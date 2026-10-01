import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { readFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
import { PNG } from "pngjs";
import jsQR from "jsqr";
import {
  EMPTY_FIELDS,
  DEFAULT_DESIGN,
  PRESETS,
  PATTERNS,
  CAMPUS_EXAMPLES,
  CAMPUS_URL,
  encode,
} from "../src/qr.js";
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "--host",
    "127.0.0.1",
    "--port",
    "5181",
    "--strictPort",
  ],
  { stdio: "ignore" },
);
let browser;
let passed = 0;
const pass = (name) => {
  passed++;
  console.log(`PASS ${name}`);
};
try {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch("http://127.0.0.1:5181");
      if (r.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1120 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5181");
  await page.getByTestId("qr-preview").waitFor();
  await mkdir("screenshots", { recursive: true });
  await page.screenshot({
    path: "screenshots/studio-desktop.png",
    fullPage: true,
  });
  const download = async (button, name) => {
    const promise = page.waitForEvent("download");
    await page.getByRole("button", { name, exact: true }).click();
    const dl = await promise;
    return readFile(await dl.path());
  };
  const png = await download(null, "Download PNG");
  const raster = PNG.sync.read(png);
  assert.equal(raster.width, 1024);
  assert.equal(raster.height, 1024);
  assert.equal(
    jsQR(new Uint8ClampedArray(raster.data), raster.width, raster.height)?.data,
    CAMPUS_URL,
  );
  pass("Actual downloaded PNG dimensions and decoded URL");
  const svg = (await download(null, "SVG")).toString();
  assert.ok(svg.includes("<rect"));
  assert.ok(!svg.includes("<image"));
  pass("Actual SVG download contains vector geometry");
  // Rasterize the exact same SVG function used by the UI and exports, in a browser.
  const decodeExport = async (type, fields, design = DEFAULT_DESIGN) => {
    const expected = encode(type, { ...EMPTY_FIELDS, ...fields });
    assert.equal(expected.error, "");
    const data = await page.evaluate(
      async ({ value, d }) => {
        const { matrixFor, makeSVG, toPNG } = await import("/src/qr.js");
        const b = await toPNG(makeSVG(matrixFor(value, d.level), d), d.size);
        return Array.from(new Uint8Array(await b.arrayBuffer()));
      },
      { value: expected.value, d: design },
    );
    const png = PNG.sync.read(Buffer.from(data));
    assert.equal(
      jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data,
      expected.value,
      `${type}: decoded export must match encoded content`,
    );
  };
  for (const [type, f] of [
    ["URL", { url: "https://example.com/?a=1&b=2" }],
    ["Text", { text: "Hello नमस्ते 👋\nA second line" }],
    [
      "Email",
      { email: "hello@example.com", subject: "A&B", body: "Hello world" },
    ],
    ["Phone", { phone: "+91 98765 43210" }],
    ["Wi-Fi", { ssid: "Lab;A:B", password: "p\\a;ss:word", hidden: true }],
    ["Wi-Fi", { ssid: "Guest", security: "nopass" }],
    [
      "Contact",
      {
        name: "Ankur Bikram Thapa",
        contactEmail: "ankur@example.com",
        organization: "Student",
      },
    ],
  ]) {
    await decodeExport(type, f);
    pass(`${type} exported payload decodes`);
  }
  for (const p of PRESETS) {
    await decodeExport(
      "URL",
      { url: "https://example.com/" },
      { ...DEFAULT_DESIGN, ...p },
    );
    pass(`${p.name} preset exported QR decodes`);
  }
  for (const pattern of PATTERNS) {
    for (const [type, fields] of [
      ["URL", { url: CAMPUS_URL }],
      [
        "Text",
        { text: "GDG on Campus — नमस्ते 👋. Build together. ".repeat(4) },
      ],
      [
        "Wi-Fi",
        { ssid: "GDG-Campus;Guest", password: "demo:pass;2026", hidden: true },
      ],
    ]) {
      await decodeExport(type, fields, {
        ...DEFAULT_DESIGN,
        pattern: pattern.id,
      });
    }
    pass(`${pattern.name} pattern decodes URL, Unicode text and Wi-Fi exports`);
  }
  for (const type of Object.keys(CAMPUS_EXAMPLES)) {
    await page
      .getByRole("button", {
        name: type === "URL" ? "Website" : type,
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Use campus example", exact: true })
      .click();
    assert.equal(
      await page
        .getByRole("button", { name: "Download PNG", exact: true })
        .isDisabled(),
      false,
    );
  }
  pass("All six campus examples produce valid previews");
  await page.getByRole("tab", { name: "Style", exact: true }).click();
  await page
    .getByRole("button", { name: "Column pattern", exact: true })
    .click();
  await page.getByRole("button", { name: "Wi-Fi", exact: true }).click();
  await page
    .getByLabel("Network name (SSID)", { exact: true })
    .fill("Campus;Lab");
  await page
    .getByLabel("Network password", { exact: true })
    .fill("correct;horse");
  await page.getByLabel("Hidden network", { exact: true }).check();
  await page.getByRole("tab", { name: "Colors", exact: true }).click();
  await page.getByLabel("Foreground", { exact: true }).fill("#283774");
  await page
    .getByRole("button", { name: "Save to collection", exact: true })
    .click();
  await page.reload();
  await page.getByRole("button", { name: /My collection/ }).click();
  await page
    .getByRole("button", { name: "Open in studio", exact: true })
    .click();
  assert.equal(
    await page.getByLabel("Network name (SSID)", { exact: true }).inputValue(),
    "Campus;Lab",
  );
  assert.equal(
    await page.getByLabel("Network password", { exact: true }).inputValue(),
    "correct;horse",
  );
  assert.equal(
    await page.getByLabel("Hidden network", { exact: true }).isChecked(),
    true,
  );
  await page.getByRole("tab", { name: "Colors", exact: true }).click();
  assert.equal(
    await page.getByLabel("Foreground", { exact: true }).inputValue(),
    "#283774",
  );
  await page.getByRole("tab", { name: "Style", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Column pattern", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.getByRole("tab", { name: "Colors", exact: true }).click();
  pass("Wi-Fi fields and custom design restored after refresh");
  await page.getByRole("button", { name: "Website", exact: true }).click();
  await page
    .getByLabel("Website URL", { exact: true })
    .fill("javascript:alert(1)");
  assert.equal(
    await page
      .getByRole("button", { name: "Download PNG", exact: true })
      .isDisabled(),
    true,
  );
  assert.equal(await page.getByTestId("qr-preview").count(), 0);
  pass("Invalid input clears preview and disables export");
  await page
    .getByLabel("Website URL", { exact: true })
    .fill("https://example.com");
  await page.getByLabel("Foreground", { exact: true }).fill("#ffffff");
  assert.ok(
    await page
      .locator(".scan-check")
      .innerText()
      .then((t) => t.includes("review")),
  );
  pass("Low contrast produces a scan warning");
  await page.getByRole("button", { name: "Reset design", exact: true }).click();
  await page.getByRole("tab", { name: "Logo", exact: true }).click();
  const logo = PNG.sync.write({
    width: 32,
    height: 32,
    data: Buffer.alloc(32 * 32 * 4, 90),
  });
  await page
    .locator("input[type=file]")
    .setInputFiles({ name: "logo.png", mimeType: "image/png", buffer: logo });
  await page.getByAltText("Uploaded logo", { exact: true }).waitFor();
  const branded = PNG.sync.read(await download(null, "Download PNG"));
  assert.equal(
    jsQR(new Uint8ClampedArray(branded.data), branded.width, branded.height)
      ?.data,
    "https://example.com/",
  );
  pass("Uploaded logo export decodes");
  await page.getByRole("button", { name: "In context", exact: true }).click();
  await page.screenshot({
    path: "screenshots/logo-context.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Reset design", exact: true }).click();
  await page.getByRole("button", { name: "QR code", exact: true }).click();
  await page.getByRole("tab", { name: "Style", exact: true }).click();
  await page.getByLabel("Website URL", { exact: true }).fill(CAMPUS_URL);
  await page
    .getByRole("button", { name: "Design library", exact: true })
    .click();
  await page.screenshot({
    path: "screenshots/design-library.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: /Tidal/ }).click();
  assert.equal(
    await page.getByTestId("qr-preview").locator("linearGradient").count(),
    1,
  );
  pass("Design library applies a real gradient");
  await page.getByRole("button", { name: "Reset design", exact: true }).click();
  await page
    .getByRole("button", { name: "Switch to light theme", exact: true })
    .click();
  await page.screenshot({
    path: "screenshots/studio-light.png",
    fullPage: true,
  });
  await page.reload();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
  pass("Theme persists after refresh");
  await page
    .getByRole("button", { name: "Switch to dark theme", exact: true })
    .click();
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `No overflow at ${width}px`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "screenshots/studio-mobile.png",
    fullPage: true,
  });
  pass("Responsive widths 320, 390, 768, 1024, 1440");
  await page
    .getByRole("button", { name: "About the project", exact: true })
    .click();
  assert.equal(await page.locator("dialog").evaluate((d) => d.open), true);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog").count(), 0);
  pass("Help dialog opens and closes with Escape");
  await page.evaluate(() =>
    localStorage.setItem("qrgenie_studio_v1", "{broken"),
  );
  await page.reload();
  await page.getByRole("button", { name: /My collection/ }).click();
  assert.ok(
    await page.getByText("Your next great idea belongs here.").isVisible(),
  );
  pass("Corrupted storage recovers without crashing");
  assert.deepEqual(errors, []);
  pass("No uncaught browser errors");
  console.log(`\n${passed} browser checks passed.`);
} finally {
  await browser?.close();
  server.kill();
}
