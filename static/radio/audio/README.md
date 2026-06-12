# BLACKMESA Hz audio folder

Put the radio audio files in this folder.

These files can be used in two ways:

- As fallback/on-demand files in the website.
- As the Liquidsoap playlist that keeps the Icecast stream running when no live input is connected.

The first configured track expects this file:

```text
static/radio/audio/aperta-o-da-forte.mp3
```

It will be served by the site at:

```text
/radio/audio/aperta-o-da-forte.mp3
```

To add more authorial tracks, add the `.mp3` files here and register them in:

```text
src/lib/data/radio.ts
```

If the file should also play in the Icecast stream fallback playlist, add its container path to:

```text
radio/liquidsoap/playlist.m3u
```

Example:

```text
/audio/aperta-o-da-forte.mp3
```
