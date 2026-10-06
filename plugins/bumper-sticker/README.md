# Bumper Sticker

Your own words on the busy line. While Claude works, Claude Code shows a little
word that pulses, such as `✶ Baking… (12s)`. Bumper Sticker swaps that word for
yours.

- Out of the box it uses the print-shop set: Penciling, Inking the rollers,
  Cranking the press, Trucking to the newsstand, Riding the coaster, and more.
- To use your own, open `/plugin`, find Bumper Sticker, and type your words
  into **Your words**, separated by commas: `Revving, Idling, Drifting`.
- One turn keeps one word. The next turn gets another. The pick follows the
  word Claude Code chose for that turn, so nothing is random.

It changes only the word. The timer, the token count and the colour stay as
Claude Code draws them. It works in the terminal and in the desktop app. Nothing
leaves your machine.

## What it runs and sends

Nothing goes anywhere. Here is each thing, plainly.

**What it sends, and where.**
- Nothing. It reads your words from the **Your words** setting and changes
  the word on your screen.
- It stores nothing on disk. The setting is kept by Claude Code.

**Which programs it runs, and why.**
- None. It runs no programs.

**What it puts in the prompts it submits.**
- It submits no prompts, and changes none of yours.

**What each hook does.**
- `ui.render` for `Spinner`: swaps the busy word for one of yours. It
  changes only the word.
