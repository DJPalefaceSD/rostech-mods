# Shot

Hand Claude the picture on your clipboard in one command. Snip part of your
screen, type `/shot`, and Claude gets the picture without you saving a file
or finding a path.

- `/shot` saves the clipboard picture and puts a message for Claude in your prompt box. Press Enter to send it.
- `/shot is the band lined up?` puts your own question in with it.

Shot saves the picture as a PNG in your temp folder, then writes one
message naming that file into your prompt box. Claude opens the file itself. It uses Windows' own
clipboard on Windows, wl-paste or xclip on Linux, and pngpaste on macOS if
you have it installed. The picture stays on your machine.

## What it runs and sends

Nothing goes to any service from the mod itself. Here is each thing, plainly.

**What it sends, and where.**
- It saves the picture on your clipboard as a PNG file in your temp folder, on
  this machine.
- It writes one message naming that file into your prompt box. It does not send
  it. You press Enter, and Claude Code sends it to Anthropic like any message
  you type.
- It sends nothing over the network.
- The ways out are two Claude Code calls. `$.process.run` starts the saver
  program below on your machine. `$.prompt.fill` writes text into your prompt
  box without sending it.

**Which programs it runs, and why.**
- One saver program, to save the clipboard picture to a file. It tries these in
  order and stops at the first that prints a file path:
- Windows: `powershell.exe -NoProfile -Command` with this script:

```
Add-Type -AssemblyName System.Windows.Forms; $i = [System.Windows.Forms.Clipboard]::GetImage(); if ($i) { $p = Join-Path $env:TEMP ("shot-" + (Get-Date -Format yyyyMMdd-HHmmss) + ".png"); $i.Save($p); $p }
```

- Linux with Wayland, which runs `wl-paste`:

```
sh -c 'p="${TMPDIR:-/tmp}/shot-$(date +%Y%m%d-%H%M%S).png"; wl-paste --type image/png > "$p" 2>/dev/null && [ -s "$p" ] && echo "$p"'
```

- Linux with X11, which runs `xclip`:

```
sh -c 'p="${TMPDIR:-/tmp}/shot-$(date +%Y%m%d-%H%M%S).png"; xclip -selection clipboard -t image/png -o > "$p" 2>/dev/null && [ -s "$p" ] && echo "$p"'
```

- macOS, which runs `pngpaste` if you installed it:

```
sh -c 'p="${TMPDIR:-/tmp}/shot-$(date +%Y%m%d-%H%M%S).png"; pngpaste "$p" 2>/dev/null && echo "$p"'
```

- Each command is fixed text in the mod. Nothing you type goes into it.
- Each try stops after 10 seconds. It runs only when you type `/shot`.

**What it puts in the prompts it submits.**
- It submits no prompts. It fills your prompt box, replacing what was there,
  with exactly this, then waits for you:
- `Here is a screenshot I just took: <the PNG's path>`, a blank line, then
  the words you typed after `/shot`.
- With no words, the second line is `Look at it and tell me what you see.`

**What each hook does.**
- `session.start`: adds the `/shot` command.
- `command.run` for `shot`: saves the clipboard picture, then fills your
  prompt box with the message above.

Tested with Claude Code 2.1.287 on Windows.
