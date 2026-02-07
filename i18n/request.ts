import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ locale }) => {
    // Validate that the incoming `locale` parameter is valid
    if (!routing.locales.includes(locale as any)) {
        return {
            locale: 'pt' as const,
            messages: (await import(`../messages/pt.json`)).default
        };
    }

    return {
        locale: locale as any,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
