<script lang="ts">
    const assets = [
        {
            label: 'Logos & identidade',
            icon: 'fas fa-image'
        },
        {
            label: 'Fotos oficiais',
            icon: 'fas fa-camera'
        },
        {
            label: 'Tech rider',
            icon: 'fas fa-sliders-h'
        }
    ];
</script>

<section id="press-kit-section" aria-labelledby="press-kit-title">
    <div class="press-kit-content-wrapper">
        <span class="press-kicker">BLACKMESA assets</span>
        <h2 id="press-kit-title">Press kit</h2>
        <p>
            Materiais de imprensa, logos em alta resolucao, fotos oficiais e informacoes tecnicas para publicacao, divulgacao e propostas.
        </p>

        <div class="press-actions">
            {#each assets as asset}
                <button class="press-btn press-btn-soon" type="button" disabled aria-disabled="true">
                    <i class={asset.icon}></i>
                    <span>{asset.label}</span>
                    <small>Em breve</small>
                </button>
            {/each}

            <a href="mailto:contato@blackmesa.com.br?subject=Press%20Kit%20BLACKMESA" class="press-btn press-btn-primary">
                <i class="fas fa-envelope"></i>
                <span>Contato imprensa</span>
            </a>
        </div>
    </div>
</section>

<style>
    #press-kit-section {
        position: relative;
        width: min(980px, 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: clamp(34px, 6vw, 72px) 22px;
        border: 1px solid var(--line-color);
        border-radius: var(--border-radius, 4px);
        background: rgba(5, 5, 5, 0.82);
        color: #ffffff;
        box-shadow: var(--shadow-large);
    }

    .press-kit-content-wrapper {
        width: min(760px, 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .press-kicker {
        color: var(--accent-color);
        font-size: 11px;
        font-weight: 800;
        line-height: 1;
        text-transform: uppercase;
    }

    h2 {
        margin: 12px 0 0;
        color: #ffffff;
        font-size: clamp(48px, 10vw, 96px);
        font-weight: 800;
        line-height: 0.86;
        text-transform: uppercase;
    }

    p {
        max-width: 620px;
        margin: 22px 0 0;
        color: var(--muted-color);
        font-size: 16px;
        line-height: 1.5;
    }

    .press-actions {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-top: 36px;
    }

    .press-btn {
        min-height: 48px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        border: 1px solid var(--line-color);
        border-radius: var(--border-radius, 4px);
        padding: 0 14px;
        background: rgba(255, 255, 255, 0.035);
        color: #ffffff;
        font: inherit;
        font-size: 12px;
        font-weight: 800;
        line-height: 1;
        text-decoration: none;
        text-transform: uppercase;
        transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
    }

    .press-btn i {
        color: var(--accent-color);
    }

    .press-btn small {
        min-height: 20px;
        display: inline-flex;
        align-items: center;
        border: 1px solid rgba(255, 255, 255, 0.22);
        padding: 0 6px;
        color: #aaaaaa;
        font-size: 9px;
        font-weight: 800;
        line-height: 1;
        text-transform: uppercase;
    }

    .press-btn-primary {
        background: var(--accent-color);
        border-color: var(--accent-color);
        color: #000000;
    }

    .press-btn-primary i {
        color: #000000;
    }

    .press-btn-primary:hover,
    .press-btn-primary:focus-visible {
        transform: translateY(-1px);
    }

    .press-btn-soon {
        opacity: 0.54;
    }

    @media (max-width: 640px) {
        #press-kit-section {
            padding: 28px 16px;
        }

        .press-actions {
            grid-template-columns: 1fr;
            margin-top: 26px;
        }

        .press-btn {
            justify-content: flex-start;
        }

        .press-btn-primary {
            justify-content: center;
        }
    }
</style>
