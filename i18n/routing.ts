import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'hi', 'es', 'fr', 'de', 'pt'],
  defaultLocale: 'en',
  localePrefix: 'never', // No URL prefixes — locale detected via cookie/Accept-Language header
});
