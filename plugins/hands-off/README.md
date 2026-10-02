# Hands-Off

Files you mark as yours. Claude cannot edit them until you hand them back,
so a file you are working on by hand stays exactly as you left it.

- `/hands-off notes/plan.md` marks a file. A folder covers everything inside it.
- `/hands-off list` shows what is marked.
- `/hands-off release notes/plan.md` hands one back. `/hands-off release all` hands back everything.

It guards Claude's Edit, Write and NotebookEdit tools: an edit to a marked
path is refused, with a message telling Claude to ask you first. The marks
are kept across sessions on your own machine, in Claude Code's plugin store.
It sends nothing anywhere.

Tested with Claude Code 2.1.287.
