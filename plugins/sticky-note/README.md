# Sticky Note

A note that sits above the prompt until you clear it, so the one thing you
must not forget stays in front of you while you work.

    📌 call the printer before 5   [Done]

- `/note <text>` sticks a note.
- `/note` shows the note you have.
- `/note done`, or the Done button, clears it. Your next message then carries one visible line saying which note you cleared and when, so Claude knows you are back.

The note is kept across sessions on your own machine, in Claude Code's plugin
store, until you clear it. It sends nothing anywhere. The band draws in the
terminal and in the Code tab of the Claude desktop app.

## What it runs and sends

Nothing goes to any service from the mod itself. Here is each thing, plainly.

**What it sends, and where.**
- Your note stays on this machine, in Claude Code's plugin store, under the key
  `note`.
- When you clear the note, your next message carries one added line naming
  it. That line goes to Anthropic inside your message, through Claude Code's
  own request. It makes no new connection.
- It sends nothing else, anywhere.

**Which programs it runs, and why.**
- None. It runs no programs.

**What it puts in the prompts it submits.**
- It submits no prompts of its own.
- It adds to the message you send, only after you clear a note: a blank line,
  then `(📌 Sticky note cleared at <time>: "<note>")`.
- That line is added once. Your next message goes out unchanged.

**What each hook does.**
- `session.start`: adds the `/note` command and loads your note from the
  plugin store.
- `command.run` for `note`: sets, shows or clears the note.
- `prompt.submit`: adds the cleared-note line to your message. With no note
  cleared, it passes your message on unchanged.
- `ui.render` for `AbovePrompt`: draws the note, with a Done button, above
  the prompt.

Tested with Claude Code 2.1.287.
