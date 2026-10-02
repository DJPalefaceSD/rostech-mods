# Logo

Your own logo on the dash above the prompt. It sits beside your other bands,
such as Gas Gauge and Speedometer, so the dash carries your brand.

- `/logo set C:/path/to/logo.png` puts a PNG on the dash. A square logo
  with bold shapes reads best.
- `/logo` shows which file is in use.
- `/logo hide` and `/logo show` toggle it.

The logo is drawn in coloured block characters, 12 columns by 6 rows, so it
shows in any terminal that can show colour. Pictures are not needed. The PNG is
shrunk once when you set it, on your own machine with Windows PowerShell, and
the result is kept across sessions in Claude Code's plugin store. Nothing is
sent anywhere. See-through parts of the PNG take your terminal's own colour.

Windows only for now, because the shrinking uses PowerShell.

Tested with Claude Code 2.1.287.
