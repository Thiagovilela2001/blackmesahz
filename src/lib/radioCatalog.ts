import { radioData, type RadioData, type RadioScheduleRow, type RadioShow, type RadioTrack } from '$lib/data/radio';
import { safeImageUrl } from '$lib/security';
import { supabase } from '$lib/supabase';

const SUPABASE_TIMEOUT_MS = 650;

type RadioSettingsRow = {
    station?: string | null;
    location?: string | null;
    stream_url?: string | null;
    live_label?: string | null;
    current_series?: string | null;
    current_title?: string | null;
    current_description?: string | null;
    current_host?: string | null;
    live_artist?: string | null;
    live_artwork?: string | null;
    tags?: string[] | null;
    mode?: string | null;
};

type RadioTrackRow = {
    title: string;
    artist: string;
    src: string;
    artwork?: string | null;
    genre?: string | null;
    release?: string | null;
};

type RadioShowRow = {
    title: string;
    description?: string | null;
    host?: string | null;
    genre?: string | null;
    image?: string | null;
    date_label?: string | null;
    time_slot?: string | null;
};

type RadioScheduleRowDb = {
    time_label: string;
    monday?: string | null;
    tuesday?: string | null;
    wednesday?: string | null;
    thursday?: string | null;
    friday?: string | null;
    saturday?: string | null;
    sunday?: string | null;
};

function withTimeout<T>(promise: PromiseLike<T>, ms = SUPABASE_TIMEOUT_MS): Promise<T> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Supabase request timed out')), ms);

        Promise.resolve(promise)
            .then(resolve)
            .catch(reject)
            .finally(() => clearTimeout(timeout));
    });
}

function nonEmpty(value: string | null | undefined, fallback: string) {
    const trimmed = value?.trim();
    return trimmed || fallback;
}

function mapTrack(row: RadioTrackRow): RadioTrack {
    return {
        title: row.title,
        artist: row.artist,
        src: row.src,
        artwork: safeImageUrl(row.artwork || ''),
        genre: row.genre || undefined,
        release: row.release || undefined
    };
}

function mapShow(row: RadioShowRow): RadioShow {
    return {
        title: row.title,
        description: row.description || '',
        host: row.host || undefined,
        genre: row.genre || undefined,
        image: safeImageUrl(row.image || ''),
        date: row.date_label || 'Em breve',
        time_slot: row.time_slot || undefined
    };
}

function mapScheduleRow(row: RadioScheduleRowDb): RadioScheduleRow {
    return {
        time: row.time_label,
        shows: [
            row.monday || '',
            row.tuesday || '',
            row.wednesday || '',
            row.thursday || '',
            row.friday || '',
            row.saturday || '',
            row.sunday || ''
        ]
    };
}

export async function loadRadioCatalog(): Promise<RadioData> {
    const [settingsResult, tracksResult, showsResult, scheduleResult] = await Promise.allSettled([
        withTimeout(supabase.from('radio_settings').select('*').eq('id', 'main').maybeSingle()),
        withTimeout(
            supabase
                .from('radio_tracks')
                .select('title,artist,src,artwork,genre,release')
                .eq('published', true)
                .order('sort_order', { ascending: true })
        ),
        withTimeout(
            supabase
                .from('radio_shows')
                .select('title,description,host,genre,image,date_label,time_slot')
                .eq('published', true)
                .order('sort_order', { ascending: true })
        ),
        withTimeout(
            supabase
                .from('radio_schedule')
                .select('time_label,monday,tuesday,wednesday,thursday,friday,saturday,sunday')
                .eq('published', true)
                .order('sort_order', { ascending: true })
        )
    ]);

    const settings =
        settingsResult.status === 'fulfilled' && !settingsResult.value.error
            ? (settingsResult.value.data as RadioSettingsRow | null)
            : null;
    const tracks =
        tracksResult.status === 'fulfilled' && tracksResult.value.data?.length
            ? (tracksResult.value.data as RadioTrackRow[]).map(mapTrack)
            : radioData.tracks;
    const highlights =
        showsResult.status === 'fulfilled' && showsResult.value.data?.length
            ? (showsResult.value.data as RadioShowRow[]).map(mapShow)
            : radioData.highlights;
    const schedule =
        scheduleResult.status === 'fulfilled' && scheduleResult.value.data?.length
            ? (scheduleResult.value.data as RadioScheduleRowDb[]).map(mapScheduleRow)
            : radioData.schedule;

    const streamUrl = nonEmpty(settings?.stream_url, radioData.streamUrl);
    const station = nonEmpty(settings?.station, radioData.station);
    const liveArtist = nonEmpty(settings?.live_artist, radioData.liveTrack.artist);

    return {
        ...radioData,
        mode: settings?.mode === 'archive' ? 'archive' : 'live',
        streamUrl,
        station,
        location: nonEmpty(settings?.location, radioData.location),
        currentShow: {
            label: nonEmpty(settings?.live_label, radioData.currentShow.label),
            series: nonEmpty(settings?.current_series, radioData.currentShow.series),
            title: nonEmpty(settings?.current_title, radioData.currentShow.title),
            description: nonEmpty(settings?.current_description, radioData.currentShow.description),
            host: nonEmpty(settings?.current_host, radioData.currentShow.host)
        },
        liveTrack: {
            title: nonEmpty(settings?.current_title, radioData.liveTrack.title),
            artist: liveArtist,
            src: streamUrl,
            artwork: safeImageUrl(settings?.live_artwork || '') || radioData.liveTrack.artwork,
            genre: radioData.liveTrack.genre,
            release: station
        },
        tracks,
        tags: settings?.tags?.length ? settings.tags : radioData.tags,
        highlights,
        schedule
    };
}
