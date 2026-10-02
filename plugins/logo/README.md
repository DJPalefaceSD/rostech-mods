# Logo

Your own logo on the dash above the prompt. It sits between your other bands,
such as Gas Gauge and Speedometer, so the dash carries your brand.

- `/logo set C:/path/to/logo.png` puts a PNG on the dash. A square logo
  reads best.
- `/logo` shows which file is in use.
- `/logo hide` and `/logo show` toggle it.

The path is kept across sessions on your own machine, in Claude Code's plugin
store. The terminal reads the PNG itself, so the picture never leaves your
machine and nothing is sent anywhere. The logo draws in the terminal; where a
terminal cannot draw pictures, the word "logo" shows dim in its place.

Tested with Claude Code 2.1.287.
