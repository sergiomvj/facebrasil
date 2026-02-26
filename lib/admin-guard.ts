import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "./supabase-admin";

/**
 * Checks if the current user has the ADMIN role.
 * If not, redirects to the home page.
 */
export async function protectAdmin() {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    // Direct check for Master Admin via env var (if set)
    if (process.env.MASTER_ADMIN_CLERK_ID && userId === process.env.MASTER_ADMIN_CLERK_ID) {
        return { userId, role: "ADMIN" };
    }

    // Check database profile
    const { data: profile } = await (supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single() as any);

    if (profile?.role?.toUpperCase() !== "ADMIN") {
        console.warn(`Unauthorized admin access attempt by user ${userId}`);
        redirect("/");
    }

    return { userId, role: profile.role };
}

/**
 * Checks if the current user has at least the EDITOR role.
 */
export async function protectEditor() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    // Direct check for Master Admin
    if (process.env.MASTER_ADMIN_CLERK_ID && userId === process.env.MASTER_ADMIN_CLERK_ID) {
        return { userId, role: "ADMIN" };
    }

    // Check database profile
    const { data: profile } = await (supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single() as any);

    const role = profile?.role?.toUpperCase();

    if (role !== "ADMIN" && role !== "EDITOR") {
        redirect("/");
    }


    return { userId, role };
}
