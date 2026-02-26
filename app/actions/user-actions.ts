'use server';

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { protectAdmin } from "@/lib/admin-guard";
import { revalidatePath } from "next/cache";

export async function listUsers() {
    await protectAdmin();

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
