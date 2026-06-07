<script lang="ts">
    let visible = $state(false);
    let imgSrc = $state('');
    let imgAlt = $state('');

    export function openLightbox(src: string, alt: string = '') {
        imgSrc = src;
        imgAlt = alt;
        visible = true;
    }

    function close() {
        visible = false;
        imgSrc = '';
    }
</script>

{#if visible}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        id="image-lightbox"
        style="display: flex"
        onclick={close}
    >
        <img src={imgSrc} alt={imgAlt}>
    </div>
{/if}
