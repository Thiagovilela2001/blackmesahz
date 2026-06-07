<script lang="ts">
    import { onMount } from 'svelte';
    import { siteLanguage, hasCookieConsent } from '$lib/stores/navigation';

    onMount(() => {
        const cookies = document.cookie.split(';');
        const consentCookie = cookies.find(c => c.trim().startsWith('cookie_consent='));
        if (consentCookie) {
            hasCookieConsent.set(consentCookie.split('=')[1] === 'true');
        } else {
            hasCookieConsent.set(null); // Show banner
        }
    });

    function accept() {
        document.cookie = `cookie_consent=true; max-age=31536000; path=/`;
        hasCookieConsent.set(true);
    }

    function decline() {
        document.cookie = `cookie_consent=false; max-age=31536000; path=/`;
        hasCookieConsent.set(false);
    }
</script>

{#if $hasCookieConsent === null}
    <div id="cookie-banner">
        <p>
            {$siteLanguage === 'en' 
                ? 'We use cookies to improve your experience and save your preferences (like language and theme). Do you accept?' 
                : 'Utilizamos cookies para melhorar sua experiência e salvar suas preferências (como idioma e tema). Você aceita?'}
        </p>
        <div class="cookie-actions">
            <button class="cookie-btn accept" onclick={accept}>
                {$siteLanguage === 'en' ? 'Accept' : 'Aceitar'}
            </button>
            <button class="cookie-btn decline" onclick={decline}>
                {$siteLanguage === 'en' ? 'Decline' : 'Recusar'}
            </button>
        </div>
    </div>
{/if}

<style>
    #cookie-banner {
        position: fixed;
        bottom: 60px;
        right: 20px;
        background: rgba(20, 20, 20, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 20px;
        border-radius: var(--border-radius, 8px);
        width: 320px;
        z-index: 9998;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        color: var(--text-color, #ffffff);
        font-family: var(--font-family, 'Supreme', sans-serif);
    }

    #cookie-banner p {
        margin: 0 0 15px 0;
        font-size: 13px;
        line-height: 1.4;
    }

    .cookie-actions {
        display: flex;
        gap: 10px;
    }

    .cookie-btn {
        flex: 1;
        padding: 8px;
        border-radius: var(--border-radius, 6px);
        font-weight: bold;
        font-size: 12px;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.2s ease;
    }

    .cookie-btn.accept {
        background: var(--accent-color, #779383);
        color: #000;
    }

    .cookie-btn.accept:hover {
        opacity: 0.8;
    }

    .cookie-btn.decline {
        background: transparent;
        border-color: rgba(255, 255, 255, 0.3);
        color: #fff;
    }

    .cookie-btn.decline:hover {
        background: rgba(255, 255, 255, 0.1);
    }
</style>
