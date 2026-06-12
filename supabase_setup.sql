-- Create releases table
CREATE TABLE releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog TEXT NOT NULL,
    artist TEXT NOT NULL,
    song TEXT NOT NULL,
    image_url TEXT NOT NULL,
    embed_html TEXT,
    credits_html TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert mock releases
INSERT INTO releases (catalog, artist, song, image_url, embed_html, credits_html) VALUES
('[BM003]', 'DRAUZIO VILELA', 'FOOT THE KATZ (BRING THE KATZ REMIX)', 'https://f4.bcbits.com/img/a0309608461_10.jpg', '<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay; encrypted-media" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2321406944&color=%239c9c9c&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Supreme,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/blackmesaent" title="BLACKMESA" target="_blank" style="color: #cccccc; text-decoration: none;">BLACKMESA</a> · <a href="https://soundcloud.com/blackmesaent/foot-the-katz" title="FOOT THE KATZ (BRING THE KATZ REMIX) [BM003] [FREE DL]" target="_blank" style="color: #cccccc; text-decoration: none;">FOOT THE KATZ (BRING THE KATZ REMIX) [BM003] [FREE DL]</a></div>', 'Produção e Mixagem: Drauzio Vilela<br>Masterização: Matesu'),
('[BM002]', 'NVNSX, ROXAS OLBIV', 'QUANDO VOCÊ SE FOI CHOREI', 'https://f4.bcbits.com/img/a0672295118_10.jpg', '<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay; encrypted-media" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A2304088001&color=%239c9c9c&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Supreme,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/blackmesaent" title="BLACKMESA" target="_blank" style="color: #cccccc; text-decoration: none;">BLACKMESA</a> · <a href="https://soundcloud.com/blackmesaent/quando-voce-se-foi-chorei" title="QUANDO VOCÊ SE FOI CHOREI [BM002] [FREE DL]" target="_blank" style="color: #cccccc; text-decoration: none;">QUANDO VOCÊ SE FOI CHOREI [BM002] [FREE DL]</a></div>', 'Produção: Roxas Olbiv, NVNSX<br>Mixagem: Roxas Olbiv<br>Masterização: Matesu'),
('[BM001]', 'VARIOUS ARTISTS', 'BOOTLEGS I', 'https://f4.bcbits.com/img/a2622922340_10.jpg', '<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay; encrypted-media" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A1873378286&color=%239c9c9c&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Supreme,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/blackmesaent" title="BLACKMESA" target="_blank" style="color: #cccccc; text-decoration: none;">BLACKMESA</a> · <a href="https://soundcloud.com/blackmesaent/sets/blackmesa-i-bootlegs" title="V.A. BOOTLEGS I [BM001]" target="_blank" style="color: #cccccc; text-decoration: none;">V.A. BOOTLEGS I [BM001]</a></div>', 'Produção: Kokas, Matesu, NVNSX, SNOT, Starkenoten, Syú<br>Mixagem: Matesu, VIANA PROD (track 7)<br>Masterização: Matesu');

UPDATE releases
SET
    artist = 'BLACKMESA',
    embed_html = replace(
        replace(embed_html, 'title="V.A. BOOTLEGS I [BM001]"', 'title="BLACKMESA - BOOTLEGS I [BM001]"'),
        '>V.A. BOOTLEGS I [BM001]</a>',
        '>BLACKMESA - BOOTLEGS I [BM001]</a>'
    )
WHERE catalog = '[BM001]';

-- Allow anon read access to releases
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to releases" ON releases FOR SELECT USING (true);


-- Create events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog TEXT NOT NULL,
    artist TEXT NOT NULL,
    song TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link TEXT,
    location TEXT,
    is_hero BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert mock events
