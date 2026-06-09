<script lang="ts">
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabase';
    import { safeImageUrl } from '$lib/security';
    import type { ArticleRow } from '$lib/articles';
    import type { User } from '@supabase/supabase-js';

    type ArticleForm = {
        title: string;
        slug: string;
        subtitle: string;
        publication: string;
        issue: string;
        category: string;
        author: string;
        article_date: string;
        genre: string;
        hero_image: string;
        hero_alt: string;
        soundcloud_url: string;
        content_markdown: string;
        credits: string;
        published: boolean;
    };

    const emptyForm: ArticleForm = {
        title: '',
        slug: '',
        subtitle: '',
        publication: 'BLACKMESA Hz',
        issue: '',
        category: 'Artigo',
        author: 'BLACKMESA',
        article_date: '',
        genre: '',
        hero_image: '',
        hero_alt: '',
        soundcloud_url: '',
        content_markdown: '',
        credits: '',
        published: false
    };

    let user = $state<User | null>(null);
    let email = $state('');
    let password = $state('');
    let form = $state<ArticleForm>({ ...emptyForm });
    let articles = $state<ArticleRow[]>([]);
    let coverFile = $state<File | null>(null);
    let isLoading = $state(true);
    let isSaving = $state(false);
    let statusMessage = $state('');
    let errorMessage = $state('');

    function slugify(value: string) {
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 80);
    }

    function setTitle(value: string) {
        form.title = value;
        if (!form.slug) form.slug = slugify(value);
    }

    function setSlug(value: string) {
        form.slug = slugify(value);
    }

    function setCoverFile(event: Event) {
        const input = event.target as HTMLInputElement;
        coverFile = input.files?.[0] || null;
    }

    function clearMessages() {
        statusMessage = '';
        errorMessage = '';
    }

    async function refreshSession() {
        const sessionResult = await supabase.auth.getSession();
        user = sessionResult.data.session?.user || null;
    }

    async function loadArticles() {
        const result = await supabase
            .from('articles')
            .select('id,slug,title,issue,category,published,created_at')
            .order('created_at', { ascending: false })
            .limit(20);

        if (result.error) {
            articles = [];
            errorMessage = result.error.message;
            return;
        }

        articles = (result.data || []) as ArticleRow[];
    }

    async function login() {
        clearMessages();
        isLoading = true;

        const result = await supabase.auth.signInWithPassword({ email, password });

        if (result.error) {
            errorMessage = result.error.message;
            isLoading = false;
            return;
        }

        user = result.data.user;
        await loadArticles();
        isLoading = false;
    }

    async function logout() {
        await supabase.auth.signOut();
        user = null;
        articles = [];
        password = '';
    }

    async function uploadCover() {
        if (!coverFile || !user) return form.hero_image;

        const extension = coverFile.name.split('.').pop()?.toLowerCase() || 'webp';
        const cleanSlug = form.slug || slugify(form.title) || 'artigo';
        const path = `${user.id}/${cleanSlug}-${Date.now()}.${extension}`;

        const upload = await supabase.storage
            .from('article-images')
            .upload(path, coverFile, {
                cacheControl: '31536000',
                upsert: false
            });

        if (upload.error) throw upload.error;

        const publicUrl = supabase.storage.from('article-images').getPublicUrl(path);
        return publicUrl.data.publicUrl;
    }

    async function saveArticle() {
        clearMessages();

        if (!form.title.trim() || !form.slug.trim()) {
            errorMessage = 'Preencha título e slug.';
            return;
        }

        isSaving = true;

        try {
            const heroImage = await uploadCover();
            const credits = form.credits
                .split('\n')
                .map(line => line.trim())
                .filter(Boolean);

            const payload = {
                slug: form.slug,
                title: form.title.trim(),
                subtitle: form.subtitle.trim() || null,
                publication: form.publication.trim() || 'BLACKMESA Hz',
                issue: form.issue.trim() || null,
                category: form.category.trim() || 'Artigo',
                author: form.author.trim() || 'BLACKMESA',
                article_date: form.article_date.trim() || null,
                genre: form.genre.trim() || null,
                hero_image: safeImageUrl(heroImage) || null,
                hero_alt: form.hero_alt.trim() || form.title.trim(),
                soundcloud_url: form.soundcloud_url.trim() || null,
                content_markdown: form.content_markdown,
                credits,
                gallery: [],
                published: form.published,
                updated_at: new Date().toISOString()
            };

            const result = await supabase.from('articles').insert(payload);

            if (result.error) throw result.error;

            statusMessage = form.published ? 'Artigo publicado.' : 'Rascunho salvo.';
            form = { ...emptyForm };
            coverFile = null;
            await loadArticles();
        } catch (error) {
            errorMessage = error instanceof Error ? error.message : 'Não foi possível salvar o artigo.';
        } finally {
            isSaving = false;
        }
    }

    onMount(async () => {
        await refreshSession();
        if (user) await loadArticles();
        isLoading = false;
    });
</script>

<svelte:head>
    <title>Admin - BLACKMESA</title>
</svelte:head>

