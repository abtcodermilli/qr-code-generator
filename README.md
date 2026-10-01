# QOVA Studio

A browser-only QR designer for the GDG on Campus SRM frontend task. Create a code, customize its appearance, preview it on a card, and export it as PNG or a real vector SVG.

**Author:** Ankur Bikram Thapa  
**Repository:** https://github.com/abtcodermilli/qr-code-generator  
**Deployment:** Add your public Vercel or Netlify URL here after deploying.

![QOVA Studio desktop](screenshots/studio-desktop.png)

## Run on your Mac

1. Install Node.js 22.12 or newer (a supported LTS release).
2. Extract this ZIP, open the extracted project folder in VS Code, and choose **Terminal → New Terminal**.
3. Run:

```bash
npm ci
npm run dev
```

Open the localhost URL printed by Vite. Keep the terminal running while using the app. Press Control+C to stop it.

Do not double-click `index.html`: React source needs the Vite development server.

## This redesign

The project is now **QOVA — QR Design Studio**, with a larger two-line hero, an original Q brand mark, a campus ticket illustration with a real QR, GDG community examples, ten editable palettes and eight QR patterns. GitHub and LinkedIn links are preserved.

The earlier `qrgenie_studio_v1` and `qrgenie_theme` storage keys are intentionally retained so existing saved designs and theme preferences remain available on the same browser origin. No network or contact details in a demo should be treated as official campus information.

## What is included

- Required types: website URL, text, email, phone, Wi-Fi.
- Extra type: contact card (vCard 3.0).
- Real-time input validation and preview. Invalid content removes the code and disables downloads.
- Ten editable presets: Campus, Mono, Blueprint, Berry, Tidal, Terracotta, Cobalt, Lavender, Copper and Botanical.
- Eight data patterns: Classic, Soft, Orbit, Pillow, Ribbon, Column, Facet and Petal; square or rounded finder corners.
- Foreground/background colors and optional two-color gradient.
- Export size, module-based quiet zone and L/M/Q/H error correction.
- Local PNG/JPEG/WebP logo upload with high correction enabled automatically.
- PNG and true vector SVG exported from the same SVG representation used by the preview.
- Code/card context toggle. **The card is a mockup; exports contain only the QR.**
- Actionable contrast, quiet-zone, resolution and logo-protection checks.
- Local collection of 12 saved designs, including complete type-specific fields and visual settings.
- Persistent light/dark theme, responsive layouts, labeled controls and a keyboard-accessible help dialog.
- GitHub and LinkedIn links for the author.

The GDG community URL is prefilled so the first visit has a working preview. Every content type also has a **Use campus example** action. Contact, email, phone and Wi-Fi examples are demo data, not official GDG details. **New QR** clears the content. Saving is explicit: choose **Save to collection**. Downloading does not automatically store private content.

## Architecture

| File                | Responsibility                                                                     |
| ------------------- | ---------------------------------------------------------------------------------- |
| `src/App.jsx`       | React controls, view navigation, local state, export and logo UI                   |
| `src/qr.js`         | Validated payload encoding, QR matrix, SVG drawing, scan checks and PNG conversion |
| `src/storage.js`    | Validate/sanitize saved collection data before restoring it                        |
| `src/App.css`       | Responsive studio design and theme variables                                       |
| `tests/qr.test.js`  | Pure-logic and malformed-storage tests                                             |
| `tests/browser.mjs` | Browser interaction, export decoding, persistence and responsive tests             |

`qrcode-generator` creates the standards-based matrix. The custom SVG renderer draws that matrix using the chosen colors and patterns. Timing and detected alignment patterns remain square in all styles. PNG export rasterizes the same SVG at the selected pixel dimensions. `jsQR` independently decodes exported PNGs in tests.

The QR library is configured to encode UTF-8, so non-English text and emoji are preserved. Error correction, margins, data limits and render failures are handled before exports are enabled. Wi-Fi special characters are escaped; history stores original fields rather than trying to reverse-parse Wi-Fi strings.

## Privacy and limitations

- No backend, accounts, URL shortener, tracking or external QR-generation API.
- All QR data and logo processing happens in the browser.
- Saved collection data lives in this browser's `localStorage`. It is not encrypted or synced. **Saved Wi-Fi codes include their passwords.** Delete individual items, clear the collection, or clear browser data to remove them.
- Existing older `qrgenie_recent` entries are left untouched; this version uses `qrgenie_studio_v1` because complete fields and settings are needed for faithful restoration.
- Codes are static. Editing a destination requires generating and redistributing a new code.
- Scan checks are heuristics, not a scan-success percentage. A 4.5:1 contrast threshold is a conservative design heuristic, not a QR certification standard.
- Automated decoding does not guarantee every camera, print size, lighting condition or custom combination. Test actual exports on a real phone before sharing.
- Logo uploads are resized to a small raster image; logo SVG exports contain vector QR geometry plus an embedded raster logo.
- Input payloads are limited to 1,200 UTF-8 bytes. There is no file hosting, batch export or analytics.

## Tests

```bash
npm test
npm run lint
npm run build
```

Browser tests (first install the browser):

```bash
npx playwright install chromium
npm run test:e2e
```

The browser script starts and stops its own local Vite server on port 5181. If needed, set `CHROMIUM_PATH` to an installed Chromium executable. It writes updated screenshots under `screenshots/`.

See `TEST_RESULTS.md` for the tested scenarios and `DEMO_GUIDE.md` for a short presentation flow.

## Publish your submission

The recruitment brief requests a deployed frontend, a public GitHub repository and screenshots. The stated deadline in the supplied PDF is **4 October 2026**; it does not specify a time.

1. Back up your existing project. Copy these source files into your local clone, excluding `node_modules` and `dist`.
2. Run the tests and production build. Check the site locally and scan the exported QR with your phone.
3. Review your changes, commit them, and push to your own GitHub repository. Include `package-lock.json`, the source and the updated screenshots.
4. In Vercel or Netlify, import that repository. Use the Vite preset, build command `npm run build`, output directory `dist`, and Node 22.12+.
5. Test the deployed link on mobile, then replace the deployment placeholder at the top of this README.
6. Submit the public repository and live URL according to the recruitment form.

No environment variables or backend are needed. This folder does not publish or push itself.

## Screenshots

| Desktop                                    | Light theme                                  |
| ------------------------------------------ | -------------------------------------------- |
| ![Desktop](screenshots/studio-desktop.png) | ![Light theme](screenshots/studio-light.png) |

| Design library                             | Logo and card preview                    |
| ------------------------------------------ | ---------------------------------------- |
| ![Presets](screenshots/design-library.png) | ![Context](screenshots/logo-context.png) |

[Mobile screenshot](screenshots/studio-mobile.png)

## Dependencies and assistance

React, Vite, Lucide and `qrcode-generator` handle UI/runtime, icons and standards-based encoding. Their code remains subject to their own licenses. Playwright, jsQR and pngjs are used for testing.

This redesign was developed with AI assistance. Review, personalize and understand the code before presenting it; describe that assistance accurately if asked and follow the recruitment team's rules. The supplied brief warns against plagiarism but does not explicitly state an AI-assistance policy.

[GitHub](https://github.com/abtcodermilli) · [LinkedIn](https://www.linkedin.com/in/ankur-bikram-thapa-02a526380)
