# Gas Gauge

A fuel gauge above the prompt: how much of your Claude plan is left in each
window, and when it refills.

    ⛽ GAS 5-hour  E ██████ ½ ███░░░ F  71%  refills 3:40 PM

Read it like a car: E on the left, F on the right, the ½ mark in the middle.
Green above half a tank, yellow above a fifth, red below that.

A toast fires once when a tank drops past 25% left, and again past 10%.

- `/gas` prints every tank.
- `/gas hide` moves the numbers to the status line. `/gas show` brings the band back.

The numbers are the ones Claude Code itself reads off each response, so the
gauge fills after Claude has answered once. On an API key with no plan
windows, it stays empty.

The band draws in the terminal and in the Code tab of the Claude desktop app.
The phone app does not draw it yet.

Tested with Claude Code 2.1.287.
