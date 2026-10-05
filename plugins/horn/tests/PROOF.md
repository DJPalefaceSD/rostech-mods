# Horn proof

Does `/horn` really fix a keys file? Run 4 Oct 2026, Claude Code 2.1.289, `claude -p "/horn"` with the mod loaded by `--plugin-dir`, against a keys file shaped like the one an older version (Ignition, Steering Wheel 0.1.0) left behind. His own file was backed up first and put back after, checked byte for byte.

## Before

`f5 -> chat:sendNow`, `ctrl+x ctrl+s -> null`, and one binding of his own, `ctrl+g -> chat:externalEditor`.

## Run 1

Reply: "Ctrl+X Ctrl+X now sends a waiting message right away. Ctrl+X Ctrl+S still works too. Took out what an older version left: F5, Ctrl+X Ctrl+S."

File after: `ctrl+g -> chat:externalEditor` kept, `ctrl+x ctrl+x -> chat:sendNow` added, F5 and the null gone.

## Run 2, same file

Reply: "Ctrl+X Ctrl+X already sends now. Nothing changed." The file was left byte for byte the same.

## What the proof caught first

The first run answered "horn registered /horn but no command.run hook answered it". The hook filtered on `{ name }` where the engine matches `{ command }`, so `/horn` did nothing at all. Fixed, then run again above. Steering Wheel had the same fault.

PROOF 0.2.0: PASS
