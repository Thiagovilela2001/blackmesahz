<script lang="ts">
    import { safeExternalUrl } from '$lib/security';

    let {
        title,
        src,
        externalUrl = '',
        height = '100%',
        actionLabel = 'Carregar player',
        openLabel = 'Abrir externo'
    }: {
        title: string;
        src: string;
        externalUrl?: string;
        height?: string;
        actionLabel?: string;
        openLabel?: string;
    } = $props();

    let isLoaded = $state(false);
    let safeOpenUrl = $derived(safeExternalUrl(externalUrl, ''));
</script>

<div class="lazy-embed" style={`--embed-height: ${height};`}>
    {#if isLoaded}
        <iframe
            {title}
            {src}
            width="100%"
            height="100%"
            frameborder="0"
            allowfullscreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
        ></iframe>
    {:else}
        <div class="lazy-embed-placeholder">
            <div>
                <span>Player externo</span>
                <strong>{title}</strong>
            </div>
            <div class="lazy-embed-actions">
                <button type="button" onclick={() => isLoaded = true}>
                    <i class="fa-solid fa-play"></i>
                    {actionLabel}
                </button>
                {#if safeOpenUrl}
                    <a href={safeOpenUrl} target="_blank" rel="noopener noreferrer">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        {openLabel}
                    </a>
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    .lazy-embed {
        width: 100%;
        height: var(--embed-height);
        min-height: 100%;
    }

    .lazy-embed iframe {
        display: block;
        width: 100%;
        height: 100%;
        border: 0;
    }

    .lazy-embed-placeholder {
        min-height: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 18px;
        background:
            linear-gradient(135deg, rgba(119, 147, 131, 0.16), rgba(255, 255, 255, 0.035)),
            #080808;
        color: #ffffff;
    }

    .lazy-embed-placeholder span,
    .lazy-embed-placeholder strong {
        display: block;
        text-transform: uppercase;
    }

    .lazy-embed-placeholder span {
        color: var(--accent-color, #779383);
        font-size: 11px;
        font-weight: 800;
    }

    .lazy-embed-placeholder strong {
        margin-top: 7px;
        font-size: 18px;
        line-height: 1;
    }

    .lazy-embed-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: flex-end;
    }

    .lazy-embed-actions button,
    .lazy-embed-actions a {
        min-height: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 12px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 8px;
        background: transparent;
        color: #ffffff;
        font: inherit;
        font-size: 11px;
        font-weight: 800;
        text-decoration: none;
        text-transform: uppercase;
        cursor: pointer;
    }

    .lazy-embed-actions button {
        background: var(--accent-color, #779383);
        border-color: var(--accent-color, #779383);
        color: #000000;
    }

    @media (max-width: 640px) {
        .lazy-embed-placeholder {
            align-items: stretch;
            flex-direction: column;
        }

        .lazy-embed-actions,
        .lazy-embed-actions button,
        .lazy-embed-actions a {
            width: 100%;
        }
    }
</style>
