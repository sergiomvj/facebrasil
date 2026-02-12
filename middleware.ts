import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/:locale/admin(.*)']);
const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)', '/:locale/dashboard(.*)',
    '/gamification(.*)', '/:locale/gamification(.*)',
    '/eu-reporter/videos/submit(.*)', '/:locale/eu-reporter/videos/submit(.*)'
]);

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

    // Don't apply intl middleware to API routes
    if (req.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    return intlMiddleware(req);
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|store|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
