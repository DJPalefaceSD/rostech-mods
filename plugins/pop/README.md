# Pop

Open a link or a file in its own app, in a window of its own, straight from
the prompt. A link in a terminal is often not clickable, so Pop opens it for
you instead of leaving you to copy it out.

- `/pop example.com` opens a web page. A bare domain gets https in front.
- `/pop C:/notes/plan.md` opens a file in the app your system uses for it.

It uses your system's own opener: Start-Process on Windows, open on macOS,
and xdg-open on Linux. The address goes to that program as an environment
value, never pasted into a command line. Nothing is sent anywhere else.

Tested with Claude Code 2.1.287 on Windows.
