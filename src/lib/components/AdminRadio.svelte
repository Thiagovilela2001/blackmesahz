<script lang="ts">
    import { supabase } from '$lib/supabase';

    type TrackRow = {
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

    type TrackForm = {
        title: string;
        artist: string;
        artwork: string;
        genre: string;
        release: string;
        sort_order: number;
        published: boolean;
    };

    type RadioSettings = {
        station: string;
        location: string;
        stream_url: string;
        mode: 'live' | 'archive';
        live_label: string;
        current_series: string;
        current_title: string;
        current_description: string;
        current_host: string;
        live_artist: string;
        live_artwork: string;
        tags: string;
    };

    const emptyTrackForm: TrackForm = {
        title: '',
        artist: '',
        artwork: '/capa_quinzenal.png',
        genre: '',
        release: 'BLACKMESA Hz',
        sort_order: 0,
        published: true
    };

    let radioTab = $state<'tracks' | 'settings'>('tracks');
    let tracks = $state<TrackRow[]>([]);
    let trackForm = $state<TrackForm>({ ...emptyTrackForm });
    let editingTrackId = $state<string | null>(null);
    let audioFile = $state<File | null>(null);
    let settings = $state<RadioSettings | null>(null);
    let isLoadingTracks = $state(false);
    let isLoadingSettings = $state(false);
    let isSavingTrack = $state(false);
    let isSavingSettings = $state(false);
    let isDeleting = $state(false);
    let statusMessage = $state('');
    let errorMessage = $state('');

    function clearMessages() {
        statusMessage = '';
        errorMessage = '';
    }

    function setAudioFile(event: Event) {
        const input = event.target as HTMLInputElement;
        audioFile = input.files?.[0] || null;
    }

    function startEdit(track: TrackRow) {
        editingTrackId = track.id;
        trackForm = {
            title: track.title,
            artist: track.artist,
            artwork: track.artwork || '/capa_quinzenal.png',
            genre: track.genre || '',
            release: track.release || 'BLACKMESA Hz',
            sort_order: track.sort_order,
            published: track.published
        };
        audioFile = null;
        clearMessages();
    }

    function cancelEdit() {
        editingTrackId = null;
        trackForm = { ...emptyTrackForm };
        audioFile = null;
        clearMessages();
    }

    async function loadTracks() {
        clearMessages();
        isLoadingTracks = true;
        try {
            const { data, error } = await supabase
                .from('radio_tracks')
                .select('*')
                .order('sort_order', { ascending: true });
            if (error) throw error;
            tracks = (data || []) as TrackRow[];
        } catch (err) {
            errorMessage = err instanceof Error ? err.message : 'Nao foi possivel carregar as musicas.';
        } finally {
            isLoadingTracks = false;
        }
    }

    async function uploadAudio(): Promise<string> {
        if (!audioFile) throw new Error('Nenhum arquivo selecionado.');
        const session = await supabase.auth.getSession();
        const uid = session.data.session?.user?.id;
        if (!uid) throw new Error('Sessao expirada. Entre novamente.');
        const ext = audioFile.name.split('.').pop()?.toLowerCase() || 'mp3';
        const path = `${uid}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage
            .from('radio-audio')
            .upload(path, audioFile, { cacheControl: '31536000', upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from('radio-audio').getPublicUrl(path);
        return data.publicUrl;
    }

    async function saveTrack() {
        clearMessages();
        if (!trackForm.title.trim() || !trackForm.artist.trim()) {
            errorMessage = 'Preencha titulo e artista.';
            return;
        }
        isSavingTrack = true;
        try {
            const payload: Record<string, unknown> = {
                title: trackForm.title.trim(),
                artist: trackForm.artist.trim(),
                artwork: trackForm.artwork.trim() || null,
                genre: trackForm.genre.trim() || null,
                release: trackForm.release.trim() || null,
                sort_order: trackForm.sort_order || 0,
                published: trackForm.published,
                updated_at: new Date().toISOString()
            };

            if (audioFile) {
                payload.src = await uploadAudio();
            } else if (!editingTrackId) {
                errorMessage = 'Escolha um arquivo de audio.';
                return;
            }

            const result = editingTrackId
                ? await supabase.from('radio_tracks').update(payload).eq('id', editingTrackId)
                : await supabase.from('radio_tracks').insert(payload);

            if (result.error) throw result.error;
            statusMessage = editingTrackId ? 'Musica atualizada.' : 'Musica adicionada a radio.';
            cancelEdit();
            await loadTracks();
        } catch (err) {
            errorMessage = err instanceof Error ? err.message : 'Nao foi possivel salvar a musica.';
        } finally {
            isSavingTrack = false;
        }
    }

    async function deleteTrack(track: TrackRow) {
        if (!window.confirm(`Excluir "${track.title}" da radio?`)) return;
        clearMessages();
        isDeleting = true;
        try {
            const { error } = await supabase.from('radio_tracks').delete().eq('id', track.id);
            if (error) throw error;
            if (editingTrackId === track.id) cancelEdit();
            statusMessage = 'Musica removida.';
            await loadTracks();
        } catch (err) {
            errorMessage = err instanceof Error ? err.message : 'Nao foi possivel excluir a musica.';
        } finally {
            isDeleting = false;
        }
    }

    async function loadSettings() {
        clearMessages();
        isLoadingSettings = true;
        try {
            const { data, error } = await supabase
                .from('radio_settings')
                .select('*')
                .eq('id', 'main')
                .maybeSingle();
            if (error) throw error;
            if (data) {
                settings = {
                    station: data.station || 'BLACKMESA Hz',
                    location: data.location || 'Sao Paulo / Online',
                    stream_url: data.stream_url || '',
                    mode: data.mode === 'archive' ? 'archive' : 'live',
                    live_label: data.live_label || 'ON AIR:',
                    current_series: data.current_series || '',
                    current_title: data.current_title || '',
                    current_description: data.current_description || '',
                    current_host: data.current_host || '',
                    live_artist: data.live_artist || '',
                    live_artwork: data.live_artwork || '/capa_quinzenal.png',
                    tags: (data.tags || []).join(', ')
                };
            }
        } catch (err) {
            errorMessage = err instanceof Error ? err.message : 'Nao foi possivel carregar as configuracoes.';
        } finally {
            isLoadingSettings = false;
        }
    }

    async function saveSettings() {
        if (!settings) return;
        clearMessages();
        isSavingSettings = true;
        try {
            const tags = settings.tags
                .split(',')
                .map(t => t.trim())
                .filter(Boolean);
            const payload = {
                station: settings.station.trim(),
                location: settings.location.trim(),
                stream_url: settings.stream_url.trim(),
                mode: settings.mode,
                live_label: settings.live_label.trim(),
                current_series: settings.current_series.trim(),
                current_title: settings.current_title.trim(),
                current_description: settings.current_description.trim(),
                current_host: settings.current_host.trim(),
                live_artist: settings.live_artist.trim(),
                live_artwork: settings.live_artwork.trim() || null,
                tags,
                updated_at: new Date().toISOString()
            };
            const { error } = await supabase.from('radio_settings').update(payload).eq('id', 'main');
            if (error) throw error;
            statusMessage = 'Configuracoes salvas.';
        } catch (err) {
            errorMessage = err instanceof Error ? err.message : 'Nao foi possivel salvar as configuracoes.';
        } finally {
            isSavingSettings = false;
        }
    }

    $effect(() => {
        if (radioTab === 'tracks') {
            loadTracks();
        } else {
            loadSettings();
        }
    });
</script>

<section class="radio-admin">
    <div class="radio-head">
        <div>
            <span>BLACKMESA Hz</span>
            <h2>Radio admin</h2>
        </div>
        <div class="head-tabs">
            <button
                type="button"
                class="ghost-btn"
                class:active={radioTab === 'tracks'}
                onclick={() => radioTab = 'tracks'}
            >Musicas</button>
            <button
                type="button"
                class="ghost-btn"
                class:active={radioTab === 'settings'}
                onclick={() => radioTab = 'settings'}
            >Configuracoes</button>
            {#if radioTab === 'tracks'}
                <button
                    type="button"
                    class="ghost-btn"
                    disabled={isLoadingTracks}
                    onclick={loadTracks}
                >{isLoadingTracks ? 'Carregando...' : 'Atualizar'}</button>
            {/if}
        </div>
    </div>

    {#if radioTab === 'tracks'}
        <form class="track-form" onsubmit={(e) => { e.preventDefault(); saveTrack(); }}>
            <h3>{editingTrackId ? 'Editar musica' : 'Adicionar musica'}</h3>
            <div class="form-grid">
                <label>
                    Titulo
                    <input bind:value={trackForm.title} required>
                </label>
                <label>
                    Artista
                    <input bind:value={trackForm.artist} required>
                </label>
                <label class="span-2">
                    Capa
                    <input bind:value={trackForm.artwork} placeholder="/capa_quinzenal.png ou https://...">
                </label>
                <label>
                    Genero
                    <input bind:value={trackForm.genre}>
                </label>
                <label>
                    Lancamento
                    <input bind:value={trackForm.release}>
                </label>
                <label>
                    Ordem
                    <input type="number" bind:value={trackForm.sort_order}>
                </label>
                <label class="check-row">
                    <input type="checkbox" bind:checked={trackForm.published}>
                    Publicada
                </label>
                <label class="span-2">
                    Arquivo de audio {editingTrackId ? '(deixe vazio para manter o atual)' : '*'}
                    <input type="file" accept="audio/*" onchange={setAudioFile}>
                </label>
            </div>
            <div class="form-actions">
                <p class="file-hint">{audioFile ? audioFile.name : 'Nenhum arquivo selecionado.'}</p>
                <div class="action-buttons">
                    {#if editingTrackId}
                        <button type="button" class="ghost-btn" onclick={cancelEdit}>Cancelar</button>
                    {/if}
                    <button type="submit" class="primary-btn" disabled={isSavingTrack}>
                        {isSavingTrack ? 'Salvando...' : editingTrackId ? 'Atualizar' : 'Adicionar musica'}
                    </button>
                </div>
            </div>
        </form>

        <section class="track-list" aria-label="Musicas cadastradas">
            <h3>Musicas cadastradas</h3>
            {#if tracks.length}
                {#each tracks as track}
                    <div class="track-row">
                        <a href={track.src} target="_blank" rel="noopener noreferrer">
                            <span>{track.title}</span>
                            <small>
                                {track.artist}
                                {track.genre ? ` / ${track.genre}` : ''}
                                {track.published ? ' / publicada' : ' / rascunho'}
                                / ordem {track.sort_order}
                            </small>
                        </a>
                        <div class="row-actions">
                            <button
                                type="button"
                                class="ghost-btn"
                                onclick={() => startEdit(track)}
                            >Editar</button>
                            <button
                                type="button"
                                class="danger-btn"
                                disabled={isDeleting}
                                onclick={() => deleteTrack(track)}
                            >Excluir</button>
                        </div>
                    </div>
                {/each}
            {:else}
                <p class="radio-muted">
                    {isLoadingTracks ? 'Carregando musicas...' : 'Nenhuma musica cadastrada.'}
                </p>
            {/if}
        </section>
    {:else if radioTab === 'settings'}
        {#if isLoadingSettings}
            <p class="radio-muted">Carregando configuracoes...</p>
        {:else if settings}
            <form class="settings-form" onsubmit={(e) => { e.preventDefault(); saveSettings(); }}>
                <h3>Transmissao ao vivo</h3>
                <div class="form-grid">
                    <label class="span-2">
                        URL do stream
                        <input bind:value={settings.stream_url} placeholder="http://127.0.0.1:8000/blackmesa.mp3">
                    </label>
                    <label>
                        Modo
                        <select bind:value={settings.mode}>
                            <option value="live">Ao vivo</option>
                            <option value="archive">Arquivo</option>
                        </select>
                    </label>
                    <label>
                        Label ao vivo
                        <input bind:value={settings.live_label} placeholder="ON AIR:">
                    </label>
                </div>

                <h3>Show atual</h3>
                <div class="form-grid">
                    <label>
                        Serie
                        <input bind:value={settings.current_series}>
                    </label>
                    <label>
                        Titulo
                        <input bind:value={settings.current_title}>
                    </label>
                    <label>
                        Host
                        <input bind:value={settings.current_host}>
                    </label>
                    <label>
                        Artista ao vivo
                        <input bind:value={settings.live_artist}>
                    </label>
                    <label class="span-2">
                        Descricao
                        <textarea bind:value={settings.current_description} rows="3"></textarea>
                    </label>
                    <label class="span-2">
                        Capa ao vivo
                        <input bind:value={settings.live_artwork} placeholder="/capa_quinzenal.png ou https://...">
                    </label>
                </div>

                <h3>Estacao</h3>
                <div class="form-grid">
                    <label>
                        Nome
                        <input bind:value={settings.station}>
                    </label>
                    <label>
                        Localizacao
                        <input bind:value={settings.location}>
                    </label>
                    <label class="span-2">
                        Tags (separadas por virgula)
                        <input bind:value={settings.tags} placeholder="UK Bass, Dubstep, Garage">
                    </label>
                </div>

                <div class="form-actions">
                    <span></span>
                    <button type="submit" class="primary-btn" disabled={isSavingSettings}>
                        {isSavingSettings ? 'Salvando...' : 'Salvar configuracoes'}
                    </button>
                </div>
            </form>
        {:else}
            <p class="radio-muted">Nao foi possivel carregar as configuracoes.</p>
        {/if}
    {/if}

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

    .radio-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.16);
        padding-bottom: 18px;
    }

    .radio-head span,
    .radio-muted,
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

    h3 {
        margin: 0;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        padding-bottom: 8px;
    }

    .head-tabs {
        display: flex;
        gap: 8px;
    }

    .track-form,
    .settings-form {
        display: grid;
        gap: 16px;
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

    input,
    textarea,
    select {
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

    textarea {
        resize: vertical;
        line-height: 1.45;
    }

    select {
        cursor: pointer;
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

    .form-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    }

    .action-buttons {
        display: flex;
        gap: 8px;
    }

    .file-hint {
        margin: 0;
        color: #555555;
    }

    .track-list {
        border-top: 1px solid rgba(0, 0, 0, 0.16);
        padding-top: 20px;
        display: grid;
        gap: 0;
    }

    .track-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
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

    .row-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
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

    .ghost-btn.active {
        background: #111111;
        color: #ffffff;
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

    .status-message,
    .error-message {
        margin: 0;
        border: 1px solid rgba(0, 0, 0, 0.18);
        padding: 12px;
        font-size: 13px;
        font-weight: 700;
    }

    .status-message {
        background: #dce8d7;
    }

    .error-message {
        background: #f3d5d0;
    }

    @media (max-width: 720px) {
        .radio-head,
        .form-actions,
        .track-row {
            align-items: flex-start;
            flex-direction: column;
        }

        .head-tabs,
        .action-buttons,
        .row-actions {
            width: 100%;
        }

        .form-grid {
            grid-template-columns: 1fr;
        }

        .span-2 {
            grid-column: auto;
        }

        .primary-btn,
        .ghost-btn,
        .danger-btn {
            width: 100%;
        }
    }
</style>
