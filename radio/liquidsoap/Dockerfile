FROM savonet/liquidsoap:v2.2.5

COPY radio.liq /config/radio.liq
COPY playlist.m3u /config/playlist.m3u

CMD ["liquidsoap", "/config/radio.liq"]
