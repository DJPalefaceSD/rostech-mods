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

Nothing goes to any service except Anthropic, through Claude Code's own
requests. Here is each thing, plainly.

**What it sends, and where.** It changes nothing it does not name here.
- Every request Claude Code sends to Anthropic passes through the mod's
  `turn.step` hook on its way out. That hook is Claude Code's own request to
  the model, not a new connection.
- If you picked an effort, the hook sets that request's effort to your pick.
  On Auto it leaves the request alone.
- If Helper agents is Fast & Cheap, the hook sets a subagent's request to the
  model `claude-haiku-4-5-20251001`. Your own messages keep your model.
- The request still goes only to Anthropic, the same way it would without the
  mod. The mod adds no text to it.

**Which programs it runs, and why.**
- Only the one program you write into **Status row command**, to show one line
  of status on the panel. Empty means it runs nothing.
- It cannot be written as fixed text in the mod, because you choose it. The
  mod runs exactly what you typed: the program and its arguments, directly,
  never through a shell, in **Status row folder**, for at most 20 seconds.
- It runs when the panel opens and after each turn while the panel is open.
  Its output stays on your screen and is never sent anywhere.

**What it puts in the prompts it submits.**
- A launch button submits exactly the prompt you wrote for it in **Launch
  buttons**, as if you typed it. The mod adds nothing and changes nothing.
- It submits nothing else, ever. With no buttons set, it never submits.

The panel draws in the terminal and in the Code tab of the Claude desktop app.

Tested with Claude Code 2.1.289.
