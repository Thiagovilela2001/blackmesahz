import { error } from '@sveltejs/kit';
import { articleRowToMeta, markdownToSafeHtml, type ArticleRow } from '$lib/articles';
import { supabase } from '$lib/supabase';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const articleResult = await supabase
        .from('articles')
        .select('*')
        .eq('slug', params.slug)
        .eq('published', true)
        .maybeSingle();

    if (articleResult.data) {
        const article = articleResult.data as ArticleRow;

        return {
            content: null,
            contentHtml: markdownToSafeHtml(article.content_markdown),
            meta: articleRowToMeta(article)
        };
    }

    try {
        const post = await import(`../../../content/playlists/${params.slug}.md`);
        
        return {
            content: post.default,
            contentHtml: '',
            meta: post.metadata
        };
    } catch (e) {
        throw error(404, `Could not find ${params.slug}`);
    }
};
