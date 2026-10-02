# Context Limit

A temperature dial above the prompt: how full Claude's context window is.

    🌡️ CONTEXT LIMIT context  C ██████ ½ ██░░░░ H  67% full

Read it like a car's temperature gauge: C on the left, H on the right. Green
while there is room, yellow from 60%, red from 85%, with one toast when it
crosses into the red so you can `/compact` before Claude does it for you.

- `/limit` prints the dial.
- `/limit hide` and `/limit show` toggle the band.

Gas Gauge's sibling. The band draws in the terminal and in the Code tab of
the Claude desktop app. It reads only the figures Claude Code already has,
and sends nothing anywhere.

Tested with Claude Code 2.1.287.
