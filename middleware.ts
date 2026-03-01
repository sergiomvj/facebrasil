import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
    // Update session and get user
    const { response, user } = await updateSession(request)

    const path = request.nextUrl.pathname

    // Protect admin and dashboard routes
    const isAdminRoute = /^\/([a-z]{2})\/admin/.test(path) || path.startsWith('/admin')
    const isProtectedRoute = /^\/([a-z]{2})\/dashboard/.test(path) || path.startsWith('/dashboard') ||
        /^\/([a-z]{2})\/gamification/.test(path) || path.startsWith('/gamification')

    if (isAdminRoute || isProtectedRoute) {
        if (!user) {
            // Redirect to login if not authenticated
            const locale = path.split('/')[1] || 'pt'
            const loginUrl = new URL(`/${locale}/login`, request.url)
            loginUrl.searchParams.set('next', path)
            return NextResponse.redirect(loginUrl)
        }
    }


    // Handle internationalization
    // We apply intl middleware if it's not an API route
    if (!path.startsWith('/api')) {
        const intlResponse = intlMiddleware(request)
        // Preserve session cookies from updateSession so the access token
        // is properly refreshed in the browser on every request.
        response.headers.getSetCookie().forEach(cookie => {
            intlResponse.headers.append('Set-Cookie', cookie)
        })
        return intlResponse
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
