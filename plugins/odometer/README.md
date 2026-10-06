# Odometer

An odometer above the prompt: how long this session has run, and what it has
cost so far.

    🧭 1h 23m  $3.10

The cost is the figure `/cost` totals for the session. On a Claude plan that
is what the session would cost at API prices, not a charge. The time counts
from when the session first began, so a resumed session keeps its miles.

- `/odometer` prints it.
- `/odometer hide` and `/odometer show` toggle it.

It sits beside Gas Gauge and Speedometer on the same dash. It reads only the
figures Claude Code already has, and sends nothing anywhere. The band draws
in the terminal and in the Code tab of the Claude desktop app.

## What it runs and sends

Nothing goes anywhere. Here is each thing, plainly.

**What it sends, and where.**
- Nothing. It reads the session's start time and cost from Claude Code, with
  `$.session.usage`, and shows them on your screen.
- It stores nothing on disk.

**Which programs it runs, and why.**
- None. It runs no programs.

**What it puts in the prompts it submits.**
- It submits no prompts, and changes none of yours.

**What each hook does.**
- `session.start`: adds the `/odometer` command and reads the start time and
  cost.
- `session.measure`: takes the new cost each time Claude Code measures it.
- `command.run` for `odometer`: prints the reading, or hides or shows the
  band.
- `ui.render` for `AbovePrompt`: draws the dial above the prompt.

Tested with Claude Code 2.1.287.
