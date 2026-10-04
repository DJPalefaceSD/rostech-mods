# Glovebox

Keeps the notes that matter in the glovebox, and hands them back to Claude after it compacts its memory.

Text notes only. Never video, never the screen, never your location. Glovebox reads files on your own machine, writes its own small files in your project, and sends nothing anywhere.

## What it is for

A long session fills Claude's memory, and Claude Code compacts it: the conversation is replaced by a summary. A decision you made an hour ago, a rule you found the hard way, or the task you are halfway through can be lost in that summary.

Put those things in the glovebox. After every compaction, Glovebox hands them straight back to Claude, word for word, with the list of files that had changed.

Your CLAUDE.md already loads every session. The glovebox is for what this session has learned since then.

## Use it

    /glovebox add the build command is make quux     keep a note
    /glovebox add-file docs/RULES.md                 keep a file: a pointer, read fresh each time
    /glovebox                                        show what is in it, level by level
    /glovebox drop 2                                 take entry 2 out
    /glovebox clear                                  empty it
    /glovebox receipts                               the last 10 receipts (see below)

Add `--user` to work on your own glovebox, which every project shares. Add `--every-turn` to make an entry reach Claude on every turn, not just after a compaction.

A file is kept as a pointer, never a copy, so Glovebox always reads what is on disk now. If the file is missing, Claude is told so in one line.

The notes live in `.claude/GLOVEBOX.md`. It is plain text, so you can edit it by hand. Lines that are not entries are left alone.

## The band and the budget

A band above the prompt shows how full the glovebox is: `🧤 Glovebox 12/200 lines`. It turns red over the budget. Entries marked every turn are shown separately with their size in tokens, because they are paid on every message.

The budget is 200 lines across every level. A note counts as one line, and a file counts its own lines at that moment. A 196-line rules file fits on its own. Glovebox warns when you go over and never blocks: a long glovebox works, but Claude may skim it.

## Every turn

`--every-turn` puts an entry into Claude's system prompt, the standing instructions, on every turn. It is read fresh from disk each time. While the text does not change, the prompt cache keeps it cheap.

🔴 **This guarantees the rules are put in front of Claude every turn. It does not guarantee Claude obeys them.** For a rule that must never be broken, pair it with a hook that blocks the action, like the Hands-Off mod in this repo, or a `PreToolUse` hook.

## Receipts

Each time an entry reaches Claude, Glovebox adds one line to `.claude/glovebox/receipts.log`. That line is the evidence that the rule was in front of Claude at that moment. Each turn is logged once per entry, however many requests the turn makes, plus again if the text changes within the turn.

`/glovebox receipts` shows the newest ten and checks the chain.

A receipt that cannot be written never stops the rules from reaching Claude.

### Receipt format v1

One JSON object per line (JSON Lines), with exactly these keys, in this order:

    {"v":1,"t":"2026-10-04T15:29:51.478Z","trigger":"turn","level":"project","entry":"note:1","sha256":"…","prev":"…"}

- `v`: the format version, `1`.
- `t`: when, as an ISO 8601 time.
- `trigger`: `turn` (in the system prompt for a turn) or `compact` (handed back after a compaction).
- `level`: `managed`, `user`, `ancestor` or `project`.
- `entry`: a file's path as written in the glovebox, or `note:<n>` for the n-th note of its level.
- `sha256`: the hex SHA-256 of the exact text given to Claude for that entry.
- `prev`: the hex SHA-256 of the previous line as written, or 64 zeros for the first line ever.

The `prev` chain makes the log tamper-evident: changing or deleting any line breaks the chain from there on.

When the log would pass 2,000 lines, it moves to `receipts.log.1`, older files shift to `.2`, `.3` and so on, and a new log starts. The new log's first `prev` is the hash of the old log's last line, so the chain runs across files. Old logs are never deleted.

## Levels: as high up the tree as it goes

Like CLAUDE.md, Glovebox reads more than one file. Outer levels reach Claude first, and each entry says where it came from:

1. **managed**: `GLOVEBOX.md` in Claude Code's managed-policy folder, `C:\Program Files\ClaudeCode\`, `/Library/Application Support/ClaudeCode/` or `/etc/claude-code/`. Read only.
2. **user**: `~/.claude/GLOVEBOX.md`, for every project.
3. **parent**: `.claude/GLOVEBOX.md` in each folder above the project, outermost first.
4. **project**: `.claude/GLOVEBOX.md` in the folder Claude Code started in.

Install Glovebox at user scope so it covers every project.

## For an organisation: compliance

What is known, from Claude Code's own docs (read 4 Oct 2026):

- **KNOWN.** The managed-policy folders above are where Claude Code reads an organisation's `managed-settings.json` and its managed `CLAUDE.md`, and a managed `CLAUDE.md` cannot be excluded by users. ([managed settings](https://code.claude.com/docs/en/managed-settings), [memory](https://code.claude.com/docs/en/memory))
- **Glovebox's own choice.** It reads a `GLOVEBOX.md` in that same folder as its top level. Claude Code does not read this file itself. It works only while Glovebox is installed and enabled.
- **KNOWN.** Managed settings outrank every other settings level. `enabledPlugins` turns a plugin on per scope, and `strictKnownMarketplaces` (managed only) limits which marketplaces users can install from. ([settings](https://code.claude.com/docs/en/settings), [settings reference](https://code.claude.com/docs/en/settings-reference))
- **UNKNOWN.** Whether a user can turn off a plugin that managed settings turned on. The docs do not say.
- **UNKNOWN.** Whether `allowManagedHooksOnly` (managed only, "Run only the hooks your organization deploys") also stops plugin hooks like Glovebox's. If it does, Glovebox will not run under it.
- **KNOWN.** For instructions that must load whatever the user does, Claude Code's managed `CLAUDE.md` is the documented route. Glovebox adds what that file does not do: fresh reads of pointed-to files, the hand-back after compaction, and receipts.

## Files it touches

Reads: the `GLOVEBOX.md` files above, the files you point it at, and `git status --short` at a compaction.
Writes: `.claude/GLOVEBOX.md` (or `~/.claude/GLOVEBOX.md` with `--user`), `.claude/glovebox/last-compact.md`, and `.claude/glovebox/receipts.log`.

## Next, not in 0.1.0

- A setting for the budget.
- Receipts for the user and managed levels kept in one place, not per project.

Tested with Claude Code 2.1.289.
