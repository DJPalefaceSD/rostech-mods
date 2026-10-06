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

## What it runs and sends

Nothing goes anywhere. Here is each thing, plainly.

**What it sends, and where.**
- Nothing leaves your machine. The only thing it sends is a sound file's path,
  to the player program below.
- It keeps one value on this machine, in Claude Code's plugin store: the path
  of your own sound (`ownSound`), if you set one.
- The ways out are two Claude Code calls. `$.process.run` starts the player
  program below on your machine. `$.audio.play` is Claude Code's own sound
  player, which plays a bundled sound.

**Which programs it runs, and why.**
- One program, on Windows, to play the sound, because Claude Code's own player
  does not play in a Windows terminal:
- `powershell.exe -NoProfile -Command "(New-Object Media.SoundPlayer $env:RADIO_FILE).PlaySync()"`
- The command is fixed text. The sound file's path goes in as the environment
  value `RADIO_FILE`, never inside the command.
- It runs when a turn longer than 20 seconds finishes, unless Radio is off. It
  also runs on `/radio test`, and once on `/radio sound <file>` so you hear
  it.
- Where PowerShell does not run, Claude Code's own player plays the bundled
  chime instead.

**What it puts in the prompts it submits.**
- It submits no prompts, and changes none of yours.

**What each hook does.**
- `session.start`: adds the `/radio` command and loads your own sound's path.
- `turn.start`: notes when the turn began.
- `turn.complete`: plays the chime if the turn took 20 seconds or more.
- `command.run` for `radio`: switches it on or off, sets your sound, plays
  the test, or says how it is set.

Tested with Claude Code 2.1.287 on Windows.
