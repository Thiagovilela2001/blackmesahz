# BLACKMESA Hz
# Liquidsoap program chain:
# 1. Accept a live encoder on harbor /live.
# 2. Fall back to the local playlist when nobody is live.
# 3. Send the final program to Icecast on /blackmesa.mp3.

set("log.stdout", true)
set("init.daemon", false)

icecast_host = "icecast"
icecast_port = 8000
icecast_password = "blackmesa_source"
icecast_mount = "/blackmesa.mp3"

live_port = 9001
live_mount = "/live"
live_password = "blackmesa_live"

playlist_file = "/config/playlist.m3u"

archive = playlist(
  id="blackmesa-archive",
  mode="randomize",
  reload=60.,
  playlist_file
)

live = input.harbor(
  id="blackmesa-live",
  port=live_port,
  password=live_password,
  live_mount
)

program = fallback(
  id="blackmesa-program",
  track_sensitive=false,
  [live, archive]
)

program = mksafe(program)

output.icecast(
  %mp3(bitrate=192, samplerate=44100, stereo=true),
  id="blackmesa-icecast-output",
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount=icecast_mount,
  name="BLACKMESA Hz",
  genre="UK Bass / Dubstep / Garage",
  description="BLACKMESA Hz live stream",
  url="https://blackmesa.art.br",
  program
)
