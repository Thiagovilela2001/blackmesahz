<script lang="ts">
    import { goto } from '$app/navigation';
    import { currentTab, theme, siteLanguage } from '$lib/stores/navigation';

    let menuOpen = $state(false);
    let logoKick = $state(false);

    function toggleMenu() {
        menuOpen = !menuOpen;
    }

    function selectTheme(t: 'default' | 'theme-04') {
        theme.set(t);
        document.cookie = `site_theme=${t}; max-age=31536000; path=/`;
        menuOpen = false;
    }

    function selectLanguage(lang: 'pt-br' | 'en') {
        siteLanguage.set(lang);
        document.cookie = `site_language=${lang}; max-age=31536000; path=/`;
        menuOpen = false;
    }

    function goHome(event: MouseEvent) {
        event.preventDefault();
        logoKick = true;

        setTimeout(() => {
            currentTab.set('home');
            goto('/');
            logoKick = false;
        }, 220);
    }
</script>

<header id="main-header">
    <div class="header-left">
        <a class="logo-home-link" href="/" aria-label="Ir para a home" onclick={goHome}>
            <img class="header-logo" class:logo-kick={logoKick} src="/logo/long.webp" alt="BLACKMESA" />
        </a>
    </div>
    <div class="header-right" style="position: relative;">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_missing_attribute -->
        <a style="cursor: pointer;" title="Config" onclick={toggleMenu}>
            <i class="fas fa-cog"></i>
        </a>

        {#if menuOpen}
            <div class="theme-menu">
                <span class="menu-label">Tema</span>
                <button onclick={() => selectTheme('default')}>Default</button>
                <button onclick={() => selectTheme('theme-04')}>04' Valve</button>
                <hr class="menu-divider" />
                <span class="menu-label">Idioma</span>
                <button onclick={() => selectLanguage('pt-br')} class:active-lang={$siteLanguage === 'pt-br'}>🇧🇷 PT-BR</button>
                <button onclick={() => selectLanguage('en')} class:active-lang={$siteLanguage === 'en'}>🇺🇸 EN</button>
            </div>
        {/if}

        <a
            href="https://soundcloud.com/blackmesaent"
            target="_blank"
            rel="noopener noreferrer"
            title="Soundcloud"
        >
            <i class="fa-brands fa-soundcloud"></i>
            <span class="nav-text">Soundcloud</span>
        </a>
        <a
            href="https://blackmesaent.bandcamp.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Bandcamp"
        >
            <i class="fa-brands fa-bandcamp"></i>
            <span class="nav-text">Bandcamp</span>
        </a>
        <a
            href="https://instagram.com/blackmesaent"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
        >
            <i class="fa-brands fa-instagram"></i>
            <span class="nav-text">Instagram</span>
        </a>
    </div>
</header>

<style>
    .logo-home-link {
        position: relative;
        height: 30px;
        display: inline-flex;
        align-items: center;
        z-index: 3;
    }

    .logo-home-link:focus-visible {
        outline-offset: 10px;
    }

    .header-logo.logo-kick {
        animation: logoKick 0.24s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes logoKick {
        0% {
            transform: translateY(14px) rotate(-1.4deg) scale(1);
        }

        35% {
            transform: translateY(20px) rotate(-4deg) scale(1.14);
            filter: drop-shadow(0 0 18px rgba(119, 147, 131, 0.7));
        }

        72% {
            transform: translateY(9px) rotate(2deg) scale(0.96);
        }

        100% {
            transform: translateY(14px) rotate(-1.4deg) scale(1);
        }
    }

    .theme-menu {
        position: absolute;
        top: 30px;
        right: 0;
        background: rgba(20,20,20,0.9);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: var(--border-radius, 8px);
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        z-index: 1000;
        min-width: 120px;
        backdrop-filter: blur(10px);
    }
    .theme-menu button {
        background: transparent;
        color: var(--text-color, #fff);
        border: none;
        padding: 8px 12px;
        text-align: left;
        cursor: pointer;
        font-size: 12px;
        border-radius: var(--border-radius, 4px);
        transition: background 0.2s;
        font-family: var(--font-family, inherit);
    }
    .theme-menu button:hover {
        background: rgba(255,255,255,0.1);
    }
    .menu-label {
        font-size: 10px;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 4px 12px 2px;
    }
    .menu-divider {
        border: none;
        border-top: 1px solid rgba(255,255,255,0.1);
        margin: 4px 0;
    }
    .active-lang {
        color: var(--accent-color, #779383) !important;
    }
</style>
