<script lang="ts">
    import {
        collectiveMembers,
        roleFilters,
        roleLabels,
        type CollectiveFilter
    } from '$lib/data/collective';

    let activeFilter = $state<CollectiveFilter>('all');

    let filteredMembers = $derived(getFilteredMembers(activeFilter));

    function getFilteredMembers(filter: CollectiveFilter) {
        if (filter === 'all') return collectiveMembers;

        return collectiveMembers.filter((member) => member.roles.includes(filter));
    }

    function getInitials(name: string) {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    }
</script>

<section id="members-section" aria-labelledby="members-title">
    <div class="members-header">
        <div>
            <span class="members-kicker">BLACKMESA roster</span>
            <h2 id="members-title">Membros</h2>
        </div>
        <div class="members-count">
            <strong>{filteredMembers.length}</strong>
            <span>{activeFilter === 'all' ? 'perfis' : roleFilters.find((filter) => filter.id === activeFilter)?.label}</span>
        </div>
    </div>

    <div class="members-filters" aria-label="Filtrar membros por funcao">
        {#each roleFilters as filter}
            <button
                type="button"
                class:active={activeFilter === filter.id}
                onclick={() => activeFilter = filter.id}
            >
                {filter.label}
            </button>
        {/each}
    </div>

    <div class="members-grid">
        {#each filteredMembers as member, index (member.handle)}
            <article class="member-card">
                <div class="member-topline">
                    <span class="member-index">{String(index + 1).padStart(2, '0')}</span>
                    <span class="member-avatar" aria-hidden="true">{getInitials(member.name)}</span>
                </div>

                <div class="member-copy">
                    <h3>{member.name}</h3>
                    <span>@{member.handle}</span>
                </div>

                <div class="member-roles" aria-label={`Funcoes de ${member.name}`}>
                    {#each member.roles as role}
                        <span>{roleLabels[role]}</span>
                    {/each}
                </div>

                <a href={member.soundcloudUrl} target="_blank" rel="noreferrer" class="member-link">
                    <i class="fa-brands fa-soundcloud"></i>
                    SoundCloud
                </a>
            </article>
        {/each}
    </div>
</section>

<style>
    #members-section {
        width: min(1160px, 100%);
        max-height: calc(100vh - 96px);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid var(--line-color);
        border-radius: var(--border-radius, 4px);
        background: rgba(5, 5, 5, 0.84);
        color: #ffffff;
        box-shadow: var(--shadow-large);
    }

    .members-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
        padding: 26px 28px 18px;
        border-bottom: 1px solid var(--line-color);
    }

    .members-kicker {
        color: var(--accent-color);
        font-size: 11px;
        font-weight: 800;
        line-height: 1;
        text-transform: uppercase;
    }

    h2 {
        margin: 10px 0 0;
        font-size: clamp(42px, 7vw, 78px);
        font-weight: 800;
        line-height: 0.88;
        text-transform: uppercase;
    }

    .members-count {
        min-width: 96px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 3px;
        color: var(--muted-color);
        text-align: right;
        text-transform: uppercase;
    }

    .members-count strong {
        color: var(--accent-color);
        font-size: 32px;
        font-weight: 800;
        line-height: 0.9;
    }

    .members-count span {
        font-size: 10px;
        font-weight: 800;
        line-height: 1.1;
    }

    .members-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 14px 28px;
        border-bottom: 1px solid var(--line-color);
    }

    .members-filters button {
        min-height: 32px;
        border: 1px solid var(--line-color);
        border-radius: var(--border-radius, 4px);
        padding: 0 10px;
        background: rgba(255, 255, 255, 0.035);
        color: #ffffff;
        font: inherit;
        font-size: 11px;
        font-weight: 800;
        line-height: 1;
        text-transform: uppercase;
        transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
    }

    .members-filters button:hover,
    .members-filters button:focus-visible {
        border-color: var(--accent-color);
        color: var(--accent-color);
        transform: translateY(-1px);
    }

    .members-filters button.active {
        background: var(--accent-color);
        border-color: var(--accent-color);
        color: #000000;
    }

    .members-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0;
        overflow-y: auto;
        scrollbar-color: #555555 #050505;
    }

    .members-grid::-webkit-scrollbar {
        width: 8px;
    }

    .members-grid::-webkit-scrollbar-track {
        background: #050505;
    }

    .members-grid::-webkit-scrollbar-thumb {
        background: #555555;
        border-radius: 4px;
    }

    .member-card {
        min-height: 220px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 18px;
        border-right: 1px solid var(--line-color);
        border-bottom: 1px solid var(--line-color);
        background: rgba(255, 255, 255, 0.018);
        transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    .member-card:nth-child(4n) {
        border-right: 0;
    }

    .member-card:hover {
        border-color: rgba(119, 147, 131, 0.28);
        background: rgba(119, 147, 131, 0.055);
    }

    .member-topline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    .member-index {
        color: var(--accent-color);
        font-size: 12px;
        font-weight: 800;
        line-height: 1;
    }

    .member-avatar {
        width: 38px;
        height: 38px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--line-color);
        background: #000000;
        color: #ffffff;
        font-size: 12px;
        font-weight: 800;
        line-height: 1;
    }

    .member-copy {
        min-width: 0;
    }

    .member-copy h3 {
        margin: 0;
        color: #ffffff;
        font-size: clamp(20px, 2vw, 28px);
        font-weight: 800;
        line-height: 0.95;
        text-transform: uppercase;
    }

    .member-copy span {
        display: block;
        margin-top: 7px;
        overflow: hidden;
        color: var(--muted-color);
        font-size: 12px;
        font-weight: 700;
        line-height: 1;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .member-roles {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: auto;
    }

    .member-roles span {
        min-height: 22px;
        display: inline-flex;
        align-items: center;
        border: 1px solid rgba(255, 255, 255, 0.16);
        padding: 0 7px;
        color: #d8d8d8;
        font-size: 10px;
        font-weight: 800;
        line-height: 1;
        text-transform: uppercase;
    }

    .member-link {
        min-height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 1px solid var(--line-color);
        border-radius: var(--border-radius, 4px);
        background: transparent;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        line-height: 1;
        text-decoration: none;
        text-transform: uppercase;
        transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
    }

    .member-link:hover,
    .member-link:focus-visible {
        background: var(--accent-color);
        border-color: var(--accent-color);
        color: #000000;
        transform: translateY(-1px);
    }

    @media (max-width: 1020px) {
        .members-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .member-card:nth-child(4n) {
            border-right: 1px solid var(--line-color);
        }

        .member-card:nth-child(3n) {
            border-right: 0;
        }
    }

    @media (max-width: 760px) {
        #members-section {
            max-height: none;
        }

        .members-header {
            padding: 18px 16px 14px;
        }

        .members-filters {
            flex-wrap: nowrap;
            overflow-x: auto;
            padding: 12px 16px;
            scrollbar-width: none;
        }

        .members-filters::-webkit-scrollbar {
            display: none;
        }

        .members-filters button {
            flex: 0 0 auto;
        }

        .members-grid {
            grid-template-columns: 1fr;
            overflow: visible;
        }

        .member-card,
        .member-card:nth-child(3n),
        .member-card:nth-child(4n) {
            border-right: 0;
        }
    }

    @media (max-width: 520px) {
        .members-header {
            flex-direction: column;
        }

        .members-count {
            align-items: flex-start;
            text-align: left;
        }

        h2 {
            font-size: 42px;
        }
    }
</style>
