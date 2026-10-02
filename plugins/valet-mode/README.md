# Valet Mode

A look-only mode for when someone else is at your PC. Like the valet key for a
car: they can drive Claude's questions and answers, but they cannot open the
trunk.

- `/valet on 4821` turns it on with a code you pick, 4 characters or more.
- `/valet off 4821` turns it off. The wrong code leaves it on.
- `/valet` says whether it is on.

While it is on, Claude can still read files, search and answer questions. It
cannot edit or write files, run shell commands, or use connectors that act for
you, such as sending email. A yellow VALET MODE band sits above the prompt so
nobody forgets it is on.

It locks every Claude Code window on the PC at once, including windows that
were already open, and the band shows up in each of them within a couple of
seconds. It stays on through a restart, so closing Claude Code does not unlock
it. The lock and its code are kept in one small file on your own machine,
`.claude/rostech/valet-mode.json` in your user folder. If that file is damaged,
Valet Mode stays locked rather than opening up. It is a simple lock for a guest
at your desk, not a security system. It sends nothing anywhere.

Tested with Claude Code 2.1.288.
