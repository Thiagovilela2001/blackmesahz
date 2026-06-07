<script lang="ts">
    import { radioData } from '$lib/data/radio';
    import { blackmesaHzPlaylist } from '$lib/data/blackmesaHz';
    import { isPlaying, toggleRadio, radioStatus } from '$lib/stores/radio';

    const barsCount = 28;

    let expandedProgramIndex = $state<number | null>(null);

    function toggleDetails(index: number) {
        if (expandedProgramIndex === index) {
            expandedProgramIndex = null;
        } else {
            expandedProgramIndex = index;
        }
    }
</script>

<div id="radio-wrapper" style="display: block">
    <div
        class="radio-ambient-bg"
        style="background-image: url('{blackmesaHzPlaylist.coverUrl}')"
        aria-hidden="true"
    ></div>
    <div class="radio-shell">
        <!-- Spotify Playlist -->
        <section class="radio-spotify-section">
            <div class="spotify-embed-wrapper">
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
        </section>

        <!-- Hero -->
        <section class="radio-hero">
            <div class="radio-topline">
                <span class="radio-live-pill">
                    <span class="radio-live-dot"></span>{radioData.currentShow.label}
                </span>
                <span class="radio-location">{radioData.location}</span>
            </div>

            <div class="radio-title-block">
                <h3>{radioData.currentShow.series}</h3>
                <h1>{radioData.currentShow.title}</h1>
                <p>{radioData.currentShow.description}</p>
            </div>

            <div class="radio-player-row">
                <button
                    class="radio-play-button"
                    class:is-playing={$isPlaying}
                    onclick={toggleRadio}
                    aria-label={$isPlaying ? 'Pausar rádio' : 'Tocar rádio ao vivo'}
                >
                    <i class={$isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'}></i>
                </button>
                <div class="radio-player-info">
                    <span class="radio-player-label">{radioData.station}</span>
                    <strong>{radioData.currentShow.host}</strong>
                    <span class="radio-status">{$radioStatus}</span>
                    <div class="radio-waveform" class:is-playing={$isPlaying} aria-hidden="true">
                        {#each Array(barsCount) as _}
                            <span></span>
                        {/each}
                    </div>
                </div>
            </div>
        </section>

        <!-- Side Panel -->
        <aside class="radio-side-panel">
            <div class="radio-side-header">
                <span>Próximos</span>
                <span>Hoje</span>
            </div>
            <div class="radio-next-list">
                {#each radioData.next as item}
                    <div class="radio-next-item">
                        <span class="radio-next-time">{item.time}</span>
                        <div class="radio-next-info">
                            <strong>{item.title}</strong>
                            <span>{item.subtitle}</span>
                        </div>
                    </div>
                {/each}
            </div>
            <div class="radio-tags">
                {#each radioData.tags as tag}
                    <span class="radio-tag">{tag}</span>
                {/each}
            </div>
        </aside>

        <!-- Programas -->
        <section id="radio-programas" class="radio-section">
            <div class="radio-section-header">
                <span>Programas</span>
                <span>Resumo</span>
            </div>
            <div class="radio-shows-stack">
                {#each radioData.highlights as show, index}
                    <article class="radio-show-row" class:is-expanded={expandedProgramIndex === index}>
                        <div class="show-row-main">
                            <div class="show-row-info">
                                {#if show.image}
                                    <img src={show.image} alt={show.title} class="show-row-img" />
                                {/if}
                                <div class="show-row-text">
                                    <h3>{show.title}</h3>
                                    <small>{show.date} {show.time_slot ? `| ${show.time_slot}` : ''}</small>
                                </div>
                            </div>
                            <button
                                class="details-btn"
                                type="button"
                                aria-expanded={expandedProgramIndex === index}
                                onclick={() => toggleDetails(index)}
                            >
                                {expandedProgramIndex === index ? 'Menos' : 'Detalhes'}
                            </button>
                        </div>
                        {#if expandedProgramIndex === index}
                            <div class="show-row-details">
                                <p><strong>Apresentação:</strong> {show.host || 'N/A'}</p>
                                <p><strong>Gênero:</strong> {show.genre || 'N/A'}</p>
                                <p class="desc">{show.description}</p>
                            </div>
                        {/if}
                    </article>
                {/each}
            </div>
        </section>

        <!-- Schedule -->
        <section class="radio-section">
            <div class="radio-section-header">
                <span>Schedule</span>
                <span>Semana</span>
            </div>
            <div class="radio-schedule-grid">
                <div class="radio-schedule-cell is-head">Hora</div>
                {#each radioData.scheduleDays as day}
                    <div class="radio-schedule-cell is-head">{day}</div>
                {/each}
                {#each radioData.schedule as row}
                    <div class="radio-schedule-cell is-time">{row.time}</div>
                    {#each row.shows as show}
                        <div class="radio-schedule-cell">
                            {#if show}<strong>{show}</strong>{/if}
                        </div>
                    {/each}
                {/each}
            </div>
        </section>
    </div>
</div>

<style>
    .radio-ambient-bg {
        position: absolute;
        inset: 0;
        background-size: cover;
        background-position: center;
        filter: blur(70px) brightness(0.13) saturate(2);
        transform: scale(1.2);
        z-index: 0;
        pointer-events: none;
    }

    .radio-shell {
        position: relative;
        z-index: 1;
    }

    .radio-spotify-section {
        grid-column: 1 / -1;
        padding: 0 8px;
    }

    .spotify-embed-wrapper {
        border-radius: 20px;
        overflow: hidden;
        height: calc(100vh - 195px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow:
            0 0 0 1px rgba(119, 147, 131, 0.06),
            0 32px 80px rgba(0, 0, 0, 0.6);
    }

    .spotify-embed-wrapper iframe {
        display: block;
        width: 100%;
        height: 100%;
    }

    @media (max-width: 720px) {
        .radio-spotify-section {
            padding: 0;
        }

        .spotify-embed-wrapper {
            height: calc(100vh - 170px);
            border-radius: 14px;
        }
    }

    .radio-shows-stack {
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    .radio-show-row {
        background: rgba(255, 255, 255, 0.02);
        border-bottom: 1px solid var(--line-color);
        padding: 16px;
        transition: background 0.2s, border-color 0.2s;
    }

    .radio-show-row:hover,
    .radio-show-row.is-expanded {
        background: rgba(119, 147, 131, 0.06);
        border-color: rgba(119, 147, 131, 0.22);
    }

    .show-row-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
    }

    .show-row-info {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .show-row-img {
        width: 68px;
        height: 68px;
        border: 1px solid var(--line-color);
        border-radius: var(--border-radius);
        object-fit: cover;
    }

    .show-row-text h3 {
        margin: 0 0 5px 0;
        font-size: 20px;
        font-weight: 800;
        line-height: 0.95;
        text-transform: uppercase;
    }

    .show-row-text small {
        color: #888;
        font-size: 12px;
    }

    .details-btn {
        min-height: 34px;
        background: transparent;
        border: 1px solid var(--line-color);
        color: #fff;
        padding: 0 12px;
        border-radius: var(--border-radius);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        font-weight: bold;
        backdrop-filter: blur(5px);
        box-shadow: none;
    }

    .details-btn:hover,
    .details-btn:focus-visible {
        background: var(--accent-color);
        color: #000;
        border-color: var(--accent-color);
        transform: translateY(-1px);
        box-shadow: none;
    }

    .show-row-details {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid var(--line-color);
        font-size: 14px;
        color: #ccc;
        animation: detailsOpen 0.24s var(--ease-standard, cubic-bezier(0.16, 1, 0.3, 1)) both;
    }

    .show-row-details p {
        margin: 5px 0;
    }

    .show-row-details .desc {
        margin-top: 15px;
        line-height: 1.45;
    }

    @keyframes detailsOpen {
        from {
            opacity: 0;
            transform: translateY(-4px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (max-width: 720px) {
        .show-row-main {
            align-items: flex-start;
            flex-direction: column;
        }

        .details-btn {
            width: 100%;
        }
    }
</style>
