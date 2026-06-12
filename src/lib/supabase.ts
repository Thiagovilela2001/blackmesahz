import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (init?.headers) {
        const safe = new Headers();
        new Headers(init.headers as HeadersInit).forEach((value, name) => {
            // Strip code points > 255 (non-ISO-8859-1) to prevent fetch TypeError
            safe.set(name, value.replace(/[^\x00-\xFF]/g, ''));
        });
        return fetch(input, { ...init, headers: safe });
    }
    return fetch(input, init);
}

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    global: { fetch: safeFetch }
});
