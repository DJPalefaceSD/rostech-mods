---
name: clip
description: The CLIP keyword. Put one value straight onto the user's clipboard so they never copy it out of the terminal or chat. Use when the user says "CLIP the address", "put that on my clipboard", "CLIP that link", or names any value followed by CLIP.
---

# CLIP: it goes on the clipboard, they never copy it

The user names one value. You put it on their clipboard. They paste.

Nothing is selected, dragged or read off the screen.

## Why

Copying out of a terminal or a chat window picks up things that do not look wrong: a quote marker in front of the text, a box border, a line broken in the middle of a key.

A key or address copied that way can fail silently. So the user should not copy from the conversation at all.

## How, on each system

Pass the value without a trailing newline. A stray newline breaks keys, tokens and URLs without any error.

Windows (PowerShell):

```
Set-Clipboard -Value 'the value'
```

macOS:

```
printf '%s' 'the value' | pbcopy
```

Linux, whichever is installed:

```
printf '%s' 'the value' | wl-copy
printf '%s' 'the value' | xclip -selection clipboard
```

Quote the value with single quotes so the shell expands nothing inside it.

On Windows, prefer `Set-Clipboard` over piping to `clip.exe`. `clip.exe` can read the text in the wrong encoding, so dashes, curly quotes and accents arrive garbled.

## Check what landed

Read the clipboard back before saying it is there: `Get-Clipboard`, `pbpaste`, `wl-paste` or `xclip -o -selection clipboard`.

Compare it with the value. Do not assume.

## Say what landed, do not reprint it

Write "Your signature is on the clipboard", not the signature again in a code block.

The exception: a value the user must check before pasting, such as a legal name, an amount or an address. Show it and clip it, and say which is which.

## One value at a time

The clipboard holds one thing. If the user needs several, put the first one on, name it, and wait for "next".

Never overwrite a value they have not pasted yet.

## What never goes on the clipboard

Nothing private the user did not ask for. A clipboard is one paste away from anywhere.

If you cannot run a command in this environment, say so in one line and show the value in a plain code block instead.
