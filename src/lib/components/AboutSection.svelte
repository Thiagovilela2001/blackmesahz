<script lang="ts">
    let currentSlide = $state(0);
    const totalSlides = 11;

    $effect(() => {
        const interval = setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
        }, 3000);

        return () => clearInterval(interval);
    });
</script>

<section id="about-section" aria-labelledby="about-title">
    <div class="about-content-wrapper">
        <div class="about-left-col">
            <img class="about-logo" src="/logo/big.webp" alt="BLACKMESA" />
            <div class="about-meta" aria-label="BLACKMESA resumo">
                <span>Desde 2024</span>
                <span>Sao Paulo</span>
                <span>UK Bass</span>
            </div>
            <div class="about-copy">
                <h2 id="about-title">Coletivo e selo independente.</h2>
                <p>Nascido em 2024, BLACKMESA e um coletivo e selo de Sao Paulo que reune veteranos da cena de UK Bass do estado. A plataforma nasce da soma de esforcos para amplificar vozes desse nicho e ocupar a cultura da grande capital.</p>
                <p>DJs, MCs, produtores, fotografos e designers compartilham o mesmo laboratorio para expandir os limites visuais e auditivos dos generos e subgeneros eletronicos em sua diaspora no Brasil.</p>
                <p>O coletivo e residente do CR1A 011 com o programa BLACKMESA LABS, encontro mensal que apresenta uma curadoria de nomes inseridos na cultura de dentro e fora da cidade.</p>
            </div>
        </div>

        <div class="about-right-col">
            <div class="slideshow-container">
                <div
                    class="slideshow-track"
                    style="width: {totalSlides * 100}%; transform: translateX(-{(currentSlide * 100) / totalSlides}%);"
                >
                    {#each Array(totalSlides) as _, i}
                        <img
                            src={`/slides/S${i + 1}.webp`}
                            alt={`BLACKMESA slide ${i + 1}`}
                            style="width: {100 / totalSlides}%;"
                        />
                    {/each}
                </div>
            </div>
        </div>
    </div>
</section>

<style>
    #about-section {
        position: relative;
        width: min(1120px, 100%);
        max-height: calc(100vh - 96px);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 34px;
        border: 1px solid var(--line-color);
        border-radius: var(--border-radius, 4px);
        background: rgba(5, 5, 5, 0.82);
        color: #ffffff;
        box-shadow: var(--shadow-large);
    }

    .about-content-wrapper {
        width: 100%;
        display: grid;
        grid-template-columns: minmax(0, 1.08fr) minmax(280px, 0.82fr);
        align-items: center;
        gap: clamp(28px, 5vw, 64px);
    }

    .about-left-col {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 22px;
    }

    .about-logo {
        width: min(260px, 72vw);
        height: auto;
        object-fit: contain;
    }

    .about-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .about-meta span {
        min-height: 24px;
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--line-color);
        padding: 0 8px;
        color: #d8d8d8;
        font-size: 11px;
        font-weight: 800;
        line-height: 1;
        text-transform: uppercase;
    }

    .about-copy {
        max-width: 640px;
        color: #d8d8d8;
    }

    .about-copy h2 {
        max-width: 620px;
        margin: 0 0 16px;
        color: #ffffff;
        font-size: clamp(34px, 5vw, 64px);
        font-weight: 800;
        line-height: 0.94;
        text-transform: uppercase;
    }

    .about-copy p {
        margin: 0 0 14px;
        color: var(--muted-color);
        font-size: 15px;
        line-height: 1.55;
    }

    .about-copy p:last-child {
        margin-bottom: 0;
    }

    .about-right-col {
        min-width: 0;
    }

    .slideshow-container {
        position: relative;
        width: 100%;
        aspect-ratio: 4 / 5;
        overflow: hidden;
        border: 1px solid var(--line-color);
        background: #0b0b0b;
    }

    .slideshow-container::after {
        content: "";
        position: absolute;
        inset: 0;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: linear-gradient(180deg, transparent 58%, rgba(0, 0, 0, 0.52));
        pointer-events: none;
    }

    .slideshow-track {
        display: flex;
        height: 100%;
        transition: transform 1.2s var(--ease-soft, cubic-bezier(0.22, 1, 0.36, 1));
    }

    .slideshow-track img {
        height: 100%;
        object-fit: cover;
        filter: contrast(1.04) saturate(0.96);
    }

    @media (max-width: 900px) {
        #about-section {
            max-height: none;
            overflow-y: auto;
            padding: 22px;
        }

        .about-content-wrapper {
            grid-template-columns: 1fr;
        }

        .about-right-col {
            width: min(420px, 100%);
        }
    }

    @media (max-width: 520px) {
        #about-section {
            padding: 16px;
        }

        .about-copy h2 {
            font-size: 34px;
        }
    }
</style>
