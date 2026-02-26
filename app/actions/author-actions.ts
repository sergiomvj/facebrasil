// @ts-nocheck
'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { auth, createClerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { protectAdmin } from '@/lib/admin-guard';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });


interface AuthorPayload {
    name: string;
    avatar_url?: string | null;
    role: string;
    email?: string | null;
}

export async function upsertAuthor(payload: AuthorPayload, id?: string) {
    // Only admins can manage authors
    await protectAdmin();

    console.log('--- SERVER ACTION: UPSERT AUTHOR ---');
    console.log('Payload:', payload);
    console.log('ID:', id);

    let finalId = id;
    const isVirtual = !id;

    if (isVirtual) {
        // Generate a new UUID for virtual authors
        finalId = crypto.randomUUID();
    }

    const dbPayload = {
        id: finalId,
        name: payload.name,
        avatar_url: payload.avatar_url || null,
        role: payload.role || 'EDITOR',
        updated_at: new Date().toISOString()
    };

    let result;
    if (!isVirtual) {
        // Update existing (Clerk or Virtual)
        result = await supabaseAdmin.from('profiles').upsert([dbPayload], { onConflict: 'id' }).select();
    } else {
        // Insert new Virtual Author
        result = await supabaseAdmin.from('profiles').insert([dbPayload]).select();
    }

    if (result.error) {
        console.error('Author Upsert Error:', result.error);
        return { success: false, error: result.error.message };
    }

    revalidatePath('/admin/authors');
    revalidatePath('/admin/articles');
    revalidatePath('/admin/editor');

    return { success: true, data: result.data };
}

export async function deleteAuthor(id: string) {
    // Only admins can delete authors
    await protectAdmin();

    const { error } = await supabaseAdmin.from('profiles').delete().eq('id', id);

    if (error) {
        console.error('Delete author error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/authors');
    return { success: true };
}

export async function inviteAuthor(email: string) {
    // Only admins can invite authors
    await protectAdmin();

    try {
        await clerkClient.invitations.createInvitation({
            emailAddress: email,
            ignoreExisting: true
        });
        return { success: true };
    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT' || error.digest?.includes('NEXT_REDIRECT')) {
            throw error;
        }
        console.error('Clerk Invitation Error:', error);
        return { success: false, error: error.message };
    }
}


