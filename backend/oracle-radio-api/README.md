# BLACKMESA Oracle Radio API

API para rodar na Oracle VM e receber uploads de audio vindos do admin hospedado na Vercel.

## Setup

```sh
cd backend/oracle-radio-api
npm install
cp .env.example .env
npm start
```

Configure no `.env`:

- `ALLOWED_ORIGIN`: dominio do frontend na Vercel.
- `PUBLIC_MEDIA_BASE_URL`: URL publica que aponta para `/media` desta API.
- `MEDIA_ROOT`: pasta no disco da Oracle onde os audios serao gravados.
- `PLAYLIST_PATH`: caminho do `playlist.m3u` usado pelo Liquidsoap, opcional.
- `SUPABASE_SERVICE_ROLE_KEY`: chave secreta do Supabase, somente no servidor.

O frontend deve enviar `Authorization: Bearer <supabase-access-token>`.

## Endpoints

- `GET /health`
- `GET /media/:file`
- `POST /radio/tracks/upload`
- `GET /radio/tracks`
- `DELETE /radio/tracks/:id`

`POST /radio/tracks/upload` espera `multipart/form-data` com:

- `audio`: arquivo de audio.
- `title`
- `artist`
- `artwork`
- `genre`
- `release`
- `sort_order`
- `published`
