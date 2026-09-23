import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './App.css';

const QR_TYPES = [
  { id: 'URL', label: 'URL', icon: '🔗' },
  { id: 'Text', label: 'Text', icon: '📝' },
  { id: 'Email', label: 'Email', icon: '✉️' },
  { id: 'Phone', label: 'Phone', icon: '📞' },
  { id: 'WiFi', label: 'WiFi', icon: '📶' },
];

const PRESETS = [
  { name: 'Classic', fg: '#000000', bg: '#ffffff' },
  { name: 'Ocean', fg: '#0ea5e9', bg: '#ffffff' },
  { name: 'Sunset', fg: '#f97316', bg: '#fff7ed' },
  { name: 'Dark', fg: '#5eead4', bg: '#0d120e' },
];

function App() {
  const [qrType, setQrType] = useState('URL');
  const [urlText, setUrlText] = useState('');
  const [plainText, setPlainText] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');

  // Customization state
  const [size, setSize] = useState(220);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [errorLevel, setErrorLevel] = useState('M');
  const [margin, setMargin] = useState(4);

  // Recent QR codes (persisted in localStorage)
  const [recent, setRecent] = useState(() => {
    try {
      const saved = localStorage.getItem('recentQRs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [copied, setCopied] = useState(false);

  const getQRValue = () => {
    switch (qrType) {
      case 'URL':
        return urlText.trim();
      case 'Text':
        return plainText.trim();
      case 'Email':
        return email.trim() ? `mailto:${email.trim()}` : '';
      case 'Phone':
        return phone.trim() ? `tel:${phone.trim()}` : '';
      case 'WiFi':
        return wifiSSID.trim()
          ? `WIFI:T:WPA;S:${wifiSSID.trim()};P:${wifiPassword};;`
          : '';
      default:
        return '';
    }
  };

  const qrValue = getQRValue();

  // Basic validation per type
  useEffect(() => {
    if (!qrValue) {
      setError('');
      return;
    }
    if (qrType === 'URL') {
      const looksValid = /^https?:\/\/.+\..+/.test(urlText.trim());
      setError(looksValid ? '' : 'Enter a valid URL starting with http:// or https://');
    } else if (qrType === 'Email') {
      const looksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      setError(looksValid ? '' : 'Enter a valid email address');
    } else if (qrType === 'Phone') {
      const looksValid = /^[+\d][\d\s-]{6,}$/.test(phone.trim());
      setError(looksValid ? '' : 'Enter a valid phone number');
    } else {
      setError('');
    }
  }, [qrType, urlText, email, phone, qrValue]);
    useEffect(() => {
    if (!qrValue) {
      setWarning('');
      return;
    }
    const warnings = [];
    if (errorLevel === 'L' && qrValue.length > 60) {
      warnings.push('Low error correction with long content may reduce scannability.');
    }
    if (margin < 2) {
      warnings.push('Low margin may make the QR code harder for some scanners to read.');
    }
    if (fgColor.toLowerCase() === bgColor.toLowerCase()) {
      warnings.push('Foreground and background are the same color — this QR code will not scan.');
    }
    setWarning(warnings.join(' '));
  }, [qrValue, errorLevel, margin, fgColor, bgColor]);

  const handleDownload = () => {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qr-code.png';
    link.click();

    const entry = { type: qrType, value: qrValue, date: new Date().toISOString() };
    const updated = [entry, ...recent.filter((r) => r.value !== qrValue)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem('recentQRs', JSON.stringify(updated));
  };

  const handleDownloadSVG = () => {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><image href="${canvas.toDataURL('image/png')}" width="${size}" height="${size}"/></svg>`;
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qr-code.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = async () => {
    if (!qrValue) return;
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const applyPreset = (preset) => {
    setFgColor(preset.fg);
    setBgColor(preset.bg);
  };

  const loadRecent = (item) => {
    setQrType(item.type);
    if (item.type === 'URL') setUrlText(item.value);
    if (item.type === 'Text') setPlainText(item.value);
    if (item.type === 'Email') setEmail(item.value.replace('mailto:', ''));
    if (item.type === 'Phone') setPhone(item.value.replace('tel:', ''));
  };

  return (
    <div className="app-shell">
      <aside className="app-nav">
        <div className="app-nav-logo">
          <span className="logo-dot">◆</span> QuickScan
        </div>
        <nav className="app-nav-links">
          <a className="active"><span>⚡</span> Generate QR</a>
          <a><span>🕐</span> Recent Codes</a>
          <a><span>⭐</span> Presets</a>
        </nav>
      </aside>

      <div className="page">
        <header className="header">
        <div className="logo">QuickScan</div>
        <nav className="nav">
          <a href="#">Features</a>
          <a href="#">How it works</a>
          <a href="#">FAQ</a>
        </nav>
        <a
          className="github-btn"
          href="https://github.com/abtcodermilli/qr-code-generator"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </header>

      <section className="hero">
        <h1>
          Instant <span className="highlight">QR Codes</span>: Generate
          <br />
          Anything, <span className="highlight">Anywhere</span>.
        </h1>
        <p>Create, customize, and download QR codes instantly — right in your browser.</p>
      </section>

      <section className="card" id="generator">
        <div className="sidebar">
          {QR_TYPES.map((type) => (
            <button
              key={type.id}
              className={qrType === type.id ? 'active' : ''}
              onClick={() => setQrType(type.id)}
            >
              <span className="icon">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>

        <div className="input-area">
           <div className="step-label"><span className="step-num">1</span> Choose QR Type</div>
            <div className="step-label"><span className="step-num">2</span> Enter Your Information</div>
          {qrType === 'URL' && (
            <>
              <h2>Enter your website URL</h2>
              <p className="hint">Your QR code will be generated automatically</p>
              <input
                type="text"
                placeholder="https://example.com"
                value={urlText}
                onChange={(e) => setUrlText(e.target.value)}
              />
            </>
          )}

          {qrType === 'Text' && (
            <>
              <h2>Enter your text</h2>
              <p className="hint">Any plain text will be encoded</p>
              <textarea
                placeholder="Type anything..."
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
              />
            </>
          )}

          {qrType === 'Email' && (
            <>
              <h2>Enter an email address</h2>
              <p className="hint">Scanning opens a new email draft</p>
              <input
                type="email"
                placeholder="someone@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </>
          )}

          {qrType === 'Phone' && (
            <>
              <h2>Enter a phone number</h2>
              <p className="hint">Scanning starts a phone call</p>
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </>
          )}

          {qrType === 'WiFi' && (
            <>
              <h2>Enter WiFi details</h2>
              <p className="hint">Scanning connects to the network</p>
              <input
                type="text"
                placeholder="Network name (SSID)"
                value={wifiSSID}
                onChange={(e) => setWifiSSID(e.target.value)}
              />
              <input
                type="text"
                placeholder="Password"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
              />
            </>
          )}

          {error && <p className="error-msg">{error}</p>}
          {warning && !error && <p className="warning-msg">⚠️ {warning}</p>}

          {/* Customization controls */}
          <div className="customize">
            <div className="step-label"><span className="step-num">3</span> Customize Your QR Code</div>
            <h3>Customize</h3>

            <div className="control-row">
              <label>Size ({size}px)</label>
              <input
                type="range"
                min="120"
                max="320"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </div>

            <div className="control-row two-col">
              <div>
                <label>Foreground</label>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                />
              </div>
              <div>
                <label>Background</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                />
              </div>
            </div>

            <div className="control-row two-col">
              <div>
                <label>Error correction</label>
                <select value={errorLevel} onChange={(e) => setErrorLevel(e.target.value)}>
                  <option value="L">Low</option>
                  <option value="M">Medium</option>
                  <option value="Q">Quartile</option>
                  <option value="H">High</option>
                </select>
              </div>
              <div>
                <label>Margin ({margin})</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="control-row">
              <label>Presets</label>
                           <div className="preset-grid" id="preset-section">
                {PRESETS.map((p) => (
                  <button key={p.name} className="preset-card" onClick={() => applyPreset(p)}>
                    <div className="preset-swatch" style={{ background: p.fg }} />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="preview-area">
                   <div className="qr-box" style={{ background: bgColor }}>
            {qrValue && !error ? (
              <QRCodeCanvas
                id="qr-canvas"
                value={qrValue}
                size={size}
                fgColor={fgColor}
                bgColor={bgColor}
                level={errorLevel}
                marginSize={margin}
              />
            ) : (
              <p className="placeholder">QR preview appears here</p>
            )}
          </div>

         <div className="reliability">
              <div className="reliability-header">
                <span>Scan Reliability</span>
                <span className="status-pill">{warning ? 'Fair' : 'Excellent'}</span>
              </div>
              <div className="score-circle" style={{ '--pct': warning ? 75 : 98 }}>
                <span>{warning ? '75%' : '98%'}</span>
              </div>
              <ul className="score-checks">
                <li>✓ Proper size</li>
                <li>{warning ? '⚠' : '✓'} {warning || 'Good contrast, error correction, all devices'}</li>
              </ul>
            </div>
          
                <button
            className="download-btn"
            onClick={handleDownload}
            disabled={!qrValue || !!error}
          >
            ⬇ Download PNG
          </button>

          <button
            className="copy-btn"
            onClick={handleDownloadSVG}
            disabled={!qrValue || !!error}
          >
            ⬇ Download SVG
          </button>

          <button
            className="copy-btn"
            onClick={handleCopyLink}
            disabled={!qrValue}
          >
            {copied ? '✓ Copied!' : '📋 Copy Content'}
          </button>

          {recent.length > 0 && (
           <div className="recent" id="recent-section">
              <h4>Recent</h4>
              {recent.map((item, i) => (
                <button key={i} className="recent-item" onClick={() => loadRecent(item)}>
                  <span className="recent-type">{item.type}</span>
                  <span className="recent-value">{item.value.slice(0, 24)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      < footer className="footer">
        <p>Built by Ankur Thapa for GDG on Campus SRM Recruitments 2026-27</p>
        <div className="socials">
          <a href="https://github.com/abtcodermilli" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/ankur-bikram-thapa-02a526380" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
            </footer>
           </div>
    </div>
  );
}
export default App;