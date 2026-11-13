# McQueen Remote: project handoff

This is everything needed to pick up the McQueen Remote project in a new Claude session or account.

## What this is

The Sphero Ultimate Lightning McQueen (2017) is a robotic toy car. Sphero discontinued it, and its iPhone app now stops at a screen saying "Please enable internet access… Critical updates required" because Sphero's update servers are gone.

This project replaces the app with a single web page that drives the car directly over Bluetooth. It doesn't need Sphero's servers.

- **Live page:** https://statmetrics.github.io/mcqueen-remote/
- **Browser:** open it in **Bluefy** on iPhone. It's free on the App Store and supports Web Bluetooth; Safari and Chrome on iPhone don't. Chrome or Edge on a Mac or PC with Bluetooth should also work, but that hasn't been tested.
- **Code:** everything is in `index.html`, with no build step. GitHub Pages serves it from the `main` branch, at the repository root.
- **The car:** Bluetooth name `LM-C644`. Any McQueen's name starts with `LM-`.

## Status (version 12, 2026-11-10)

| Feature | Status |
|---|---|
| Connect from Bluefy (GitHub Pages copy) | Works |
| Drive and steer (touch pads, portrait and landscape) | Works on the real car |
| Headlights | Work on their own: the car turns them on when driving forward |
| Taillights, eye screen | Work on their own |
| Sounds | Partly working. Known sound IDs: 256, 2560, 4096, 4352, 4864, 6144, 7168 |
| Automatic sound finder | Doesn't work on this car: it answers OK to every ID |
| Wake on connect | Works (wake is sent on every connect) |
| Driving while charging | He won't drive while on the charger (by design); unplug him to drive |
| Battery readout | Works (version 20): shown next to the connection status, refreshed every minute |
| Phone locking | If the screen locks, Bluefy pauses the page, the drive updates stop, and he switches off in about a minute. Version 18 asks for a screen wake lock while connected (logged; untested whether Bluefy supports it) |
| Sleep | Any disconnect (Sleep button, phone lock, page reload) makes him sleep about 1 minute later, and then he does not show up in Bluetooth. Unplugging and replugging the charger wakes him; while asleep on the charger his headlights pulse. The one time he showed up after Sleep, he had probably been on the charger. Version 22 labels the button "Sleep (charger wakes)". While connected he never dozes off, even when the sleep command answers OK |
| Mouth movement / animations | Animation 0 slowed his idle movement and 1 stopped it (eyes froze). Nothing else visible yet in 0–67. Version 15 adds Idle moves On/Off (`0x17 0x2c [0/1]`), Stop (`0x17 0x2b`), and logs messages the car sends by itself, including "animation finished" (`0x17 0x11`) |
| Lights control (headlights on/off while parked) | Not started; the owner said "not yet" |

### Where we stopped

On the last test, version 10's Sleep put the car to sleep, but it then didn't show up in the Bluetooth device list. Shaking it didn't wake it. The owner plugged it in to charge overnight. Charging woke it once before, on the first night.

## Next steps, in order

**Version 11–12 changes:** Sleep now sends only the no-target sleep and stays connected (steps 2 below is done in code, waiting on a real-car test). The Animations section (step 3) is built; next is scanning IDs on the car and saving the ones that move the mouth or play voice lines.

