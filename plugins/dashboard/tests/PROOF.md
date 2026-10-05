# Dashboard proof

Run 5 Oct 2026, Claude Code 2.1.289, `claude -p "/dashboard"` with the mod
loaded by `--plugin-dir`, its settings passed with `--settings` under
`pluginConfigs."rostech-dashboard@inline".options`, in a scratch git repo
holding one commit and `tools/count.js`, which prints `QUEUE` then
`  waiting : 3 of 7`.

| Run | Settings | Reply |
|---|---|---|
| 1 | none | `Dashboard opened.` |
| 2 | label `QUEUE`, command `node tools/count.js`, folder the scratch repo | `Dashboard opened. QUEUE: 3 of 7` |
| 3 | label `LAST`, command `git log -1 "--format=%h %s"`, folder the scratch repo | `Dashboard opened. LAST: 4e11942 Proof commit for the status row` |
| 4 | command `node tools/count.js`, no folder (session folder) | `Dashboard opened. STATUS: 3 of 7` |
| 5 | command `no-such-program-xyz` | `Dashboard opened. STATUS: no reading` |

Run 3's line is the repo's real `git log -1 "--format=%h %s"`, checked by
hand: `4e11942 Proof commit for the status row`. The quoted part reached git
as one argument.

## What this run could not prove

The button above the prompt, the panel, and pressing Effort, Helper agents or
a launch button are drawn only in an interactive session. A `claude -p` run
places no pane and has nothing to press. The suite covers them (13 tests,
terminal and desktop), but no person has pressed them in a live session of
this build.

PROOF 0.1.0: NONE — the status row and /dashboard are proven live above; the button, the panel and its presses need a person in an interactive session.
