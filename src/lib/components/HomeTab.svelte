<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { currentTab, isInstitutionalVisible, siteLanguage } from '$lib/stores/navigation';
    import { blackmesaHzPlaylist } from '$lib/data/blackmesaHz';
    import { collectiveMembers } from '$lib/data/collective';

    type FeatureSlide = {
        topicPt: string;
        topicEn: string;
        title: string;
        metaPrimary: string;
        metaSecondary: string;
        descriptionPt: string;
        descriptionEn: string;
        image: string;
        ctaPt: string;
        ctaEn: string;
        icon: string;
        action: () => void;
    };

    let activeFeatureIndex = $state(0);
    let featureTouchStartX = 0;
    let featureTouchStartY = 0;
    let latestRelease = $derived($page.data.releasesData?.[0]);
    let latestArticle = $derived($page.data.playlistCardsData?.[0]);
    let latestEvent = $derived($page.data.eventsData?.slice(-1)[0]);
    let featuredArticles = $derived($page.data.playlistCardsData?.slice(0, 3) ?? []);
    let signalImages = $derived(
        [latestRelease?.image, latestArticle?.image, latestEvent?.image, blackmesaHzPlaylist.coverUrl].filter(Boolean)
    );
    let homeStats = $derived([
        {
            labelPt: 'Releases',
            labelEn: 'Releases',
            value: String($page.data.releasesData?.length ?? 0)
        },
        {
            labelPt: 'Artigos',
            labelEn: 'Articles',
            value: String($page.data.playlistCardsData?.length ?? 0)
        },
        {
            labelPt: 'Eventos',
            labelEn: 'Events',
            value: String($page.data.eventsData?.length ?? 0)
        },
        {
            labelPt: 'Coletivo',
            labelEn: 'Crew',
            value: String(collectiveMembers.length)
        }
    ]);
    let featureSlides = $derived.by(() => {
        const slides: FeatureSlide[] = [];

        if (latestRelease) {
            slides.push({
                topicPt: 'Última música lançada',
                topicEn: 'Latest track released',
                title: latestRelease.song,
                metaPrimary: latestRelease.artist,
                metaSecondary: latestRelease.catalog,
                descriptionPt: 'A entrada mais recente do catalogo BLACKMESA, com contexto, creditos e superficie de escuta em um so lugar.',
                descriptionEn: 'The newest BLACKMESA catalog entry, with context, credits and a listening surface in one place.',
                image: latestRelease.image,
                ctaPt: 'Abrir release',
                ctaEn: 'Open release',
                icon: 'fa-solid fa-compact-disc',
                action: () => currentTab.set('releases')
            });
        }

        if (latestArticle) {
            slides.push({
                topicPt: 'Último artigo escrito',
                topicEn: 'Latest article written',
                title: latestArticle.artist,
                metaPrimary: latestArticle.catalog,
                metaSecondary: latestArticle.song,
                descriptionPt: 'A publicacao editorial mais recente da BLACKMESA Hz, entre contexto, imagem e escuta.',
                descriptionEn: 'The latest BLACKMESA Hz editorial publication, moving through context, image and listening.',
                image: imageUrl(latestArticle.image),
                ctaPt: 'Ler artigo',
                ctaEn: 'Read article',
                icon: 'fa-solid fa-newspaper',
                action: () => goToArticle(latestArticle.slug)
            });
        }

        if (latestEvent) {
            slides.push({
                topicPt: 'Último evento anunciado',
                topicEn: 'Latest event announced',
                title: latestEvent.artist,
                metaPrimary: latestEvent.catalog,
                metaSecondary: latestEvent.location || latestEvent.song,
                descriptionPt: 'O anuncio mais recente da agenda BLACKMESA, com data, local e chamada para a proxima aparicao.',
                descriptionEn: 'The latest BLACKMESA calendar announcement, with date, place and the next appearance.',
                image: imageUrl(latestEvent.image),
                ctaPt: 'Ver evento',
                ctaEn: 'View event',
                icon: 'fa-solid fa-calendar-days',
                action: () => currentTab.set('events')
            });
        }

        return slides;
    });
    let activeFeature = $derived(featureSlides[activeFeatureIndex] ?? featureSlides[0]);

    const aboutTopics = [
        {
            labelPt: 'Coletivo',
            labelEn: 'Collective',
            textPt: 'Selo, radio e plataforma visual para a cena bass brasileira, reunindo DJs, produtores, MCs e criativos.',
            textEn: 'Label, radio and visual platform for Brazilian bass culture, connecting DJs, producers, MCs and creatives.',
            actionPt: 'Abrir sobre',
            actionEn: 'Open about',
            icon: 'fa-solid fa-users',
            action: openInstitutional
        },
        {
            labelPt: 'Press kit',
            labelEn: 'Press kit',
            textPt: 'Materiais de imprensa, identidade, fotos oficiais e informacoes tecnicas para publicacao e divulgacao.',
            textEn: 'Press assets, identity files, official photos and technical information for publishing and promotion.',
            actionPt: 'Solicitar',
            actionEn: 'Request',
            icon: 'fa-solid fa-file-arrow-down',
            action: () => {
                window.location.href = 'mailto:contato@blackmesa.com.br?subject=Press%20Kit%20BLACKMESA';
            }
        },
        {
            labelPt: 'Contrate',
            labelEn: 'Booking',
            textPt: 'Bookings para eventos, curadorias, radios, showcases, conteudo editorial e projetos especiais.',
            textEn: 'Bookings for events, curation, radio, showcases, editorial content and special projects.',
            actionPt: 'Contato',
            actionEn: 'Contact',
            icon: 'fa-solid fa-bolt',
            action: () => {
                window.location.href = 'mailto:contato@blackmesa.com.br?subject=Contrate%20BLACKMESA';
            }
        }
    ];

    function imageUrl(path?: string) {
        if (!path) return '';
        return path.startsWith('http') || path.startsWith('/') ? path : `/${path}`;
    }

    function setFeature(index: number) {
        if (!featureSlides.length) return;
        activeFeatureIndex = (index + featureSlides.length) % featureSlides.length;
    }

    function nextFeature() {
        setFeature(activeFeatureIndex + 1);
    }

    function previousFeature() {
        setFeature(activeFeatureIndex - 1);
    }

    function handleFeatureTouchStart(event: TouchEvent) {
        const touch = event.touches[0];
        featureTouchStartX = touch.clientX;
        featureTouchStartY = touch.clientY;
    }

    function handleFeatureTouchEnd(event: TouchEvent) {
        if (!featureSlides.length) return;

        const touch = event.changedTouches[0];
        const deltaX = featureTouchStartX - touch.clientX;
        const deltaY = featureTouchStartY - touch.clientY;

        if (Math.abs(deltaX) < 44 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) {
            return;
        }

        if (deltaX > 0) {
            nextFeature();
        } else {
            previousFeature();
        }
    }

    function goToArticles() {
        currentTab.set('playlists');
    }

    function openInstitutional() {
        isInstitutionalVisible.set(true);
    }

    function goToArticle(slug?: string) {
        if (!slug) {
            goToArticles();
            return;
        }

        currentTab.set('playlists');
        goto(`/playlists/${slug}`);
    }

    $effect(() => {
        if (activeFeatureIndex >= featureSlides.length) {
            activeFeatureIndex = 0;
        }
    });
