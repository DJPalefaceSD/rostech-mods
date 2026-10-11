# Hands-Off proof

## 0.1.4 — 11 Oct 2026

What changed: the README only. Four lines at the foot point to every Rostech mod at
[rostech.app](https://rostech.app/).

- KNOWN: `git diff --stat origin/main HEAD -- plugins/hands-off`, before this file was written:

    plugins/hands-off/README.md | 4 ++++
    1 file changed, 4 insertions(+)

- KNOWN: `claude plugin validate --strict plugins/hands-off` passes, and `claude plugin test plugins/hands-off` is green, on Claude Code 2.1.296.
- Hands-Off was built before the gate (4 Oct 2026), so no live proof run was ever recorded for it. None is claimed here.

PROOF 0.1.4: NONE — README only; built before the gate, no live proof run recorded
