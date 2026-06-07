<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { currentTab, type TabName } from '$lib/stores/navigation';
    import { currentIndex, expandedCardIndex, isPlaylistArticleOpen, isAnimating } from '$lib/stores/cards';

    function resetCardState() {
        currentIndex.set(0);
        expandedCardIndex.set(null);
        isPlaylistArticleOpen.set(false);
        isAnimating.set(false);
    }

    function switchTab(tab: TabName) {
        const isSameTab = $currentTab === tab;
        const isOutsideHomeRoute = $page.url.pathname !== '/';

        if (isSameTab && !isOutsideHomeRoute) return;

        resetCardState();

        if (!isSameTab) {
            currentTab.set(tab);
        }

        if (isOutsideHomeRoute) {
            goto('/');
        }
    }

    const tabs: { id: TabName; label: string }[] = [
        { id: 'home', label: 'Início' },
        { id: 'releases', label: 'Releases' },
        { id: 'playlists', label: 'Artigos' },
        { id: 'events', label: 'Eventos' }
    ];
</script>

<div id="sub-header-container">
    <div id="sub-header">
        {#each tabs as tab}
            <button
                class="tab-button"
                class:active={$currentTab === tab.id}
                onclick={() => switchTab(tab.id)}
                aria-current={$currentTab === tab.id ? 'page' : undefined}
            >
                {tab.label}
            </button>
        {/each}
    </div>
</div>

<style>
    #sub-header-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        position: relative;
        z-index: 100;
        margin-top: 10px;
    }
</style>
