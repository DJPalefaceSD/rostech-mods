---
name: pop
description: The POP keyword. Open a result in a new browser window instead of printing it, so the user gets a page, not a link to click. Use when the user says POP, "pop it", "pop that page", "open it for me", or asks to see a URL, a local HTML file, an image or a PDF.
---

# POP: it opens in a window, never as a printed link

When the user says POP, the thing opens in front of them, in a new browser window.

Printing a link or a file path is not popping it. In many terminals a link cannot be clicked at all, and copying it out is a chore that should not exist.

## How, on each system

A web address or a local file, the same command:

Windows (PowerShell):

```
Start-Process 'https://example.com'
Start-Process 'C:\path\to\report.html'
```

macOS:

```
open 'https://example.com'
open '/path/to/report.html'
```

Linux:

```
xdg-open 'https://example.com'
```

Quote the path or address so spaces and symbols survive.

## Open the right thing

Pop the finished result, not the folder it sits in.

If there are several candidates, open the one the user meant. If that is unclear, open the newest and say which one it was.

If the thing is Markdown, render it to HTML first. A browser draws a `.md` file as plain text, which is a wall of symbols, not a document.

## Say what opened

One line: what opened and where it came from. "Your report is open in a new window."

If nothing could open, because you cannot run a command here or there is no browser, say so plainly and give the address once.

## One window for one thing

POP is for one item. If the user needs several pages, open them together in one window as tabs where the browser allows it, rather than leaving several windows to arrange by hand.
