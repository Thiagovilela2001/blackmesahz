<script lang="ts">
    import { isInstitutionalVisible } from '$lib/stores/navigation';
    import AboutSection from './AboutSection.svelte';
    import MembersSection from './MembersSection.svelte';
    import PressKitSection from './PressKitSection.svelte';

    const lastSection = 2;

    let currentSection = $state(0);
    let isAnimating = false;

    // Reset to Sobre when opened
    $effect(() => {
        if ($isInstitutionalVisible) {
            currentSection = 0;
        }
    });

    function handleWheel(e: WheelEvent) {
        if (!$isInstitutionalVisible || isAnimating) return;
        
        isAnimating = true;
        setTimeout(() => isAnimating = false, 800);

        if (e.deltaY > 20) {
            if (currentSection < lastSection) {
                currentSection += 1;
            } else {
                isInstitutionalVisible.set(false);
            }
        } else if (e.deltaY < -20) {
            if (currentSection > 0) {
                currentSection -= 1;
            } else {
                isInstitutionalVisible.set(false);
            }
        }
    }

    function setSection(section: number) {
        currentSection = section;
    }

    function closeOverlay() {
        isInstitutionalVisible.set(false);
    }

    function handleKeydown(e: KeyboardEvent) {
        if (!$isInstitutionalVisible) return;

        if (e.key === 'Escape') {
            closeOverlay();
        } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            currentSection = Math.min(lastSection, currentSection + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            currentSection = Math.max(0, currentSection - 1);
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
    id="institutional-overlay" 
    class:is-visible={$isInstitutionalVisible}
    onwheel={handleWheel}
    role="dialog"
    aria-modal="true"
    aria-label="BLACKMESA institucional"
>
    <nav class="institutional-nav" aria-label="Navegacao institucional">
        <button type="button" class:active={currentSection === 0} onclick={() => setSection(0)}>
            <span>01</span>
            Sobre
        </button>
        <button type="button" class:active={currentSection === 1} onclick={() => setSection(1)}>
            <span>02</span>
            Membros
        </button>
        <button type="button" class:active={currentSection === 2} onclick={() => setSection(2)}>
            <span>03</span>
            Press kit
        </button>
    </nav>

    <button class="close-btn" type="button" onclick={closeOverlay}>
        <i class="fas fa-times"></i> Fechar
    </button>
    <div class="institutional-slides" style="transform: translateY(-{currentSection * 100}vh)">
        <div class="overlay-slide">
            <AboutSection />
        </div>
        <div class="overlay-slide">
            <MembersSection />
        </div>
        <div class="overlay-slide">
            <PressKitSection />
        </div>
    </div>
</div>

<style>
    #institutional-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background:
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(180deg, rgba(255,255,255,0.035) 1px, transparent 1px),
            rgba(5, 5, 5, 0.9);
        background-size: 44px 44px;
        backdrop-filter: blur(20px);
        z-index: 9998;
        opacity: 0;
        pointer-events: none;
        transform: translateY(-100%);
        transition: opacity 0.36s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        overflow: hidden;
    }

    #institutional-overlay.is-visible {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0);
    }

    .institutional-nav {
        position: absolute;
        left: 30px;
        top: 50%;
        z-index: 12;
        display: flex;
        flex-direction: column;
        gap: 8px;
        transform: translateY(-50%);
    }

    .institutional-nav button {
        min-height: 36px;
        min-width: 118px;
        display: inline-flex;
        align-items: center;
        gap: 9px;
        padding: 0 11px;
        border: 1px solid var(--line-color);
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.7);
        color: #ffffff;
        font: inherit;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
    }

    .institutional-nav span {
        color: var(--accent-color);
    }

    .institutional-nav button:hover,
    .institutional-nav button:focus-visible {
        border-color: var(--accent-color);
        color: var(--accent-color);
        transform: translateX(2px);
    }

    .institutional-nav button.active {
        background: var(--accent-color);
        border-color: var(--accent-color);
        color: #000000;
    }

    .institutional-nav button.active span {
        color: #000000;
    }

    .institutional-slides {
        width: 100vw;
        height: 300vh;
        transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .overlay-slide {
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
        box-sizing: border-box;
        overflow-y: auto;
    }

    .close-btn {
        position: absolute;
        top: 20px;
        right: 30px;
        min-height: 36px;
        background: rgba(0, 0, 0, 0.72);
        color: #fff;
        border: 1px solid var(--line-color);
        padding: 0 14px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10;
        backdrop-filter: blur(5px);
        transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .close-btn:hover,
    .close-btn:focus-visible {
        background: var(--accent-color);
        border-color: var(--accent-color);
        color: #000000;
        transform: translateY(-1px);
    }

    @media (max-width: 768px) {
        #institutional-overlay {
            background-size: 30px 30px;
        }

        .institutional-nav {
            left: 12px;
            right: 12px;
            top: 74px;
            flex-direction: row;
            transform: none;
        }

        .institutional-nav button {
            flex: 1;
            justify-content: center;
            min-width: 0;
        }

        .overlay-slide {
            align-items: flex-start;
            padding: 126px 12px 28px;
        }

        .close-btn {
            top: 18px;
            right: 12px;
        }
    }
</style>
