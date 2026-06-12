# BLACKMESA Hz streaming

This folder contains the local Icecast + Liquidsoap radio stack.

Start the radio backend:

```powershell
npm run radio:up
```

Then open the stream:

```text
http://127.0.0.1:8000/blackmesa.mp3
```

The website reads this stream URL from:

```text
PUBLIC_RADIO_STREAM_URL
```

For local development, use:

```text
PUBLIC_RADIO_STREAM_URL=http://127.0.0.1:8000/blackmesa.mp3
```

Live input

Liquidsoap also opens a live input on port `9001`, mount `/live`.
Use BUTT, OBS, Mixxx, or another encoder with:

```text
Server: 127.0.0.1
Port: 9001
Mount: /live
Password: blackmesa_live
Format: MP3
```

Liquidsoap will prefer the live input when connected and fall back to the local playlist when no live source is active.

Fallback playlist files live in:

```text
radio/liquidsoap/playlist.m3u
```

Paths in that file must use the container path:

```text
/audio/file-name.mp3
```

Change all passwords before production.
