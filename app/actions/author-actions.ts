// @ts-nocheck
'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';
import { protectEditor } from '@/lib/admin-guard';
import { isRedirectError } from 'next/navigation';

interface AuthorPayload {
    name: string;
    avatar_url?: string | null;
    role: string;
    email?: string | null;
}

export async function upsertAuthor(payload: AuthorPayload, id?: string) {
    // Both admins and editors can manage authors
    await protectEditor();

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
        email: payload.email || null,
        role: payload.role || 'EDITOR',
        updated_at: new Date().toISOString()
    };


    let result;
    if (!isVirtual) {
        // Update existing (Supabase Auth or Virtual)
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

export async function deleteAuthor(id: string, transferToId: string) {
    // Both admins and editors can delete authors
    await protectEditor();

    if (!transferToId) {
        return { success: false, error: 'A destination author is required for article transfer.' };
    }

    if (id === transferToId) {
        return { success: false, error: 'Cannot transfer articles to the same author being deleted.' };
    }

    // 1. Transfer articles to the new author
    const { error: transferError } = await supabaseAdmin
        .from('articles')
        .update({ author_id: transferToId })
        .eq('author_id', id);

    if (transferError) {
        console.error('Error transferring articles:', transferError);
        return { success: false, error: 'Failed to transfer articles: ' + transferError.message };
    }

    // 2. Delete the author profile
    const { error } = await supabaseAdmin.from('profiles').delete().eq('id', id);

    if (error) {
        console.error('Delete author error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/authors');
    revalidatePath('/admin/articles');
    return { success: true };
}


export async function inviteAuthor(email: string, role: string = 'EDITOR') {
    console.log(`[AuthorActions] --- Starting inviteAuthor for ${email} as ${role} ---`);
    try {
        // Both admins and editors can invite authors
        console.log('[AuthorActions] Verifying permissions...');
        await protectEditor();
        console.log('[AuthorActions] Permissions OK.');

        // Use Supabase Admin to invite the user
        console.log('[AuthorActions] Calling Supabase Admin inviteUserByEmail...');
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
        console.log(`[AuthorActions] Has Service Key: ${hasServiceKey}, Redirect URL: ${siteUrl}/api/auth/callback`);

        if (!hasServiceKey) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing in environment variables.');
        }

        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${siteUrl}/api/auth/callback`,
            data: {
                role: role.toUpperCase()
            }
        });

        if (error) {
            console.error('[AuthorActions] Supabase returned error:', error);
            throw error;
        }

        console.log('[AuthorActions] Invitation sent successfully:', data?.user?.id);
        return { success: true };
    } catch (error: any) {
        console.error('[AuthorActions] inviteAuthor caught error:', error);

        // Detailed error logging
        if (error instanceof Error) {
            console.error('[AuthorActions] Error Name:', error.name);
            console.error('[AuthorActions] Error Message:', error.message);
            console.error('[AuthorActions] Error Stack:', error.stack);
        }

        return {
            success: false,
            error: error.message || 'Falha ao enviar convite via Supabase.'
        };
    }
}
