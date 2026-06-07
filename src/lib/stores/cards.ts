import { writable } from 'svelte/store';

export const currentIndex = writable(0);
export const expandedCardIndex = writable<number | null>(null);
export const isAnimating = writable(false);
export const isPlaylistArticleOpen = writable(false);
