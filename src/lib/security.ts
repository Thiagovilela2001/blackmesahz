const SAFE_LOCAL_PATH = /^\/(?!\/)[A-Za-z0-9._~:/?#[\]@!$&()*+,;=%-]+$/;
const SAFE_RELATIVE_PATH = /^(?![a-z][a-z0-9+.-]*:)(?!\/\/)[A-Za-z0-9._~/?#[\]@!$&()*+,;=%-]+$/i;

const TRUSTED_IMAGE_HOSTS = new Set([
    'f4.bcbits.com',
    'placehold.co',
    'flagcdn.com',
    'i.scdn.co',
    'mosaic.scdn.co',
    'image-cdn-ak.spotifycdn.com'
]);

const TRUSTED_LINK_HOSTS = new Set([
    'soundcloud.com',
    'www.soundcloud.com',
    'blackmesaent.bandcamp.com',
    'instagram.com',
    'www.instagram.com',
    'open.spotify.com'
]);

const TRUSTED_FRAME_HOSTS = new Set([
    'w.soundcloud.com',
    'open.spotify.com'
]);

function normalizeLocalPath(path: string) {
    const trimmed = path.trim();
    if (!trimmed) return '';
    const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

    return SAFE_LOCAL_PATH.test(normalized) ? normalized : '';
}

function isTrustedHost(hostname: string, trustedHosts: Set<string>) {
    return trustedHosts.has(hostname.toLowerCase());
}

function isTrustedImageHost(hostname: string) {
    const normalized = hostname.toLowerCase();
    return TRUSTED_IMAGE_HOSTS.has(normalized) || normalized.endsWith('.supabase.co');
}

export function safeImageUrl(path?: string | null) {
    if (!path) return '';

    const trimmed = path.trim();
    if (!trimmed) return '';

    if (trimmed.startsWith('/') || SAFE_RELATIVE_PATH.test(trimmed)) {
        return normalizeLocalPath(trimmed);
    }

    try {
        const url = new URL(trimmed);
        if (url.protocol !== 'https:') return '';
        return isTrustedImageHost(url.hostname) ? url.toString() : '';
    } catch {
        return '';
    }
}

export function safeExternalUrl(urlValue?: string | null, fallback = '#') {
    if (!urlValue) return fallback;

    const trimmed = urlValue.trim();
    if (!trimmed || trimmed === '#') return fallback;

    if (trimmed.startsWith('/') && SAFE_LOCAL_PATH.test(trimmed)) return trimmed;

    if (trimmed.startsWith('mailto:')) {
        try {
            const url = new URL(trimmed);
            return url.protocol === 'mailto:' ? trimmed : fallback;
        } catch {
            return fallback;
        }
    }

    try {
        const url = new URL(trimmed);
        if (url.protocol !== 'https:') return fallback;
        return isTrustedHost(url.hostname, TRUSTED_LINK_HOSTS) ? url.toString() : fallback;
    } catch {
        return fallback;
    }
}

function safeFrameUrl(urlValue?: string | null) {
    if (!urlValue) return '';

    try {
        const url = new URL(urlValue.trim());
        if (url.protocol !== 'https:') return '';
        return isTrustedHost(url.hostname, TRUSTED_FRAME_HOSTS) ? url.toString() : '';
    } catch {
        return '';
    }
}

function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, char => {
        if (char === '&') return '&amp;';
        if (char === '<') return '&lt;';
        if (char === '>') return '&gt;';
        if (char === '"') return '&quot;';
        return '&#39;';
    });
}