INSERT INTO events (catalog, artist, song, image_url, link, location, is_hero) VALUES
('05.06.2026', 'VILELA BADAY', 'CR1A', 'flyers/18.webp', 'https://www.instagram.com/p/DYxwEdlkVhV/', 'R. São Domingos, 251 - Bela Vista, São Paulo', true),
('TBA', 'ARTISTA 17', 'EVENTO 17', 'flyers/17.webp', '#', NULL, false),
('TBA', 'ARTISTA 16', 'EVENTO 16', 'flyers/16.webp', '#', NULL, false),
('TBA', 'ARTISTA 15', 'EVENTO 15', 'flyers/15.webp', '#', NULL, false),
('TBA', 'ARTISTA 14', 'EVENTO 14', 'flyers/14.webp', '#', NULL, false),
('TBA', 'ARTISTA 13', 'EVENTO 13', 'flyers/13.webp', '#', NULL, false),
('TBA', 'ARTISTA 12', 'EVENTO 12', 'flyers/12.webp', '#', NULL, false),
('TBA', 'ARTISTA 11', 'EVENTO 11', 'flyers/11.webp', '#', NULL, false),
('TBA', 'ARTISTA 10', 'EVENTO 10', 'flyers/10.webp', '#', NULL, false),
('TBA', 'ARTISTA 9', 'EVENTO 9', 'flyers/9.webp', '#', NULL, false),
('TBA', 'ARTISTA 8', 'EVENTO 8', 'flyers/8.webp', '#', NULL, false),
('TBA', 'ARTISTA 7', 'EVENTO 7', 'flyers/7.webp', '#', NULL, false),
('TBA', 'ARTISTA 6', 'EVENTO 6', 'flyers/6.webp', '#', NULL, false),
('TBA', 'ARTISTA 5', 'EVENTO 5', 'flyers/5.webp', '#', NULL, false),
('TBA', 'ARTISTA 4', 'EVENTO 4', 'flyers/4.webp', '#', NULL, false),
('TBA', 'ARTISTA 3', 'EVENTO 3', 'flyers/3.webp', '#', NULL, false),
('TBA', 'ARTISTA 2', 'EVENTO 2', 'flyers/2.webp', '#', NULL, false),
('TBA', 'ARTISTA 1', 'EVENTO 1', 'flyers/1.webp', '#', NULL, false);

-- Allow anon read access to events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to events" ON events FOR SELECT USING (true);


-- Article admin allowlist
CREATE TABLE article_admins (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE article_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read admin allowlist" ON article_admins
FOR SELECT
USING (email = (auth.jwt() ->> 'email'));


-- Editorial articles managed from the frontend admin
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    title TEXT NOT NULL,
    subtitle TEXT,
    publication TEXT DEFAULT 'BLACKMESA Hz' NOT NULL,
    issue TEXT,
    category TEXT DEFAULT 'Artigo' NOT NULL,
    author TEXT DEFAULT 'BLACKMESA' NOT NULL,
    article_date TEXT,
    genre TEXT,
    hero_image TEXT,
    hero_alt TEXT,
    soundcloud_url TEXT,
    content_markdown TEXT DEFAULT '' NOT NULL,
    credits TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    gallery JSONB DEFAULT '[]'::jsonb NOT NULL,
    published BOOLEAN DEFAULT false NOT NULL,
    publish_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    webhook_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS articles_published_created_at_idx ON articles (published, publish_at, created_at DESC);

ALTER TABLE articles ADD COLUMN IF NOT EXISTS publish_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS webhook_sent_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS article_webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE article_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admins read webhook events" ON article_webhook_events;
CREATE POLICY "Allow admins read webhook events" ON article_webhook_events
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
);

CREATE OR REPLACE FUNCTION set_article_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.published = true AND (TG_OP = 'INSERT' OR OLD.published IS DISTINCT FROM true) THEN
        NEW.published_at = timezone('utc'::text, now());
    END IF;

    IF NEW.published = false THEN
        NEW.published_at = NULL;
        NEW.webhook_sent_at = NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_article_published_at_trigger ON articles;
CREATE TRIGGER set_article_published_at_trigger
BEFORE INSERT OR UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION set_article_published_at();

