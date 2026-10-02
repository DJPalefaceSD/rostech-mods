# Clip

Put text on your clipboard straight from the prompt, cleaned of the clutter a
terminal drags along with it, so you never have to select and copy text out
of the terminal by hand.

- `/clip <text>` puts that text on your clipboard.

Clip strips box edges, prompt marks and trailing spaces from every line, and
blank lines from the top and bottom, before it copies.

It uses your system's own clipboard program: PowerShell's Set-Clipboard on
Windows, pbcopy on macOS, and wl-copy or xclip on Linux. Nothing is sent
anywhere else.

Tested with Claude Code 2.1.287 on Windows.
