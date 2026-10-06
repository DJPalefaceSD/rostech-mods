# Shot proof

## 0.1.1 — 5 Oct 2026

What changed: the README only. It answers the directory review notes in a new section,
"What it runs and sends": what the mod sends and where, which programs it runs and why, what
it puts in the prompts it submits, and what each hook does.

- KNOWN: `git diff --stat ec3f6df -- plugins/shot`, before this file was written:

    plugins/shot/.claude-plugin/plugin.json |  2 +-
    plugins/shot/README.md                  | 57 +++++++++++++++++++++++++++++++++
    2 files changed, 58 insertions(+), 1 deletion(-)

  The README and the version in `plugin.json`, nothing else.

PROOF 0.1.1: NONE — README only; the code is byte for byte 0.1.0, which had no proof run recorded
