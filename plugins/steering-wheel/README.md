# Steering Wheel

Steer Claude mid-turn with one chord.

When Claude is working and you have typed your next message, Claude Code holds it until the turn ends. Steering Wheel lets you send it right away and steer the work. Press Ctrl+X, then Ctrl+X again.

## What it does

- `/steering-wheel` adds Ctrl+X Ctrl+X to your own `~/.claude/keybindings.json`. That chord then sends a waiting message now.
- Everything else in that file stays as you had it. The default chord, Ctrl+X Ctrl+S, keeps working too.
- The hint under the prompt then reads **tap Ctrl+X Ctrl+X to send now**. It reads the key from your keybindings file, so if you change the key yourself, the hint follows.

## Why not F5

Versions 0.1.1 and before used F5. Claude Code does not take function keys, so F5 did nothing. Version 0.1.0 used Alt+Enter, which Windows Terminal keeps for full screen. Ctrl+X Ctrl+X works in any terminal.

If an older version left F5 in your file, or switched Ctrl+X Ctrl+S off, `/steering-wheel` takes those two lines back out. It touches nothing else.

## Notes

- A plugin cannot bind keys by itself. Your keys live in your own keybindings file, which is why Steering Wheel writes there only when you run `/steering-wheel`.
- Esc stays the stop button.

MIT licensed. Made by Rostech.
