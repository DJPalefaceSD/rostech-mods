# Key Fob

Three keywords you type as one word, for working at a glance.

## CLIP

Say "CLIP the address" or "CLIP that link". Claude puts the value straight onto your clipboard, checks what landed, and tells you it is there. You paste. You never drag-select text out of a terminal, where a quote marker or a box border can sneak in and break a key without looking wrong.

## POP

Say "POP it". The result opens in a new browser window: a web page, a local HTML file, an image or a PDF. A printed link you would have to copy is not a result.

## RESTATE

Type RESTATE when the last thing Claude said did not land. Claude checks whether the ask itself was wrong, then says it again shorter, as one action, in the words on your screen, and retires the old ask out loud.

## What it runs and sends

Key Fob is three skills, which are written instructions for Claude. It has no hooks, no scripts and no server, and it sends nothing anywhere.

When you use CLIP or POP, Claude runs one ordinary command on your own machine through its normal tools, with your usual permission prompts: `Set-Clipboard`, `pbcopy`, `wl-copy` or `xclip` for CLIP, and `Start-Process`, `open` or `xdg-open` for POP. RESTATE runs nothing.

## Install

```
/plugin install rostech-key-fob --marketplace DJPalefaceSD/rostech-mods
```

More from Rostech: https://rostech.app

License: MIT.
