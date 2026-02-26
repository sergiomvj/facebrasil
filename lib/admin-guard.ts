import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "./supabase-admin";

/**
 * Checks if the current user has the ADMIN role.
 * If not, redirects to the home page.
 */
export async function protectAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/sign-in");
    }

    const userId = user.id;
    const masterAdminId = process.env.MASTER_ADMIN_ID || process.env.MASTER_ADMIN_CLERK_ID;

    console.log(`[AdminGuard] Checking Admin: User=${userId}, Master=${masterAdminId}`);

    // Direct check for Master Admin via env var (if set)
    if (masterAdminId && userId === masterAdminId) {
        console.log(`[AdminGuard] Master Admin bypass granted for ${userId}`);
        return { userId, role: "ADMIN" };
    }

    // Check database profile
    const { data: profile, error } = await (supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single() as any);

    if (error) {
        console.error(`[AdminGuard] Profile fetch error for ${userId}:`, error);
    }

    const role = profile?.role?.toUpperCase();
    console.log(`[AdminGuard] User ${userId} has role: ${role}`);

    if (role !== "ADMIN") {
        console.warn(`[AdminGuard] Unauthorized admin access attempt by user ${userId} (Role: ${role})`);
        throw new Error("Não autorizado. Você precisa ser Administrador para realizar esta ação.");
    }

    return { userId, role };
}

/**
 * Checks if the current user has at least the EDITOR role.
 */
export async function protectEditor() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/sign-in");
    }

    const userId = user.id;
    const masterAdminId = process.env.MASTER_ADMIN_ID || process.env.MASTER_ADMIN_CLERK_ID;

    console.log(`[AdminGuard] Checking Editor: User=${userId}, Master=${masterAdminId}`);

    // Direct check for Master Admin via env var (if set)
    if (masterAdminId && userId === masterAdminId) {
        console.log(`[AdminGuard] Master Admin bypass granted for ${userId}`);
        return { userId, role: "ADMIN" };
    }

    // Check database profile
    const { data: profile, error } = await (supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single() as any);

    if (error) {
        console.error(`[AdminGuard] Profile fetch error for ${userId}:`, error);
    }

    const role = profile?.role?.toUpperCase();

    if (role !== "ADMIN" && role !== "EDITOR") {
        throw new Error("Não autorizado. Você precisa ser Editor ou Administrador para realizar esta ação.");
    }

    return { userId, role };
}
