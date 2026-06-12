<script lang="ts">
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabase';
    import { safeImageUrl } from '$lib/security';
    import { markdownToSafeHtml, type ArticleRow } from '$lib/articles';
    import AdminRadio from '$lib/components/AdminRadio.svelte';
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
        publish_at: string;
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
        published: false,
        publish_at: ''
    };

    const AUTOSAVE_KEY = 'blackmesa_admin_article_draft';

    let user = $state<User | null>(null);
    let email = $state('');
    let password = $state('');
    let form = $state<ArticleForm>({ ...emptyForm });
    let articles = $state<ArticleRow[]>([]);
    let coverFile = $state<File | null>(null);
    let editingArticleId = $state<string | null>(null);
    let isPreviewOpen = $state(false);
    let isLoading = $state(true);
    let isSaving = $state(false);
    let isDeleting = $state(false);
    let activeAdminTab = $state<'articles' | 'radio'>('articles');
    let statusMessage = $state('');
    let errorMessage = $state('');
    let showPassword = $state(false);
    let previewHtml = $derived(markdownToSafeHtml(form.content_markdown));
    let previewImage = $derived(safeImageUrl(form.hero_image));
    let previewCredits = $derived(
        form.credits
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean)
    );
    let hasDraftContent = $derived(
        Boolean(
            form.title.trim() ||
            form.slug.trim() ||
            form.subtitle.trim() ||
            form.content_markdown.trim() ||
            form.hero_image.trim()
        )
    );

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

    function toDatetimeLocal(value?: string | null) {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return offsetDate.toISOString().slice(0, 16);
    }

    function fromDatetimeLocal(value: string) {
        if (!value) return null;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }

    function clearMessages() {
        statusMessage = '';
        errorMessage = '';
    }

    function resetForm() {
        form = { ...emptyForm };
        coverFile = null;
        editingArticleId = null;
        isPreviewOpen = false;
        localStorage.removeItem(AUTOSAVE_KEY);
        clearMessages();
    }

    function restoreAutosaveDraft() {
        const rawDraft = localStorage.getItem(AUTOSAVE_KEY);
        if (!rawDraft) return;

        try {
            const draft = JSON.parse(rawDraft) as Partial<ArticleForm>;
            form = { ...emptyForm, ...draft };
            statusMessage = 'Rascunho local restaurado.';
        } catch {
            localStorage.removeItem(AUTOSAVE_KEY);
        }
    }

    function formFromArticle(article: ArticleRow): ArticleForm {
        return {
            title: article.title || '',
            slug: article.slug || '',
            subtitle: article.subtitle || '',
            publication: article.publication || 'BLACKMESA Hz',
            issue: article.issue || '',
            category: article.category || 'Artigo',
            author: article.author || 'BLACKMESA',
            article_date: article.article_date || '',
            genre: article.genre || '',
            hero_image: article.hero_image || '',
            hero_alt: article.hero_alt || '',
            soundcloud_url: article.soundcloud_url || '',
            content_markdown: article.content_markdown || '',
            credits: Array.isArray(article.credits) ? article.credits.join('\n') : '',
            published: Boolean(article.published),
            publish_at: toDatetimeLocal(article.publish_at)
        };
    }

    function editArticle(article: ArticleRow) {
        if (!article.id) return;
        form = formFromArticle(article);
        editingArticleId = article.id;
        coverFile = null;
        isPreviewOpen = false;
        clearMessages();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function refreshSession() {
        const sessionResult = await supabase.auth.getSession();
        user = sessionResult.data.session?.user || null;
    }

    async function loadArticles() {
        const result = await supabase
            .from('articles')
            .select('*')
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

        try {
            const result = await supabase.auth.signInWithPassword({ email: email.trim(), password });

            if (result.error) {
                errorMessage = result.error.message;
                return;
            }

            user = result.data.user;
            await loadArticles();
        } catch (error) {
            errorMessage = error instanceof Error ? error.message : 'Erro ao tentar fazer login.';
        } finally {
            isLoading = false;
        }
    }

    async function logout() {
        await supabase.auth.signOut();
        user = null;
        articles = [];
        password = '';
        resetForm();
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
                publish_at: fromDatetimeLocal(form.publish_at),
                updated_at: new Date().toISOString()
            };

            let result = editingArticleId
                ? await supabase.from('articles').update(payload).eq('id', editingArticleId)
                : await supabase.from('articles').insert(payload);

            if (result.error && result.error.message.includes('publish_at') && form.publish_at) {
                throw new Error('Para usar agendamento, rode a migração de publish_at no Supabase.');
            }

            if (result.error && result.error.message.includes('publish_at')) {
                const { publish_at, ...legacyPayload } = payload;
                result = editingArticleId
                    ? await supabase.from('articles').update(legacyPayload).eq('id', editingArticleId)
                    : await supabase.from('articles').insert(legacyPayload);
            }

            if (result.error) throw result.error;

            const successMessage = editingArticleId
                ? 'Artigo atualizado.'
                : form.published ? 'Artigo publicado.' : 'Rascunho salvo.';
            resetForm();
            statusMessage = successMessage;
            await loadArticles();
        } catch (error) {
            errorMessage = error instanceof Error ? error.message : 'Não foi possível salvar o artigo.';
        } finally {
            isSaving = false;
        }
    }

    async function deleteArticle(article: ArticleRow) {
        if (!article.id) return;
        const confirmed = window.confirm(`Excluir "${article.title}"? Essa ação não pode ser desfeita.`);
        if (!confirmed) return;

        clearMessages();
        isDeleting = true;

        try {
            const result = await supabase.from('articles').delete().eq('id', article.id);
            if (result.error) throw result.error;

            if (editingArticleId === article.id) resetForm();
            statusMessage = 'Artigo excluído.';
            await loadArticles();
        } catch (error) {
            errorMessage = error instanceof Error ? error.message : 'Não foi possível excluir o artigo.';
        } finally {
            isDeleting = false;
        }
    }

    onMount(async () => {
        await refreshSession();
        if (user) {
            restoreAutosaveDraft();
            await loadArticles();
        }
        isLoading = false;
    });

    $effect(() => {
        if (!user || editingArticleId || isLoading) return;

        const timer = setTimeout(() => {
            if (hasDraftContent) {
                localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(form));
                return;
            }

            localStorage.removeItem(AUTOSAVE_KEY);
        }, 900);

        return () => clearTimeout(timer);
    });
