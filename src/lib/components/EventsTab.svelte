<script lang="ts">
    import { page } from "$app/stores";
    import { safeExternalUrl, safeImageUrl } from "$lib/security";

    function formatDate(catalog: string): {
        dateStr: string;
        isUpcoming: boolean;
    } {
        const parts = catalog.split(".");
        if (parts.length !== 3) return { dateStr: catalog, isUpcoming: false };

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const eventDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diasSemana = [
            "Domingo",
            "Segunda-feira",
            "Terça-feira",
            "Quarta-feira",
            "Quinta-feira",
            "Sexta-feira",
            "Sábado",
        ];
        const diaSemana = diasSemana[eventDate.getDay()];

        return {
            dateStr: `${diaSemana}, ${catalog}`,
            isUpcoming: eventDate >= today,
        };
    }

    function imageUrl(path?: string) {
        return safeImageUrl(path);
    }

    function eventLink(link?: string) {
        return safeExternalUrl(link);
    }

    let heroData = $derived($page.data.eventsData[0]);
    let dateInfo = $derived(heroData ? formatDate(heroData.catalog) : { dateStr: "", isUpcoming: false });
    let restEvents = $derived($page.data.eventsData.slice(1));
</script>

<div id="events-wrapper" style="display: flex">
    {#if heroData}
        <div id="events-hero">
            <div class="hero-img" style="background-image: url('{imageUrl(heroData.image)}')"></div>
            <div class="hero-info">
                {#if dateInfo.isUpcoming}
                    <span class="event-badge">EM BREVE</span>
                {/if}
                <span class="hero-date">{dateInfo.dateStr}</span>
                <h2 class="hero-artist">{heroData.artist}</h2>
                <h3 class="hero-title">{heroData.song}</h3>

                {#if heroData.location}
                    <p class="hero-location">
                        <i class="fa-solid fa-location-dot"></i> Localização: {heroData.location}
                    </p>
                {/if}

                <a
                    href={eventLink(heroData.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="event-action"
                >Mais Informações</a>
            </div>
        </div>
    {/if}

    {#if restEvents.length > 0}
        <div id="events-list">
            {#each restEvents as event}
                {#if eventLink(event.link) !== '#'}
                    <a
                        class="event-mini"
                        aria-label={event.artist}
                        href={eventLink(event.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style="background-image: url('{imageUrl(event.image)}')"
                    ></a>
                {:else}
                    <div
                        class="event-mini"
                        role="img"
                        aria-label={event.artist}
                        style="background-image: url('{imageUrl(event.image)}')"
                    ></div>
                {/if}
            {/each}
        </div>
    {/if}
</div>
