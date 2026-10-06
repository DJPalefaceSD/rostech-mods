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

## What it runs and sends

Nothing goes to any service from the mod itself. Here is each thing, plainly.

**What it sends, and where.**
- Your to-dos stay on this machine, in Claude Code's plugin store, under the
  key `items`.
- When you tick a to-do off, your next message carries one added line naming
  it. That line goes to Anthropic inside your message, through Claude Code's
  own request. It makes no new connection.
- It sends nothing else, anywhere.

**Which programs it runs, and why.**
- None. It runs no programs.

**What it puts in the prompts it submits.**
- It submits no prompts of its own.
- It adds to the message you send, only after you tick a to-do off: a blank
  line, then `(📋 Ticked off at <time>: "<to-do>")`, naming each to-do you
  ticked off since your last message.
- That line is added once. Your next message goes out unchanged.

**What each hook does.**
- `session.start`: adds the `/pin` command and loads your list from the
  plugin store.
- `command.run` for `pin`: pins, lists, ticks off or clears, and saves the
  list.
- `prompt.submit`: adds the ticked-off line to your message. With nothing
  ticked off, it passes your message on unchanged.
- `ui.render` for `AbovePrompt`: draws the list, with a Done button on each
  line, above the prompt.

Tested with Claude Code 2.1.287.
