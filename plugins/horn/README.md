# Horn

One chord to send now. Like a tap on the horn.

When Claude is working and you have typed your next message, Claude Code holds it until the turn ends. Horn lets you send it right away. Press Ctrl+X, then Ctrl+X again. Honk.

## What it does

- `/horn` adds Ctrl+X Ctrl+X to your own `~/.claude/keybindings.json`. That chord then sends a waiting message now.
- Everything else in that file stays as you had it. The default chord, Ctrl+X Ctrl+S, keeps working too.
- The hint under the prompt then reads **tap Ctrl+X Ctrl+X to send now**. It reads the key from your keybindings file, so if you change the key yourself, the hint follows.

## Why not F5

This mod used to be called Ignition, and it used F5. Claude Code does not take function keys, so F5 did nothing. Ctrl+X Ctrl+X works in any terminal.

If an older version left F5 in your file, or switched Ctrl+X Ctrl+S off, `/horn` takes those two lines back out. It touches nothing else.

## Notes

- A plugin cannot bind keys by itself. Your keys live in your own keybindings file, which is why Horn writes there only when you run `/horn`.
- Esc stays the stop button.

## What it runs and sends

Nothing goes anywhere. Here is each thing, plainly.

**What it sends, and where.**
- Nothing leaves your machine.
- It reads `USERPROFILE`, or `HOME`, to find your home folder.
- It reads `~/.claude/keybindings.json` when a session starts and when you
  run `/horn`.
- It writes that one file only when you run `/horn`, and only if the chord
  is not set yet or an old line needs taking out. Nothing else is written.

**Which programs it runs, and why.**
- None. It runs no programs.

**What it puts in the prompts it submits.**
- It submits no prompts, and changes none of yours.

**What each hook does.**
- `session.start`: reads your keybindings file to learn your send-now key,
  and adds the `/horn` command.
- `command.run` for `horn`: adds Ctrl+X Ctrl+X to your keybindings file,
  takes out the two old lines named above, and says what it did.
- `ui.render` for `PromptHint`: rewrites the hint under the prompt to name
  your send-now key.

MIT licensed. Made by Rostech.
