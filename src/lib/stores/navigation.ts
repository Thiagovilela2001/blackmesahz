import { writable } from 'svelte/store';

export type TabName = 'home' | 'releases' | 'playlists' | 'radio' | 'events';

export const currentTab = writable<TabName>('home');
export const isInstitutionalVisible = writable(false);

export const theme = writable<'default' | 'theme-04'>('default');
export const siteLanguage = writable<'pt-br' | 'en'>('pt-br');
export const hasCookieConsent = writable<boolean | null>(null);