1. ~~**Confirm the car wakes on the charger.**~~ Done (2026-11-11): plugging him in woke him from version 10's deep sleep.
2. **Make Sleep gentler.** Version 10 sends sleep (power device `0x13`, command `0x01`) three times: with no target, to target `0x11`, and to target `0x12`. Then it disconnects after 3 seconds. In version 9, the no-target form alone returned OK. On one occasion the car said its "power nap" line and slept, but it stayed awake when the page kept the connection open. Suggested fix: send only the no-target sleep, pause the drive stream (already done), and either stay connected or disconnect. Test whether the car stays visible to Bluetooth afterwards. If it still disappears, label the button clearly, for example "Sleep (wake with charger or a shake)".
3. **Mouth and animations.** The car has a motorized mouth. A reference video of the original app shows it moving while the car talks. Add an "Animations" test section that sends the animatronics command (device `0x17`, command `0x05`, payload `[0x00, id]`, as R2-D2 and BB-9E use) and steps through IDs, the way the sound Scan does. Find the IDs that move the mouth or play voice lines, and save them.
4. **Lights test (optional).** Try the user I/O "all LEDs" command (device `0x1a`, command `0x0e`, payload `[mask_hi, mask_lo, values…]`) one bit at a time, to see if headlights or taillights can be set directly.
5. **Tilt to steer (optional).**
6. **Clean-up (optional).** Remove or hide the automatic sound finder, since it can't tell real sounds from silent ones on this car.

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
| Idle animations | `0x17` | `0x2c` | `[0 or 1]` | from spherov2 (Python). No target: car replies "unknown command" (first rejection seen). Also "unknown command" on target 0x12. 0x11 not yet tried |
| Animation | `0x17` | `0x05` | `[0x00, id]` | from other Sphero toys; version 12 has a test section for it |

**Mistakes already fixed**
- Version 1–2 ran inside a claude.ai artifact. Claude's frame blocks the Web Bluetooth device-picker result, so the page never connected. **Always use the GitHub Pages copy.**
- Version 1 used pointer events. Bluefy needs touch events (fixed in version 2).
- Version 1–2 put the sound number in the high byte, so "sound 1" was really 256 (fixed in version 3).
- The spherov2.js library's speed encoding (`n * 3968`) is only right at 0 and ±1. The page uses real float32 instead.

## Page features (version 10)
- Steer pad (horizontal) and Gas pad (vertical; up is forward). Letting go stops the car. A big Stop button. Keyboard on a computer: arrow keys or WASD, space to stop.
- Landscape layout: steer under the left thumb, gas under the right, Stop in the middle.
- Settings, saved on the phone: Top speed (default 40%), Steering sensitivity (default 160%), Steering amount (up to 150%; values over 100% are experimental), Flip steering, Flip gas, Show all Bluetooth devices.
- Buttons: Connect car, Disconnect, Wake, Sleep.
- Experiments: Sound # with Play, Prev, Next, Save, Hush and Scan (0.8, 1.5 or 3 s); Volume; saved sounds; the automatic finder (doesn't work on this car).
- Connection log, and a version label next to the title.

## How to work on it
1. Edit `index.html`, and bump `const VERSION` and the `vN` label so the owner can tell the new version loaded.
2. Run `node tools/check-packets.js` to confirm the packet encoding still matches the capture from the official app. It needs Playwright (`npm i playwright`, plus a Chromium).
3. Commit and push to `main`. GitHub Pages updates in about 1–3 minutes.
4. The owner opens `https://statmetrics.github.io/mcqueen-remote/?v=N` in Bluefy. The `?v=N` gets around Bluefy's cache.
5. When something fails, ask for a screenshot of the **Connection log**. It shows each command and the car's reply.

## Sources
- spherov2.js (TypeScript), which has a Lightning McQueen class: https://github.com/igbopie/spherov2.js. This is where the Bluetooth details, the unlock string and the drive command came from.
- spherov2 (Python), for the sound command layout (16-bit ID plus mode) and the power commands: https://pypi.org/project/spherov2/. It has no McQueen support.

## Starting prompt for a new Claude session

> Continue my McQueen Remote project. Repo: statmetrics/mcqueen-remote (public, GitHub Pages at https://statmetrics.github.io/mcqueen-remote/). Read HANDOFF.md first. It's a single-page Web Bluetooth remote for a Sphero Ultimate Lightning McQueen, used from the Bluefy browser on iPhone. Next up: make the Sleep button gentler so the car stays findable, then add an Animations test section to find the commands that move his mouth.
