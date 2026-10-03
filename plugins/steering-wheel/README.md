# Steering Wheel

Steer Claude mid-turn with one key.

When Claude is working and you have typed your next message, Claude Code holds it until the turn ends. To send it right away and steer the work, the default is a two-step chord: Ctrl+X, then Ctrl+S. Steering Wheel makes it one key: Alt+Enter.

## What it does

- `/steering-wheel` adds Alt+Enter to your own `~/.claude/keybindings.json`, so Alt+Enter sends a waiting message now. Everything else in that file stays as you had it, and the old chord keeps working.
- The hint under the prompt then reads **tap Alt+Enter to send now**. The key it names is read from your keybindings file, so if you change the key yourself, the hint follows.

## Notes

- A plugin cannot bind keys by itself. Your keys live in your own keybindings file, which is why Steering Wheel writes there only when you run `/steering-wheel`.
- Windows Terminal uses Alt+Enter for full screen by default, so there it may never reach Claude Code. Ctrl+X Ctrl+S and Ctrl+Enter still send now, or you can free Alt+Enter in Windows Terminal's settings.
- Esc stays the stop button.

MIT licensed. Made by Rostech.
