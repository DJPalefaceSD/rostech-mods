# Speedometer proof

## 0.1.10 — 5 Oct 2026

What changed: the README only. It answers the directory review notes in a new section,
"What it runs and sends": what the mod sends and where, which programs it runs and why, what
it puts in the prompts it submits, and what each hook does.

- KNOWN: `git diff --stat da30ab4 -- plugins/speedometer`, before this file was written:

    plugins/speedometer/.claude-plugin/plugin.json |  2 +-
    plugins/speedometer/README.md                  | 24 ++++++++++++++++++++++++
    2 files changed, 25 insertions(+), 1 deletion(-)

  The README and the version in `plugin.json`, nothing else.

PROOF 0.1.10: NONE — README only; the code is byte for byte 0.1.9, which had no proof run recorded
