import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Only allow internal redirects to prevent open redirect vulnerabilities
            const redirectTo = next.startsWith('/') ? `${origin}${next}` : origin
            return NextResponse.redirect(redirectTo)
        }
    }

    // Detect locale from the 'next' param or default to 'pt'
    const localeMatch = next.match(/^\/(pt|en|es)\//)
    const locale = localeMatch ? localeMatch[1] : 'pt'

    return NextResponse.redirect(`${origin}/${locale}/login?error=Link_Invalido`)
}
