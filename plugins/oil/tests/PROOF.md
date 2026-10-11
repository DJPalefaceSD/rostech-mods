# Oil proof

## 0.1.0 — 11 Oct 2026

What changed: the README only. Four lines at the foot point to every Rostech mod at
[rostech.app](https://rostech.app/).

- KNOWN: `git diff --stat origin/main HEAD -- plugins/oil`, before this file was written:

    plugins/oil/README.md | 4 ++++
    1 file changed, 4 insertions(+)

- KNOWN: `claude plugin validate --strict plugins/oil` passes, and `claude plugin test plugins/oil` is green, on Claude Code 2.1.296.
- Oil was built before the gate (4 Oct 2026), so no live proof run was ever recorded for it. None is claimed here.

PROOF 0.1.0: NONE — README only; built before the gate, no live proof run recorded
