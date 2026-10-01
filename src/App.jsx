import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownToLine,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Code2,
  Copy,
  FileText,
  ImagePlus,
  LayoutGrid,
  Link,
  Mail,
  Moon,
  Phone,
  Plus,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  UserRound,
  Wifi,
  X,
} from "lucide-react";
import {
  DEFAULT_DESIGN,
  EMPTY_FIELDS,
  PRESETS,
  TYPES,
  PATTERNS,
  CAMPUS_URL,
  CAMPUS_EXAMPLES,
  encode,
  matrixFor,
  makeSVG,
  scanChecks,
  toPNG,
} from "./qr";
import "./App.css";
import { cleanHistory } from "./storage.js";
const ICONS = {
  URL: Link,
  Text: FileText,
  Email: Mail,
  Phone,
  "Wi-Fi": Wifi,
  Contact: UserRound,
};
const HISTORY_KEY = "qrgenie_studio_v1";
const SAMPLE_URL = CAMPUS_URL;
function readHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return cleanHistory(parsed);
  } catch {
    return [];
  }
}
function readTheme() {
  try {
    return localStorage.getItem("qrgenie_theme") === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}
function Field({ label, hint, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input aria-label={label} {...props} />
      {hint && <small>{hint}</small>}
    </label>
  );
}
function ColorField({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="color-input">
        <input
          aria-label={label}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span>{value.toUpperCase()}</span>
      </div>
    </label>
  );
}
function QovaMark() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="17"
        height="17"
        rx="5"
        stroke="currentColor"
        strokeWidth="3"
      />
      <rect x="8" y="8" width="7" height="7" rx="2" fill="currentColor" />
      <path
        d="m17 17 6 6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="22" cy="4" r="2" fill="currentColor" />
    </svg>
  );
}
function App() {
  const [view, setView] = useState("studio");
  const [type, setType] = useState("URL");
  const [fields, setFields] = useState({ ...EMPTY_FIELDS, url: SAMPLE_URL });
  const [design, setDesign] = useState({ ...DEFAULT_DESIGN });
  const [tab, setTab] = useState("Style");
  const [theme, setTheme] = useState(readTheme);
  const [recent, setRecent] = useState(readHistory);
  const [toast, setToast] = useState("");
  const [help, setHelp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [context, setContext] = useState("Code");
  const [showPassword, setShowPassword] = useState(false);
  const fileInput = useRef(null);
  const result = useMemo(() => encode(type, fields), [type, fields]);
  const generated = useMemo(() => {
    if (result.error) return { svg: "", modules: 21, error: result.error };
    try {
      const qr = matrixFor(result.value, design.level);
      return {
        svg: makeSVG(qr, design),
        modules: qr.getModuleCount(),
        error: "",
      };
    } catch {
      return {
        svg: "",
        modules: 21,
        error:
          "This content is too large for the selected correction level. Shorten it and try again.",
      };
    }
  }, [result, design]);
  const checks = scanChecks(design, generated.modules),
    issues = checks.filter((c) => !c.ok).length;
  const presets = useMemo(
    () =>
      PRESETS.map((p, i) => ({
        ...p,
        svg: makeSVG(
          matrixFor(CAMPUS_URL, "H"),
          { ...DEFAULT_DESIGN, ...p, size: 100 },
          `preset-${i}`,
        ),
      })),
    [],
  );
  const title =
    type === "URL"
      ? fields.url
      : type === "Text"
        ? fields.text
        : type === "Email"
          ? fields.email
          : type === "Phone"
            ? fields.phone
            : type === "Wi-Fi"
              ? fields.ssid
              : fields.name;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("qrgenie_theme", theme);
    } catch {
      /* Theme still works in memory. */
    }
  }, [theme]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  const change = (key, value) => setFields((f) => ({ ...f, [key]: value }));
  const customize = (key, value) => setDesign((d) => ({ ...d, [key]: value }));
  const fieldProps = (key) => ({
    value: fields[key],
    onChange: (e) => change(key, e.target.value),
    maxLength: key === "text" || key === "body" ? 1200 : 300,
  });
  function persist(items, message) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
      setRecent(items);
      setToast(message);
    } catch {
      setToast(
        "Your browser could not save this. Storage may be full or disabled.",
      );
    }
  }
  function save() {
    if (generated.error) return;
    const item = {
      id: crypto.randomUUID(),
      type,
      fields: { ...fields },
      design: { ...design },
      title: title.slice(0, 100),
      date: new Date().toISOString(),
    };
    persist(
      [
        item,
        ...recent.filter(
          (r) =>
            !(
              r.type === type &&
              JSON.stringify(r.fields) === JSON.stringify(fields) &&
              JSON.stringify(r.design) === JSON.stringify(design)
            ),
        ),
      ].slice(0, 12),
      "Saved to your collection on this device.",
    );
  }
  function restore(item) {
    setType(item.type);
    setFields({ ...EMPTY_FIELDS, ...item.fields });
    setDesign({ ...DEFAULT_DESIGN, ...item.design });
    setView("studio");
    setToast("Content and design restored.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function applyPreset(p) {
    setDesign((d) => ({
      ...d,
      ...p,
      svg: undefined,
      name: undefined,
      note: undefined,
    }));
    setView("studio");
    setTab("Style");
  }
  async function download(extension) {
    if (!generated.svg || busy) return;
    setBusy(true);
    try {
      const blob =
        extension === "png"
          ? await toPNG(generated.svg, design.size)
          : new Blob([generated.svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qova-${type.toLowerCase()}-${design.size}.${extension}`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setToast(
        `${extension.toUpperCase()} downloaded. Test it with your phone before sharing.`,
      );
    } catch {
      setToast("Export failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function uploadLogo(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setToast("Choose a PNG, JPEG or WebP image under 2 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const c = document.createElement("canvas");
      c.width = c.height = 160;
      const ctx = c.getContext("2d");
      const scale = Math.min(160 / image.width, 160 / image.height);
      ctx.drawImage(
        image,
        (160 - image.width * scale) / 2,
        (160 - image.height * scale) / 2,
        image.width * scale,
        image.height * scale,
      );
      setDesign((d) => ({ ...d, logo: c.toDataURL("image/png"), level: "H" }));
      setToast("Logo added. High error correction enabled.");
    } catch {
      setToast("That image could not be opened. Try another file.");
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  function fresh() {
    setType("URL");
    setFields({ ...EMPTY_FIELDS });
    setDesign({ ...DEFAULT_DESIGN });
    setView("studio");
    setContext("Code");
  }
  function contentForm() {
    if (type === "URL")
      return (
        <Field
          label="Website URL"
          placeholder="https://gdg.community.dev/"
          hint="Share your GDG chapter, campus workshop, or event registration page."
          {...fieldProps("url")}
        />
      );
    if (type === "Text")
      return (
        <label className="field">
          <span>Your message</span>
          <textarea
            rows="4"
            placeholder="Hello, GDG on Campus! Let’s learn, build, and share together."
            {...fieldProps("text")}
          />
          <small>
            {new TextEncoder().encode(fields.text).length} / 1,200 bytes
          </small>
        </label>
      );
    if (type === "Email")
      return (
        <>
          <Field
            label="Email address"
            type="email"
            placeholder="gdg-campus@example.com"
            {...fieldProps("email")}
          />
          <Field
            label="Subject (optional)"
            placeholder="GDG on Campus — Workshop enquiry"
            {...fieldProps("subject")}
          />
          <label className="field">
            <span>Message (optional)</span>
            <textarea
              rows="3"
              placeholder="Hi team, I’d love to join the next campus workshop."
              {...fieldProps("body")}
            />
          </label>
        </>
      );
    if (type === "Phone")
      return (
        <Field
          label="Phone number"
          type="tel"
          placeholder="Your campus coordinator’s number"
          hint="Add the country code for your campus or event contact."
          {...fieldProps("phone")}
        />
      );
    if (type === "Wi-Fi")
      return (
        <>
          <Field
            label="Network name (SSID)"
            placeholder="GDG-Campus-Guest"
            autoComplete="off"
            {...fieldProps("ssid")}
          />
          <label className="field">
            <span>Security</span>
            <select
              value={fields.security}
              onChange={(e) => change("security", e.target.value)}
            >
              <option value="WPA">WPA / WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">Open network</option>
            </select>
          </label>
          {fields.security !== "nopass" && (
            <>
              <Field
                label="Network password"
                placeholder="Your campus guest-network password"
                type={showPassword ? "text" : "password"}
                autoComplete="off"
                {...fieldProps("password")}
              />
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                Show password
              </label>
            </>
          )}
          <label className="check-label">
            <input
              type="checkbox"
              checked={fields.hidden}
              onChange={(e) => change("hidden", e.target.checked)}
            />
            Hidden network
          </label>
          <p className="small-note">
            The QR contains your network password. Saving it stores that
            password on this device.
          </p>
        </>
      );
    return (
      <>
        <Field
          label="Full name"
          placeholder="Ankur Bikram Thapa"
          {...fieldProps("name")}
        />
        <Field
          label="Organization (optional)"
          placeholder="GDG on Campus — SRM"
          {...fieldProps("organization")}
        />
        <div className="two-cols">
          <Field
            label="Contact email (optional)"
            placeholder="your-name@example.com"
            type="email"
            {...fieldProps("contactEmail")}
          />
          <Field
            label="Contact phone (optional)"
            placeholder="Your number with country code"
            type="tel"
            {...fieldProps("contactPhone")}
          />
        </div>
      </>
    );
  }
  const preview = generated.svg ? (
    <div
      className="qr-output"
      data-testid="qr-preview"
      dangerouslySetInnerHTML={{ __html: generated.svg }}
    />
  ) : (
    <div className="empty-qr">
      <QrCode size={50} />
      <strong>Your campus connection</strong>
      <span>Add a GDG link, event note, or contact to begin.</span>
    </div>
  );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to builder
      </a>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView("studio");
          }}
        >
          <span className="brand-symbol">
            <QovaMark />
          </span>
          <span>
            QOVA<span className="studio-word">QR DESIGN STUDIO</span>
          </span>
        </a>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav aria-label="Main navigation">
          {[
            ["studio", "QR studio", LayoutGrid],
            ["presets", "Design library", Sparkles],
            ["collection", "My collection", Clock3],
          ].map(([key, label, Icon]) => (
            <button
              key={key}
              className={`nav-item ${view === key ? "active" : ""}`}
              onClick={() => setView(key)}
            >
              <Icon size={18} />
              {label}
              {key === "collection" ? (
                <span className="nav-count">{recent.length}</span>
              ) : (
                view === key && <span className="active-dot" />
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-tip">
          <div className="tiny-orbit">
            <QrCode size={29} />
            <span>✦</span>
          </div>
          <h3>
            Made to scan.
            <br />
            Designed to connect.
          </h3>
          <p>
            Your next connection
            <br />
            is just a scan away.
          </p>
          <button onClick={() => setHelp(true)}>
            A few scanning tips <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="sidebar-bottom">
          <span className="private-label">
            <ShieldCheck size={15} /> Made in your browser
          </span>
          <p>Your content stays on your device.</p>
          <button className="help-link" onClick={() => setHelp(true)}>
            <CircleHelp size={17} /> How it works <ArrowUpRight size={14} />
          </button>
          <div className="maker">
            <span className="avatar">A</span>
            <div>
              <strong>Ankur Bikram Thapa</strong>
              <span>Designer & developer</span>
            </div>
            <a
              aria-label="Ankur's GitHub"
              href="https://github.com/abtcodermilli"
              target="_blank"
              rel="noreferrer"
            >
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span>{" "}
            <strong>
              {view === "studio"
                ? "QR studio"
                : view === "presets"
                  ? "Design library"
                  : "My collection"}
            </strong>
          </div>
          <div className="top-actions">
            <span className="local-badge">
              <i /> 100% browser-based
            </span>
            <button
              className="icon-btn"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <a
              href="https://github.com/abtcodermilli/qr-code-generator"
              target="_blank"
              rel="noreferrer"
              className="source-link"
            >
              <Code2 size={16} /> Source <ArrowUpRight size={13} />
            </a>
          </div>
        </header>
        <main id="main">
          <section
            className={`page-heading ${view === "studio" ? "studio-heading" : ""}`}
          >
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="campus-dots">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>{" "}
                MADE FOR IDEAS THAT GO PLACES
              </div>
              <h1>
                {view === "studio" ? (
                  <>
                    Small squares.<em>Big possibilities.</em>
                  </>
                ) : view === "presets" ? (
                  <>
                    Find your signature<span className="mint">.</span>
                  </>
                ) : (
                  <>
                    Keep the good ones<span className="mint">.</span>
                  </>
                )}
              </h1>
              <p>
                {view === "studio"
                  ? "From your next GDG campus meetup to your next big project. Create a QR that connects people — and looks like you."
                  : view === "presets"
                    ? "Ten palettes. Eight patterns. A whole lot of you. Pick a starting point and make every detail your own."
                    : "Your campus links, contacts, and custom designs. Saved on this device, ready whenever you are."}
              </p>
              <div className="hero-actions">
                <button className="primary new-button" onClick={fresh}>
                  <Plus size={17} /> New QR <ArrowUpRight size={16} />
                </button>
                <button
                  className="hero-library-link"
                  onClick={() => setView("presets")}
                >
                  Explore designs <ArrowRight size={16} />
                </button>
              </div>
              {view === "studio" && (
                <div className="hero-features">
                  <span>
                    <Check size={13} /> No sign-up
                  </span>
                  <span>
                    <ShieldCheck size={13} /> Private by design
                  </span>
                  <span>
                    <ArrowDownToLine size={13} /> PNG + SVG
                  </span>
                </div>
              )}
            </div>
            {view === "studio" && (
              <div className="hero-art">
                <div className="hero-orbit orbit-one" />
                <div className="hero-orbit orbit-two" />
                <span className="hero-star star-one">✳</span>
                <span className="hero-star star-two">✦</span>
                <div className="campus-ticket">
                  <div className="ticket-top">
                    <span>
                      <i /> CAMPUS CONNECTIONS
                    </span>
                    <ArrowUpRight size={20} />
                  </div>
                  <h2>
                    Meet. Build.
                    <br />
                    <em>Belong.</em>
                  </h2>
                  <div
                    className="ticket-qr"
                    dangerouslySetInnerHTML={{ __html: presets[0].svg }}
                  />
                  <div className="ticket-footer">
                    <strong>GDG on Campus</strong>
                    <span>Discover the community</span>
                  </div>
                </div>
                <span className="hero-art-caption">
                  A SMALL SCAN. A NEW CONNECTION.
                </span>
              </div>
            )}
          </section>
          {view === "studio" ? (
            <>
              <div className="studio-grid" id="builder">
                <div className="editor">
                  <section className="panel content-panel">
                    <div className="section-heading">
                      <div>
                        <span className="step">01</span>
                        <h2>Start with a connection</h2>
                      </div>
                      <span className="muted tiny">CHOOSE YOUR CONTENT</span>
                    </div>
                    <div className="type-grid">
                      {TYPES.map((t) => {
                        const Icon = ICONS[t];
                        return (
                          <button
                            key={t}
                            aria-pressed={type === t}
                            onClick={() => setType(t)}
                            className={`type-button ${type === t ? "selected" : ""}`}
                          >
                            <Icon size={20} />
                            <span>{t === "URL" ? "Website" : t}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="content-fields">{contentForm()}</div>
                    <div className="campus-example-row">
                      <span>MADE FOR YOUR COMMUNITY</span>
                      <button
                        onClick={() => {
                          setFields((f) => ({
                            ...f,
                            ...CAMPUS_EXAMPLES[type],
                          }));
                          setToast(
                            type === "URL"
                              ? "GDG community link added."
                              : "Campus demo added. Replace sample details with your own before sharing.",
                          );
                        }}
                      >
                        <Sparkles size={13} /> Use campus example
                      </button>
                    </div>
                    {type !== "URL" && (
                      <p className="example-disclaimer">
                        Campus examples are demo content, not official GDG
                        contact or network details.
                      </p>
                    )}
                    {generated.error && (
                      <p className="validation" role="status">
                        {generated.error}
                      </p>
                    )}
                  </section>
                  <section className="panel design-panel">
                    <div className="section-heading">
                      <div>
                        <span className="step">02</span>
                        <h2>Design it your way</h2>
                      </div>
                      <button
                        className="icon-btn"
                        aria-label="Reset design"
                        onClick={() => setDesign({ ...DEFAULT_DESIGN })}
                      >
                        <RotateCcw size={16} />
                      </button>
                    </div>
                    <div
                      className="tabs"
                      role="tablist"
                      aria-label="Customization"
                    >
                      {["Style", "Colors", "Logo", "Settings"].map((t) => (
                        <button
                          role="tab"
                          aria-selected={tab === t}
                          key={t}
                          onClick={() => setTab(t)}
                          className={tab === t ? "selected" : ""}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="custom-content" role="tabpanel">
                      {tab === "Style" && (
                        <>
                          <div className="field-heading">
                            <span>MAKE IT A MATCH</span>
                            <button onClick={() => setView("presets")}>
                              All presets <ArrowUpRight size={13} />
                            </button>
                          </div>
                          <div className="preset-strip">
                            {presets.slice(0, 4).map((p) => (
                              <button
                                key={p.name}
                                className={`preset-mini ${design.fg === p.fg && design.bg === p.bg ? "selected" : ""}`}
                                onClick={() => applyPreset(p)}
                              >
                                <div
                                  dangerouslySetInnerHTML={{ __html: p.svg }}
                                />
                                <span>{p.name}</span>
                              </button>
                            ))}
                          </div>
                          <div className="field-heading">
                            <span>
                              CHOOSE YOUR PATTERN{" "}
                              <b className="count-tag">08</b>
                            </span>
                            <span>A different kind of detail</span>
                          </div>
                          <div className="pattern-grid">
                            {PATTERNS.map((p) => (
                              <button
                                key={p.id}
                                aria-label={`${p.name} pattern`}
                                aria-pressed={design.pattern === p.id}
                                className={
                                  design.pattern === p.id ? "selected" : ""
                                }
                                onClick={() => customize("pattern", p.id)}
                              >
                                <span className={`pattern-sample ${p.id}`}>
                                  {Array.from({ length: 16 }, (_, i) => (
                                    <i key={i} />
                                  ))}
                                </span>
                                <span className="pattern-name">{p.name}</span>
                                <span className="pattern-selected">
                                  {design.pattern === p.id ? (
                                    <Check size={12} />
                                  ) : (
                                    <Plus size={12} />
                                  )}
                                </span>
                              </button>
                            ))}
                          </div>
                          <label className="field compact">
                            <span>Corner style</span>
                            <select
                              value={design.eyes}
                              onChange={(e) =>
                                customize("eyes", e.target.value)
                              }
                            >
                              <option value="rounded">Soft corners</option>
                              <option value="square">Square corners</option>
                            </select>
                          </label>
                        </>
                      )}
                      {tab === "Colors" && (
                        <>
                          <div className="two-cols">
                            <ColorField
                              label="Foreground"
                              value={design.fg}
                              onChange={(v) => customize("fg", v)}
                            />
                            <ColorField
                              label="Background"
                              value={design.bg}
                              onChange={(v) => customize("bg", v)}
                            />
                          </div>
                          <label className="check-label">
                            <input
                              type="checkbox"
                              checked={design.gradient}
                              onChange={(e) =>
                                customize("gradient", e.target.checked)
                              }
                            />
                            Use gradient ink
                          </label>
                          {design.gradient && (
                            <ColorField
                              label="Gradient end color"
                              value={design.accent}
                              onChange={(v) => customize("accent", v)}
                            />
                          )}
                          <p className="small-note">
                            Dark ink on a light background gives phone cameras
                            the best chance. Check both gradient colors before
                            sharing.
                          </p>
                        </>
                      )}
                      {tab === "Logo" && (
                        <>
                          <input
                            ref={fileInput}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            hidden
                            onChange={uploadLogo}
                          />
                          <button
                            className="upload-zone"
                            onClick={() => fileInput.current.click()}
                          >
                            {design.logo ? (
                              <img src={design.logo} alt="Uploaded logo" />
                            ) : (
                              <ImagePlus size={30} />
                            )}
                            <strong>
                              {design.logo
                                ? "Change your logo"
                                : "Put your mark on it"}
                            </strong>
                            <span>Choose PNG, JPEG or WebP · up to 2 MB</span>
                          </button>
                          {design.logo && (
                            <button
                              className="text-button"
                              onClick={() => customize("logo", "")}
                            >
                              <Trash2 size={14} /> Remove logo
                            </button>
                          )}
                          <p className="small-note">
                            We keep the logo small and switch to high error
                            correction. Always scan-test a branded code.
                          </p>
                        </>
                      )}
                      {tab === "Settings" && (
                        <>
                          <label className="field">
                            <span>
                              Export size{" "}
                              <b>
                                {design.size} × {design.size} px
                              </b>
                            </span>
                            <input
                              type="range"
                              min="256"
                              max="2048"
                              step="128"
                              value={design.size}
                              onChange={(e) =>
                                customize("size", +e.target.value)
                              }
                            />
                          </label>
                          <div className="two-cols">
                            <label className="field">
                              <span>Error correction</span>
                              <select
                                value={design.level}
                                onChange={(e) =>
                                  customize("level", e.target.value)
                                }
                              >
                                <option value="L">Low · L</option>
                                <option value="M">Medium · M</option>
                                <option value="Q">Quartile · Q</option>
                                <option value="H">High · H</option>
                              </select>
                            </label>
                            <label className="field">
                              <span>Quiet zone</span>
                              <select
                                value={design.margin}
                                onChange={(e) =>
                                  customize("margin", +e.target.value)
                                }
                              >
                                {[0, 1, 2, 4, 6, 8].map((m) => (
                                  <option key={m} value={m}>
                                    {m} modules{m === 4 ? " · recommended" : ""}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                          <p className="small-note">
                            Error correction adds redundant data to help a
                            reader recover a damaged code. It does not guarantee
                            a scan.
                          </p>
                        </>
                      )}
                    </div>
                  </section>
                  <div className="workflow-note">
                    <ShieldCheck size={17} />
                    <span>
                      No sign-up. No tracking. Just your next connection.
                    </span>
                  </div>
                </div>
                <aside className="preview-panel">
                  <div className="preview-header">
                    <span>
                      <span className="live-dot" /> LIVE PREVIEW
                    </span>
                    <span className="tiny muted">
                      {design.size} × {design.size} px
                    </span>
                  </div>
                  <div
                    className={`preview-stage ${context === "Card" ? "card-context" : ""}`}
                  >
                    <div className="preview-card">
                      {context === "Card" && (
                        <div className="card-heading">
                          <span>GDG CAMPUS CONNECTION</span>
                          <strong>
                            {type === "Wi-Fi"
                              ? "Make yourself at home."
                              : "See you on campus."}
                          </strong>
                        </div>
                      )}
                      {preview}
                      {context === "Card" && (
                        <div className="card-caption">
                          Scan to{" "}
                          {type === "Wi-Fi" ? "get connected" : "discover more"}{" "}
                          <ArrowUpRight size={15} />
                        </div>
                      )}
                    </div>
                    <div className="stage-caption">
                      {context === "Card"
                        ? "Context preview · exports contain only the QR"
                        : "YOUR CAMPUS. YOUR COMMUNITY. YOUR CODE."}
                    </div>
                  </div>
                  <div className="context-switch" aria-label="Preview context">
                    {["Code", "Card"].map((c) => (
                      <button
                        key={c}
                        aria-pressed={context === c}
                        onClick={() => setContext(c)}
                        className={context === c ? "selected" : ""}
                      >
                        {c === "Code" ? (
                          <QrCode size={14} />
                        ) : (
                          <LayoutGrid size={14} />
                        )}{" "}
                        {c === "Code" ? "QR code" : "In context"}
                      </button>
                    ))}
                  </div>
                  <div className="preview-details">
                    <span className="content-pill">
                      {type === "URL" ? "WEBSITE" : type.toUpperCase()}
                    </span>
                    <span title={type === "Wi-Fi" ? fields.ssid : title}>
                      {title || "Waiting for your content"}
                    </span>
                  </div>
                  <details
                    className={`scan-check ${issues ? "has-warning" : ""}`}
                  >
                    <summary>
                      <span>
                        <ShieldCheck size={17} />
                        {generated.error
                          ? "Add content to check"
                          : issues
                            ? `${issues} scan check${issues > 1 ? "s" : ""} to review`
                            : "Scan-friendly settings"}
                      </span>
                      <ChevronDown size={15} />
                    </summary>
                    <div className="checks">
                      {checks.map((c) => (
                        <div key={c.name}>
                          <span className={c.ok ? "ok" : "warn"}>
                            {c.ok ? (
                              <CheckCircle2 size={15} />
                            ) : (
                              <CircleHelp size={15} />
                            )}
                          </span>
                          <p>
                            <strong>{c.name}</strong>
                            <small>{c.detail}</small>
                          </p>
                        </div>
                      ))}
                      <p className="small-note">
                        These are design checks, not a decoded scan test. Test
                        the downloaded file with your phone.
                      </p>
                    </div>
                  </details>
                  <div className="download-row">
                    <button
                      className="primary"
                      disabled={!!generated.error || busy}
                      onClick={() => download("png")}
                    >
                      <ArrowDownToLine size={18} />
                      {busy ? "Exporting…" : "Download PNG"}
                      <ArrowRight size={17} />
                    </button>
                    <button
                      className="secondary svg-download"
                      disabled={!!generated.error || busy}
                      onClick={() => download("svg")}
                    >
                      SVG <ArrowDownToLine size={15} />
                    </button>
                  </div>
                  <div className="preview-secondary">
                    <button disabled={!!generated.error} onClick={save}>
                      <Plus size={15} /> Save to collection
                    </button>
                    <button
                      disabled={!!generated.error}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(result.value);
                          setToast("Encoded content copied.");
                        } catch {
                          setToast(
                            "Clipboard access is unavailable in this browser.",
                          );
                        }
                      }}
                    >
                      <Copy size={14} /> Copy content
                    </button>
                  </div>
                  <div className="export-note">
                    Ready for screens, stickers, and everything in between.
                  </div>
                </aside>
              </div>
              <section className="bottom-banner">
                <span className="banner-icon">
                  <Sparkles size={22} />
                </span>
                <div>
                  <h3>Your campus, a little more connected.</h3>
                  <p>
                    Workshop sign-ups. Club contacts. Guest Wi-Fi. Give every
                    campus moment a way in.
                  </p>
                </div>
                <button onClick={() => setView("presets")}>
                  Find your style <ArrowUpRight size={16} />
                </button>
              </section>
            </>
          ) : view === "presets" ? (
            <div className="library-grid">
              {presets.map((p) => (
                <button
                  key={p.name}
                  className="design-card panel"
                  onClick={() => applyPreset(p)}
                >
                  <div
                    className="design-card-art"
                    style={{ background: p.bg }}
                    dangerouslySetInnerHTML={{ __html: p.svg }}
                  />
                  <div>
                    <h2>
                      {p.name}
                      <ArrowUpRight size={18} />
                    </h2>
                    <p>{p.note}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <>
              {recent.length ? (
                <>
                  <div className="collection-toolbar">
                    <span>{recent.length} / 12 saved designs</span>
                    <button
                      className="text-button"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Delete all saved QR codes from this device?",
                          )
                        )
                          persist([], "Collection cleared.");
                      }}
                    >
                      <Trash2 size={15} /> Clear collection
                    </button>
                  </div>
                  <div className="library-grid">
                    {recent.map((item) => {
                      let svg = "";
                      try {
                        const r = encode(item.type, item.fields);
                        if (!r.error)
                          svg = makeSVG(
                            matrixFor(r.value, item.design.level),
                            item.design,
                            `saved-${item.id}`,
                          );
                      } catch {
                        /* Damaged entries remain removable. */
                      }
                      return (
                        <article className="panel saved-card" key={item.id}>
                          <button
                            className="saved-art"
                            onClick={() => restore(item)}
                            aria-label={`Restore ${item.title}`}
                            dangerouslySetInnerHTML={{ __html: svg }}
                          />
                          <div className="saved-meta">
                            <span className="content-pill">{item.type}</span>
                            <h3>{item.title}</h3>
                            <p>
                              {new Date(item.date).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </p>
                            <div>
                              <button
                                className="secondary"
                                onClick={() => restore(item)}
                              >
                                Open in studio <ArrowUpRight size={14} />
                              </button>
                              <button
                                className="icon-btn"
                                aria-label={`Delete ${item.title}`}
                                onClick={() =>
                                  persist(
                                    recent.filter((r) => r.id !== item.id),
                                    "Saved code removed.",
                                  )
                                }
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="empty-collection panel">
                  <Clock3 size={38} />
                  <h2>Your next great idea belongs here.</h2>
                  <p>
                    Save a QR from the studio to keep its content and every
                    design detail.
                  </p>
                  <button className="primary" onClick={() => setView("studio")}>
                    Create your first code <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
          <footer>
            <span>
              <QrCode size={15} /> QOVA Studio{" "}
              <span className="muted">/ Made by Ankur.</span>
            </span>
            <div>
              <a
                href="https://github.com/abtcodermilli"
                target="_blank"
                rel="noreferrer"
              >
                GitHub <ArrowUpRight size={12} />
              </a>
              <a
                href="https://www.linkedin.com/in/ankur-bikram-thapa-02a526380"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn <ArrowUpRight size={12} />
              </a>
              <button onClick={() => setHelp(true)}>About the project</button>
            </div>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {help && <HelpDialog close={() => setHelp(false)} />}
    </div>
  );
}
function HelpDialog({ close }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="help-dialog"
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <div className="section-heading">
        <h2>A small code. A real connection.</h2>
        <button className="icon-btn" aria-label="Close help" onClick={close}>
          <X size={20} />
        </button>
      </div>
      <p>
        Choose your content, make the design your own, then download and scan it
        with your phone.
      </p>
      <ol>
        <li>
          <strong>Give the code breathing room.</strong> Keep at least four
          modules of empty space around it.
        </li>
        <li>
          <strong>Keep the ink dark.</strong> Light backgrounds and high
          contrast are easier for cameras.
        </li>
        <li>
          <strong>Test the actual export.</strong> Check PNG or SVG at its final
          printed size, especially with a logo.
        </li>
      </ol>
      <p>
        QR codes are static: changing a destination requires a new QR. This app
        has no accounts, analytics, or backend. Saved content (including Wi-Fi
        passwords) stays in this browser until you delete it or clear browser
        data.
      </p>
      <p className="small-note">
        Student project for the GDG on Campus SRM frontend task; not an official
        GDG product. Design checks are guidance, not a guarantee of
        scannability.
      </p>
      <button className="primary" onClick={close}>
        Let's create <ArrowRight size={16} />
      </button>
    </dialog>
  );
}
export default App;
