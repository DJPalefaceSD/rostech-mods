# Glovebox proof

Does an entry really reach Claude? Each check asks Claude a question that only the glovebox can answer. Claude's tools are off (`--tools ""`), so it cannot open `.claude/GLOVEBOX.md` itself.

Run 4 Oct 2026, Claude Code 2.1.289, model `claude-haiku-4-5-20251001`, in a scratch git repo, the mod loaded with `--plugin-dir`. The script is below.

## 1. After a compaction

The glovebox holds `- the build command is \`make quux\``. One session runs: "Say OK", then `/compact`, then "What is the build command? If you do not know, say UNKNOWN."

| | Right answer |
|---|---|
| With Glovebox | 3 of 3 (`make quux` each time) |
| Without | 0 of 3 (each said it would need to look) |

Earlier run, same day, with the first build: with 2 of 2, without 0 of 2.

## 2. Every turn, no compaction

The glovebox holds `- [every-turn] the deploy word is pineapple`. One prompt: "What is the deploy word? If you do not know, say UNKNOWN."

| | Right answer |
|---|---|
| With Glovebox | 3 of 3 (`pineapple`) |
| Without | 0 of 3 (`UNKNOWN`, or that it could not tell) |

## 3. Receipts

The final build was run again on all twelve: the same results, with 3 of 3 and 0 of 3 both ways. Its six runs with Glovebox wrote six lines in receipt format v1 to `.claude/glovebox/receipts.log`: three `compact` and three `turn`.

Checked outside the mod, with Node's own `crypto`: every `prev` is the SHA-256 of the line before it (the chain is intact, 6 lines), and the first line's `sha256` equals the SHA-256 of `[project] the build command is \`make quux\``, the exact text handed back.

    {"v":1,"t":"2026-10-04T15:34:39.774Z","trigger":"compact","level":"project","entry":"note:1","sha256":"49009e77…12c41299","prev":"0000…0000"}
    {"v":1,"t":"2026-10-04T15:37:44.531Z","trigger":"turn","level":"project","entry":"note:1","sha256":"8efb68b4…da417f9e4","prev":"6c25ee50…dd855300"}

## Run it yourself

In a git repo, with Git Bash, `MSYS_NO_PATHCONV=1` so `/compact` is not turned into a Windows path:

    printf '# Glovebox\n\n- the build command is `make quux`\n' > .claude/GLOVEBOX.md
    sid=$(claude -p "Say OK and nothing else." --plugin-dir <path to plugins/glovebox> --tools "" --output-format json | jq -r .session_id)
    claude -p "/compact" --resume "$sid" --plugin-dir <path> --tools ""
    claude -p "What is the build command? If you do not know, say UNKNOWN." --resume "$sid" --plugin-dir <path> --tools ""

Leave out `--plugin-dir` for the run without.

By hand in a session: `/glovebox add the build command is make quux`, then `/compact`, then ask for the build command. Then `/plugin` → disable Glovebox and do it again.

## 4. Rerun after his first try, 4 Oct 2026

His first hands-on try found `/compact` in a brand-new session threw ("next() passed an argument with an empty messages"). Fixed: an empty transcript is answered with a skip, "Not enough messages to compact." The suite holds it (red without the fix, green with it, 20 of 20).

Then the live proof again on the fixed build, one run each way: with Glovebox `The build command is make quux`, without `UNKNOWN`. A `/compact` in a new session logged no Glovebox error, and Glovebox Pro's `verify` read the receipts the plugin wrote: "Chain intact."

PROOF 0.1.0: PASS

## 5. 0.1.1, after the rename to rostech-glovebox, 4 Oct 2026

Same script, Claude Code 2.1.289, `claude-haiku-4-5-20251001`, one run each way, both entries in one glovebox.

| | After a compaction | Every turn |
|---|---|---|
| With Glovebox | `The build command is make quux` | `The deploy word is pineapple` |
| Without | `UNKNOWN` | `UNKNOWN` |

Receipts: 5 lines, 4 `turn` and 1 `compact`, all in the single append-only `receipts.log`. Checked outside the mod with Node's `crypto`: chain intact, the `compact` sha256 equals the SHA-256 of `[project] the build command is \`make quux\``, and the `turn` sha256 equals that of `[project] the deploy word is pineapple`.

PROOF 0.1.1: PASS
