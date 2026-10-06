# Speedometer

A speedometer above the prompt: how full Claude's context window is.

    🏎️ SPEEDOMETER 0 ███ ½ █░░ MAX  context 67% full

Read it like a car's dash: 0 on the left, MAX on the right. Green while there
is room, yellow from 60%, red from 85%, with one toast when it redlines so you
can `/compact` before Claude does it for you.

- `/speed` or `/speedometer` prints the dial.
- `/speed hide` and `/speed show` toggle the band.

Gas Gauge's sibling on the same dash. The band draws in the terminal and in
the Code tab of the Claude desktop app. It reads only the figures Claude Code
already has, and sends nothing anywhere.

## What it runs and sends

Nothing goes anywhere. Here is each thing, plainly.

**What it sends, and where.**
- Nothing. It reads how full the context window is from Claude Code, with
  `$.session.usage`, and shows it on your screen.
- It stores nothing on disk.

**Which programs it runs, and why.**
- None. It runs no programs.

**What it puts in the prompts it submits.**
- It submits no prompts, and changes none of yours.

**What each hook does.**
- `session.start`: adds the `/speed` and `/speedometer` commands and reads
  the context fill.
- `session.measure`: takes the new fill, and shows one toast when it crosses
  85%.
- `command.run` for `speed`, and for `speedometer`: prints the dial, or
  hides or shows the band.
- `ui.render` for `AbovePrompt`: draws the dial above the prompt.

Tested with Claude Code 2.1.287.
