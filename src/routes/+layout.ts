import { supabase } from '$lib/supabase';
import { playlistCardsData } from '$lib/data/playlists';
import type { LayoutLoad } from './$types';

export const ssr = false;
export const prerender = false;

function normalizeReleaseArtist(catalog: string, artist: string) {
    if (catalog === '[BM001]') return 'BLACKMESA';
    return artist;
}

function normalizeReleaseEmbed(catalog: string, embedHtml?: string | null) {
    if (catalog !== '[BM001]' || !embedHtml) return embedHtml;

    return embedHtml.replaceAll(
        'V.A. BOOTLEGS I [BM001]',
        'BLACKMESA - BOOTLEGS I [BM001]'
    );
}

export const load: LayoutLoad = async () => {
    // Carregar releases (ordem descendente, assumindo que os mais recentes foram inseridos por último e mantêm ordem)
    const { data: releases } = await supabase
        .from('releases')
        .select('*')
        .order('catalog', { ascending: false });

    // Carregar eventos (heróis e normais)
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: true }); // A ordem de inserção do mock foi do 18 ao 1. Ajuste se necessário.

    // Apenas garante um array vazio em caso de erro para não quebrar a UI
    const mappedReleases = (releases || []).map(r => ({
        ...r,
        artist: normalizeReleaseArtist(r.catalog, r.artist),
        image: r.image_url,
        embed: normalizeReleaseEmbed(r.catalog, r.embed_html),
        credits: r.credits_html
    }));

    const mappedEvents = (events || []).reverse().map(e => ({
        ...e,
        image: e.image_url
    }));

    return {
        releasesData: mappedReleases,
        eventsData: mappedEvents,
        playlistCardsData
    };
};
