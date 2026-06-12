# Liquidsoap config

`radio.liq` builds the BLACKMESA Hz program in this order:

1. `input.harbor` accepts live audio on `/live`.
2. `playlist.m3u` plays local files when live is disconnected.
3. `output.icecast` sends the final program to Icecast on `/blackmesa.mp3`.

Current local credentials:

```text
Live input port: 9001
Live mount: /live
Live password: blackmesa_live

Icecast host: icecast
Icecast port: 8000
Icecast mount: /blackmesa.mp3
Icecast source password: blackmesa_source
```

Add fallback tracks by placing files in:

```text
static/radio/audio
```

Then add the container path to `playlist.m3u`:

```text
/audio/my-track.mp3
```

For production, change `blackmesa_live` and `blackmesa_source` before exposing the service.
