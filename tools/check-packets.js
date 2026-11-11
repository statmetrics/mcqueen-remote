// Loads index.html in headless Chromium and checks the packet encoder.
// Usage: node tools/check-packets.js   (needs: npm i playwright)
const path = require('path');
const { chromium } = require('playwright');

const hex = (a) => a.map((b) => b.toString(16).padStart(2, '0')).join(' ');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html'));

  const got = await page.evaluate(() => {
    const arr = (u) => Array.from(u);
    const steer = new DataView(new Uint8Array([0xbf, 0x72, 0x93, 0xde]).buffer).getFloat32(0, false);
    __mcq.resetSeq(0x8b);
    const drive = arr(__mcq.cmds.driveRc(steer, 0));
    __mcq.resetSeq(0x8d);
    const escaped = arr(__mcq.cmds.driveRc(0, 0));
    __mcq.resetSeq(0);
    const sound = arr(__mcq.cmds.sound(256));
    __mcq.resetSeq(0);
    const sleep = arr(__mcq.cmds.sleep());
    __mcq.resetSeq(0);
    const anim = arr(__mcq.cmds.animation(5));
    __mcq.resetSeq(0);
    const anim256 = arr(__mcq.cmds.animation(256));
    return { drive, escaped, sound, sleep, anim, anim256 };
  });

  const checks = [
    ['drive matches official app capture', hex(got.drive), '8d 08 16 02 8b bf 72 93 de 00 00 00 00 b2 d8'],
    ['sequence byte 0x8d is escaped', hex(got.escaped), '8d 08 16 02 ab 05 00 00 00 00 00 00 00 00 52 d8'],
    ['sound 256 is 16-bit big-endian', hex(got.sound), '8d 0a 1a 07 00 01 00 00 d3 d8'],
    ['sleep has no target', hex(got.sleep), '8d 02 13 01 00 e9 d8'],
    ['animation 5 is [0x00, id]', hex(got.anim), '8d 0a 17 05 00 00 05 d4 d8'],
    ['animation 256 is 16-bit big-endian (checksum d8 escaped)', hex(got.anim256), '8d 0a 17 05 00 01 00 ab 50 d8'],
  ];
  let failed = errors.length > 0;
  for (const [name, actual, expected] of checks) {
    const ok = actual === expected;
    if (!ok) failed = true;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `\n      got      ${actual}\n      expected ${expected}`}`);
  }
  if (errors.length) console.log('Page errors:', errors);
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
