import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth();

    // Protect admin routes
    if (isAdminRoute(req)) {
        if (!userId) {
            return (await auth()).redirectToSignIn();
        }

        // Temporary Bypass for Development: Allow all logged-in users to access admin
        // const role = (sessionClaims?.metadata as any)?.role;
        // if (role !== 'ADMIN') {
        //     // Redirect non-admins to home
        //     const url = new URL('/', req.url);
        //     return NextResponse.redirect(url);
        // }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
