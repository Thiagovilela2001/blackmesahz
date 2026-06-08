import { supabase } from '$lib/supabase';
import { eventsData as fallbackEventsData } from '$lib/data/events';
import { playlistCardsData } from '$lib/data/playlists';
import { releasesData as fallbackReleasesData } from '$lib/data/releases';
import type { LayoutLoad } from './$types';

export const ssr = false;
export const prerender = false;

const SUPABASE_TIMEOUT_MS = 1800;

type ReleaseLike = {
    catalog: string;
    artist: string;
    image?: string;
    image_url?: string | null;
    embed?: string;
    embed_html?: string | null;
    credits?: string;
    credits_html?: string | null;
    [key: string]: unknown;
};

type EventLike = {
    image?: string;
    image_url?: string | null;
    [key: string]: unknown;
};

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

function resolveImage(primary?: string | null, fallback?: string | null) {
    return primary || fallback || '';
}

function withTimeout<T>(promise: PromiseLike<T>, ms = SUPABASE_TIMEOUT_MS): Promise<T> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Supabase request timed out')), ms);

        Promise.resolve(promise)
            .then(resolve)
            .catch(reject)
            .finally(() => clearTimeout(timeout));
    });
}

export const load: LayoutLoad = async () => {
    const [releasesResult, eventsResult] = await Promise.allSettled([
        withTimeout(
            supabase
                .from('releases')
                .select('*')
                .order('catalog', { ascending: false })
        ),
        withTimeout(
            supabase
                .from('events')
                .select('*')
                .order('created_at', { ascending: true })
        )
    ]);

    const releases =
        releasesResult.status === 'fulfilled' && releasesResult.value.data?.length
            ? (releasesResult.value.data as ReleaseLike[])
            : fallbackReleasesData;
    const events =
        eventsResult.status === 'fulfilled' && eventsResult.value.data?.length
            ? (eventsResult.value.data as EventLike[])
            : fallbackEventsData;

    const mappedReleases = releases.map(r => ({
        ...r,
        artist: normalizeReleaseArtist(r.catalog, r.artist),
        image: resolveImage('image_url' in r ? r.image_url : undefined, r.image),
        embed: normalizeReleaseEmbed(r.catalog, 'embed_html' in r ? r.embed_html : r.embed),
        credits: 'credits_html' in r ? r.credits_html : r.credits
    }));

    const mappedEvents = events.slice().reverse().map(e => ({
        ...e,
        image: resolveImage('image_url' in e ? e.image_url : undefined, e.image)
    }));

    return {
        releasesData: mappedReleases,
        eventsData: mappedEvents,
        playlistCardsData
    };
};
