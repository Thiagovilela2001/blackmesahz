import { loadRadioCatalog } from '$lib/radioCatalog';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
    return {
        radioData: await loadRadioCatalog()
    };
};
