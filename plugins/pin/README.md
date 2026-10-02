# Pin

A short to-do list pinned above the prompt, so the few things you must get
done today stay in front of you while you work with Claude.

    📋 1. call the printer   [Done]
    📋 2. send the invoice   [Done]

- `/pin <text>` pins a to-do at the bottom of the list.
- `/pin` shows the list with its numbers.
- `/pin done 2`, or the Done button beside it, ticks one off.
- `/pin clear` clears the list.

When you tick a to-do off, your next message carries one visible line naming
it and the time, so Claude knows what you just finished. The list is kept
across sessions on your own machine, in Claude Code's plugin store, and
nothing is sent anywhere. The band draws in the terminal and in the Code tab
of the Claude desktop app.

Tested with Claude Code 2.1.287.
