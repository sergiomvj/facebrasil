import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/gamification(.*)', '/eu-reporter/videos/submit(.*)']);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();

    // Protect admin routes
    if (isAdminRoute(req)) {
        if (!userId) {
            return (await auth()).redirectToSignIn();
        }
    }

    // Protect user routes
    if (isProtectedRoute(req)) {
        if (!userId) {
            return (await auth()).redirectToSignIn();
        }
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
