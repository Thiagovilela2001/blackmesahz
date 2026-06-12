import { error } from '@sveltejs/kit';
import { articleRowToMeta, markdownToSafeHtml, type ArticleRow } from '$lib/articles';
import type { PageLoad } from './$types';

async function loadLocalPost(slug: string) {
    const post = await import(`../../../content/playlists/${slug}.md`);

    return {
        content: post.default,
        contentHtml: '',
        meta: post.metadata
    };
}

export const load: PageLoad = async ({ params }) => {
    try {
        return await loadLocalPost(params.slug);
    } catch {
        // Dynamic Supabase articles are resolved below when no bundled article exists.
    }

    const { supabase } = await import('$lib/supabase');
    let articleResult = await supabase
        .from('articles')
        .select('*')
        .eq('slug', params.slug)
        .eq('published', true)
        .or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`)
        .maybeSingle();

    if (articleResult.error) {
        articleResult = await supabase
            .from('articles')
            .select('*')
            .eq('slug', params.slug)
            .eq('published', true)
            .maybeSingle();
    }

    if (articleResult.data) {
        const article = articleResult.data as ArticleRow;

        return {
            content: null,
            contentHtml: markdownToSafeHtml(article.content_markdown),
            meta: articleRowToMeta(article)
        };
    }

    throw error(404, `Could not find ${params.slug}`);
};
