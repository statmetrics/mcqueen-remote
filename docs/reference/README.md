# Reference copies

Copies of the outside sources this project's McQueen findings came from, kept here in case they disappear.

## pysphero (MIT)

From pysphero 0.0.12 on PyPI (https://pypi.org/project/pysphero/, source https://github.com/EnotYoyo/pysphero), by Andrey Lemets. The package declares the MIT License; `pysphero/LICENSE` reproduces it.

| File | Why it matters |
|---|---|
| `pysphero/animatronics.py` | `LMQAnimation`: McQueen's voice-line animation IDs (Ka-chow = `0x69`), and `AnimatronicsLMQCommand`: his eyes, suspension, mouth, idle and user-drive commands. Animations are played on target `0x12`. |
| `pysphero/power.py` | Power commands, including the McQueen battery-state values. |
| `pysphero/user_io.py` | Audio commands (play `0x07`, volume `0x08`, stop `0x0a`). |
| `pysphero/packet.py` | Packet format; notes that McQueen sends a notification when audio finishes. |

These files are for reading only. The page doesn't load them.

The findings themselves, including what was verified on the real car, are in `../../HANDOFF.md`.
