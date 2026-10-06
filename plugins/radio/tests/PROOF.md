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
