import { DEFAULT_DESIGN, EMPTY_FIELDS, TYPES, PATTERNS } from "./qr.js";
const hex = (value) =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
// Stored content is untrusted: validate it before generating SVG markup.
export function cleanHistory(parsed) {
  if (!Array.isArray(parsed)) return [];
  return parsed.slice(0, 12).flatMap((r, index) => {
    if (
      !r ||
      !TYPES.includes(r.type) ||
      !r.fields ||
      !r.design ||
      typeof r.title !== "string"
    )
      return [];
    const fields = { ...EMPTY_FIELDS };
    for (const key of Object.keys(fields)) {
      if (key === "hidden") fields[key] = r.fields[key] === true;
      else if (typeof r.fields[key] === "string")
        fields[key] = r.fields[key].slice(0, 1500);
    }
    if (!["WPA", "WEP", "nopass"].includes(fields.security))
      fields.security = "WPA";
    const d = r.design,
      design = { ...DEFAULT_DESIGN };
    for (const key of ["fg", "bg", "accent"])
      if (hex(d[key])) design[key] = d[key];
    if (PATTERNS.some((p) => p.id === d.pattern)) design.pattern = d.pattern;
    if (["square", "rounded"].includes(d.eyes)) design.eyes = d.eyes;
    if (["L", "M", "Q", "H"].includes(d.level)) design.level = d.level;
    if ([0, 1, 2, 4, 6, 8].includes(d.margin)) design.margin = d.margin;
    if (Number.isInteger(d.size) && d.size >= 256 && d.size <= 2048)
      design.size = d.size;
    design.gradient = d.gradient === true;
    if (
      typeof d.logo === "string" &&
      d.logo.length < 200000 &&
      /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(d.logo)
    )
      design.logo = d.logo;
    return [
      {
        id: `restored-${index}`,
        type: r.type,
        fields,
        design,
        title: r.title.slice(0, 100),
        date: Number.isFinite(Date.parse(r.date))
          ? r.date
          : new Date(0).toISOString(),
      },
    ];
  });
}
