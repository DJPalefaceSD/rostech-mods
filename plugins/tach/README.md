# Tach

A tachometer above the prompt. It shows how fast you are burning tokens right
now, as tokens a minute over the last few minutes, on a ten-segment bar.

- Green is easy going. Amber is the upper half. The top two segments are the
  red zone.
- The red zone is measured against your own busiest rate, which Tach remembers
  across sessions. It is your redline, not someone else's.
- `/tach` prints the rate and your busiest rate.
- `/tach 15m` or `/tach 1h` changes the window. The default is 5 minutes.
- `/tach hide` and `/tach show` toggle the band.

Tach counts fresh tokens: what each turn reads new, writes to the prompt cache,
and generates. Cache reads are left out, because they are cheap and would swamp
the needle. It updates when a turn ends, and slides back toward zero while you
are idle. Nothing leaves your machine.

It pairs with Gas Gauge (how much plan is left), Speedometer (how full the
context is) and Odometer (the session total).

## What it runs and sends

Nothing goes anywhere. Here is each thing, plainly.

**What it sends, and where.**
- Nothing. It reads each turn's token counts from Claude Code when the turn
  ends, and shows a rate on your screen.
- It keeps two numbers on this machine, in Claude Code's plugin store: your
  window (`windowMin`) and your busiest rate (`peak`).

**Which programs it runs, and why.**
- None. It runs no programs.
- Every 15 seconds it reads the clock, so the bar slides back while you are
  idle. That is all the timer does.

**What it puts in the prompts it submits.**
- It submits no prompts, and changes none of yours.

**What each hook does.**
- `session.start`: adds the `/tach` command, loads your window and busiest
  rate, and starts the 15-second clock.
- `turn.complete`: counts the turn's fresh tokens and saves a new busiest
  rate if there is one.
- `command.run` for `tach`: prints the rate, sets the window, or hides or
  shows the band.
- `ui.render` for `AbovePrompt`: draws the bar above the prompt.

Tested with Claude Code 2.1.287.