</script>

<div id="home-wrapper">
    <section
        class="home-feature"
        aria-label="Destaques BLACKMESA"
        ontouchstart={handleFeatureTouchStart}
        ontouchend={handleFeatureTouchEnd}
    >
        {#if activeFeature}
            <div class="feature-media">
                <img src={imageUrl(activeFeature.image)} alt={activeFeature.title} />
                <div class="feature-index">
                    {String(activeFeatureIndex + 1).padStart(2, '0')} / {String(featureSlides.length).padStart(2, '0')}
                </div>
            </div>
            <div class="feature-copy">
                <div class="feature-carousel-head">
                    <div>
                        <span class="section-kicker">{$siteLanguage === 'en' ? 'Latest updates' : 'Últimos lançamentos'}</span>
                        <span class="feature-topic">{$siteLanguage === 'en' ? activeFeature.topicEn : activeFeature.topicPt}</span>
                    </div>
                    <div class="feature-carousel-controls">
                        <button class="feature-nav-btn" type="button" aria-label="Anterior" onclick={previousFeature}>
                            <i class="fa-solid fa-arrow-left"></i>
                        </button>
                        <button class="feature-nav-btn" type="button" aria-label="Proximo" onclick={nextFeature}>
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
                <h1>{activeFeature.title}</h1>
                <div class="feature-meta">
                    <span>{activeFeature.metaPrimary}</span>
                    <span>{activeFeature.metaSecondary}</span>
                </div>

                <div class="feature-actions">
                    <button class="bm-btn is-primary" onclick={activeFeature.action}>
                        <i class={activeFeature.icon}></i>
                        {$siteLanguage === 'en' ? activeFeature.ctaEn : activeFeature.ctaPt}
                    </button>
                    <button class="bm-btn" onclick={goToArticles}>
                        <i class="fa-solid fa-newspaper"></i>
                        {$siteLanguage === 'en' ? 'Read articles' : 'Ler artigos'}
                    </button>
                </div>
                <div class="feature-dots" aria-label="Selecionar destaque">
                    {#each featureSlides as slide, index}
                        <button
                            class="feature-dot"
                            class:active={activeFeatureIndex === index}
                            type="button"
                            aria-label={$siteLanguage === 'en' ? slide.topicEn : slide.topicPt}
                            aria-current={activeFeatureIndex === index ? 'true' : undefined}
                            onclick={() => setFeature(index)}
                        ></button>
                    {/each}
                </div>
            </div>
        {:else}
            <div class="feature-copy is-empty">
                <span class="section-kicker">BLACKMESA</span>
                <h1>BLACKMESA Hz</h1>
                <p>
                    {$siteLanguage === 'en'
                        ? 'A platform for releases, radio, events and editorial notes around Brazilian bass pressure.'
                        : 'Uma plataforma para releases, radio, eventos e notas editoriais em torno da pressao bass brasileira.'}
                </p>
            </div>
        {/if}
    </section>

    <section class="home-signal-band" aria-label="BLACKMESA signal">
        <div class="signal-copy">
            <span class="section-kicker">BLACKMESA SIGNAL</span>
            <h2>{$siteLanguage === 'en' ? 'Bass pressure, visual memory and local transmission.' : 'Pressao bass, memoria visual e transmissao local.'}</h2>
            <div class="signal-tags">
                <span>UK GARAGE</span>
                <span>BASS</span>
                <span>DUBSTEP</span>
                <span>BRASIL</span>
            </div>
        </div>

        <div class="signal-stats">
            {#each homeStats as stat}
                <button
                    class="signal-stat"
                    type="button"
                    onclick={() => {
                        if (stat.labelEn === 'Releases') currentTab.set('releases');
                        if (stat.labelEn === 'Articles') currentTab.set('playlists');
                        if (stat.labelEn === 'Events') currentTab.set('events');
                        if (stat.labelEn === 'Crew') openInstitutional();
                    }}
                >
                    <strong>{stat.value}</strong>
                    <span>{$siteLanguage === 'en' ? stat.labelEn : stat.labelPt}</span>
                </button>
            {/each}
        </div>

        <div class="signal-collage" aria-hidden="true">
            {#each signalImages as image, index}
                <span
                    class="signal-frame frame-{index + 1}"
                    style="background-image: url('{imageUrl(image)}')"
                ></span>
            {/each}
        </div>
    </section>

    <section class="home-dashboard" aria-label="BLACKMESA dashboard">
        <div class="home-panel hz-panel">
            <div class="hz-ambient" style="background-image: url('{blackmesaHzPlaylist.coverUrl}')" aria-hidden="true"></div>
            <div class="panel-head">
                <span class="section-kicker">BLACKMESA Hz</span>
                <span class="panel-count">{blackmesaHzPlaylist.platform}</span>
            </div>
            <div class="hz-identity-row">
                <img class="hz-cover-thumb" src={blackmesaHzPlaylist.coverUrl} alt={blackmesaHzPlaylist.title} />
                <div class="hz-identity-copy">
                    <h2>{$siteLanguage === 'en' ? blackmesaHzPlaylist.subtitleEn : blackmesaHzPlaylist.subtitlePt}</h2>
                    <p>{$siteLanguage === 'en' ? blackmesaHzPlaylist.descriptionEn : blackmesaHzPlaylist.descriptionPt}</p>
                </div>
            </div>
            <div class="home-spotify-embed">
                <iframe
                    title={blackmesaHzPlaylist.title}
                    src={blackmesaHzPlaylist.embedUrl}
                    width="100%"
                    height="100%"
                    frameborder="0"
                    allowfullscreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                ></iframe>
            </div>
            <div class="hz-meta-grid">
                <div>
                    <small>Serie</small>
                    <strong>{blackmesaHzPlaylist.title}</strong>
                </div>
                <div>
                    <small>Formato</small>
                    <strong>{$siteLanguage === 'en' ? blackmesaHzPlaylist.labelEn : blackmesaHzPlaylist.labelPt}</strong>
                </div>
                <div>
                    <small>Status</small>
                    <strong>{$siteLanguage === 'en' ? blackmesaHzPlaylist.updateLabelEn : blackmesaHzPlaylist.updateLabelPt}</strong>
                </div>
            </div>
            <div class="hz-actions">
                <a class="bm-btn is-primary" href={blackmesaHzPlaylist.externalUrl} target="_blank" rel="noreferrer">
                    <i class="fa-solid fa-list"></i>
                    {$siteLanguage === 'en' ? 'Open playlist' : 'Abrir playlist'}
                </a>
                <button class="bm-btn" onclick={goToArticles}>
                    <i class="fa-solid fa-newspaper"></i>
                    {$siteLanguage === 'en' ? 'Read articles' : 'Ler artigos'}
                </button>
            </div>
        </div>

        <div class="home-panel archive-panel">
            <div class="panel-head">
                <span class="section-kicker">{$siteLanguage === 'en' ? 'Articles' : 'Artigos'}</span>
                <button class="icon-link" aria-label="Abrir artigos" onclick={goToArticles}>
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
            <div class="article-list">
                {#each featuredArticles as article, index}
                    <button class="article-row" onclick={() => goToArticle(article.slug)}>
                        <span class="article-number">{String(index + 1).padStart(2, '0')}</span>
                        <span class="article-thumb" style="background-image: url('{imageUrl(article.image)}')"></span>
                        <span class="article-copy">
                            <strong>{article.artist}</strong>
                            <small>{article.catalog} / {article.song}</small>
                        </span>
                    </button>
                {/each}
            </div>
        </div>

        <div class="home-panel about-panel">
            <div class="panel-head">
                <span class="section-kicker">{$siteLanguage === 'en' ? 'About us' : 'Sobre nos'}</span>
                <span class="panel-count">BLACKMESA</span>
            </div>
            <h2>{$siteLanguage === 'en' ? 'Collective, assets and bookings.' : 'Coletivo, materiais e contratacao.'}</h2>
            <div class="about-topic-list">
                {#each aboutTopics as topic}
                    <button class="about-topic" onclick={topic.action}>
                        <span class="topic-icon"><i class={topic.icon}></i></span>
                        <span class="topic-copy">
                            <strong>{$siteLanguage === 'en' ? topic.labelEn : topic.labelPt}</strong>
                            <small>{$siteLanguage === 'en' ? topic.textEn : topic.textPt}</small>
                        </span>
                        <span class="topic-action">
                            {$siteLanguage === 'en' ? topic.actionEn : topic.actionPt}
                            <i class="fa-solid fa-arrow-right"></i>
                        </span>
                    </button>
                {/each}
            </div>
        </div>
    </section>
</div>

<style>
    #home-wrapper {
        position: fixed;
        top: 75px;
        left: 0;
        width: 100vw;
        height: calc(100vh - 123px);
        height: calc(100dvh - 123px);
        padding: 24px 32px 64px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        z-index: 50;
        color: #ffffff;
        pointer-events: auto;
        background:
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(180deg, rgba(255,255,255,0.035) 1px, transparent 1px),
            #000000;
        background-size: 44px 44px;
        scroll-behavior: smooth;
        scrollbar-color: #555555 #050505;
        animation: homeEnter 0.46s var(--ease-standard, cubic-bezier(0.16, 1, 0.3, 1)) both;
    }

    #home-wrapper::-webkit-scrollbar {
        width: 8px;
    }

    #home-wrapper::-webkit-scrollbar-track {
        background: #050505;
    }

    #home-wrapper::-webkit-scrollbar-thumb {
        background: #555;
        border-radius: 4px;
    }

    .home-feature,
    .home-panel {
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(5, 5, 5, 0.88);
        backdrop-filter: blur(14px);
        border-radius: 16px;
        box-shadow: 0 0 0 1px rgba(119, 147, 131, 0.04), 0 24px 64px rgba(0, 0, 0, 0.55);
        transition: border-color 0.24s ease, background-color 0.24s ease, box-shadow 0.24s ease;
    }

    .home-feature:hover,
    .home-panel:hover {
        border-color: rgba(119, 147, 131, 0.3);
        box-shadow: 0 0 0 1px rgba(119, 147, 131, 0.12), 0 28px 72px rgba(0, 0, 0, 0.6);
    }

    .home-feature {
        min-height: min(58vh, 560px);
        display: grid;
        grid-template-columns: minmax(280px, 0.82fr) minmax(0, 1.18fr);
        overflow: hidden;
        touch-action: pan-y;
    }

    .feature-media {
        position: relative;
        min-height: 360px;
        background: #0b0b0b;
        border-right: 1px solid var(--line-color);
    }

    .feature-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: contrast(1.05) saturate(0.94);
        transition: filter 0.32s ease, transform 0.44s var(--ease-standard, cubic-bezier(0.16, 1, 0.3, 1));
    }

    .home-feature:hover .feature-media img {
        filter: contrast(1.1) saturate(1);
        transform: scale(1.015);
    }

    .feature-media::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, transparent 54%, rgba(0,0,0,0.7));
        pointer-events: none;
    }

    .feature-index {
        position: absolute;
        left: 16px;
        bottom: 16px;
        z-index: 2;
        min-height: 30px;
        display: inline-flex;
        align-items: center;
        padding: 0 10px;
        border: 1px solid var(--accent-color);
        background: #000000;
        color: var(--accent-color);
        font-size: 12px;
        font-weight: 800;
        line-height: 1;
    }

    .feature-copy {
        min-width: 0;
        padding: clamp(28px, 5vh, 54px);
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .feature-copy.is-empty {
        grid-column: 1 / -1;
        max-width: 780px;
    }

    .section-kicker {
        color: var(--accent-color);
        font-size: 11px;
        font-weight: 800;
        line-height: 1;
        text-transform: uppercase;
    }

    .feature-carousel-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
    }

    .feature-topic {
        display: block;
        margin-top: 8px;
        color: #d8d8d8;
        font-size: 12px;
        font-weight: 800;
        line-height: 1;
        text-transform: uppercase;
    }

    .feature-carousel-controls {
        display: inline-flex;
        flex: 0 0 auto;
        gap: 8px;
    }

    .feature-nav-btn,
    .feature-dot {
        font: inherit;
    }

    .feature-nav-btn {
        width: 34px;
        height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--line-color);
        border-radius: var(--border-radius);
        background: transparent;
        color: #ffffff;
        cursor: pointer;
        transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
    }

    .feature-nav-btn:hover,
    .feature-nav-btn:focus-visible {
        border-color: var(--accent-color);
        color: var(--accent-color);
        transform: translateY(-1px);
    }

    .feature-copy h1 {
        max-width: 960px;
        margin: 8px 0 0;
        font-size: clamp(28px, 5vw, 72px);
        font-weight: 800;
        line-height: 0.92;
        text-transform: uppercase;
    }

    .feature-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
    }

    .feature-meta span,
    .panel-count {
        min-height: 24px;
        display: inline-flex;
        align-items: center;
        padding: 0 8px;
        border: 1px solid var(--line-color);
        color: #d8d8d8;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
    }

    .feature-copy p,
    .home-panel p {
        max-width: 690px;
        margin: 18px 0 0;
        color: var(--muted-color);
        font-size: 15px;
        line-height: 1.5;
    }

    .feature-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 18px;
    }

    .feature-dots {
        display: flex;
        align-items: center;
        gap: 7px;
        min-height: 14px;
        margin-top: 24px;
    }

    .feature-dot {
        width: 28px;
        height: 4px;
        border: 0;
        border-radius: 0;
        padding: 0;
        background: rgba(255, 255, 255, 0.34);
        cursor: pointer;
        transition: background-color 0.18s ease, opacity 0.18s ease, transform 0.18s ease;
    }

    .feature-dot:hover,
    .feature-dot:focus-visible {
        opacity: 0.82;
        transform: scaleX(1.1);
    }

    .feature-dot.active {
        background: var(--accent-color);
        opacity: 1;
        transform: scaleX(1.22);
    }

    .bm-btn,
    .icon-link,
    .article-row,
    .about-topic {
        font: inherit;
    }

    .bm-btn {
        min-height: 38px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 14px;
        border: 1px solid var(--line-strong);
        border-radius: var(--border-radius);
        background: transparent;
        color: #ffffff;
        font-size: 12px;
        font-weight: 800;
        text-decoration: none;
        text-transform: uppercase;
        cursor: pointer;
        transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
    }

    .bm-btn:hover,
    .bm-btn:focus-visible {
        border-color: var(--accent-color);
        color: var(--accent-color);
        transform: translateY(-1px);
    }

    .bm-btn.is-primary {
        background: var(--accent-color);
        border-color: var(--accent-color);
        color: #000000;
    }

    .bm-btn:active,
    .icon-link:active,
    .article-row:active,
    .about-topic:active {
        transform: translateY(0);
    }

    .bm-btn.is-primary:hover,
    .bm-btn.is-primary:focus-visible {
        color: #000000;
    }

    .home-dashboard {
        display: grid;
        grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.82fr) minmax(280px, 0.92fr);
        gap: 18px;
    }

    .home-signal-band {
        position: relative;
        min-height: 210px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(280px, 0.72fr) minmax(260px, 0.58fr);
        gap: 18px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        background:
            linear-gradient(90deg, rgba(119, 147, 131, 0.11), transparent 42%),
            rgba(5, 5, 5, 0.9);
        box-shadow: 0 0 0 1px rgba(119, 147, 131, 0.04), 0 24px 64px rgba(0, 0, 0, 0.48);
    }

    .home-signal-band::before {
        content: "BLACKMESA";
        position: absolute;
        left: 18px;
        bottom: -11px;
        color: rgba(255, 255, 255, 0.035);
        font-size: clamp(68px, 13vw, 180px);
        font-weight: 800;
        line-height: 0.8;
        pointer-events: none;
    }

    .signal-copy {
        position: relative;
        z-index: 1;
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-width: 0;
    }

    .signal-copy h2 {
        max-width: 780px;
        margin: 16px 0 0;
        color: #ffffff;
        font-size: clamp(28px, 4.6vw, 62px);
        font-weight: 800;
        line-height: 0.94;
        text-transform: uppercase;
    }

    .signal-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: 22px;
    }

    .signal-tags span {
        min-height: 26px;
        display: inline-flex;
        align-items: center;
        border: 1px solid rgba(255, 255, 255, 0.14);
        padding: 0 9px;
        color: #d8d8d8;
        font-size: 10px;
        font-weight: 800;
    }

    .signal-stats {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        border-left: 1px solid rgba(255, 255, 255, 0.08);
        border-right: 1px solid rgba(255, 255, 255, 0.08);
    }

    .signal-stat {
        min-width: 0;
        border: 0;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding: 18px;
        background: rgba(255, 255, 255, 0.018);
        color: #ffffff;
        cursor: pointer;
        text-align: left;
    }

    .signal-stat:nth-child(2n) {
        border-right: 0;
    }

    .signal-stat:nth-last-child(-n + 2) {
        border-bottom: 0;
    }

    .signal-stat strong {
        display: block;
        color: var(--accent-color);
        font-size: clamp(28px, 4vw, 48px);
        font-weight: 800;
        line-height: 0.9;
    }

    .signal-stat span {
        display: block;
        margin-top: 8px;
        color: #bdbdbd;
        font-size: 10px;
        font-weight: 800;
        line-height: 1;
        text-transform: uppercase;
    }

    .signal-collage {
        position: relative;
        min-height: 210px;
        overflow: hidden;
        background: #050505;
    }

    .signal-frame {
        position: absolute;
        display: block;
        background-size: cover;
        background-position: center;
        border: 1px solid rgba(255, 255, 255, 0.14);
        box-shadow: 0 18px 46px rgba(0, 0, 0, 0.56);
        filter: contrast(1.05) saturate(0.92);
    }

    .frame-1 {
        width: 64%;
        height: 64%;
        left: 10%;
        top: 12%;
        z-index: 3;
        transform: rotate(-4deg);
    }

    .frame-2 {
        width: 50%;
        height: 48%;
        right: 7%;
        bottom: 10%;
        z-index: 4;
        transform: rotate(5deg);
    }

    .frame-3 {
        width: 42%;
        height: 42%;
        right: 18%;
        top: 7%;
        z-index: 2;
        opacity: 0.74;
        transform: rotate(9deg);
    }

    .frame-4 {
        width: 46%;
        height: 46%;
        left: 4%;
        bottom: 6%;
        z-index: 1;
        opacity: 0.64;
        transform: rotate(7deg);
    }

    .home-panel {
        min-height: 310px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
    }

    .panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 20px;
    }

    .home-panel h2 {
        margin: 0;
        font-size: clamp(26px, 4vw, 46px);
        font-weight: 800;
        line-height: 0.95;
        text-transform: uppercase;
    }

    .hz-ambient {
        position: absolute;
        inset: 0;
        background-size: cover;
        background-position: center;
        filter: blur(60px) brightness(0.12) saturate(2);
        transform: scale(1.2);
        z-index: 0;
        pointer-events: none;
        border-radius: inherit;
    }

    .hz-panel > *:not(.hz-ambient) {
        position: relative;
        z-index: 1;
    }

    .hz-identity-row {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 4px;
    }

    .hz-cover-thumb {
        width: 72px;
        height: 72px;
        border-radius: 10px;
        object-fit: cover;
        flex-shrink: 0;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
    }

    .hz-identity-copy {
        flex: 1;
        min-width: 0;
    }

    .hz-identity-copy h2 {
        margin: 0 0 6px;
    }

    .hz-identity-copy p {
        margin: 0;
    }

    .home-spotify-embed {
        position: relative;
        width: 100%;
        min-height: 156px;
        margin-top: 20px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        background: #050505;
    }

    .home-spotify-embed iframe {
        position: absolute;
        inset: 0;
        display: block;
        width: 100%;
        height: 100%;
        border: 0;
    }

    .hz-meta-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        margin: 14px 0 18px;
        border: 1px solid var(--line-color);
    }

    .hz-meta-grid div {
        min-width: 0;
        padding: 12px;
        border-right: 1px solid var(--line-color);
    }

    .hz-meta-grid div:last-child {
        border-right: 0;
    }

    .hz-meta-grid small,
    .article-row small {
        display: block;
        color: var(--muted-color);
        font-size: 10px;
        font-weight: 800;
        line-height: 1;
        text-transform: uppercase;
    }

    .hz-meta-grid strong {
        display: block;
        margin-top: 7px;
        color: #ffffff;
        font-size: 12px;
        line-height: 1.2;
        text-transform: uppercase;
    }

    .hz-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: auto;
    }

    .archive-panel {
        padding-bottom: 14px;
    }

    .icon-link {
        width: 32px;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--line-color);
        border-radius: var(--border-radius);
        background: transparent;
        color: #ffffff;
        cursor: pointer;
    }

    .icon-link:hover,
    .icon-link:focus-visible {
        border-color: var(--accent-color);
        color: var(--accent-color);
    }

    .article-list {
        display: flex;
        flex-direction: column;
        border-top: 1px solid var(--line-color);
    }

    .article-row {
        width: 100%;
        min-height: 78px;
        display: grid;
        grid-template-columns: 34px 54px minmax(0, 1fr);
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border: 0;
        border-bottom: 1px solid var(--line-color);
        background: transparent;
        color: #ffffff;
        text-align: left;
        cursor: pointer;
        transition: background-color 0.18s ease, border-color 0.18s ease;
    }

    .article-row:hover,
    .article-row:focus-visible,
    .about-topic:hover,
    .about-topic:focus-visible {
        background: rgba(119, 147, 131, 0.045);
        border-color: rgba(119, 147, 131, 0.28);
    }

    .article-row:hover .article-copy strong,
    .article-row:focus-visible .article-copy strong {
        color: var(--accent-color);
    }

    .article-number {
        color: var(--accent-color);
        font-size: 12px;
        font-weight: 800;
    }

    .article-thumb {
        width: 54px;
        height: 54px;
        display: block;
        background-size: cover;
        background-position: center;
        border: 1px solid var(--line-color);
        filter: grayscale(0.34) contrast(1.04);
        transition: filter 0.22s ease, border-color 0.22s ease;
    }

    .article-row:hover .article-thumb,
    .article-row:focus-visible .article-thumb {
        border-color: var(--accent-color);
        filter: grayscale(0) contrast(1.08);
    }

    .article-copy {
        min-width: 0;
    }

    .article-copy strong {
        display: block;
        overflow: hidden;
        color: #ffffff;
        font-size: 14px;
        line-height: 1.05;
        text-overflow: ellipsis;
        text-transform: uppercase;
        white-space: nowrap;
        transition: color 0.18s ease;
    }

    .article-copy small {
        margin-top: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .about-topic {
        position: relative;
        min-height: 46px;
        display: grid;
        grid-template-columns: 30px minmax(0, 1fr) auto;
        align-items: center;
        gap: 12px;
        overflow: hidden;
        padding: 12px 0;
        border: 0;
        border-bottom: 1px solid var(--line-color);
        background: transparent;
        color: #ffffff;
        cursor: pointer;
        text-align: left;
        transition: background-color 0.18s ease, border-color 0.18s ease;
    }

    .about-topic:first-child {
        border-top: 1px solid var(--line-color);
    }

    .about-topic:hover .topic-copy strong,
    .about-topic:focus-visible .topic-copy strong,
    .about-topic:hover .topic-action,
    .about-topic:focus-visible .topic-action {
        color: var(--accent-color);
    }

    .topic-icon {
        width: 30px;
        height: 30px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--line-color);
        border-radius: var(--border-radius);
        font-size: 12px;
        transition: border-color 0.18s ease, color 0.18s ease, background-color 0.18s ease;
    }

    .about-topic:hover .topic-icon,
    .about-topic:focus-visible .topic-icon {
        background: var(--accent-color);
        border-color: var(--accent-color);
        color: #000000;
    }

    .topic-copy {
        min-width: 0;
    }

    .topic-copy strong {
        display: block;
        color: #ffffff;
        font-size: 14px;
        font-weight: 800;
        line-height: 1;
        text-transform: uppercase;
        transition: color 0.18s ease;
    }

    .topic-copy small {
        display: block;
        margin-top: 6px;
        color: var(--muted-color);
        font-size: 12px;
        line-height: 1.35;
    }

    .topic-action {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: #d0d0d0;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        transition: color 0.18s ease;
    }

    .topic-action i {
        transition: transform 0.18s ease;
    }

    .about-topic:hover .topic-action i,
    .about-topic:focus-visible .topic-action i {
        transform: translateX(2px);
    }

    @keyframes homeEnter {
        from {
            opacity: 0;
            transform: translateY(8px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (max-width: 1020px) {
        .home-feature,
        .home-dashboard {
            grid-template-columns: 1fr;
        }

        .feature-media {
            min-height: 280px;
            border-right: 0;
            border-bottom: 1px solid var(--line-color);
        }

        .hz-meta-grid {
            grid-template-columns: 1fr;
        }

        .hz-meta-grid div {
            border-right: 0;
            border-bottom: 1px solid var(--line-color);
        }

        .hz-meta-grid div:last-child {
            border-bottom: 0;
        }
    }

    @media (max-width: 768px) {
        #home-wrapper {
            top: 88px;
            height: calc(100vh - 136px);
            height: calc(100dvh - 136px);
            padding: 14px 14px 64px;
            gap: 14px;
            background:
                linear-gradient(180deg, rgba(119, 147, 131, 0.1), transparent 260px),
                linear-gradient(90deg, rgba(255,255,255,0.026) 1px, transparent 1px),
                linear-gradient(180deg, rgba(255,255,255,0.026) 1px, transparent 1px),
                #000000;
            background-size: auto, 32px 32px, 32px 32px, auto;
        }

        .home-feature {
            min-height: auto;
            border-radius: 16px;
            background: rgba(8, 8, 8, 0.94);
            box-shadow: 0 20px 64px rgba(0, 0, 0, 0.62);
        }

        .home-signal-band {
            min-height: 0;
            grid-template-columns: 1fr;
            gap: 0;
            border-radius: 16px;
            background:
                linear-gradient(180deg, rgba(119, 147, 131, 0.13), transparent 52%),
                rgba(7, 7, 7, 0.94);
        }

        .home-signal-band::before {
            left: 12px;
            bottom: auto;
            top: 150px;
            font-size: 72px;
        }

        .signal-collage {
            order: -1;
            min-height: 170px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .frame-1 {
            width: 58%;
            height: 72%;
            left: 8%;
            top: 15%;
        }

        .frame-2 {
            width: 42%;
            height: 58%;
            right: 7%;
            bottom: 13%;
        }

        .frame-3 {
            width: 35%;
            height: 38%;
            right: 25%;
            top: 8%;
        }

        .frame-4 {
            width: 34%;
            height: 42%;
            left: 4%;
            bottom: 8%;
        }

        .signal-copy {
            padding: 18px;
        }

        .signal-copy h2 {
            margin-top: 12px;
            font-size: clamp(27px, 9vw, 38px);
            line-height: 0.95;
        }

        .signal-tags {
            margin-top: 16px;
            gap: 6px;
        }

        .signal-tags span {
            min-height: 25px;
            border-radius: 7px;
            background: rgba(255, 255, 255, 0.035);
        }

        .signal-stats {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            border-left: 0;
            border-right: 0;
        }

        .signal-stat {
            min-height: 76px;
            padding: 12px 8px;
            text-align: center;
            border-bottom: 0;
            border-right: 1px solid rgba(255, 255, 255, 0.08);
        }

        .signal-stat:nth-child(2n) {
            border-right: 1px solid rgba(255, 255, 255, 0.08);
        }

        .signal-stat:last-child {
            border-right: 0;
        }

        .signal-stat strong {
            font-size: 26px;
        }

        .signal-stat span {
            font-size: 9px;
            line-height: 1.1;
        }

        .feature-media {
            min-height: 230px;
            aspect-ratio: 4 / 3;
            border-bottom-color: rgba(255, 255, 255, 0.12);
        }

        .feature-media::after {
            background:
                linear-gradient(180deg, transparent 38%, rgba(0,0,0,0.82)),
                linear-gradient(90deg, rgba(119, 147, 131, 0.16), transparent 56%);
        }

        .feature-index {
            left: 12px;
            bottom: 12px;
            min-height: 26px;
            border-radius: 7px;
            background: rgba(0, 0, 0, 0.76);
            backdrop-filter: blur(10px);
            font-size: 11px;
        }

        .feature-copy,
        .home-panel {
            padding: 18px;
            border-radius: 16px;
            background: rgba(8, 8, 8, 0.92);
        }

        .feature-copy h1 {
            margin-top: 10px;
            font-size: clamp(32px, 11vw, 46px);
            line-height: 0.94;
            overflow-wrap: anywhere;
        }

        .feature-meta span,
        .panel-count {
            max-width: 100%;
        }

        .feature-copy p,
        .home-panel p {
            font-size: 14px;
            line-height: 1.5;
            color: #b8b8b8;
        }

        .feature-meta {
            gap: 6px;
        }

        .feature-meta span,
        .panel-count {
            min-height: 26px;
            border-radius: 7px;
            background: rgba(255, 255, 255, 0.035);
        }

        .feature-actions {
            flex-direction: column;
            gap: 8px;
        }

        .feature-carousel-head {
            flex-direction: column;
            gap: 12px;
        }

        .feature-carousel-controls {
            width: 100%;
        }

        .feature-nav-btn {
            flex: 1;
            height: 38px;
            border-radius: 9px;
            background: rgba(255, 255, 255, 0.035);
        }

        .feature-dots {
            margin-top: 18px;
            gap: 6px;
        }

        .feature-dot {
            flex: 1;
            height: 5px;
            border-radius: 999px;
        }

        .bm-btn,
        .hz-actions {
            width: 100%;
        }

        .bm-btn {
            min-height: 42px;
            border-radius: 9px;
        }

        .hz-actions {
            flex-direction: column;
        }

        .hz-identity-row {
            align-items: flex-start;
        }

        .hz-cover-thumb {
            width: 58px;
            height: 58px;
        }

        .home-spotify-embed {
            min-height: 142px;
            border-radius: 14px;
        }

        .article-row {
            min-height: 72px;
            grid-template-columns: 28px 58px minmax(0, 1fr);
            gap: 10px;
            padding: 10px 0;
        }

        .article-thumb {
            width: 58px;
            height: 58px;
            border-radius: 10px;
        }

        .about-topic {
            min-height: 58px;
            padding: 14px 0;
        }

        .about-topic {
            grid-template-columns: 30px minmax(0, 1fr);
            align-items: start;
        }

        .topic-action {
            grid-column: 2;
            justify-self: flex-start;
            margin-top: -2px;
        }
    }
</style>
