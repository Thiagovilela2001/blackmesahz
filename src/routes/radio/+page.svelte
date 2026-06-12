<script lang="ts">
    import { onMount } from 'svelte';
    import SubHeader from '$lib/components/SubHeader.svelte';
    import RadioTab from '$lib/components/RadioTab.svelte';
    import { currentTab } from '$lib/stores/navigation';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    onMount(() => {
        currentTab.set('radio');
    });
</script>

<svelte:head>
    <title>BLACKMESA Hz</title>
</svelte:head>

<SubHeader />

<div id="page-title-wrapper">
    <img src="/ICONES/icone-radio.png" alt="" class="page-title-icon" />
    <h2 id="page-title">RÁDIO</h2>
</div>

<RadioTab radioData={data.radioData} />
