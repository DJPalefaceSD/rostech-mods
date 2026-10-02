# Temp Gauge

A temperature gauge above the prompt: how full the context window is.

    🌡️ TEMP context  C ██████ ½ ██░░░░ H  67% full

Read it like a car: C on the left, H on the right. Green while it runs cool,
yellow from 60%, red from 85%, with one toast when it crosses into the red
so you can `/compact` before Claude does it for you.

- `/temp` prints the gauge.
- `/temp hide` and `/temp show` toggle the band.

Gas Gauge's sibling. The band draws in the terminal and in the Code tab of
the Claude desktop app.

Tested with Claude Code 2.1.287.
