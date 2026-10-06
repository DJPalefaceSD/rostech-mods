# Gas Gauge

A fuel gauge above the prompt: how much of your Claude plan is left in each
window, and when it refills.

    ⛽ 5-hour  E ███ ½ █░░ F  71%  @ 3:40 PM

Read it like a car: E on the left, F on the right, the ½ mark in the middle.
Green above half a tank, yellow above a fifth, red below that.

Each gauge takes half the band. A toast fires once when a tank drops past 25% left, and again past 10%.

- `/gas` prints every tank.
- `/gas hide` moves the numbers to the status line. `/gas show` brings the band back.

The Tanks to show setting, in `/config`, picks which windows the gauge shows:
`both` (the default), `5-hour` alone, or `week` alone. A tank it leaves out is
gone everywhere, from the band, `/gas`, the warnings and the status line.

The numbers are the ones Claude Code itself reads off each response, so the
gauge fills after Claude has answered once. On an API key with no plan
windows, it stays empty.

The band draws in the terminal and in the Code tab of the Claude desktop app.
The phone app does not draw it yet.

## What it runs and sends

Nothing goes anywhere. Here is each thing, plainly.

**What it sends, and where.**
- Nothing. It reads your plan windows from Claude Code, with
  `$.session.usage`, and shows them on your screen.
- It stores nothing on disk. The Tanks to show setting is kept by Claude Code.

**Which programs it runs, and why.**
- None. It runs no programs.

**What it puts in the prompts it submits.**
- It submits no prompts, and changes none of yours.

**What each hook does.**
- `session.start`: adds the `/gas` command and reads the plan windows.
- `session.measure`: takes the new windows, shows a toast when a tank drops
  past 25% or 10% left, and fills the status line while the band is hidden.
- `command.run` for `gas`: prints every tank, or hides or shows the band.
- `ui.render` for `AbovePrompt`: draws the gauge above the prompt.

Tested with Claude Code 2.1.288.
