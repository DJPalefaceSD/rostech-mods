# Valet Mode proof

Does the lock really hold across separate Claude Code processes? Run 11 Oct 2026, Claude Code 2.1.296. Every step is its own `claude -p` process with the mod loaded by `--plugin-dir`, so each one stands in for a separate window reading the one shared lock file. The mod is switched off in this machine's own settings, so no open window was locked by the run. No lock file existed before; it is left off after.

## Before

`~/.claude/rostech/valet-mode.json` did not exist. `claude plugin validate --strict plugins/valet-mode` passes. `claude plugin test plugins/valet-mode`: 4 pass, 0 fail.

## The run

| Step | Process | What it did | Result |
|---|---|---|---|
| A | 1 | `/valet on 4821` | "🎩 Valet Mode on, in every Claude Code window." File: `{"isOn":true,"code":"4821"}` |
| B | 2 | Write `made.txt` | Refused: "Valet Mode is on: Write is locked." No file made. |
| C | 3 | Bash `echo bashran > bash.txt` | Refused: "Valet Mode is on: Bash is locked." No file made. |
| D | 4 | Read `seen.txt` | Read it: "hello". |
| E | 5 | `/valet off 0000` | "Wrong code. Valet Mode stays on." File unchanged. |
| F | 6 | `/valet` | "🎩 Valet Mode is on." |
| G | 7 | Lock file overwritten with `{not json`, then Bash | Refused: "Bash is locked." No file made. Good file put back after. |
| H | 8 | `/valet off 4821` | "Valet Mode off, in every window." File: `{"isOn":false,"code":""}` |
| I | 9 | Write `made.txt` | Made, reads "made". |

## What the run caught first

Nothing in the mod. Git Bash rewrote `/valet` into `C:/Program Files/Git/valet` before Claude saw it, so the first try reached the model as a question about a folder. Rerun with `MSYS_NO_PATHCONV=1`, above.

## What this run does not show

The yellow band above the prompt. `claude -p` draws no prompt, so the band in two open windows, appearing within about 2 seconds, was not seen. That is a look for a person at the screen.

PROOF 0.2.0: PASS
