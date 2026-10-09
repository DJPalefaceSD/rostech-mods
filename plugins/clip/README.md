# Clip

Put text on your clipboard straight from the prompt, cleaned of the clutter a
terminal drags along with it, so you never have to select and copy text out
of the terminal by hand.

- `/clip <text>` puts that text on your clipboard.

If `/clip` already belongs to something of yours, a skill or another mod, Clip
answers to `/clipboard <text>` instead.

Clip strips box edges, prompt marks and trailing spaces from every line, and
blank lines from the top and bottom, before it copies.

It uses your system's own clipboard program: PowerShell's Set-Clipboard on
Windows, pbcopy on macOS, and wl-copy or xclip on Linux. Nothing is sent
anywhere else.

## What it runs and sends

Nothing goes to any service. Here is each thing, plainly.

**What it sends, and where.**
- The text you give `/clip` goes to your own clipboard program, on this
  machine, through its standard input. That is the only place it goes.
- The way out is `$.process.run`, Claude Code's call for starting a program on
  your machine. Clip uses it only to start the clipboard program below.
- It sends nothing over the network.

**Which programs it runs, and why.**
- One clipboard program, to put your text on the clipboard. It tries these in
  order and stops at the first that works:
- Windows: `powershell.exe -NoProfile -Command "$input | Set-Clipboard"`
- macOS: `pbcopy`
- Linux with Wayland: `wl-copy`
- Linux with X11: `xclip -selection clipboard`
- Each command is fixed text in the mod. Your text never goes into the
  command. It goes in on standard input.
- Each try stops after 5 seconds. It runs only when you type `/clip`.

**What it puts in the prompts it submits.**
- It submits no prompts. It never touches your prompt box.

**What each hook does.**
- `session.start`: adds the `/clip` command, or `/clipboard` when `/clip` is taken.
- `command.run` for `clip` and `clipboard`: cleans the text you typed, runs the clipboard
  program, and says how many characters it copied.

Tested with Claude Code 2.1.287 on Windows.
