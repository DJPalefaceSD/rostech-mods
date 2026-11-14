# Key Fob — proof runs

Key Fob is skills only: no hooks, no mod code, so `claude plugin test` has nothing
to load. The proof is a live run of each skill in a fresh `claude -p` session with
`--plugin-dir plugins/key-fob`, 13 Nov 2026.

## RESTATE

Prompt: a made-up muddled line ("...needs its face_title populated per #D143 §E...")
followed by RESTATE.

Result: it checked whether the ask itself was wrong first, searched for `face_title`
and `D143`, found neither, said the sentence "pointed at nothing", and withdrew the ask
out loud. No apology, no longer re-telling, nothing handed back. That is the skill's
first move and its retire-out-loud rule.

## CLIP

Prompt: `CLIP the text: Key Fob proof — café 13 Nov` (an em-dash and an accent on purpose).

Result: the session said it read the clipboard back and it matched. Checked
independently afterwards with `Get-Clipboard` through a UTF-8 console:
`Key Fob proof — café 13 Nov`, byte for byte. The dash and the é survived.

## POP

Prompt: `POP the image C:/Development/rostech-mods/plugins/key-fob/icon.png`.

Result: the icon opened in its own window, and the reply said in one line what
opened and where (Windows' default app for PNG). No link printed instead.

PROOF 0.1.0: PASS
