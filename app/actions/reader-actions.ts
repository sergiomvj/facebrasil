'use server';

import { supabaseAdmin } from "@/lib/supabase-admin";
import { protectAdmin } from "@/lib/admin-guard";
import { revalidatePath } from "next/cache";

export async function listReaders() {
    await protectAdmin();

    // Fetch profiles that are typically considered 'readers'
    // such as VIEWER, READER, or null roles
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .or('role.eq.VIEWER,role.eq.READER,role.is.null')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

export async function createReader(payload: { name: string; email: string; password?: string }) {
    await protectAdmin();

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: payload.email,
        password: payload.password,
        email_confirm: true,
        user_metadata: {
            full_name: payload.name,
            role: 'VIEWER'
        }
    });

    if (authError) return { success: false, error: authError.message };

    const { error: profileError } = await supabaseAdmin.from('profiles').upsert([{
        id: authData.user.id,
        name: payload.name,
        email: payload.email,
        role: 'VIEWER',
        updated_at: new Date().toISOString()
    }], { onConflict: 'id' });

    if (profileError) return { success: false, error: profileError.message };

    revalidatePath('/[locale]/admin/readers', 'page');
    return { success: true, user: authData.user };
}

export async function updateReader(userId: string, payload: { name: string; email: string; password?: string }) {
    await protectAdmin();

    if (payload.password) {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: payload.password,
            user_metadata: { full_name: payload.name }
        });
        if (authError) return { success: false, error: authError.message };
    } else {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { full_name: payload.name }
        });
    }

    const { error: profileError } = await (supabaseAdmin as any)
        .from('profiles')
        .update({
            name: payload.name,
            email: payload.email,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId);

    if (profileError) return { success: false, error: profileError.message };

    revalidatePath('/[locale]/admin/readers', 'page');
    return { success: true };
}

export async function deleteReader(userId: string) {
    await protectAdmin();
    // Delete from auth (cascade should delete profile)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) return { success: false, error: error.message };

    revalidatePath('/[locale]/admin/readers', 'page');
    return { success: true };
}