CREATE OR REPLACE FUNCTION queue_article_publish_webhook()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.published = true
        AND (NEW.publish_at IS NULL OR NEW.publish_at <= timezone('utc'::text, now()))
        AND (
            TG_OP = 'INSERT'
            OR OLD.published IS DISTINCT FROM true
            OR OLD.publish_at IS DISTINCT FROM NEW.publish_at
        )
    THEN
        INSERT INTO article_webhook_events (article_id, event_type, payload)
        VALUES (
            NEW.id,
            'article.published',
            jsonb_build_object(
                'id', NEW.id,
                'slug', NEW.slug,
                'title', NEW.title,
                'url', '/playlists/' || NEW.slug,
                'published_at', NEW.published_at,
                'publish_at', NEW.publish_at
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS queue_article_publish_webhook_trigger ON articles;
CREATE TRIGGER queue_article_publish_webhook_trigger
AFTER INSERT OR UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION queue_article_publish_webhook();

CREATE OR REPLACE FUNCTION queue_due_article_publish_webhooks()
RETURNS INTEGER AS $$
DECLARE
    queued_count INTEGER;
BEGIN
    INSERT INTO article_webhook_events (article_id, event_type, payload)
    SELECT
        articles.id,
        'article.published',
        jsonb_build_object(
            'id', articles.id,
            'slug', articles.slug,
            'title', articles.title,
            'url', '/playlists/' || articles.slug,
            'published_at', articles.published_at,
            'publish_at', articles.publish_at
        )
    FROM articles
    WHERE articles.published = true
        AND articles.publish_at IS NOT NULL
        AND articles.publish_at <= timezone('utc'::text, now())
        AND NOT EXISTS (
            SELECT 1
            FROM article_webhook_events
            WHERE article_webhook_events.article_id = articles.id
                AND article_webhook_events.event_type = 'article.published'
        );

    GET DIAGNOSTICS queued_count = ROW_COUNT;
    RETURN queued_count;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to published articles" ON articles;
CREATE POLICY "Allow public read access to published articles" ON articles
FOR SELECT
USING (
    published = true
    AND (publish_at IS NULL OR publish_at <= timezone('utc'::text, now()))
);

CREATE POLICY "Allow admins read access to all articles" ON articles
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
);

CREATE POLICY "Allow admins insert articles" ON articles
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
);

CREATE POLICY "Allow admins update articles" ON articles
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
);

DROP POLICY IF EXISTS "Allow admins delete articles" ON articles;
CREATE POLICY "Allow admins delete articles" ON articles
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
);


-- Public article image uploads. Create the bucket here, then upload through /admin.
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY "Allow public read access to article images" ON storage.objects
FOR SELECT
USING (bucket_id = 'article-images');

CREATE POLICY "Allow admins upload article images" ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'article-images'
    AND EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
);

CREATE POLICY "Allow admins update article images" ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'article-images'
    AND EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
)
WITH CHECK (
    bucket_id = 'article-images'
    AND EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
);

-- After creating your Supabase Auth user, add your email:
-- INSERT INTO article_admins (email) VALUES ('voce@seudominio.com');


-- BLACKMESA Hz radio audio storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('radio-audio', 'radio-audio', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY "Allow public read access to radio audio" ON storage.objects
FOR SELECT USING (bucket_id = 'radio-audio');

CREATE POLICY "Allow admins upload radio audio" ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'radio-audio'
    AND EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
);

CREATE POLICY "Allow admins delete radio audio" ON storage.objects
FOR DELETE
USING (
    bucket_id = 'radio-audio'
    AND EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
);


