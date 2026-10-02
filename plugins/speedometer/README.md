# Speedometer

A speedometer above the prompt: how full Claude's context window is.

    🏎️ SPEEDOMETER context  0 ███ ½ █░░ MAX  67% full

Read it like a car's dash: 0 on the left, MAX on the right. Green while there
is room, yellow from 60%, red from 85%, with one toast when it redlines so you
can `/compact` before Claude does it for you.

- `/speed` or `/speedometer` prints the dial.
- `/speed hide` and `/speed show` toggle the band.

Gas Gauge's sibling on the same dash. The band draws in the terminal and in
the Code tab of the Claude desktop app. It reads only the figures Claude Code
already has, and sends nothing anywhere.

Tested with Claude Code 2.1.287.
