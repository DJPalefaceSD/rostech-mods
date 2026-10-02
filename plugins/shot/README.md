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

Tested with Claude Code 2.1.287 on Windows.
