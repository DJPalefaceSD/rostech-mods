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

## Why this exists

I edit my own files by hand, in Notepad++.

I direct Claude Code all day. I do not write the code.

I run Claude like a workshop, and Claude is the foreman.
On 15 August 2026, half in character, I told the foreman this, at 1:23 in the afternoon:

> "Next time i come in here and 2 minutes later some idiot AI is [messing] with MY files in any way that i dont approve then you habndel it"

Nothing had been wrecked yet.
That was the point. I wanted it fixed before it happened.

The rule it made:
when I say a file is mine, no Claude writes to it.
Not a typo. Not a reformat. Not because the change is obviously right.
And I release it. Nobody else does.

The first version was a flag and a warning.
A shell script kept the list, and a hook printed it above every turn.
It could not stop a write. It only made a write deliberate instead of an accident.

This mod is the version that stops it.

Tested with Claude Code 2.1.287.
