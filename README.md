# McQueen Remote

A Bluetooth web remote for the Sphero Ultimate Lightning McQueen. It replaces the discontinued official app, which no longer gets past its update screen.

**Use it:** open https://statmetrics.github.io/mcqueen-remote/ in the **Bluefy** browser on iPhone, turn the car on, tap **Connect car**, and pick the device whose name starts with `LM-`.

- Everything lives in `index.html`. There's no build step, and GitHub Pages serves it from `main`.
- `HANDOFF.md` covers the current status, the Bluetooth protocol, and next steps.
- `tools/check-packets.js` checks the packet encoding against a capture from the official app.

This is an unofficial hobby project, not affiliated with Sphero or Disney.
