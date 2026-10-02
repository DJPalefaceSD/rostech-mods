# Radio

A chime when Claude finishes a long turn, so you can look away while it works
and come back when it is done.

The chime plays only when a turn took longer than 20 seconds, so quick
answers stay quiet.

- `/radio sound C:/path/to/chime.wav` makes it play your own sound. It plays
  the file once so you hear it, then keeps it across sessions.
- `/radio sound default` goes back to the bundled chime.
- `/radio test` plays the done chime, then the whistle.
- `/radio off` and `/radio on` switch it.
- `/radio` says whether it is on, and which sound it plays.

Your own sound has to be a .wav file. On Windows it is played with Windows'
own SoundPlayer, through PowerShell, because Claude Code's player does not
play in a Windows terminal. The path is passed as a setting, never inside the
command. Elsewhere Claude Code plays the bundled chime. It reads only the
sound file you name and sends nothing anywhere.

Tested with Claude Code 2.1.287 on Windows.