</script>

<svelte:head>
    <title>Admin - BLACKMESA</title>
    <meta name="robots" content="noindex,nofollow">
</svelte:head>

<main class="admin-shell">
    <section class="admin-panel">
        <div class="admin-head">
            <div>
                <span>BLACKMESA</span>
                <h1>{editingArticleId ? 'Editar artigo' : 'Admin de artigos'}</h1>
            </div>
            {#if user}
                <div class="head-actions">
                    <button type="button" class:active={activeAdminTab === 'articles'} class="ghost-btn" onclick={() => activeAdminTab = 'articles'}>Artigos</button>
                    <button type="button" class:active={activeAdminTab === 'radio'} class="ghost-btn" onclick={() => activeAdminTab = 'radio'}>Radio</button>
                    <button type="button" class="ghost-btn" onclick={resetForm}>Novo</button>
                    <button type="button" class="ghost-btn" onclick={logout}>Sair</button>
                </div>
            {/if}
        </div>

        {#if isLoading}
            <p class="admin-muted">Carregando...</p>
        {:else if !user}
            <form class="admin-form compact" onsubmit={(event) => { event.preventDefault(); login(); }}>
                <label>
                    Login
                    <input bind:value={email} autocomplete="username" required>
                </label>
                <label>
                    Senha
                    <div class="password-wrap">
                        <input type={showPassword ? 'text' : 'password'} bind:value={password} autocomplete="current-password" required>
                        <button type="button" class="show-btn" onclick={() => showPassword = !showPassword} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                            {showPassword ? '🙈' : '👁'}
                        </button>
                    </div>
                </label>
                <button type="submit" class="primary-btn">Entrar</button>
            </form>
        {:else if activeAdminTab === 'radio'}
            <AdminRadio />
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
                        Publicar em
                        <input type="datetime-local" bind:value={form.publish_at}>
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
                    <button type="button" class="ghost-btn" onclick={() => isPreviewOpen = !isPreviewOpen}>
                        {isPreviewOpen ? 'Fechar preview' : 'Preview'}
                    </button>
                    <button type="submit" class="primary-btn" disabled={isSaving}>
                        {isSaving ? 'Salvando...' : editingArticleId ? 'Atualizar artigo' : 'Salvar artigo'}
                    </button>
                </div>
            </form>

            {#if isPreviewOpen}
                <section class="preview-panel" aria-label="Preview do artigo">
                    <span class="preview-kicker">
                        {form.publication || 'BLACKMESA Hz'} / {form.issue || form.category || 'Artigo'}
                        {form.publish_at ? ' / agendado' : ''}
                    </span>
                    <h2>{form.title || 'Título do artigo'}</h2>
                    {#if form.subtitle}<p class="preview-subtitle">{form.subtitle}</p>{/if}
                    {#if previewImage}
                        <img src={previewImage} alt={form.hero_alt || form.title || 'Capa do artigo'}>
                    {/if}
                    <div class="preview-body">
                        {@html previewHtml || '<p>Escreva o conteúdo markdown para visualizar o artigo.</p>'}
                    </div>
                    {#if previewCredits.length}
                        <footer>
                            <strong>Créditos</strong>
                            {#each previewCredits as credit}
                                <span>{credit}</span>
                            {/each}
                        </footer>
                    {/if}
                </section>
            {/if}

            <section class="article-list" aria-label="Artigos cadastrados">
                <h2>Artigos recentes</h2>
                {#if articles.length}
                    {#each articles as article}
                        <div class="article-row">
                            <a href={`/playlists/${article.slug}`} target="_blank" rel="noopener noreferrer">
                                <span>{article.title}</span>
                                <small>
                                    {article.published ? 'publicado' : 'rascunho'}
                                    {article.publish_at ? ' / agendado' : ''}
                                    / {article.issue || article.category || 'Artigo'}
                                </small>
                            </a>
                            <div class="row-actions">
                                <button type="button" class="ghost-btn" onclick={() => editArticle(article)}>Editar</button>
                                <button type="button" class="danger-btn" disabled={isDeleting} onclick={() => deleteArticle(article)}>Excluir</button>
                            </div>
                        </div>
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
    .admin-actions,
    .head-actions,
    .row-actions {
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

    .password-wrap {
        position: relative;
        display: flex;
    }

    .password-wrap input {
        flex: 1;
        padding-right: 40px;
    }

    .show-btn {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 38px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: unset;
        padding: 0;
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

    .preview-panel {
        margin-top: 24px;
        border: 1px solid rgba(0, 0, 0, 0.18);
        background: #ffffff;
        padding: 22px;
    }

    .preview-kicker {
        display: block;
        color: #657d70;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
    }

    .preview-subtitle {
        margin: 8px 0 18px;
        color: #555555;
        font-size: 15px;
        line-height: 1.45;
    }

    .preview-panel img {
        width: min(420px, 100%);
        display: block;
        margin: 18px 0;
    }

    .preview-body {
        font-size: 15px;
        line-height: 1.55;
        text-transform: none;
    }

    .preview-body :global(h2),
    .preview-body :global(h3) {
        margin-top: 22px;
    }

    .preview-panel footer {
        display: grid;
        gap: 5px;
        margin-top: 22px;
        border-top: 1px solid rgba(0, 0, 0, 0.12);
        padding-top: 14px;
        font-size: 12px;
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

    .primary-btn:disabled {
        opacity: 0.5;
        cursor: progress;
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

    .danger-btn:disabled {
        opacity: 0.5;
        cursor: progress;
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
        padding: 12px 0;
    }

    .article-row a {
        min-width: 0;
        color: inherit;
        text-decoration: none;
    }

    .article-row span {
        display: block;
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
        .head-actions,
        .row-actions,
        .article-row {
            align-items: flex-start;
            flex-direction: column;
        }

        .head-actions,
        .row-actions,
        .primary-btn,
        .ghost-btn,
        .danger-btn {
            width: 100%;
        }
    }
</style>
