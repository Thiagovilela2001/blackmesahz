<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import SubHeader from "$lib/components/SubHeader.svelte";
    import ImageLightbox from "$lib/components/ImageLightbox.svelte";
    import RadioTab from "$lib/components/RadioTab.svelte";
    import EventsTab from "$lib/components/EventsTab.svelte";
    import HomeTab from "$lib/components/HomeTab.svelte";
    import InstitutionalOverlay from "$lib/components/InstitutionalOverlay.svelte";
    import { currentTab, isInstitutionalVisible } from "$lib/stores/navigation";
    import {
        currentIndex,
        expandedCardIndex,
        isAnimating,
        isPlaylistArticleOpen,
    } from "$lib/stores/cards";
    import { page } from "$app/stores";

    let lightbox: ImageLightbox;

    // Fade overlay
    let fadeOpacity = $state("1");

    // G-Man observer
    let gmanVisible = $state(false);

    $effect(() => {
        let timer: ReturnType<typeof setTimeout>;

        const show = () => { gmanVisible = true; };
        const reset = () => {
            gmanVisible = false;
            clearTimeout(timer);
            timer = setTimeout(show, 8000);
        };

        reset();

        window.addEventListener('mousemove', reset);
        window.addEventListener('keydown', reset);
        window.addEventListener('click', reset);
        window.addEventListener('touchstart', reset);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('mousemove', reset);
            window.removeEventListener('keydown', reset);
            window.removeEventListener('click', reset);
            window.removeEventListener('touchstart', reset);
        };
    });
    let fadeDisplay = $state("block");

    // Tooltip state
    let mouseX = $state(0);
    let mouseY = $state(0);
    let hoveredCardIndex = $state<number | null>(null);

    function handleMouseMove(e: MouseEvent) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    // Reactive active data
    let activeData = $derived(
        $currentTab === "playlists" ? $page.data.playlistCardsData : $page.data.releasesData,
    );

    // Page title
    let pageTitle = $derived(
        $currentTab === "releases"
            ? "RELEASES"
            : $currentTab === "playlists"
              ? "ARTIGOS"
              : $currentTab === "radio"
                ? "RÁDIO"
                : $currentTab === "events"
                  ? "EVENTOS"
                  : ""
    );

    // Page icon
    let pageIcon = $derived(
        $currentTab === "releases"
            ? "/ICONES/icone-radio.png"
            : $currentTab === "playlists"
              ? "/ICONES/icone-artigo.png"
              : $currentTab === "radio"
                ? "/ICONES/icone-radio.png"
                : $currentTab === "events"
                  ? "/ICONES/icone-eventos.png"
                  : ""
    );

    // Side info visibility
    let showCardUI = $derived(
        $currentTab === "releases" || $currentTab === "playlists",
    );
    let sideInfoOpacity = $derived(
        showCardUI && $expandedCardIndex === null && !$isPlaylistArticleOpen
            ? "1"
            : "0",
    );
    let arcOpacity = $derived(
        showCardUI && $expandedCardIndex === null && !$isPlaylistArticleOpen
            ? "1"
            : "0",
    );
    let scrollIndicatorOpacity = $derived(
        showCardUI &&
            $currentIndex === 0 &&
            $expandedCardIndex === null &&
            !$isPlaylistArticleOpen
            ? "1"
            : "0",
    );

    // Current card info
    let currentCardData = $derived(activeData[$currentIndex] || activeData[0]);

    function escapeHtml(value: string): string {
        const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };
        return String(value).replace(/[&<>"']/g, (char) => entities[char]);
    }

    function stopAllMedia() {
        const iframes = document.querySelectorAll("iframe");
        iframes.forEach((iframe) => {
            const src = iframe.src;
            iframe.src = src;
        });
    }

    function closePlaylistArticle() {
        isPlaylistArticleOpen.set(false);
    }

    function onCardClick(i: number) {
        if ($isAnimating) return;

        if ($currentIndex === i) {
            if ($currentTab === "playlists") {
                const card = $page.data.playlistCardsData[i];
                if (card?.slug) {
                    goto(`/playlists/${card.slug}`);
                }
                return;
            } else if ($expandedCardIndex === i) {
                stopAllMedia();
                expandedCardIndex.set(null);
            } else {
                expandedCardIndex.set(i);
            }
        } else {
            if ($expandedCardIndex !== null) return;
            currentIndex.set(i);
        }
    }

    function onCloseCard(e: Event) {
        e.stopPropagation();
        stopAllMedia();
        expandedCardIndex.set(null);
    }

    function getCardStyle(i: number): string {
        const viewportW = typeof window !== "undefined" ? window.innerWidth : 1024;
        const viewportH = typeof window !== "undefined" ? window.innerHeight : 768;
        const isMobile = viewportW <= 768;
        const wrapperLeft = isMobile ? 16 : 180;
        const baseW = isMobile ? Math.min(360, Math.max(260, viewportW - 32)) : 500;
        const baseH = isMobile ? Math.round(baseW * 0.56) : 225;
        const deltaIndex = i - $currentIndex;
        const distance = Math.abs(deltaIndex);
        const cardSpacingY = isMobile ? Math.min(190, Math.max(150, viewportH * 0.24)) : 240;
        const centerYOffset = baseH / 2;

        if ($expandedCardIndex !== null) {
            if ($expandedCardIndex === i) {
                const centerX = viewportW / 2;
                const targetW = isMobile ? Math.min(viewportW - 24, viewportW * 0.94) : Math.min(1200, viewportW * 0.95);
                const targetH = isMobile ? Math.max(300, Math.min(viewportH - 132, viewportH * 0.7)) : 550;
                const moveX = centerX - wrapperLeft - targetW / 2;
                const moveY = -(targetH / 2) + (isMobile ? 34 : 15);
                return `width:${targetW}px;height:${targetH}px;transform:translate3d(${moveX}px,${moveY}px,0) rotateZ(0deg);z-index:100;opacity:1;pointer-events:auto;`;
            } else {
                const extraPush = Math.sign(deltaIndex) * 200;
                const translateY = deltaIndex * cardSpacingY + extraPush;
                const rotateZ = deltaIndex * 4;
                const scale = 0.85 - distance * 0.05;
                return `width:${baseW}px;height:${baseH}px;transform:translateY(${translateY - centerYOffset}px) rotateZ(${rotateZ}deg) scale(${scale});z-index:0;opacity:0;pointer-events:none;`;
            }
        }

        if (distance > 3) {
            const translateY = deltaIndex * cardSpacingY;
            const rotateZ = deltaIndex * 4;
            const scale = 0.85 - distance * 0.05;
            return `width:${baseW}px;height:${baseH}px;transform:translateY(${translateY - centerYOffset}px) rotateZ(${rotateZ}deg) scale(${scale});opacity:0;pointer-events:none;z-index:0;`;
        }

        const translateY = deltaIndex * cardSpacingY;
        const rotateZ = deltaIndex * 4;
        let scale = distance === 0 ? 1 : 0.85 - distance * 0.05;
        const opacity = distance === 0 ? 1 : Math.max(0.1, 1 - distance * 0.4);
        const zIndex = distance === 0 ? 10 : 10 - distance;

        return `width:${baseW}px;height:${baseH}px;transform:translateY(${translateY - centerYOffset}px) rotateZ(${rotateZ}deg) scale(${scale});opacity:${opacity};z-index:${zIndex};pointer-events:auto;`;
    }

    // Scroll handler
    let scrollTimeout: ReturnType<typeof setTimeout>;

    function triggerAnimation() {
        isAnimating.set(true);
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isAnimating.set(false);
        }, 500);
    }

    function handleWheel(e: WheelEvent) {
        if ($isInstitutionalVisible) return;
        if ($currentTab !== "releases" && $currentTab !== "playlists" && $currentTab !== "home" && $currentTab !== "radio" && $currentTab !== "events") return;
        if ($isPlaylistArticleOpen) return;
        if (($currentTab === "releases" || $currentTab === "playlists") && ($expandedCardIndex !== null || $isAnimating)) return;

        if ($currentTab !== "releases" && $currentTab !== "playlists") return;

        if (e.deltaY > 0 && $currentIndex < activeData.length - 1) {
            currentIndex.update((n) => n + 1);
            triggerAnimation();
        } else if (e.deltaY < 0 && $currentIndex > 0) {
            currentIndex.update((n) => n - 1);
            triggerAnimation();
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if ($isPlaylistArticleOpen) {
            if (e.key === "Escape") closePlaylistArticle();
            return;
        }

        if ($expandedCardIndex !== null) {
            if (e.key === "Escape") {
                stopAllMedia();
                expandedCardIndex.set(null);
            }
            return;
        }

        if (
            ($currentTab !== "releases" && $currentTab !== "playlists") ||
            $isAnimating
        )
            return;

        if (e.key === "ArrowDown" && $currentIndex < activeData.length - 1) {
            currentIndex.update((n) => n + 1);
            triggerAnimation();
        } else if (e.key === "ArrowUp" && $currentIndex > 0) {
            currentIndex.update((n) => n - 1);
            triggerAnimation();
        } else if (e.key === "Enter" && $currentTab === "playlists") {
            const card = $page.data.playlistCardsData[$currentIndex];
            if (card?.slug) {
                goto(`/playlists/${card.slug}`);
            }
        } else if (e.key === "Enter") {
            expandedCardIndex.set($currentIndex);
        }
    }

    // Touch handling
    let touchStartY = 0;

    function handleTouchStart(e: TouchEvent) {
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchEnd(e: TouchEvent) {
        if (
            $expandedCardIndex !== null ||
            $isAnimating ||
            $isPlaylistArticleOpen ||
            $isInstitutionalVisible
        )
            return;

        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY - touchEndY;

        if ($currentTab !== "releases" && $currentTab !== "playlists") return;

        if (deltaY > 40) {
            if ($currentIndex < activeData.length - 1) {
                currentIndex.update((n) => n + 1);
                triggerAnimation();
            }
        } else if (deltaY < -40) {
            if ($currentIndex > 0) {
                currentIndex.update((n) => n - 1);
                triggerAnimation();
            }
        }
    }

    // Click outside overlay
    function onClickOutside() {
        if ($expandedCardIndex !== null) {
            stopAllMedia();
            expandedCardIndex.set(null);
        }
    }

    function openLightbox(src: string, alt: string) {
        if (lightbox) lightbox.openLightbox(src, alt);
    }

    onMount(() => {
        // Fade in
        fadeOpacity = "0";
        setTimeout(() => {
            fadeDisplay = "none";
        }, 1200);
    });
</script>

<svelte:window
    onwheel={handleWheel}
    onkeydown={handleKeydown}
    ontouchstart={handleTouchStart}
    ontouchend={handleTouchEnd}
    onmousemove={handleMouseMove}
/>

<!-- Fade Overlay -->
<div
    id="fade-overlay"
    style="opacity: {fadeOpacity}; display: {fadeDisplay}"
></div>

<!-- Tooltip -->
{#if hoveredCardIndex !== null && $expandedCardIndex === null && !$isAnimating && !$isPlaylistArticleOpen && activeData[hoveredCardIndex]}
    <div
        class="hover-tooltip"
        style="top: {mouseY + 20}px; left: {mouseX + 20}px;"
    >
        <span class="tooltip-kicker">
            {activeData[hoveredCardIndex].catalog || 'Artigo'}
        </span>
        <h4>
            {activeData[hoveredCardIndex].artist || activeData[hoveredCardIndex].title || 'Black Mesa'}
        </h4>
        <p>
            {activeData[hoveredCardIndex].song || activeData[hoveredCardIndex].subtitle || 'Clique para ler o artigo.'}
        </p>
    </div>
{/if}

<!-- Click Outside Overlay (for expanded cards) -->
<div
    id="click-outside-overlay"
    role="presentation"
    tabindex="-1"
    style="display: {$expandedCardIndex !== null
        ? 'block'
        : 'none'}; opacity: {$expandedCardIndex !== null ? '1' : '0'};"
    onclick={onClickOutside}
></div>

<!-- Lightbox -->
<ImageLightbox bind:this={lightbox} />

<!-- Institutional Overlay -->
<InstitutionalOverlay />

<!-- Sub Header -->
<SubHeader />

<!-- Page Title -->
{#if pageTitle}
    <div id="page-title-wrapper">
        {#if pageIcon}
            <img src={pageIcon} alt="" class="page-title-icon" />
        {/if}
        <h2 id="page-title">{pageTitle}</h2>
    </div>
{/if}

<!-- Arc Indicator -->
{#if showCardUI}
    <div id="arc-container" style="opacity: {arcOpacity}">
        <svg id="arc-svg" viewBox="0 0 200 1000" preserveAspectRatio="none">
            <path d="M 0 0 Q 200 500 0 1000" />
        </svg>
        <div id="arc-indicator"></div>
    </div>
{/if}

<!-- Cards Wrapper (Releases & Articles) -->
{#if showCardUI && !$isPlaylistArticleOpen}
    <div id="cards-wrapper">
        {#each activeData as data, i}
            <div
                class="card"
                class:is-expanded={$expandedCardIndex === i}
                style={getCardStyle(i)}
                role="button"
                tabindex="0"
                onclick={() => onCardClick(i)}
                onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick(i); } }}
                onmouseenter={() => hoveredCardIndex = i}
                onmouseleave={() => hoveredCardIndex = null}
            >
                <div
                    class="card-img-overlay"
                    style="background-image: url('{data.image}')"
                ></div>
                <div
                    class="card-text-content"
                    style="display: flex; flex-direction: column; height: 100%;"
                >
                    <div
                        style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;"
                    >
                        <div
                            style="display: flex; flex-direction: column; gap: 2px;"
                        >
                            <span
                                style="font-size: 12px; color: #666; font-weight: bold; line-height: 1; letter-spacing: 0;"
                                >{data.catalog}</span
                            >
                            <h2
                                style="font-size: 24px; font-weight: bold; margin: 0; line-height: 1; letter-spacing: 0;"
                            >
                                {data.artist}
                            </h2>
                            <h3
                                style="font-size: 15px; font-weight: normal; margin: 0; color: #555; line-height: 1; letter-spacing: 0;"
                            >
                                {data.song}
                            </h3>
                        </div>
                        <button
                            class="close-btn"
                            style="background: none; border: none; font-size: 30px; cursor: pointer; color: #000; padding: 0 5px; line-height: 1;"
                            onclick={onCloseCard}>&times;</button
                        >
                    </div>
                    {#if "embed" in data && data.embed}
                        <div
                            style="flex-grow: 1; display: flex; align-items: center; width: 100%; min-height: 150px;"
                        >
                            <div style="width: 100%;">{@html data.embed}</div>
                        </div>
                    {/if}
                    {#if "credits" in data && data.credits}
                        <div
                            style="margin-top: auto; font-size: 12px; color: #444; line-height: 1.35; border-top: 1px solid #eee; padding-top: 12px; letter-spacing: 0;"
                        >
                            <strong
                                style="display: block; font-size: 13px; color: #000; margin-bottom: 2px;"
                                >Créditos</strong
                            >
                            {@html data.credits}
                        </div>
                    {/if}
                </div>
            </div>
        {/each}
    </div>

    <!-- Side Info -->
    <div id="side-info" style="opacity: {sideInfoOpacity}">
        <h3 id="info-catalog">{currentCardData?.catalog ?? ""}</h3>
        <h1 id="info-artist">{currentCardData?.artist ?? ""}</h1>
        <h2 id="info-song">{currentCardData?.song ?? ""}</h2>
    </div>
{/if}

<!-- Radio Tab -->
{#if $currentTab === "radio"}
    <RadioTab />
{/if}

<!-- Events Tab -->
{#if $currentTab === "events"}
    <EventsTab />
{/if}

<!-- Home Tab -->
{#if $currentTab === "home"}
    <HomeTab />
{/if}

<!-- G-Man Observer -->
<div class="gman-observer" class:visible={gmanVisible} aria-hidden="true">
    <img src="/gman-2-nobg.gif" alt="" />
</div>

<style>
    .gman-observer {
        position: fixed;
        bottom: 0;
        right: -180px;
        width: 160px;
        z-index: 40;
        pointer-events: none;
        opacity: 0;
        transition: right 3s cubic-bezier(0.16, 1, 0.3, 1), opacity 2s ease;
    }

    .gman-observer.visible {
        right: -45px;
        opacity: 0.45;
    }

    .gman-observer img {
        width: 100%;
        height: auto;
        filter: grayscale(0.3) brightness(0.75) contrast(1.1);
    }

    @media (max-width: 768px) {
        .gman-observer {
            width: 110px;
            right: -130px;
        }

        .gman-observer.visible {
            right: -30px;
            opacity: 0.35;
        }
    }
</style>
