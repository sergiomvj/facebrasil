import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Checks if the current user has the ADMIN role.
 * If not, redirects to the home page.
 * Use this in React Server Components (RSCs) within the /admin directory.
 */
export async function protectAdmin() {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const role = (sessionClaims?.metadata as any)?.role;

    if (role !== "ADMIN") {
        redirect("/");
    }

    return { userId, role };
}

/**
 * Checks if the current user has at least the EDITOR role.
 */
export async function protectEditor() {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const role = (sessionClaims?.metadata as any)?.role;

    if (role !== "ADMIN" && role !== "EDITOR") {
        redirect("/");
    }

    return { userId, role };
}