<main class="admin-shell">
    <section class="admin-panel">
        <div class="admin-head">
            <div>
                <span>BLACKMESA</span>
                <h1>Admin de artigos</h1>
            </div>
            {#if user}
                <button type="button" class="ghost-btn" onclick={logout}>Sair</button>
            {/if}
        </div>

        {#if isLoading}
            <p class="admin-muted">Carregando...</p>
        {:else if !user}
            <form class="admin-form compact" onsubmit={(event) => { event.preventDefault(); login(); }}>
                <label>
                    E-mail
                    <input type="email" bind:value={email} autocomplete="email" required>
                </label>
                <label>
                    Senha
                    <input type="password" bind:value={password} autocomplete="current-password" required>
                </label>
                <button type="submit" class="primary-btn">Entrar</button>
            </form>
        {:else}
            <form class="admin-form" onsubmit={(event) => { event.preventDefault(); saveArticle(); }}>
                <div class="form-grid">
                    <label>
                        Título
                        <input value={form.title} oninput={(event) => setTitle(event.currentTarget.value)} required>
                    </label>
                    <label>
                        Slug
                        <input value={form.slug} oninput={(event) => setSlug(event.currentTarget.value)} required>
                    </label>
                    <label class="span-2">
                        Subtítulo
                        <input bind:value={form.subtitle}>
                    </label>
                    <label>
                        Publicação
                        <input bind:value={form.publication}>
                    </label>
                    <label>
                        Edição
                        <input bind:value={form.issue}>
                    </label>
                    <label>
                        Categoria
                        <input bind:value={form.category}>
                    </label>
                    <label>
                        Autor
                        <input bind:value={form.author}>
                    </label>
                    <label>
                        Data exibida
                        <input bind:value={form.article_date} placeholder="09.06.2026">
                    </label>
                    <label>
                        Gênero
                        <input bind:value={form.genre}>
                    </label>
                    <label class="span-2">
                        URL da capa
                        <input bind:value={form.hero_image} placeholder="/playlist/... ou https://...">
                    </label>
                    <label>
                        Upload de capa
                        <input type="file" accept="image/*" onchange={setCoverFile}>
                    </label>
                    <label>
                        Alt da capa
                        <input bind:value={form.hero_alt}>
                    </label>
                    <label class="span-2">
                        SoundCloud URL
                        <input bind:value={form.soundcloud_url} placeholder="https://soundcloud.com/...">
                    </label>
                    <label class="span-2">
                        Conteúdo markdown
                        <textarea bind:value={form.content_markdown} rows="14" placeholder="Texto do artigo em Markdown"></textarea>
                    </label>
                    <label class="span-2">
                        Créditos
                        <textarea bind:value={form.credits} rows="4" placeholder="Um crédito por linha"></textarea>
                    </label>
                </div>

                <div class="admin-actions">
                    <label class="check-row">
                        <input type="checkbox" bind:checked={form.published}>
                        Publicado
                    </label>
                    <button type="submit" class="primary-btn" disabled={isSaving}>
                        {isSaving ? 'Salvando...' : 'Salvar artigo'}
                    </button>
                </div>
            </form>

            <section class="article-list" aria-label="Artigos cadastrados">
                <h2>Artigos recentes</h2>
                {#if articles.length}
                    {#each articles as article}
                        <a href={`/playlists/${article.slug}`} class="article-row">
                            <span>{article.title}</span>
                            <small>{article.published ? 'publicado' : 'rascunho'} / {article.issue || article.category || 'Artigo'}</small>
                        </a>
                    {/each}
                {:else}
                    <p class="admin-muted">Nenhum artigo encontrado para este usuário.</p>
                {/if}
            </section>
        {/if}

        {#if statusMessage}
            <p class="status-message">{statusMessage}</p>
        {/if}
        {#if errorMessage}
            <p class="error-message">{errorMessage}</p>
        {/if}
    </section>
</main>

<style>
    :global(body) {
        background: #ecebe3;
    }

    .admin-shell {
        min-height: 100vh;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 42px 18px;
        color: #111111;
        font-family: var(--font-family, Arial, sans-serif);
    }

    .admin-panel {
        width: min(980px, 100%);
        border: 1px solid rgba(0, 0, 0, 0.22);
        background: #f7f5ee;
        padding: 24px;
    }

    .admin-head,
    .admin-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    }

    .admin-head {
        margin-bottom: 24px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.16);
        padding-bottom: 18px;
    }

    .admin-head span,
    .admin-muted,
    .article-row small,
    label,
    button {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
    }

    h1,
    h2 {
        margin: 4px 0 0;
        font-size: 28px;
        line-height: 1;
        text-transform: uppercase;
    }

    h2 {
        margin-bottom: 12px;
        font-size: 18px;
    }

    .admin-form {
        display: grid;
        gap: 18px;
    }

    .admin-form.compact {
        max-width: 420px;
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
    textarea {
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
    .ghost-btn {
        min-height: 38px;
        border: 1px solid #111111;
        padding: 0 16px;
        cursor: pointer;
    }

    .primary-btn {
        background: #111111;
        color: #ffffff;
    }

    .primary-btn:disabled {
        opacity: 0.5;
        cursor: progress;
    }

    .ghost-btn {
        background: transparent;
        color: #111111;
    }

    .article-list {
        margin-top: 28px;
        border-top: 1px solid rgba(0, 0, 0, 0.16);
        padding-top: 20px;
    }

    .article-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        color: inherit;
        padding: 12px 0;
        text-decoration: none;
    }

    .article-row span {
        font-weight: 800;
    }

    .status-message,
    .error-message {
        margin: 18px 0 0;
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
        .admin-panel {
            padding: 18px;
        }

        .form-grid {
            grid-template-columns: 1fr;
        }

        .span-2 {
            grid-column: auto;
        }

        .admin-head,
        .admin-actions,
        .article-row {
            align-items: flex-start;
            flex-direction: column;
        }
    }
</style>
