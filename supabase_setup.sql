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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX articles_published_created_at_idx ON articles (published, created_at DESC);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to published articles" ON articles
FOR SELECT
USING (published = true);

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
