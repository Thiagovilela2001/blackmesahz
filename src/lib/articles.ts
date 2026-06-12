import { safeExternalUrl, safeImageUrl, sanitizeTrustedHtml } from '$lib/security';

export type ArticleRow = {
    id?: string;
    slug: string;
    title: string;
    subtitle?: string | null;
    publication?: string | null;
    issue?: string | null;
    category?: string | null;
    author?: string | null;
    article_date?: string | null;
    genre?: string | null;
    hero_image?: string | null;
    hero_alt?: string | null;
    soundcloud_url?: string | null;
    content_markdown?: string | null;
    credits?: string[] | null;
    gallery?: Array<{ src: string; alt: string }> | null;
    published?: boolean | null;
    publish_at?: string | null;
    published_at?: string | null;
    created_at?: string | null;
};

export type ArticleMeta = {
    title: string;
    subtitle: string;
    publication: string;
    issue: string;
    category: string;
    author: string;
    date: string;
    genre: string;
    heroImage: string;
    heroAlt: string;
    soundcloudUrl: string;
    credits: string[];
    gallery: Array<{ src: string; alt: string }>;
};

function escapeHtml(value: string) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function renderInlineMarkdown(value: string) {
    let html = escapeHtml(value);
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return html;
}

export function markdownToSafeHtml(markdown?: string | null) {
    if (!markdown) return '';

    const blocks: string[] = [];
    const lines = markdown.replaceAll('\r\n', '\n').split('\n');
    let paragraph: string[] = [];
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    function flushParagraph() {
        if (!paragraph.length) return;
        blocks.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`);
        paragraph = [];
    }

    function flushList() {
        if (!listItems.length || !listType) return;
        blocks.push(`<${listType}>${listItems.join('')}</${listType}>`);
        listItems = [];
        listType = null;
    }

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            flushParagraph();
            flushList();
            continue;
        }

        const heading = trimmed.match(/^(#{2,3})\s+(.+)$/);
        if (heading) {
            flushParagraph();
            flushList();
            const level = heading[1].length;
            blocks.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
            continue;
        }

        const unordered = trimmed.match(/^[-*]\s+(.+)$/);
        if (unordered) {
            flushParagraph();
            if (listType !== 'ul') flushList();
            listType = 'ul';
            listItems.push(`<li>${renderInlineMarkdown(unordered[1])}</li>`);
            continue;
        }

        const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
        if (ordered) {
            flushParagraph();
            if (listType !== 'ol') flushList();
            listType = 'ol';
            listItems.push(`<li>${renderInlineMarkdown(ordered[1])}</li>`);
            continue;
        }

        const quote = trimmed.match(/^>\s+(.+)$/);
        if (quote) {
            flushParagraph();
            flushList();
            blocks.push(`<blockquote>${renderInlineMarkdown(quote[1])}</blockquote>`);
            continue;
        }

        flushList();
        paragraph.push(trimmed);
    }

    flushParagraph();
    flushList();

    return sanitizeTrustedHtml(blocks.join('\n'));
}

export function articleRowToMeta(article: ArticleRow): ArticleMeta {
    return {
        title: article.title,
        subtitle: article.subtitle || '',
        publication: article.publication || 'BLACKMESA Hz',
        issue: article.issue || article.category || 'Artigo',
        category: article.category || 'Artigo',
        author: article.author || 'BLACKMESA',
        date: article.article_date || '',
        genre: article.genre || '',
        heroImage: safeImageUrl(article.hero_image),
        heroAlt: article.hero_alt || article.title,
        soundcloudUrl: safeExternalUrl(article.soundcloud_url, ''),
        credits: Array.isArray(article.credits) ? article.credits.filter(Boolean) : [],
        gallery: Array.isArray(article.gallery)
            ? article.gallery
                .map(image => ({
                    src: safeImageUrl(image.src),
                    alt: image.alt || article.title
                }))
                .filter(image => image.src)
            : []
    };
}

export function articleRowToCard(article: ArticleRow) {
    return {
        catalog: article.issue || article.category || 'Artigo',
        artist: article.title,
        song: article.genre || article.subtitle || article.category || 'Editorial BLACKMESA Hz',
        image: safeImageUrl(article.hero_image),
        slug: article.slug
    };
}
