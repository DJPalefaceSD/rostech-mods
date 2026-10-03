# Steering Wheel

Steer Claude mid-turn with one key.

When Claude is working and you have typed your next message, Claude Code holds it until the turn ends. To send it right away and steer the work, the default is a two-step chord: Ctrl+X, then Ctrl+S. Steering Wheel makes it one key: F5.

## What it does

- `/steering-wheel` adds F5 to your own `~/.claude/keybindings.json`, so F5 sends a waiting message now. Everything else in that file stays as you had it, and the old chord keeps working, because some terminals never pass F5 through.
- The hint under the prompt then reads **tap F5 to send now**. The key it names is read from your keybindings file, so if you change the key yourself, the hint follows.

## Notes

- A plugin cannot bind keys by itself. Your keys live in your own keybindings file, which is why Steering Wheel writes there only when you run `/steering-wheel`.
- Why not Alt+Enter: Windows Terminal uses it for full screen, so it never reaches Claude Code there. Version 0.1.0 used it; 0.1.1 is back on F5.
- Esc stays the stop button.
- If F5 does nothing in your terminal, Ctrl+X Ctrl+S and Ctrl+Enter still send now.

MIT licensed. Made by Rostech.
