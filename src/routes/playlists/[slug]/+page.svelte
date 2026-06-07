<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { currentTab } from '$lib/stores/navigation';
    import { currentIndex, expandedCardIndex, isAnimating, isPlaylistArticleOpen } from '$lib/stores/cards';
    import ImageLightbox from '$lib/components/ImageLightbox.svelte';
    import SubHeader from '$lib/components/SubHeader.svelte';

    let { data } = $props();
    let Content = $derived(data.content);
    let soundcloudEmbedUrl = $derived(
        data.meta.soundcloudUrl
            ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(data.meta.soundcloudUrl)}&color=%23779383&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`
            : ''
    );
    let lightbox: ImageLightbox;
    let carouselIndex = $state(0);
    let carouselTouchStartX = 0;
    let carouselTouchStartY = 0;
    let suppressCarouselClick = false;

    function prevSlide() {
        if (carouselIndex > 0) carouselIndex--;
    }

    function nextSlide() {
        const gallery = data.meta.gallery;
        if (gallery && carouselIndex < gallery.length - 1) carouselIndex++;
    }

    function handleCarouselTouchStart(event: TouchEvent) {
        const touch = event.touches[0];
        carouselTouchStartX = touch.clientX;
        carouselTouchStartY = touch.clientY;
    }

    function handleCarouselTouchEnd(event: TouchEvent) {
        const gallery = data.meta.gallery;
        if (!gallery?.length) return;

        const touch = event.changedTouches[0];
        const deltaX = carouselTouchStartX - touch.clientX;
        const deltaY = carouselTouchStartY - touch.clientY;

        if (Math.abs(deltaX) < 44 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) {
            return;
        }

        suppressCarouselClick = true;

        if (deltaX > 0) {
            nextSlide();
        } else {
            prevSlide();
        }

        setTimeout(() => {
            suppressCarouselClick = false;
        }, 120);
    }

    function resetCardState() {
        currentIndex.set(0);
        expandedCardIndex.set(null);
        isAnimating.set(false);
        isPlaylistArticleOpen.set(false);
    }

    function goBack() {
        resetCardState();
        currentTab.set('playlists');
        goto('/');
    }

    function goHome() {
        resetCardState();
        currentTab.set('home');
        goto('/');
    }

    function openLightbox(src: string, alt: string) {
        if (lightbox) lightbox.openLightbox(src, alt);
    }

    function openCarouselImage(event: MouseEvent, src: string, alt: string) {
        if (suppressCarouselClick) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        openLightbox(src, alt);
    }

    onMount(() => {
        currentTab.set('playlists');
    });
</script>

<svelte:head>
    <title>{data.meta.title} - BLACKMESA</title>
</svelte:head>

<!-- Sub Header for navigation context -->
<SubHeader />

<!-- Lightbox -->
<ImageLightbox bind:this={lightbox} />

<div id="playlist-wrapper" style="display: block" role="presentation" tabindex="-1" onclick={goBack}>
    <article class="playlist-publication" role="presentation" onclick={(event) => event.stopPropagation()}>
        <header class="playlist-publication-header">
            <div class="playlist-publication-brand">
                <strong>{data.meta.publication}</strong>
                <span>{data.meta.issue}</span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button type="button" class="playlist-close-btn" onclick={goBack}>Voltar (Artigos)</button>
                <button type="button" class="playlist-close-btn" onclick={goHome}>Início</button>
            </div>
        </header>

        <div class="playlist-article">
            <span class="playlist-article-kicker">{data.meta.publication}</span>
            <h1 class="playlist-article-title">{data.meta.title}</h1>
            <p class="playlist-article-subtitle">{data.meta.subtitle}</p>
            <div class="playlist-article-meta">
                {#each [data.meta.author, data.meta.date, data.meta.genre].filter(Boolean) as item, idx}
                    {#if idx > 0}<span aria-hidden="true">/</span>{/if}
                    <span>{item}</span>
                {/each}
            </div>

            {#if data.meta.heroImage}
                <figure class="playlist-hero-image">
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                    <img
                        src={data.meta.heroImage}
                        alt={data.meta.heroAlt || 'Hero Image'}
                        onclick={() => openLightbox(data.meta.heroImage, data.meta.heroAlt || '')}
                    >
                    {#if data.meta.heroAlt}
                        <figcaption class="playlist-image-caption">{data.meta.heroAlt}</figcaption>
                    {/if}
                </figure>
            {/if}

            {#if data.meta.soundcloudUrl}
                <section class="playlist-soundcloud-player" aria-label="Player SoundCloud">
                    <div class="playlist-soundcloud-header">
                        <span>Escute aqui</span>
                        <a href={data.meta.soundcloudUrl} target="_blank" rel="noreferrer">
                            Abrir no SoundCloud
                            <i class="fa-brands fa-soundcloud"></i>
                        </a>
                    </div>
                    <iframe
                        title={`${data.meta.title} no SoundCloud`}
                        width="100%"
                        height="360"
                        scrolling="no"
                        frameborder="no"
                        allow="autoplay; encrypted-media"
                        src={soundcloudEmbedUrl}
                    ></iframe>
                </section>
            {/if}

            <div class="playlist-article-body">
                <Content />
            </div>

            {#if data.meta.gallery?.length}
                <div class="playlist-carousel">
                    <div
                        class="playlist-carousel-viewport"
                        role="group"
                        aria-label="Galeria de imagens"
                        ontouchstart={handleCarouselTouchStart}
                        ontouchend={handleCarouselTouchEnd}
                    >
                        <div class="playlist-carousel-track" style="transform: translateX(-{carouselIndex * 100}%)">
                            {#each data.meta.gallery as image}
                                <figure class="playlist-carousel-slide">
                                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        loading="lazy"
                                        onclick={(event) => openCarouselImage(event, image.src, image.alt)}
                                    >
                                    <figcaption class="playlist-image-caption">{image.alt}</figcaption>
                                </figure>
                            {/each}
                        </div>
                    </div>
                    <div class="playlist-carousel-controls">
                        <button
                            class="playlist-carousel-btn"
                            type="button"
                            onclick={prevSlide}
                            disabled={carouselIndex === 0}
                            aria-label="Foto anterior"
                        >
                            <i class="fa-solid fa-arrow-left"></i>
                        </button>
                        <div class="playlist-carousel-dots">
                            {#each data.meta.gallery as _, i}
                                <button
                                    class="playlist-carousel-dot"
                                    class:active={i === carouselIndex}
                                    onclick={() => carouselIndex = i}
                                    aria-label={`Foto ${i + 1}`}
                                ></button>
                            {/each}
                        </div>
                        <button
                            class="playlist-carousel-btn"
                            type="button"
                            onclick={nextSlide}
                            disabled={carouselIndex === data.meta.gallery.length - 1}
                            aria-label="Próxima foto"
                        >
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            {/if}

            {#if data.meta.credits?.length}
                <footer class="playlist-article-footer">
                    <strong>Créditos</strong>
                    {#each data.meta.credits as credit}
                        {credit}<br>
                    {/each}
                </footer>
            {/if}
        </div>
    </article>
</div>

<style>
    .playlist-soundcloud-player {
        margin: 28px 0 8px;
        border: 1px solid rgba(0, 0, 0, 0.18);
        background: #111111;
        color: #ffffff;
    }

    .playlist-soundcloud-header {
        min-height: 42px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 0 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.14);
    }

    .playlist-soundcloud-header span,
    .playlist-soundcloud-header a {
        font-size: 11px;
        font-weight: 800;
        line-height: 1;
        text-transform: uppercase;
    }

    .playlist-soundcloud-header span {
        color: var(--accent-color);
    }

    .playlist-soundcloud-header a {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #ffffff;
        text-decoration: none;
    }

    .playlist-soundcloud-header a:hover,
    .playlist-soundcloud-header a:focus-visible {
        color: var(--accent-color);
    }

    .playlist-soundcloud-player iframe {
        display: block;
        border: 0;
    }

    @media (max-width: 640px) {
        .playlist-soundcloud-header {
            align-items: flex-start;
            flex-direction: column;
            padding: 12px;
        }

        .playlist-soundcloud-player iframe {
            height: 300px;
        }

    }

    .playlist-carousel {
        margin-top: 34px;
        max-width: 70%;
        margin-left: auto;
        margin-right: auto;
    }

    .playlist-carousel-viewport {
        overflow: hidden;
        background-color: #111111;
        touch-action: pan-y;
        user-select: none;
    }

    .playlist-carousel-track {
        display: flex;
        transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .playlist-carousel-slide {
        flex: 0 0 100%;
        margin: 0;
    }

    .playlist-carousel-slide img {
        width: 100%;
        aspect-ratio: 4 / 5;
        object-fit: cover;
        cursor: zoom-in;
        display: block;
    }

    .playlist-carousel-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0 0;
        gap: 12px;
    }

    .playlist-carousel-btn {
        min-width: 44px;
        min-height: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: 1px solid rgba(0, 0, 0, 0.2);
        color: #111111;
        font-family: var(--font-family);
        font-size: 13px;
        font-weight: 800;
        padding: 6px 16px;
        cursor: pointer;
        letter-spacing: 0.06em;
        transition: background-color 0.2s, color 0.2s;
        text-transform: uppercase;
    }

    .playlist-carousel-btn:hover:not(:disabled) {
        background-color: #111111;
        color: #f4f4ef;
    }

    .playlist-carousel-btn:disabled {
        opacity: 0.22;
        cursor: default;
    }

    .playlist-carousel-dots {
        display: flex;
        gap: 7px;
        align-items: center;
    }

    .playlist-carousel-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.18);
        border: none;
        padding: 0;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.2s;
    }

    .playlist-carousel-dot.active {
        background-color: #779383;
        transform: scale(1.4);
    }

    @media (max-width: 640px) {
        .playlist-carousel {
            max-width: 100%;
        }

        .playlist-carousel-viewport {
            width: 100%;
        }

        .playlist-carousel-btn {
            flex: 0 0 auto;
            min-width: 46px;
            min-height: 40px;
            padding: 7px 12px;
        }

        .playlist-carousel-dots {
            min-width: 0;
            flex-wrap: wrap;
            justify-content: center;
        }
    }
</style>
