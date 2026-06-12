import 'dotenv/config';

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';

const PORT = Number(process.env.PORT || 8787);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
const MEDIA_ROOT = process.env.MEDIA_ROOT || path.resolve('media');
const PUBLIC_MEDIA_BASE_URL = process.env.PUBLIC_MEDIA_BASE_URL || `http://localhost:${PORT}/media`;
const PLAYLIST_PATH = process.env.PLAYLIST_PATH || '';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const AUDIO_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/aac',
  'audio/flac',
  'audio/x-flac',
  'audio/mp4'
]);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Configure SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY.');
}

await fs.mkdir(MEDIA_ROOT, { recursive: true });

const authSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'track';
}

function getBearerToken(req) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' ? token : '';
}

async function requireAdmin(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: 'Missing bearer token.' });

    const userResult = await authSupabase.auth.getUser(token);
    if (userResult.error || !userResult.data.user?.email) {
      return res.status(401).json({ error: 'Invalid session.' });
    }

    const email = userResult.data.user.email;
    const adminResult = await adminSupabase
      .from('article_admins')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (adminResult.error) throw adminResult.error;
    if (!adminResult.data) return res.status(403).json({ error: 'User is not an admin.' });

    req.user = userResult.data.user;
    next();
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Auth failed.' });
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, MEDIA_ROOT),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase() || '.mp3';
    const title = req.body?.title || path.basename(file.originalname, extension);
    const suffix = crypto.randomBytes(5).toString('hex');
    cb(null, `${slugify(title)}-${Date.now()}-${suffix}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (AUDIO_MIME_TYPES.has(file.mimetype)) return cb(null, true);
    cb(new Error('Arquivo de audio invalido.'));
  }
});

async function rebuildPlaylist() {
  if (!PLAYLIST_PATH) return;

  const result = await adminSupabase
    .from('radio_tracks')
    .select('src')
    .eq('published', true)
    .order('sort_order', { ascending: true });

  if (result.error) throw result.error;
  const lines = (result.data || []).map(track => track.src).filter(Boolean);
  await fs.mkdir(path.dirname(PLAYLIST_PATH), { recursive: true });
  await fs.writeFile(PLAYLIST_PATH, `${lines.join('\n')}\n`, 'utf8');
}

const app = express();

app.use(cors({
  origin: ALLOWED_ORIGIN.split(',').map(origin => origin.trim()),
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type']
}));
app.use(express.json());
app.use('/media', express.static(MEDIA_ROOT, {
  immutable: true,
  maxAge: '365d',
  setHeaders(res) {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/radio/tracks', requireAdmin, async (_req, res) => {
  const result = await adminSupabase
    .from('radio_tracks')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (result.error) return res.status(500).json({ error: result.error.message });
  res.json({ tracks: result.data || [] });
});

app.post('/radio/tracks/upload', requireAdmin, upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Envie um arquivo no campo audio.' });

  try {
    const title = String(req.body.title || '').trim();
    const artist = String(req.body.artist || '').trim();
    if (!title || !artist) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Preencha titulo e artista.' });
    }

    const src = `${PUBLIC_MEDIA_BASE_URL.replace(/\/$/, '')}/${encodeURIComponent(req.file.filename)}`;
    const payload = {
      title,
      artist,
      src,
      artwork: String(req.body.artwork || '').trim() || null,
      genre: String(req.body.genre || '').trim() || null,
      release: String(req.body.release || '').trim() || 'BLACKMESA Hz',
      sort_order: Number(req.body.sort_order || 0),
      published: String(req.body.published || 'true') === 'true',
      updated_at: new Date().toISOString()
    };

    const result = await adminSupabase.from('radio_tracks').insert(payload).select('*').single();
    if (result.error) throw result.error;

    await rebuildPlaylist();
    res.status(201).json({ track: result.data });
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: error instanceof Error ? error.message : 'Upload failed.' });
  }
});

app.delete('/radio/tracks/:id', requireAdmin, async (req, res) => {
  const existing = await adminSupabase
    .from('radio_tracks')
    .select('id,src')
    .eq('id', req.params.id)
    .maybeSingle();

  if (existing.error) return res.status(500).json({ error: existing.error.message });
  if (!existing.data) return res.status(404).json({ error: 'Track not found.' });

  const result = await adminSupabase.from('radio_tracks').delete().eq('id', req.params.id);
  if (result.error) return res.status(500).json({ error: result.error.message });

  const mediaBase = PUBLIC_MEDIA_BASE_URL.replace(/\/$/, '');
  if (existing.data.src?.startsWith(mediaBase)) {
    const filename = decodeURIComponent(existing.data.src.slice(mediaBase.length + 1));
    await fs.unlink(path.join(MEDIA_ROOT, path.basename(filename))).catch(() => {});
  }

  await rebuildPlaylist();
  res.status(204).send();
});

app.use((error, _req, res, _next) => {
  res.status(400).json({ error: error instanceof Error ? error.message : 'Request failed.' });
});

app.listen(PORT, () => {
  console.log(`BLACKMESA Oracle Radio API listening on :${PORT}`);
});
