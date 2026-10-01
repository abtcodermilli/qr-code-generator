import test from "node:test";
import assert from "node:assert/strict";
import {
  encode,
  EMPTY_FIELDS,
  DEFAULT_DESIGN,
  matrixFor,
  makeSVG,
  scanChecks,
} from "../src/qr.js";
const f = (values) => ({ ...EMPTY_FIELDS, ...values });
test("URL requires http(s), supports query strings and rejects malformed input", () => {
  for (const url of [
    "",
    "hello",
    "javascript:alert(1)",
    "ftp://example.com",
    "https://",
  ])
    assert.ok(encode("URL", f({ url })).error);
  assert.equal(
    encode("URL", f({ url: "https://example.com/?a=1&b=2" })).value,
    "https://example.com/?a=1&b=2",
  );
});
test("Text preserves Unicode and whitespace; byte limit handles multibyte input", () => {
  assert.equal(
    encode("Text", f({ text: "  नमस्ते 👋\nHello  " })).value,
    "  नमस्ते 👋\nHello  ",
  );
  assert.ok(encode("Text", f({ text: "🙂".repeat(301) })).error);
  assert.ok(encode("Text", f({ text: " " })).error);
});
test("Email parameters are encoded and recipient validated", () => {
  assert.equal(
    encode(
      "Email",
      f({ email: "a@example.com", subject: "A&B?", body: "hello\nworld" }),
    ).value,
    "mailto:a@example.com?subject=A%26B%3F&body=hello%0Aworld",
  );
  assert.ok(encode("Email", f({ email: "a@" })).error);
});
test("Telephone strips formatting and rejects invalid length", () => {
  assert.equal(
    encode("Phone", f({ phone: "+91 (98765) 43210" })).value,
    "tel:+919876543210",
  );
  for (const phone of ["12", "hello123", "++123456789", "1234567890123456"])
    assert.ok(encode("Phone", f({ phone })).error);
});
test("Wi-Fi escapes reserved characters, supports hidden and open networks", () => {
  assert.equal(
    encode("Wi-Fi", f({ ssid: "Lab;A:B", password: "a\\b;c", hidden: true }))
      .value,
    "WIFI:T:WPA;S:Lab\\;A\\:B;P:a\\\\b\\;c;H:true;;",
  );
  assert.equal(
    encode("Wi-Fi", f({ ssid: "Guest", security: "nopass", password: "old" }))
      .value,
    "WIFI:T:nopass;S:Guest;P:;H:false;;",
  );
  assert.ok(encode("Wi-Fi", f({ ssid: "Home" })).error);
  assert.ok(
    encode("Wi-Fi", f({ ssid: "x".repeat(33), security: "nopass" })).error,
  );
});
test("Contact escapes vCard content and validates optional fields", () => {
  const value = encode(
    "Contact",
    f({ name: "Ankur; Thapa", organization: "A,B" }),
  ).value;
  assert.match(value, /FN:Ankur\\; Thapa/);
  assert.match(value, /ORG:A\\,B/);
  assert.ok(encode("Contact", f({ name: "Ankur", contactEmail: "bad" })).error);
});
test("Scan checks flag contrast, quiet zone, resolution and unsafe logo settings", () => {
  assert.ok(scanChecks(DEFAULT_DESIGN, 29).every((c) => c.ok));
  assert.equal(
    scanChecks(
      {
        ...DEFAULT_DESIGN,
        fg: "#ffffff",
        margin: 0,
        size: 32,
        logo: "present",
        level: "L",
      },
      29,
    ).filter((c) => !c.ok).length,
    4,
  );
});
test("SVG is vector geometry with a module based margin; no raster QR wrapper", () => {
  const svg = makeSVG(matrixFor("hello", "H"), DEFAULT_DESIGN);
  assert.match(svg, /<rect/);
  assert.doesNotMatch(svg, /<image/);
  assert.match(svg, /width="1024"/);
});

test("History rejects corrupted structure and sanitizes SVG attributes", async () => {
  const { cleanHistory } = await import("../src/storage.js");
  assert.deepEqual(cleanHistory({ nope: true }), []);
  const [item] = cleanHistory([
    {
      type: "URL",
      fields: { url: "https://example.com" },
      title: "x",
      design: {
        fg: '"><script>alert(1)</script>',
        size: -1,
        logo: "javascript:bad",
      },
    },
  ]);
  assert.equal(item.design.fg, DEFAULT_DESIGN.fg);
  assert.equal(item.design.size, 1024);
  assert.equal(item.design.logo, "");
});
