# Pop

Open a link or a file in its own app, in a window of its own, straight from
the prompt. A link in a terminal is often not clickable, so Pop opens it for
you instead of leaving you to copy it out.

- `/pop example.com` opens a web page. A bare domain gets https in front.
- `/pop C:/notes/plan.md` opens a file in the app your system uses for it.

It uses your system's own opener: Start-Process on Windows, open on macOS,
and xdg-open on Linux. The address goes to that program as an environment
value, never pasted into a command line. Nothing is sent anywhere else.

## What it runs and sends

Nothing goes to any service from the mod itself. Here is each thing, plainly.

**What it sends, and where.**
- The link or path you give `/pop` goes to your system's own opener program,
  on this machine. That is the only place the mod sends it.
- The opener then opens it: a link in your web browser, a file in the app your
  system uses for it. That is the same as clicking it yourself.
- The way out is `$.process.run`, Claude Code's call for starting a program on
  your machine. Pop uses it only to start the opener below.

**Which programs it runs, and why.**
- One opener program, to open your link or file. It tries these in order and
  stops at the first that works:
- Windows: `powershell.exe -NoProfile -Command "Start-Process -FilePath $env:POP_TARGET"`
- macOS: `open <your link or path>`
- Linux: `xdg-open <your link or path>`
- On Windows the command is fixed text. Your link goes in as the environment
  value `POP_TARGET`, never inside the command.
- On macOS and Linux the program name is fixed. Your link or path is its one
  argument, passed straight to it, never through a shell.
- Each try stops after 8 seconds. It runs only when you type `/pop`.

**What it puts in the prompts it submits.**
- It submits no prompts. It never touches your prompt box.

**What each hook does.**
- `session.start`: adds the `/pop` command.
- `command.run` for `pop`: puts https in front of a bare domain, runs the
  opener, and says whether it opened.

Tested with Claude Code 2.1.287 on Windows.
