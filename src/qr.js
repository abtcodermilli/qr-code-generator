import qrcode from "qrcode-generator";
qrcode.stringToBytes = (text) => Array.from(new TextEncoder().encode(text));

export const CAMPUS_URL = "https://gdg.community.dev/";
export const PATTERNS = [
  { id: "square", name: "Classic", note: "Crisp & familiar" },
  { id: "rounded", name: "Soft", note: "Gently rounded" },
  { id: "dots", name: "Orbit", note: "Perfect little circles" },
  { id: "squircle", name: "Pillow", note: "Extra soft edges" },
  { id: "horizontal", name: "Ribbon", note: "Connected rows" },
  { id: "vertical", name: "Column", note: "Connected columns" },
  { id: "facet", name: "Facet", note: "Cut-corner geometry" },
  { id: "leaf", name: "Petal", note: "A botanical touch" },
];
export const CAMPUS_EXAMPLES = {
  URL: { url: CAMPUS_URL },
  Text: {
    text: "Hello, GDG on Campus! Learn together. Build something useful. Share what you discover.",
  },
  Email: {
    email: "gdg-campus@example.com",
    subject: "GDG on Campus — Let's build together",
    body: "Hi team, I'd love to know more about the next campus workshop.",
  },
  Phone: { phone: "+1 202 555 0142" },
  "Wi-Fi": {
    ssid: "GDG-Campus-Guest",
    password: "campus-demo-2026",
    security: "WPA",
    hidden: false,
  },
  Contact: {
    name: "Ankur Bikram Thapa",
    organization: "GDG on Campus — student project",
    contactEmail: "ankur@example.com",
    contactPhone: "",
  },
};
export const TYPES = ["URL", "Text", "Email", "Phone", "Wi-Fi", "Contact"];
export const DEFAULT_DESIGN = {
  fg: "#153f35",
  bg: "#ffffff",
  accent: "#285aac",
  gradient: false,
  pattern: "rounded",
  eyes: "rounded",
  size: 1024,
  margin: 4,
  level: "H",
  logo: "",
};
export const PRESETS = [
  {
    name: "Campus",
    note: "For your next campus connection",
    fg: "#153f35",
    bg: "#f4faef",
    pattern: "rounded",
    eyes: "rounded",
    gradient: false,
  },
  {
    name: "Mono",
    note: "A timeless original",
    fg: "#171d24",
    bg: "#ffffff",
    pattern: "square",
    eyes: "square",
    gradient: false,
  },
  {
    name: "Blueprint",
    note: "Made for bold ideas",
    fg: "#16429b",
    bg: "#eef3ff",
    pattern: "dots",
    eyes: "rounded",
    gradient: false,
  },
  {
    name: "Berry",
    note: "A little unexpected",
    fg: "#6b214e",
    bg: "#fff0f6",
    pattern: "rounded",
    eyes: "rounded",
    gradient: false,
  },
  {
    name: "Tidal",
    note: "Two tones. One code.",
    fg: "#125143",
    accent: "#233b96",
    bg: "#f4ffff",
    pattern: "rounded",
    eyes: "rounded",
    gradient: true,
  },
  {
    name: "Terracotta",
    note: "Warm by design",
    fg: "#7e3324",
    bg: "#fff3e8",
    pattern: "square",
    eyes: "rounded",
    gradient: false,
  },
  {
    name: "Cobalt",
    note: "Built to stand out",
    fg: "#163993",
    bg: "#f4f6ff",
    pattern: "horizontal",
    eyes: "square",
    gradient: false,
  },
  {
    name: "Lavender",
    note: "A softer kind of statement",
    fg: "#563181",
    bg: "#f7f0ff",
    pattern: "squircle",
    eyes: "rounded",
    gradient: false,
  },
  {
    name: "Copper",
    note: "Precision with a warm edge",
    fg: "#713a19",
    bg: "#fff7e8",
    pattern: "facet",
    eyes: "square",
    gradient: false,
  },
  {
    name: "Botanical",
    note: "A fresh perspective",
    fg: "#24502e",
    bg: "#f4f9ec",
    pattern: "leaf",
    eyes: "rounded",
    gradient: false,
  },
];
export const EMPTY_FIELDS = {
  url: "",
  text: "",
  email: "",
  subject: "",
  body: "",
  phone: "",
  ssid: "",
  password: "",
  security: "WPA",
  hidden: false,
  name: "",
  organization: "",
  contactEmail: "",
  contactPhone: "",
};
const wifiEscape = (s) => s.replace(/[\\;,:"]/g, "\\$&");
const cardEscape = (s) =>
  s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/[,;]/g, "\\$&");
const validEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const validPhone = (s) =>
  /^\+?[\d ()-]+$/.test(s) &&
  s.replace(/\D/g, "").length >= 7 &&
  s.replace(/\D/g, "").length <= 15;
export function encode(type, f) {
  let value = "",
    error = "";
  const need = (message) => ({ value: "", error: message });
  switch (type) {
    case "URL": {
      if (!f.url.trim())
        return need("Add your GDG chapter, event, or registration link.");
      try {
        const u = new URL(f.url.trim());
        if (!["http:", "https:"].includes(u.protocol) || !u.hostname)
          throw Error();
        value = u.href;
      } catch {
        return need("Use a complete URL, such as https://gdg.community.dev/.");
      }
      break;
    }
    case "Text":
      if (!f.text.trim()) return need("Enter the text you want to share.");
      value = f.text;
      break;
    case "Email":
      if (!validEmail(f.email.trim()))
        return need("Enter a valid email address.");
      value = `mailto:${f.email.trim()}?subject=${encodeURIComponent(f.subject)}&body=${encodeURIComponent(f.body)}`;
      break;
    case "Phone":
      if (!validPhone(f.phone.trim()))
        return need("Enter 7–15 digits, with an optional country code.");
      value = `tel:${f.phone.replace(/[ ()-]/g, "")}`;
      break;
    case "Wi-Fi":
      if (!f.ssid) return need("Enter your network name (SSID).");
      if (new TextEncoder().encode(f.ssid).length > 32)
        return need("Network names must be 32 bytes or fewer.");
      if (f.security !== "nopass" && !f.password)
        return need("Enter the network password or select Open network.");
      value = `WIFI:T:${f.security};S:${wifiEscape(f.ssid)};P:${f.security === "nopass" ? "" : wifiEscape(f.password)};H:${!!f.hidden};;`;
      break;
    case "Contact":
      if (!f.name.trim()) return need("Enter a contact name.");
      if (f.contactEmail && !validEmail(f.contactEmail.trim()))
        return need("Enter a valid contact email.");
      if (f.contactPhone && !validPhone(f.contactPhone))
        return need("Enter a valid contact phone number.");
      value = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:;${cardEscape(f.name.trim())};;;`,
        `FN:${cardEscape(f.name.trim())}`,
        `ORG:${cardEscape(f.organization)}`,
        `TEL:${f.contactPhone}`,
        `EMAIL:${f.contactEmail}`,
        "END:VCARD",
      ].join("\r\n");
      break;
    default:
      return need("Choose a supported content type.");
  }
  if (new TextEncoder().encode(value).length > 1200)
    error = "This content is too long. Keep it under 1,200 UTF-8 bytes.";
  return { value, error };
}
export function matrixFor(value, level) {
  const qr = qrcode(0, level);
  qr.addData(value, "Byte");
  qr.make();
  return qr;
}
export function makeSVG(qr, d, id = "qr-ink") {
  const n = qr.getModuleCount(),
    span = n + d.margin * 2;
  // Keep timing and alignment patterns square; only style data modules.
  const structural = new Set();
  for (let y = 0; y <= n - 5; y++)
    for (let x = 0; x <= n - 5; x++) {
      let matches = true;
      for (let j = 0; j < 5 && matches; j++)
        for (let i = 0; i < 5; i++) {
          const expected =
            i === 0 || j === 0 || i === 4 || j === 4 || (i === 2 && j === 2);
          if (qr.isDark(y + j, x + i) !== expected) {
            matches = false;
            break;
          }
        }
      if (matches)
        for (let j = 0; j < 5; j++)
          for (let i = 0; i < 5; i++) structural.add(`${x + i},${y + j}`);
    }
  const fill = d.gradient ? `url(#${id})` : d.fg;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${d.size}" height="${d.size}" viewBox="0 0 ${span} ${span}" role="img" aria-label="Generated QR code">`,
    `<rect width="${span}" height="${span}" fill="${d.bg}"/>`,
  ];
  if (d.gradient)
    parts.push(
      `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${d.fg}"/><stop offset="1" stop-color="${d.accent}"/></linearGradient></defs>`,
    );
  parts.push(`<g fill="${fill}">`);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (
        (x < 7 && y < 7) ||
        (x >= n - 7 && y < 7) ||
        (x < 7 && y >= n - 7) ||
        !qr.isDark(y, x)
      )
        continue;
      const a = x + d.margin,
        b = y + d.margin;
      const protectedCell = x === 6 || y === 6 || structural.has(`${x},${y}`);
      const pattern = protectedCell ? "square" : d.pattern;
      if (pattern === "dots")
        parts.push(`<circle cx="${a + 0.5}" cy="${b + 0.5}" r=".5"/>`);
      else if (pattern === "facet")
        parts.push(
          `<path d="M${a + 0.22} ${b}h.56l.22 .22v.56l-.22 .22h-.56l-.22 -.22v-.56Z"/>`,
        );
      else if (pattern === "leaf")
        parts.push(
          `<path d="M${a + 0.48} ${b}H${a + 1}v.52q0 .48 -.48 .48H${a}v-.52q0 -.48 .48 -.48Z"/>`,
        );
      else if (pattern === "horizontal") {
        const left = x > 0 && qr.isDark(y, x - 1),
          right = x < n - 1 && qr.isDark(y, x + 1);
        parts.push(
          `<rect x="${a}" y="${b + 0.04}" width="1" height=".92" rx=".46"/>`,
        );
        if (left)
          parts.push(
            `<rect x="${a}" y="${b + 0.04}" width=".5" height=".92"/>`,
          );
        if (right)
          parts.push(
            `<rect x="${a + 0.5}" y="${b + 0.04}" width=".5" height=".92"/>`,
          );
      } else if (pattern === "vertical") {
        const up = y > 0 && qr.isDark(y - 1, x),
          down = y < n - 1 && qr.isDark(y + 1, x);
        parts.push(
          `<rect x="${a + 0.04}" y="${b}" width=".92" height="1" rx=".46"/>`,
        );
        if (up)
          parts.push(
            `<rect x="${a + 0.04}" y="${b}" width=".92" height=".5"/>`,
          );
        if (down)
          parts.push(
            `<rect x="${a + 0.04}" y="${b + 0.5}" width=".92" height=".5"/>`,
          );
      } else
        parts.push(
          `<rect x="${a}" y="${b}" width="1" height="1" rx="${pattern === "rounded" ? 0.22 : pattern === "squircle" ? 0.4 : 0}"/>`,
        );
    }
  parts.push("</g>");
  for (const [x, y] of [
    [0, 0],
    [n - 7, 0],
    [0, n - 7],
  ]) {
    const a = x + d.margin,
      b = y + d.margin,
      round = d.eyes === "rounded";
    parts.push(
      `<rect x="${a}" y="${b}" width="7" height="7" rx="${round ? 1.6 : 0}" fill="${fill}"/><rect x="${a + 1}" y="${b + 1}" width="5" height="5" rx="${round ? 0.9 : 0}" fill="${d.bg}"/><rect x="${a + 2}" y="${b + 2}" width="3" height="3" rx="${round ? 0.65 : 0}" fill="${fill}"/>`,
    );
  }
  if (
    d.logo &&
    /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(d.logo)
  ) {
    const s = Math.max(3, Math.floor(n * 0.16)),
      p = (span - s) / 2;
    parts.push(
      `<rect x="${p - 0.6}" y="${p - 0.6}" width="${s + 1.2}" height="${s + 1.2}" rx=".8" fill="${d.bg}"/><image href="${d.logo}" x="${p}" y="${p}" width="${s}" height="${s}" preserveAspectRatio="xMidYMid meet"/>`,
    );
  }
  return parts.join("") + "</svg>";
}
export function luminance(hex) {
  const c = hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
}
export function scanChecks(d, modules) {
  const bg = luminance(d.bg),
    inks = [d.fg, ...(d.gradient ? [d.accent] : [])].map(luminance);
  const contrast = Math.min(
    ...inks.map((f) => (Math.max(f, bg) + 0.05) / (Math.min(f, bg) + 0.05)),
  );
  return [
    {
      name: "Color contrast",
      ok: contrast >= 4.5 && inks.every((f) => f < bg),
      detail: `${contrast.toFixed(1)}:1 · use dark ink on a light background`,
    },
    {
      name: "Quiet zone",
      ok: d.margin >= 4,
      detail: `${d.margin} modules · 4 or more recommended`,
    },
    {
      name: "Export resolution",
      ok: d.size / (modules + 2 * d.margin) >= 4,
      detail: `${Math.floor(d.size / (modules + 2 * d.margin))} pixels per module · aim for 4 or more`,
    },
    {
      name: "Logo protection",
      ok: !d.logo || d.level === "H",
      detail: d.logo
        ? "High correction recommended with a logo"
        : "No logo covering the QR pattern",
    },
  ];
}
export async function toPNG(svg, size) {
  const source = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml" }),
  );
  try {
    const img = new Image();
    img.src = source;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    canvas.getContext("2d").drawImage(img, 0, 0, size, size);
    return await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(Error("PNG export failed"))),
        "image/png",
      ),
    );
  } finally {
    URL.revokeObjectURL(source);
  }
}
