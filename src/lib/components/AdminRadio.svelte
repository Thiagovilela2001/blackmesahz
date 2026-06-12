<script lang="ts">
    import { env } from '$env/dynamic/public';
    import { supabase } from '$lib/supabase';

    type RadioTrackRow = {
        id: string;
        title: string;
        artist: string;
        src: string;
        artwork?: string | null;
        genre?: string | null;
        release?: string | null;
        sort_order: number;
        published: boolean;
    };

    type RadioForm = {
        title: string;
        artist: string;
        artwork: string;
        genre: string;
        release: string;
        sort_order: number;
        published: boolean;
    };

    const emptyForm: RadioForm = {
        title: '',
        artist: '',
        artwork: '/capa_quinzenal.png',
        genre: '',
        release: 'BLACKMESA Hz',
        sort_order: 0,
        published: true
    };

    let form = $state<RadioForm>({ ...emptyForm });
    let audioFile = $state<File | null>(null);
    let tracks = $state<RadioTrackRow[]>([]);
    let isLoading = $state(false);
    let isUploading = $state(false);
    let isDeleting = $state(false);
    let statusMessage = $state('');
    let errorMessage = $state('');

    const radioApiUrl = $derived((env.PUBLIC_RADIO_API_URL || '').trim().replace(/\/$/, ''));

    function clearMessages() {
        statusMessage = '';
        errorMessage = '';
    }

    function setAudioFile(event: Event) {
        const input = event.target as HTMLInputElement;
        audioFile = input.files?.[0] || null;
    }

    async function getToken() {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token?.trim().replace(/[^\x21-\x7e]/g, '');
        if (!token) throw new Error('Sessao expirada. Entre novamente no admin.');
        return token;
    }

    async function apiFetch(path: string, init: RequestInit = {}) {
        if (!radioApiUrl) {
            throw new Error('Configure PUBLIC_RADIO_API_URL na Vercel para ativar o upload da radio.');
        }

        const token = await getToken();
        const headers = new Headers(init.headers);
        headers.set('Authorization', `Bearer ${token}`);

        const response = await fetch(`${radioApiUrl}${path}`, {
            ...init,
            headers
        });

        if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(body?.error || `API da radio respondeu ${response.status}.`);
        }

        if (response.status === 204) return null;
        return response.json();
    }

    async function loadTracks() {
        clearMessages();
        isLoading = true;

        try {
            const body = await apiFetch('/radio/tracks');
            tracks = body.tracks || [];
        } catch (error) {
            errorMessage = error instanceof Error ? error.message : 'Nao foi possivel carregar as musicas.';
        } finally {
            isLoading = false;
        }
    }

    async function uploadTrack() {
        clearMessages();

        if (!audioFile) {
            errorMessage = 'Escolha um arquivo de audio.';
            return;
        }

        if (!form.title.trim() || !form.artist.trim()) {
            errorMessage = 'Preencha titulo e artista.';
            return;
        }

        isUploading = true;

        try {
            const data = new FormData();
            data.set('audio', audioFile);
            data.set('title', form.title.trim());
            data.set('artist', form.artist.trim());
            data.set('artwork', form.artwork.trim());
            data.set('genre', form.genre.trim());
            data.set('release', form.release.trim());
            data.set('sort_order', String(form.sort_order || 0));
            data.set('published', String(form.published));

            await apiFetch('/radio/tracks/upload', {
                method: 'POST',
                body: data
            });

            form = { ...emptyForm };
            audioFile = null;
            statusMessage = 'Musica enviada para a radio.';
            await loadTracks();
        } catch (error) {
            errorMessage = error instanceof Error ? error.message : 'Nao foi possivel enviar a musica.';
        } finally {
            isUploading = false;
        }
    }

    async function deleteTrack(track: RadioTrackRow) {
        const confirmed = window.confirm(`Excluir "${track.title}" da radio?`);
        if (!confirmed) return;

        clearMessages();
        isDeleting = true;

        try {
            await apiFetch(`/radio/tracks/${track.id}`, { method: 'DELETE' });
            statusMessage = 'Musica removida da radio.';
            await loadTracks();
        } catch (error) {
            errorMessage = error instanceof Error ? error.message : 'Nao foi possivel excluir a musica.';
        } finally {
            isDeleting = false;
        }
    }

    $effect(() => {
        if (radioApiUrl) loadTracks();
    });
</script>

