<script lang="ts">
    import { onMount } from 'svelte';
    import { siteLanguage } from '$lib/stores/navigation';

    let isLoading = $state(true);
    let isLanguageSelected = $state(false);

    onMount(() => {
        // Check for language cookie
        const cookies = document.cookie.split(';');
        const langCookie = cookies.find(c => c.trim().startsWith('site_language='));
        if (langCookie) {
            const lang = langCookie.split('=')[1];
            if (lang === 'pt-br' || lang === 'en') {
                siteLanguage.set(lang);
                isLanguageSelected = true;
                isLoading = false;
            }
        }
    });

    $effect(() => {
        if (isLanguageSelected) {
            // Small delay for smooth UX
            setTimeout(() => {
                isLoading = false;
            }, 500);
        }
    });

    function selectLanguage(lang: 'pt-br' | 'en') {
        siteLanguage.set(lang);
        document.cookie = `site_language=${lang}; max-age=31536000; path=/`;
        isLanguageSelected = true;
    }

    function showFlagFallback(event: Event) {
        const image = event.currentTarget as HTMLImageElement;
        image.style.display = 'none';
        const fallback = image.nextElementSibling as HTMLElement | null;
        if (fallback) fallback.style.display = 'inline';
    }
</script>

{#if isLoading}
    <div id="loading-screen">
        <div class="loading-mark" aria-hidden="true">BLACKMESA</div>
        <div class="loading-content">
            {#if !isLanguageSelected}
                <div class="flags-container">
                    <button class="flag-btn" onclick={() => selectLanguage('pt-br')} aria-label="Português (Brasil)">
                        <img
                            src="https://flagcdn.com/w160/br.png"
                            alt=""
                            class="flag-img"
                            onerror={showFlagFallback}
                        />
                        <span class="flag-emoji" style="display:none" aria-hidden="true">🇧🇷</span>
                        <span class="flag-label">PT-BR</span>
                    </button>
                    <button class="flag-btn" onclick={() => selectLanguage('en')} aria-label="English">
                        <img
                            src="https://flagcdn.com/w160/us.png"
                            alt=""
                            class="flag-img"
                            onerror={showFlagFallback}
                        />
                        <span class="flag-emoji" style="display:none" aria-hidden="true">🇺🇸</span>
                        <span class="flag-label">EN</span>
                    </button>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    #loading-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        height: 100dvh;
        background-color: var(--bg-color, #050505);
        color: var(--text-color, #ffffff);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-family, 'Supreme', sans-serif);
    }

    .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px;
        max-width: 400px;
        width: 100%;
        padding: 20px;
    }

    .flags-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .flag-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(255,255,255,0.05);
        border: 2px solid rgba(255,255,255,0.15);
        border-radius: 8px;
        padding: 12px 24px;
        cursor: pointer;
        transition: transform 0.2s, border-color 0.2s;
        color: #fff;
    }

    .flag-btn:hover {
        transform: scale(1.05);
        border-color: rgba(255,255,255,0.5);
    }

    .flag-img {
        width: 48px;
        height: auto;
        border-radius: 2px;
    }

    .flag-emoji {
        font-size: 32px;
        line-height: 1;
    }

    .flag-label {
        font-size: 16px;
        font-weight: bold;
        letter-spacing: 2px;
    }

    .loading-mark {
        position: absolute;
        right: 4vw;
        bottom: 3vh;
        max-width: 86vw;
        opacity: 0.05;
        color: #ffffff;
        font-size: clamp(48px, 13vw, 190px);
        font-weight: 800;
        line-height: 0.8;
        letter-spacing: 0;
        pointer-events: none;
        text-transform: uppercase;
    }

    @media (max-width: 768px) {
        .loading-mark {
            right: 50%;
            bottom: 8vh;
            transform: translateX(50%);
            font-size: clamp(42px, 16vw, 98px);
        }
    }

</style>
