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

Tested with Claude Code 2.1.287.