-- BLACKMESA Hz radio catalog
CREATE TABLE IF NOT EXISTS radio_settings (
    id TEXT PRIMARY KEY DEFAULT 'main' CHECK (id = 'main'),
    station TEXT DEFAULT 'BLACKMESA Hz' NOT NULL,
    location TEXT DEFAULT 'Sao Paulo / Online' NOT NULL,
    stream_url TEXT NOT NULL,
    mode TEXT DEFAULT 'live' NOT NULL CHECK (mode IN ('live', 'archive')),
    live_label TEXT DEFAULT 'ON AIR:' NOT NULL,
    current_series TEXT DEFAULT 'Icecast / Liquidsoap' NOT NULL,
    current_title TEXT DEFAULT 'BLACKMESA Hz' NOT NULL,
    current_description TEXT DEFAULT '' NOT NULL,
    current_host TEXT DEFAULT 'BLACKMESA residents' NOT NULL,
    live_artist TEXT DEFAULT 'Icecast / Liquidsoap' NOT NULL,
    live_artwork TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO radio_settings (
    id,
    station,
    location,
    stream_url,
    mode,
    live_label,
    current_series,
    current_title,
    current_description,
    current_host,
    live_artist,
    live_artwork,
    tags
) VALUES (
    'main',
    'BLACKMESA Hz',
    'Sao Paulo / Online',
    'http://127.0.0.1:8000/blackmesa.mp3',
    'live',
    'ON AIR:',
    'Icecast / Liquidsoap',
    'BLACKMESA Hz',
    'Transmissao ao vivo e programacao autoral via Icecast + Liquidsoap, com fallback para arquivos gravados quando nao houver entrada live.',
    'BLACKMESA residents',
    'Icecast / Liquidsoap',
    '/capa_quinzenal.png',
    ARRAY['Ao vivo', 'Autoral', 'Icecast', 'Liquidsoap', 'UK Bass', 'Dubstep', 'Garage', 'Sao Paulo']
) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS radio_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    src TEXT NOT NULL,
    artwork TEXT,
    genre TEXT,
    release TEXT,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS radio_tracks_published_sort_order_idx ON radio_tracks (published, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS radio_tracks_src_idx ON radio_tracks (src);

INSERT INTO radio_tracks (title, artist, src, artwork, genre, release, sort_order, published)
VALUES (
    'Aperta o da Forte',
    'BLACKMESA',
    '/radio/audio/aperta-o-da-forte.mp3',
    '/capa_quinzenal.png',
    'Autoral',
    'BLACKMESA Hz',
    10,
    true
) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS radio_shows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '' NOT NULL,
    host TEXT,
    genre TEXT,
    image TEXT,
    date_label TEXT DEFAULT 'Em breve' NOT NULL,
    time_slot TEXT,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS radio_shows_published_sort_order_idx ON radio_shows (published, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS radio_shows_title_idx ON radio_shows (title);

INSERT INTO radio_shows (title, description, host, genre, image, date_label, time_slot, sort_order, published)
VALUES
(
    'SNOT - CONCRETICIDADE',
    'A primeira edicao da serie BLACKMESA Hz vira transmissao comentada, atravessando peso, textura e dubstep.',
    'SNOT',
    'Dubstep',
    'https://placehold.co/128x128/3f4738/eff6ee?text=SNOT',
    '29 Jun 2026',
    '20:00 - 22:00',
    10,
    true
),
(
    'LABS TRANSMISSION',
    'Sets registrados no laboratorio BLACKMESA, com convidados e recortes do circuito bass brasileiro.',
    'BM Residents',
    'UK Bass / Grime',
    'https://placehold.co/128x128/3f4738/eff6ee?text=LABS',
    'Em breve',
    '18:00 - 20:00',
    20,
    true
),
(
    'BOOTLEGS I RADIO',
    'Escuta expandida do catalogo BM001 com notas, versoes e contexto de producao.',
    'Black Mesa',
    'Bootlegs / Garage',
    'https://placehold.co/128x128/3f4738/eff6ee?text=BOOTS',
    'Arquivo',
    '22:00 - 00:00',
    30,
    true
) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS radio_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    time_label TEXT NOT NULL,
    monday TEXT,
    tuesday TEXT,
    wednesday TEXT,
    thursday TEXT,
    friday TEXT,
    saturday TEXT,
    sunday TEXT,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS radio_schedule_published_sort_order_idx ON radio_schedule (published, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS radio_schedule_time_label_idx ON radio_schedule (time_label);

INSERT INTO radio_schedule (
    time_label,
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
    sort_order,
    published
) VALUES
('18', '', '', 'Rec: Hz', '', 'Warmup', 'Arquivo', '', 10, true),
('20', 'Labs', '', 'Concreticidade', '', 'Residents', 'Guest Mix', 'Sunday Bass', 20, true),
('22', 'Rec: BM001', 'Garage Notes', '', 'Grime Files', 'Club Pressure', 'Live Room', '', 30, true),
('00', '', 'After Hours', '', 'Dub Pressure', 'After Hours', 'After Hours', 'Rec: Labs', 40, true)
ON CONFLICT DO NOTHING;

ALTER TABLE radio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to radio settings" ON radio_settings;
CREATE POLICY "Allow public read access to radio settings" ON radio_settings
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to published radio tracks" ON radio_tracks;
CREATE POLICY "Allow public read access to published radio tracks" ON radio_tracks
FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Allow public read access to published radio shows" ON radio_shows;
CREATE POLICY "Allow public read access to published radio shows" ON radio_shows
FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Allow public read access to published radio schedule" ON radio_schedule;
CREATE POLICY "Allow public read access to published radio schedule" ON radio_schedule
FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Allow admins manage radio settings" ON radio_settings;
CREATE POLICY "Allow admins manage radio settings" ON radio_settings
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
);

DROP POLICY IF EXISTS "Allow admins manage radio tracks" ON radio_tracks;
CREATE POLICY "Allow admins manage radio tracks" ON radio_tracks
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
);

DROP POLICY IF EXISTS "Allow admins manage radio shows" ON radio_shows;
CREATE POLICY "Allow admins manage radio shows" ON radio_shows
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
);

DROP POLICY IF EXISTS "Allow admins manage radio schedule" ON radio_schedule;
CREATE POLICY "Allow admins manage radio schedule" ON radio_schedule
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM article_admins
        WHERE email = (auth.jwt() ->> 'email')
    )
);
