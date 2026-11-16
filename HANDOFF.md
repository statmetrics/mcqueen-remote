# McQueen Remote: project handoff

This is everything needed to pick up the McQueen Remote project in a new Claude session or account.

## What this is

The Sphero Ultimate Lightning McQueen (2017) is a robotic toy car. Sphero discontinued it, and its iPhone app now stops at a screen saying "Please enable internet access… Critical updates required" because Sphero's update servers are gone.

This project replaces the app with a single web page that drives the car directly over Bluetooth. It doesn't need Sphero's servers.

- **Live page:** https://statmetrics.github.io/mcqueen-remote/
- **Browser:** open it in **Bluefy** on iPhone. It's free on the App Store and supports Web Bluetooth; Safari and Chrome on iPhone don't. Chrome or Edge on a Mac or PC with Bluetooth should also work, but that hasn't been tested.
- **Code:** everything is in `index.html`, with no build step. GitHub Pages serves it from the `main` branch, at the repository root.
- **The car:** Bluetooth name `LM-C644`. Any McQueen's name starts with `LM-`.

## Status (version 32, 2026-11-16)

| Feature | Status |
|---|---|
| Connect from Bluefy (GitHub Pages copy) | Works |
| Drive and steer (touch pads, portrait and landscape) | Works on the real car |
| Headlights | Work on their own: the car turns them on when driving forward |
| Taillights, eye screen | Work on their own |
| Sounds | Plain sounds (`0x1a 0x07`) play voice only, without moves, and some (like 4096) stopped playing. Use the Voice lines panel instead. Old sound IDs: 256, 2560, 4096, 4352, 4864, 6144, 7168 |
| Automatic sound finder | Doesn't work on this car: it answers OK to every ID |
| Wake on connect | Works (wake to target `0x11` is sent on every connect) |
| Wake button | Wake with no target answers OK but doesn't wake him from his own sleep (eyes closed, seen 2026-11-16 on the charger while connected). Version 34 sends wake to `0x11` and then no target |
| Driving while charging | He won't drive while on the charger (by design); unplug him to drive |
| Battery readout | Works (version 20): shown next to the connection status, refreshed every minute |
| Phone locking | If the screen locks, Bluefy pauses the page, the drive updates stop, and he switches off in about a minute. Version 18 asks for a screen wake lock while connected (logged; untested whether Bluefy supports it) |
| Sleep | Any disconnect (Sleep button, phone lock, page reload) makes him sleep about 1 minute later, and then he does not show up in Bluetooth. Unplugging and replugging the charger wakes him; while asleep on the charger his headlights pulse. The one time he showed up after Sleep, he had probably been on the charger. Version 22 labels the button "Sleep (charger wakes)". While connected he never dozes off, even when the sleep command answers OK  **Not consistent:** on 2026-11-13 (after the deep-sleep reset, and again on the charger at night) he stayed awake after Disconnect. Leaving him awake on the charger is harmless. Next: look for a proper sleep or power-nap animation in McQueen's command set |
| Animation IDs | The car sends `0x17 0x11` "animation finished" with data `[hi, lo]` for its own idle moves: seen 187 (`00 bb`) and 188 (`00 bc`). So real IDs are in the low hundreds. Version 23 logs the ID and auto-saves every reported one |
| Copy list | Version 25: a Copy list button (in Experiments and Animations) copies every saved sound and animation as "N = " lines for the owner to name and paste back. Next: build the named ones into the page as a soundboard |
| Voice lines and mouth | Sounds are his voice lines. 4096 = "Ka-chow!" with mouth, right tire lift and body tilt (worked on the charger; later silent off the charger though it answered OK). 256 = voice only, no movement. Theory: the 80 ms "speed 0" drive stream blocks the move and he skips the line, so version 27 pauses the stream for 5 s after each sound or animation. That didn't help (4096 still silent off the charger, 256 fine), so version 28 sends drive packets only while a pad is held, plus 5 stops after release. That didn't help either. Since the v25 session (after a sleep and charger wake around 8:10 pm, 2026-11-12) he also stopped his usual engine rumble on connect, on or off the charger, while voice-only 256 still plays. His state changed, cause unknown. Version 29 added a Full restart button (version 10's deep sleep). On 2026-11-12 it put him into deep sleep and he did not wake on the charger right away (no headlight pulsing); left on the charger. He later woke when version 30 connected, and **the engine rumble on connect was back**, so the deep sleep did reset his state. Version 30 removed the button. **Never send sleep to targets 0x11/0x12.** After the reset, 4096 was still silent on and off the charger (256 fine). Ka-chow only ever worked while the page streamed drive updates continuously (versions 23–24), so version 31 makes that the default again; the version 27–28 quiet behaviour is a Settings checkbox, "Quiet when parked". Version 24 adds Step 256 to the sound Scan to find more |
| Voice lines soundboard | Version 32: a "Voice lines" panel with 47 named buttons from pysphero's McQueen animation list (Ka-chow = `0x69`, engine rev/start/idle = `0x130`/`0x131`/`0x132`), sent as animatronics play on **target 0x12**. **Works on the car** (2026-11-13). Other lines not individually checked yet |
| Mouth movement / animations | Solved by the Voice lines panel (animations on target `0x12`). History: with no target, animation 0 slowed his idle moves and 1 froze him; 2304–2816 on `0x12` (not real IDs) probably caused a quiet mode that only a deep sleep cleared |
| Lights control (headlights on/off while parked) | Not started; the owner said "not yet" |

### Where we stopped (2026-11-13)

- **Voice lines work.** Version 32's "Voice lines" panel plays McQueen's real lines with mouth and body moves, using pysphero's animation IDs on target `0x12`. Ka-chow was confirmed on the car. The other 46 buttons haven't been checked one by one.
- **Sleep isn't reliable.** After Disconnect he sometimes sleeps within a minute (and then only the charger wakes him) and sometimes stays awake. Leaving him awake on the charger is harmless.
- The owner wants a line "along the lines of lightning bolt and getting a jolt", which isn't in pysphero's list. He also said "Did you know race cars don't have trunks? True story" by himself on the charger.

## Next steps, in order

1. **Check the voice lines.** Tap each button in the Voice lines panel. Remove any that do nothing, and rename the `*` ones (translated from the French app) to his real English words.
2. **Find more lines, including the lightning-bolt one.** Easiest: leave him connected with the log open. Every line he says by himself is reported (`0x17 0x11` with its ID) and auto-saved. Otherwise scan Animations on target `0x12`, Step 1, from 2 to about 320, every 5 s (skip 0 and 1, which freeze him). Use Copy list to send the numbers back, then add them to `VOICE_LINES`.
3. **A reliable sleep.** Research (2026-11-16): pysphero names power `0x00` deep sleep ("shutdown") and `0x01` soft sleep ("normal condition of toy"), plus `0x12`/`0x13` set/get power options. spherov2 lists the option bits `0x01` sleep while charging and `0x02` double-tap to wake; neither library shows the set format. Red Thunder Remote (unofficial McQueen app, 261 animations) doesn't mention sleep. Reviews say the original app had him announce sleep. Version 33 reads power options on connect (read only) and names his sleep messages (`0x13 0x19` about to sleep, `0x1a` going to sleep). Result: `00 00 00 00` (both off), which explains why only the charger wakes him. Version 35 adds Double-tap to wake On/Off in Experiments: it reads the options, flips only bit `0x02`, writes them with power `0x12` (same 4-byte layout), and reads them back. Off restores `00 00 00 00`. Verified 2026-11-16: set returned OK and the options read back `00 00 00 02`. Version 36 adds "Sleep test (target 0x11)": soft sleep to 0x11 only, then disconnect, because no-target power commands answer OK but do nothing (wake only works on 0x11). Don't send sleep to targets `0x11`/`0x12`.
4. **Tidy the page (optional).** Now that voice lines work, the old sound experiments (sound Scan, automatic finder, 256-step sounds, Idle moves `0x2c` buttons, Full restart notes) could be hidden or removed.
5. **Lights (optional).** Try the user I/O "all LEDs" command (device `0x1a`, command `0x0e`) one bit at a time. Search for existing McQueen work on it first.
6. **Tilt to steer (optional).**

## Protocol reference

All of this was verified on the real car unless marked otherwise.

**Bluetooth (GATT)**
- API service `00010001-574f-4f20-5370-6865726f2121`, characteristic `00010002-…` (write commands, get notifications)
- DFU service `00020001-574f-4f20-5370-6865726f2121`
  - `00020005-…` "anti-DoS": write the ASCII text `usetheforce...band` first to unlock the car
  - `00020002-…` DFU control: subscribe, and reply `0x30` to each notification
- Connection order: connect → unlock → subscribe DFU control → subscribe API → wait for the first notification (1.5 s timeout) → send wake.
- The car's replies arrive **one byte per notification**, so the page reassembles them.

**Packet format (Sphero API v2)**
`8D | flags | [target] | device | command | seq | payload… | checksum | D8`
- checksum = `~(sum of every byte between 8D and the checksum) & 0xFF`
- Escaping, applied after the checksum is computed: `AB→AB 23`, `8D→AB 05`, `D8→AB 50`
- Flags: `0x01` response, `0x02` requests a response, `0x08` resets the inactivity timer, `0x10` has a target
- Replies have flag `0x01` set and an error byte after `seq` (`0x00` = OK)

**Commands**

| What | Device | Command | Payload | Notes |
|---|---|---|---|---|
| Drive (RC) | `0x16` | `0x02` | float32 big-endian steer (−1…1), then float32 speed (−1…1) | flags `0x08` only. Matches byte for byte a packet captured from the official app: `8d 08 16 02 8b bf 72 93 de 00 00 00 00 b2 d8`. Sent every 80 ms while connected |
| Wake | `0x13` | `0x0d` | none | sent with target `0x11` on connect |
| Battery % | `0x13` | `0x10` | none | reply: 1 byte percent. Verified (version 20): no target gives percent, voltage (`0x03`, 16-bit hundredths of a volt) and state (`0x04`: 0 charged, 1 charging, 2 not charging, 3 OK, 4 low, 5 critical). First reading on the charger: 26%, 11.36 V, charging |
| Sleep | `0x13` | `0x01` | none | no target returns OK; see Next steps |
| Play sound | `0x1a` | `0x07` | sound ID, 16-bit big-endian, then a mode byte (`0` = play now) | the car answers OK to any ID |
| Stop sound | `0x1a` | `0x0a` | none | |
| Volume | `0x1a` | `0x08` | 0–255 | untested |
| Stop animation | `0x17` | `0x2b` | none | from spherov2 (Python) |
| Idle animations | `0x17` | `0x2c` | `[0 or 1]` | from spherov2 (Python). No target: car replies "unknown command" (first rejection seen). Also "unknown command" on targets 0x11 and 0x12: McQueen doesn't have it |
| Animation | `0x17` | `0x05` | 16-bit ID, big-endian | **target `0x12`** for McQueen (pysphero). Voice lines with moves, e.g. Ka-chow `0x69`. Verified |

**Mistakes already fixed**
- Version 1–2 ran inside a claude.ai artifact. Claude's frame blocks the Web Bluetooth device-picker result, so the page never connected. **Always use the GitHub Pages copy.**
- Version 1 used pointer events. Bluefy needs touch events (fixed in version 2).
- Version 1–2 put the sound number in the high byte, so "sound 1" was really 256 (fixed in version 3).
- The spherov2.js library's speed encoding (`n * 3968`) is only right at 0 and ±1. The page uses real float32 instead.

## Page features (version 32)
- Steer pad (horizontal) and Gas pad (vertical; up is forward). Letting go stops the car. A big Stop button. Keyboard on a computer: arrow keys or WASD, space to stop.
- Landscape layout: steer under the left thumb, gas under the right, Stop in the middle.
- Status line with battery level (percent, volts, charging state), refreshed every minute.
- Buttons: Connect car, Disconnect, Wake, Sleep (charger wakes). The screen is kept on while connected.
- **Voice lines:** 47 named buttons and a Stop.
- Settings, saved on the phone: Top speed, Steering sensitivity, Steering amount, Flip steering, Flip gas, Quiet when parked (test), Show all Bluetooth devices.
- Experiments: sound Play, Prev, Next, Save, Hush, Scan (Step 1 or 256); Volume; Sleep now (command); Battery; saved sounds; Copy list; the automatic finder (doesn't work on this car).
- Animations: Play, Prev, Next, Save, Stop, Idle moves On/Off (unknown command on McQueen), Send to (default `0x12`), Step, Scan; IDs the car reports are auto-saved; Copy list.
- Connection log, including messages the car sends by itself, and a version label next to the title.

## How to work on it
0. **Before guessing or scanning for a new feature, search for existing McQueen work first** (pysphero, Red Thunder Remote, forums). Scanning blind caused a freeze (animation 1), a quiet mode, and a deep sleep, while pysphero already had the Ka-chow ID.
1. Edit `index.html`, and bump `const VERSION` and the `vN` label so the owner can tell the new version loaded.
2. Run `node tools/check-packets.js` to confirm the packet encoding still matches the capture from the official app. It needs Playwright (`npm i playwright`, plus a Chromium).
3. Commit and push to `main`. GitHub Pages updates in about 1–3 minutes.
4. The owner opens `https://statmetrics.github.io/mcqueen-remote/?v=N` in Bluefy. The `?v=N` gets around Bluefy's cache.
5. When something fails, ask for a screenshot of the **Connection log**. It shows each command and the car's reply.

## McQueen animatronics (from pysphero, MIT)

pysphero (https://github.com/EnotYoyo/pysphero, `device_api/animatronics.py`; a copy is in `docs/reference/pysphero/`) has McQueen-specific findings:
- Play animation: device `0x17`, command `0x05`, 16-bit big-endian ID, **target `0x12`**. The car answers `0x17 0x11` with the same ID when done.
- `LMQAnimation` IDs (voice line plus mouth and body moves), e.g. Ka-chow `0x69`, I am speed `0x5e`, Engine rev `0x130`, Engine start `0x131`, Engine idle loop `0x132`. The full list is in `index.html` (`VOICE_LINES`). Names ending in `*` were captured from the French app.
- McQueen animatronics commands: `0x01` animate eyes, `0x03` animate suspension, `0x04` animate mouth, `0x05` execute animation, `0x07` capacitive touch indication, `0x0a` enable idle animation, `0x0b` enable user drive, `0x12` animate steering, `0x2b` stop animation. Payloads for 0x01/0x03/0x04/0x0a/0x0b are unknown. Note that idle animation on McQueen is `0x0a`, not `0x2c`.
- Power: battery state `0x04`, battery state changed notification `0x06`.

## Sources
- spherov2.js (TypeScript), which has a Lightning McQueen class: https://github.com/igbopie/spherov2.js. This is where the Bluetooth details, the unlock string and the drive command came from.
- spherov2 (Python), for the sound command layout (16-bit ID plus mode) and the power commands: https://pypi.org/project/spherov2/. It has no McQueen support.
- pysphero (Python, MIT), for McQueen's animation IDs and animatronics commands: https://github.com/EnotYoyo/pysphero. Copy in `docs/reference/pysphero/`.



> Continue my McQueen Remote project. Repo: statmetrics/mcqueen-remote (public, GitHub Pages at https://statmetrics.github.io/mcqueen-remote/). Read HANDOFF.md first. It's a single-page Web Bluetooth remote for a Sphero Ultimate Lightning McQueen, used from the Bluefy browser on iPhone. Next up: make the Sleep button gentler so the car stays findable, then add an Animations test section to find the commands that move his mouth.

## Starting prompt for a new Claude session

> Continue my McQueen Remote project. Repo: statmetrics/mcqueen-remote (public, GitHub Pages at https://statmetrics.github.io/mcqueen-remote/). Read HANDOFF.md first. It's a single-page Web Bluetooth remote for a Sphero Ultimate Lightning McQueen, used from the Bluefy browser on iPhone. Next up: check the Voice lines buttons, find more of his lines (including one about a lightning bolt and a jolt), and find a reliable way to put him to sleep.
