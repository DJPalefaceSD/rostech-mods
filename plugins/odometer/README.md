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

Tested with Claude Code 2.1.287.
