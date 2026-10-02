<!--
DRAFT. Not in the README yet. Sources, every fact below traces to one of these:

1. C:/Development/ComicBookStudioSimulator/docs/lore/THE_RECORD/2026-08-15.md
   line 11524  1:13 PM, Ryan asks for Notepad++ on the Foreman page
   line 11538  1:15 PM, Claude: "when you say `editing`, I stop writing to that file and never tidy what you typed"
   line 11823  1:23 PM, Ryan's words, quoted verbatim below
   line 11833  1:24 PM, Claude: HANDS OFF built and tested, six paths
2. C:/Development/ComicBookStudioSimulator/.claude/tools/hands-off.sh
   lines 1-24  the flag, the same quote, "It cannot physically stop a write"
   git: b902e838c, 2026-08-15 13:24:49 -0700, "HANDS OFF: his files, declared and reported at the top of every turn"
3. C:/Development/ComicBookStudioSimulator/.claude/hooks/the-shape.sh lines 186-194  printed above every turn
4. C:/Development/ComicBookStudioSimulator/IRONMAN/LANGUAGE.md lines 224-235  "not a typo, not a reformat"
5. C:/Development/ComicBookStudioSimulator/CLAUDE.md line 293  "When he says he is editing: stop writing to that file and do not tidy what he typed."
6. C:/Development/ComicBookStudioSimulator/docs/lore/THE_RECORD/2026-10-02.md lines 3880, 4012-4014  the mod, built 2 Oct 2026
7. C:/Development/rostech-mods/plugins/hands-off/README.md and hooks/register.ts  what the mod does now

The quote keeps his spelling and his capitals. Swap in the softer cut at the bottom if the language is wrong for a public page.
-->

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
It sits in front of Claude's Edit, Write and NotebookEdit tools.
A marked file is refused, and Claude is told to ask me first.

`/hands-off <file>` takes it.
`/hands-off release <file>` gives it back.

<!--
His pick, 2 Oct 2026: the softer cut. His words: "do the soft one please. Its not
becasue of my foul language, its the lack of context". He was roleplaying the lore
with the foreman, so the line about the foreman and "half in character" was added
for that context. The exact quote stays in the record.
-->