<section class="radio-admin">
    <div class="radio-admin-head">
        <div>
            <span>BLACKMESA Hz</span>
            <h2>Upload de musicas</h2>
        </div>
        <button type="button" class="ghost-btn" disabled={isLoading || !radioApiUrl} onclick={loadTracks}>
            {isLoading ? 'Carregando...' : 'Atualizar'}
        </button>
    </div>

    {#if !radioApiUrl}
        <p class="radio-warning">Configure PUBLIC_RADIO_API_URL na Vercel para conectar o painel ao backend da Oracle.</p>
    {/if}

    <form class="radio-form" onsubmit={(event) => { event.preventDefault(); uploadTrack(); }}>
        <div class="form-grid">
            <label class="span-2">
                Arquivo de audio
                <input type="file" accept="audio/*" onchange={setAudioFile}>
            </label>
            <label>
                Titulo
                <input bind:value={form.title} required>
            </label>
            <label>
                Artista
                <input bind:value={form.artist} required>
            </label>
            <label class="span-2">
                Capa
                <input bind:value={form.artwork} placeholder="/capa_quinzenal.png ou https://...">
            </label>
            <label>
                Genero
                <input bind:value={form.genre}>
            </label>
            <label>
                Lancamento
                <input bind:value={form.release}>
            </label>
            <label>
                Ordem
                <input type="number" bind:value={form.sort_order}>
            </label>
            <label class="check-row">
                <input type="checkbox" bind:checked={form.published}>
                Publicada
            </label>
        </div>

        <div class="admin-actions">
            <p class="file-hint">{audioFile ? audioFile.name : 'Nenhum arquivo selecionado.'}</p>
            <button type="submit" class="primary-btn" disabled={isUploading || !radioApiUrl}>
                {isUploading ? 'Enviando...' : 'Enviar musica'}
            </button>
        </div>
    </form>

    <section class="track-list" aria-label="Musicas cadastradas">
        <h2>Musicas cadastradas</h2>
        {#if tracks.length}
            {#each tracks as track}
                <div class="track-row">
                    <a href={track.src} target="_blank" rel="noopener noreferrer">
                        <span>{track.title}</span>
                        <small>
                            {track.artist}
                            {track.genre ? ` / ${track.genre}` : ''}
                            {track.published ? ' / publicada' : ' / rascunho'}
                        </small>
                    </a>
                    <button type="button" class="danger-btn" disabled={isDeleting} onclick={() => deleteTrack(track)}>Excluir</button>
                </div>
            {/each}
        {:else}
            <p class="radio-muted">{isLoading ? 'Carregando musicas...' : 'Nenhuma musica cadastrada.'}</p>
        {/if}
    </section>

    {#if statusMessage}
        <p class="status-message">{statusMessage}</p>
    {/if}
    {#if errorMessage}
        <p class="error-message">{errorMessage}</p>
    {/if}
</section>

<style>
    .radio-admin {
        display: grid;
        gap: 22px;
    }

    .radio-admin-head,
    .admin-actions,
    .track-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    }

    .radio-admin-head {
        border-bottom: 1px solid rgba(0, 0, 0, 0.16);
        padding-bottom: 18px;
    }

    .radio-admin-head span,
    .radio-muted,
    .radio-warning,
    .track-row small,
    label,
    button,
    .file-hint {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
    }

    h2 {
        margin: 4px 0 0;
        font-size: 18px;
        line-height: 1;
        text-transform: uppercase;
    }

    .radio-form {
        display: grid;
        gap: 18px;
    }

    .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
    }

    label {
        display: grid;
        gap: 7px;
    }

    .span-2 {
        grid-column: span 2;
    }

    input {
        width: 100%;
        border: 1px solid rgba(0, 0, 0, 0.22);
        background: #ffffff;
        color: #111111;
        font: inherit;
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0;
        padding: 11px 12px;
        text-transform: none;
    }

    .check-row {
        display: flex;
        grid-auto-flow: column;
        align-items: center;
        gap: 8px;
    }

    .check-row input {
        width: auto;
    }

    .primary-btn,
    .ghost-btn,
    .danger-btn {
        min-height: 38px;
        border: 1px solid #111111;
        padding: 0 16px;
        cursor: pointer;
    }

    .primary-btn {
        background: #111111;
        color: #ffffff;
    }

    .ghost-btn {
        background: transparent;
        color: #111111;
    }

    .danger-btn {
        background: #f3d5d0;
        border-color: #9f3225;
        color: #7b2118;
    }

    .primary-btn:disabled,
    .ghost-btn:disabled,
    .danger-btn:disabled {
        opacity: 0.5;
        cursor: progress;
    }

    .file-hint {
        margin: 0;
        color: #555555;
    }

    .track-list {
        border-top: 1px solid rgba(0, 0, 0, 0.16);
        padding-top: 20px;
    }

    .track-row {
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        padding: 12px 0;
    }

    .track-row a {
        min-width: 0;
        color: inherit;
        text-decoration: none;
    }

    .track-row span {
        display: block;
        font-weight: 800;
    }

    .radio-warning,
    .status-message,
    .error-message {
        margin: 0;
        border: 1px solid rgba(0, 0, 0, 0.18);
        padding: 12px;
        font-size: 13px;
        font-weight: 700;
    }

    .radio-warning {
        background: #fff3c7;
    }

    .status-message {
        background: #dce8d7;
    }

    .error-message {
        background: #f3d5d0;
    }

    @media (max-width: 720px) {
        .form-grid {
            grid-template-columns: 1fr;
        }

        .span-2 {
            grid-column: auto;
        }

        .radio-admin-head,
        .admin-actions,
        .track-row {
            align-items: flex-start;
            flex-direction: column;
        }

        .primary-btn,
        .ghost-btn,
        .danger-btn {
            width: 100%;
        }
    }
</style>