function sanitizeTrustedHtmlString(html: string) {
    const iframeMatch = html.match(/<iframe\b[^>]*\bsrc=(["'])(.*?)\1[^>]*><\/iframe>/i);
    const cleanParts: string[] = [];

    if (iframeMatch) {
        const src = safeFrameUrl(iframeMatch[2]);
        if (src) {
            cleanParts.push(
                `<iframe src="${escapeHtml(src)}" title="Player externo" width="100%" height="300" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; clipboard-write"></iframe>`
            );
        }
    }

    const withoutIframes = html.replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '');
    const withBreakTokens = withoutIframes.replace(/<br\s*\/?>/gi, '___SAFE_BR___');
    const textOnly = withBreakTokens.replace(/<[^>]*>/g, '');
    const cleanText = escapeHtml(textOnly).replace(/___SAFE_BR___/g, '<br>');

    if (cleanText.trim()) {
        cleanParts.push(cleanText);
    }

    return cleanParts.join('');
}

function appendSanitizedNode(source: Node, target: Node, documentRef: Document) {
    if (source.nodeType === Node.TEXT_NODE) {
        target.appendChild(documentRef.createTextNode(source.textContent || ''));
        return;
    }

    if (source.nodeType !== Node.ELEMENT_NODE) return;

    const element = source as Element;
    const tagName = element.tagName.toLowerCase();

    if (tagName === 'br') {
        target.appendChild(documentRef.createElement('br'));
        return;
    }

    if (
        tagName === 'p' ||
        tagName === 'h2' ||
        tagName === 'h3' ||
        tagName === 'ul' ||
        tagName === 'ol' ||
        tagName === 'li' ||
        tagName === 'blockquote' ||
        tagName === 'pre' ||
        tagName === 'code' ||
        tagName === 'strong' ||
        tagName === 'b' ||
        tagName === 'em' ||
        tagName === 'i' ||
        tagName === 'span'
    ) {
        const cleanElement = documentRef.createElement(tagName);
        element.childNodes.forEach(child => appendSanitizedNode(child, cleanElement, documentRef));
        target.appendChild(cleanElement);
        return;
    }

    if (tagName === 'a') {
        const href = safeExternalUrl(element.getAttribute('href'), '');
        if (!href) {
            element.childNodes.forEach(child => appendSanitizedNode(child, target, documentRef));
            return;
        }

        const cleanLink = documentRef.createElement('a');
        cleanLink.setAttribute('href', href);
        cleanLink.setAttribute('target', '_blank');
        cleanLink.setAttribute('rel', 'noopener noreferrer');
        element.childNodes.forEach(child => appendSanitizedNode(child, cleanLink, documentRef));
        target.appendChild(cleanLink);
        return;
    }

    if (tagName === 'div') {
        const cleanDiv = documentRef.createElement('div');
        element.childNodes.forEach(child => appendSanitizedNode(child, cleanDiv, documentRef));
        target.appendChild(cleanDiv);
        return;
    }

    if (tagName === 'iframe') {
        const src = safeFrameUrl(element.getAttribute('src'));
        if (!src) return;

        const cleanFrame = documentRef.createElement('iframe');
        cleanFrame.setAttribute('src', src);
        cleanFrame.setAttribute('title', element.getAttribute('title') || 'Player externo');
        cleanFrame.setAttribute('width', element.getAttribute('width') || '100%');
        cleanFrame.setAttribute('height', element.getAttribute('height') || '300');
        cleanFrame.setAttribute('loading', 'lazy');
        cleanFrame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        cleanFrame.setAttribute('allow', 'autoplay; encrypted-media; clipboard-write');
        target.appendChild(cleanFrame);
        return;
    }

    element.childNodes.forEach(child => appendSanitizedNode(child, target, documentRef));
}

export function sanitizeTrustedHtml(html?: string | null) {
    if (!html) return '';
    if (typeof DOMParser === 'undefined' || typeof document === 'undefined') {
        return sanitizeTrustedHtmlString(html);
    }

    const parser = new DOMParser();
    const parsed = parser.parseFromString(html, 'text/html');
    const container = document.createElement('div');

    parsed.body.childNodes.forEach(child => appendSanitizedNode(child, container, document));

    return container.innerHTML;
}
