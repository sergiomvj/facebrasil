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
    password?: string;
    isVirtualOverride?: boolean;
}

export async function upsertAuthor(payload: AuthorPayload, id?: string) {
    try {
        // Both admins and editors can manage authors
        await protectEditor();

        console.log('--- SERVER ACTION: UPSERT AUTHOR ---');
        console.log('Payload:', { ...payload, password: payload.password ? '***' : undefined });
        console.log('ID:', id);

        let finalId = id;
        let isVirtual = !id;

        // Se !id, estamos criando um novo.
        if (!id) {
            if (payload.email && payload.password && !payload.isVirtualOverride) {
                // Criação de usuário real Auth
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
                    console.error('Create User Auth Error:', authError);
                    return { success: false, error: authError.message };
                }
                finalId = authData.user.id;
                isVirtual = false;
            } else {
                // Criação de autor virtual
                finalId = crypto.randomUUID();
                isVirtual = true;
            }
        } else {
            // Se temos ID, estamos editando. Verifica se tem senha para alterar.
            if (payload.password) {
                try {
                    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
                        password: payload.password
                    });
                    if (updateError) {
                        console.error('Update User Password Error:', updateError);
                        // Ignora erros de "not found" (autor virtual) ou UUID inválido
                        if (!updateError.message.includes('not found') && !updateError.message.toLowerCase().includes('uuid')) {
                            return { success: false, error: updateError.message };
                        }
                        console.warn('[upsertAuthor] Ignorando erro de senha para autor virtual:', updateError.message);
                    }
                } catch (passError: any) {
                    // Autores virtuais não têm conta no Auth — ignora o erro de UUID
                    console.warn('[upsertAuthor] Pulando atualização de senha (autor virtual ou UUID inválido):', passError.message);
                }
            }
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
    } catch (error: any) {
        console.error('Critical Author Upsert Error:', error);
        return {
            success: false,
            error: error.message || 'Erro inesperado ao processar autor. Verifique os logs do servidor.'
        };
    }
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
            redirectTo: `${siteUrl}/api/auth/callback?next=/pt/admin/settings`,
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
