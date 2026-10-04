# rostech-mods

Small mods for Claude Code, for working at a glance.

A mod is a Claude Code plugin with live code: it can draw a pane or a band,
guard a tool call, or add a command. Mods need Claude Code 2.1.287 or later.

## Install

    /plugin marketplace add DJPalefaceSD/rostech-mods
    /plugin install <mod>@rostech

## The mods

| Mod | What it does |
|---|---|
| [Gas Gauge](plugins/gas-gauge) | A fuel gauge above the prompt: how much of your Claude plan is left, and when it refills. |
| [Speedometer](plugins/speedometer) | A speedometer above the prompt: how full the context window is, from 0 to MAX. |
| [Sticky Note](plugins/sticky-note) | A note above the prompt that stays until you clear it. |
| [Radio](plugins/radio) | A chime when Claude finishes a long turn, so you can look away. |
| [Hands-Off](plugins/hands-off) | Files you mark as yours: Claude cannot edit them until you hand them back. |
| [Odometer](plugins/odometer) | An odometer above the prompt: how long this session has run and what it has cost. |
| [Clip](plugins/clip) | Put text on your clipboard from the prompt, cleaned of terminal clutter. |
| [Pop](plugins/pop) | Open a link or a file in its own window, straight from the prompt. |
| [Shot](plugins/shot) | Hand Claude the picture on your clipboard in one command. |
| [Pin](plugins/pin) | A short to-do list pinned above the prompt, ticked off with one click. |
| [Logo](plugins/logo) | Your own logo on the dash above the prompt, drawn in coloured blocks. |
| [Tach](plugins/tach) | A tachometer above the prompt: how fast you are burning tokens, over a window you choose. |
| [Bumper Sticker](plugins/bumper-sticker) | Your own words on the busy line while Claude works, in place of Baking, Brewing and the rest. |
| [Valet Mode](plugins/valet-mode) | A look-only mode for someone else at your PC: Claude can read and answer, but cannot change anything. |
| [Glovebox](plugins/glovebox) | Keeps the notes that matter in the glovebox, and hands them back to Claude after it compacts its memory. Text notes only. |

Each mod lives in `plugins/<name>/`, with its own README. Ideas not built yet
wait in `stubs/`.
