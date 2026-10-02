# Radio

A chime when Claude finishes a long turn, so you can look away while it works
and come back when it is done.

The chime plays only when a turn took longer than 20 seconds, so quick
answers stay quiet.

- `/radio test` plays the chime.
- `/radio off` and `/radio on` switch it.
- `/radio` says whether it is on.

On Windows it plays the bundled chime with Windows' own SoundPlayer, through
PowerShell, because Claude Code's player does not play in a Windows terminal.
Elsewhere Claude Code plays it. It reads nothing and sends nothing anywhere.

Tested with Claude Code 2.1.287 on Windows.
