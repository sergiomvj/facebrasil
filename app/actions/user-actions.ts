'use server';

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { protectAdmin, protectEditor } from "@/lib/admin-guard";
import { revalidatePath } from "next/cache";

export async function listUsers() {
    await protectEditor();

    // Fetch all profiles
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

export async function updateUserRole(userId: string, newRole: string) {
    await protectAdmin();

    const { error } = await (supabaseAdmin as any)
        .from('profiles')
        .update({ role: newRole.toUpperCase() })
        .eq('id', userId);

    if (error) throw new Error(error.message);

    revalidatePath('/[locale]/admin/settings', 'page');
    return { success: true };
}

interface UserPayload {
    name: string;
    email: string;
    password?: string;
    role: string;
}

export async function createUser(payload: UserPayload) {
    await protectAdmin();

    // Create user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: payload.email,
        password: payload.password,
        email_confirm: true,
        user_metadata: {
            full_name: payload.name,
            role: payload.role
        }
    });

    if (authError) {
        return { success: false, error: authError.message };
    }

    const userId = authData.user.id;

    // Supabase trigger automatically creates the profile, but we can do an upsert
    // to ensure role and name are fully synced just in case.
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert([{
        id: userId,
        name: payload.name,
        email: payload.email,
        role: payload.role.toUpperCase(),
        updated_at: new Date().toISOString()
    }], { onConflict: 'id' });

    if (profileError) {
        return { success: false, error: profileError.message };
    }

    revalidatePath('/[locale]/admin/settings', 'page');
    return { success: true, user: authData.user };
}

export async function updateUser(userId: string, payload: UserPayload) {
    await protectAdmin();

    // Update password if provided
    if (payload.password) {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: payload.password,
            user_metadata: {
                full_name: payload.name,
                role: payload.role
            }
        });

        if (authError) {
            return { success: false, error: authError.message };
        }
    } else {
        // Just update metadata in auth if no password
        await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
                full_name: payload.name,
                role: payload.role
            }
        });
    }

    // Update profile
    const { error: profileError } = await (supabaseAdmin as any)
        .from('profiles')
        .update({
            name: payload.name,
            email: payload.email, // email is updated in profile, though not in Auth here (requires more complex flow or just forcing it if needed, but we keep it simple)
            role: payload.role.toUpperCase(),
            updated_at: new Date().toISOString()
        })
        .eq('id', userId);

    if (profileError) {
        return { success: false, error: profileError.message };
    }

    revalidatePath('/[locale]/admin/settings', 'page');
    return { success: true };
}
