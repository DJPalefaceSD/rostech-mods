# Clip proof

## 0.1.1 — 5 Oct 2026

What changed: the README, and one line in `hooks/hooks.json`.

- The README answers the directory review notes: what the mod sends and where (your text, to
  your own clipboard program, on standard input), which programs it runs and why (the four
  fixed clipboard commands), that it submits no prompts, and what each hook does.
- The directory flagged a field Claude Code does not know. It was the top-level
  `"description"` in `hooks/hooks.json`. The mods reference lists only `modules` and
  `hooks` for that file, so the field did nothing. It was not a misspelling, so 0.1.1 takes it
  out. `plugin.json` had no unknown field: every key is in the manifest reference.
- KNOWN: `git diff --stat ec3f6df -- plugins/clip`, before this file was written:

    plugins/clip/.claude-plugin/plugin.json |  2 +-
    plugins/clip/README.md                  | 30 ++++++++++++++++++++++++++++++
    plugins/clip/hooks/hooks.json           |  1 -
    3 files changed, 31 insertions(+), 2 deletions(-)

- KNOWN: `register.ts` is byte for byte the 0.1.0 file. After the change,
  `claude plugin validate --strict plugins/clip` passes and still reads the module
  (hooks: session.start, command.run{command=clip}). `claude plugin test plugins/clip`:
  2 pass, 0 fail.
- No live `/clip` run was made for this version, because it would overwrite the clipboard
  on this machine. No new live reading is claimed.

PROOF 0.1.1: NONE — README and one unread hooks.json field removed; the code is byte for byte 0.1.0, which had no proof run recorded; validate --strict and 2 tests pass

## 0.1.2 — 9 Oct 2026

What changed: when `/clip` is already taken (here, his own /clip skill), the mod registers
`/clipboard` instead of throwing `"/clip" refused: it is the user's /clip` at every start.

- KNOWN: `claude plugin validate --strict plugins/clip` passes. `claude plugin test plugins/clip`: 3 pass, 0 fail.
- KNOWN: the new test fails on the 0.1.1 code and passes on 0.1.2.
- No live session was started on 0.1.2 before this line was written.

PROOF 0.1.2: NONE — no live session run yet; the refusal is reproduced and passing in tests
