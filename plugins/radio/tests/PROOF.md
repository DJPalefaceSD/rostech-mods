# Radio proof

## 0.2.1 — 5 Oct 2026

What changed: the README only. It answers the directory review notes in a new section,
"What it runs and sends": what the mod sends and where, which programs it runs and why, what
it puts in the prompts it submits, and what each hook does.

- KNOWN: `git diff --stat 11c70c4 -- plugins/radio`, before this file was written:

    plugins/radio/.claude-plugin/plugin.json |  2 +-
    plugins/radio/README.md                  | 35 ++++++++++++++++++++++++++++++++
    2 files changed, 36 insertions(+), 1 deletion(-)

  The README and the version in `plugin.json`, nothing else.

PROOF 0.2.1: NONE — README only; the code is byte for byte 0.2.0, which had no proof run recorded

## 0.3.0 — 9 Oct 2026

What changed: the command is `/chime`, not `/radio`. Claude Code shipped a built-in
`/radio`, so every session start threw `"/radio" refused: it is the built-in /radio`,
and the throw also skipped loading your saved sound. The register call now catches a
refusal and the start carries on.

- KNOWN: `claude plugin validate --strict plugins/radio` passes. `claude plugin test plugins/radio`: 5 pass, 0 fail.
- KNOWN: the new test fails on the 0.2.1 code with `radio's session.start hook was skipped: radio:
  $.command.register: refused`, the same shape as the live error, and passes on 0.3.0.
- No live session was started on 0.3.0 before this line was written.

PROOF 0.3.0: NONE — no live session run yet; the refusal is reproduced and passing in tests
