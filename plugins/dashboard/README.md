# Dashboard

Fully customisable: just ask your Claude to put what you want in it.

A ◆ Dashboard button sits above the prompt, beside any other mod's band. Press
it and a panel opens.

    ◆ D A S H B O A R D                       Opus 5.5 · High
    STATUS   3 of 7
    EFFORT   [ Auto ] [ Low ] [ Medium ] [ High ] [ XHigh ] [ Max ]

    S E T T I N G S
    ○ Helper agents  the model they use               [ Same as me ]

    L A U N C H
    [ ◆ Review ]   [ ◆ Tests ]

We use ours for pipeline updates and quick access to commands.

## What ships

- **Effort.** Pick one and every request you send goes out with it. Auto
  leaves Claude Code's own choice alone. The top line shows the model and
  effort your last message really went out with.
- **Helper agents.** Same as me, or Fast & Cheap, which sends every subagent
  to Haiku. Your own messages keep your model.
- **Launch buttons.** Each one sends its prompt as if you typed it.
- **A status row.** One line from a command you choose, read when the panel
  opens and after each turn while it is open. If the output has a count like
  `3 of 7` the row shows that, green at 0 and red when full. Otherwise it
  shows the first line.

`/dashboard` opens the panel too, and its reply carries the status reading.

## Make it yours

Open `/config`, or ask Claude to set these for you.

| Setting | What it takes | Default |
|---|---|---|
| Launch buttons | `Label=prompt`, separated by semicolons: `Review=review my last change; Tests=run the tests` | empty: no buttons |
| Status row label | the word in front of the row | `STATUS` |
| Status row command | a program and its arguments: `git log -1 --oneline`, `node tools/count.js` | empty: no row |
| Status row folder | where the command runs | the folder Claude Code started in |

The command is run directly, not through a shell, so pipes and `&&` do not
work. Put "quotes" round a part with spaces in it. It may run for 20 seconds
at most.

## What it runs and sends

It runs only the status command you set, and only while the panel is open.
Its output stays on your screen. The launch buttons send their text to Claude
in your conversation. Nothing goes to any other service.

The panel draws in the terminal and in the Code tab of the Claude desktop app.

Tested with Claude Code 2.1.289.
