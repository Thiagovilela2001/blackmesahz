<script lang="ts">
    import { page } from "$app/stores";

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

    let heroData = $derived($page.data.eventsData[0]);
    let dateInfo = $derived(heroData ? formatDate(heroData.catalog) : { dateStr: "", isUpcoming: false });
    let restEvents = $derived($page.data.eventsData.slice(1));
</script>

<div id="events-wrapper" style="display: flex">
    {#if heroData}
        <div id="events-hero">
            <div class="hero-img" style="background-image: url('/{heroData.image}')"></div>
                <div class="hero-info" style="align-items: flex-start; text-align: left; flex: 1;">
                {#if dateInfo.isUpcoming}
                    <span class="event-badge">EM BREVE</span>
                {/if}
                <span class="hero-date" style="font-size: 13px; color: #aaa;">{dateInfo.dateStr}</span>
                <h2 class="hero-artist" style="font-size: 32px; color: #ffffff; font-weight: bold; text-transform: uppercase; margin: 2px 0; letter-spacing: 0; line-height: 1;">{heroData.artist}</h2>
                <h3 class="hero-title" style="font-size: 17px; color: #888; margin: 0 0 10px 0; letter-spacing: 0;">{heroData.song}</h3>

                {#if heroData.location}
                    <p style="font-size: 12px; color: #ccc; margin: 0 0 15px 0; display: flex; align-items: center; gap: 5px; letter-spacing: 0;">
                        <i class="fa-solid fa-location-dot"></i> Localização: {heroData.location}
                    </p>
                {/if}

                <a
                    href={heroData.link}
                    target="_blank"
                    rel="noreferrer"
                    class="event-action"
                >Mais Informações</a>
            </div>
        </div>
    {/if}

    {#if restEvents.length > 0}
        <div id="events-list">
            {#each restEvents as event}
                {#if event.link && event.link !== '#'}
                    <button
                        class="event-mini"
                        type="button"
                        aria-label={event.artist}
                        style="background-image: url('/{event.image}')"
                        onclick={() => window.open(event.link, '_blank')}
                    ></button>
                {:else}
                    <div
                        class="event-mini"
                        role="img"
                        aria-label={event.artist}
                        style="background-image: url('/{event.image}')"
                    ></div>
                {/if}
            {/each}
        </div>
    {/if}
</div>
