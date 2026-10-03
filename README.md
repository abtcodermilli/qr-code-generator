# QOVA Studio

A modern browser-based QR code design studio built for the **GDG on Campus SRM Frontend Recruitment Task**.

QOVA lets users generate, customize, preview, save, and export QR codes directly in the browser with no backend required.

## Live Demo

**Vercel:**  
https://qova-sepia.vercel.app/

## Repository

**GitHub:**  
https://github.com/abtcodermilli/qr-code-generator

---

## Preview

![QOVA Studio Desktop](screenshots/studio-desktop.png)

---

## About QOVA

QOVA is designed to make QR creation feel more like a design tool than a basic QR generator.

Instead of simply generating a black-and-white QR code, users can customize colors, patterns, gradients, logos, QR styles, export formats, and more while seeing the result update in real time.

The project runs completely in the browser and does not require a backend.

---

## Features

### QR Code Types

QOVA supports:

- Website URLs
- Plain text
- Email
- Phone numbers
- Wi-Fi networks
- Contact cards using vCard 3.0

Each QR type displays the appropriate input fields automatically.

---

### Real-Time QR Generation

The QR code updates instantly whenever the user changes:

- Content
- Colors
- Pattern
- Size
- Error correction
- Margin
- Gradient
- Logo
- Preset

Invalid or incomplete input prevents export until the content is corrected.

---

### QR Customization

Users can customize:

- Foreground color
- Background color
- QR size
- Quiet-zone / margin
- Error correction level
- Finder corner style
- QR data pattern
- Optional gradient
- Custom logo

---

## Design Presets

QOVA includes multiple editable visual presets:

- Campus
- Mono
- Blueprint
- Berry
- Tidal
- Terracotta
- Cobalt
- Lavender
- Copper
- Botanical

Selecting a preset does not lock the design. Users can continue editing every setting afterward.

---

## QR Patterns

Eight QR data patterns are available:

- Classic
- Soft
- Orbit
- Pillow
- Ribbon
- Column
- Facet
- Petal

Finder corners can also use square or rounded styling.

---

## Logo Support

Users can upload a local:

- PNG
- JPEG
- WebP

logo and place it inside the QR code.

When a logo is enabled, higher error correction is used automatically to help maintain QR readability.

---

## Export Options

QR codes can be exported as:

- PNG
- SVG

The SVG export uses vector QR geometry rather than simply embedding a screenshot.

The PNG export is generated from the same QR representation used by the preview.

---

## Scan Reliability

QOVA includes QR readability checks that help warn users when a design may become difficult to scan.

Checks include:

- Color contrast
- QR resolution
- Quiet-zone size
- Logo protection
- Error correction

These checks are guidance rather than a guaranteed scan-success score.

Users should always test important QR codes on a real device before sharing or printing them.

---

## Recent Designs

Users can save QR designs locally.

Saved designs preserve:

- QR content
- QR type
- Colors
- Pattern
- Gradient
- Size
- Margin
- Error correction
- Other visual settings

The collection is stored using browser `localStorage`, so saved designs remain available after page refreshes.

Up to 12 recent designs can be stored.

---

## Light and Dark Mode

QOVA supports both:

- Dark theme
- Light theme

The selected theme is saved in the browser.

---

## Responsive Design

The interface is designed to work across:

- Desktop computers
- Laptops
- Tablets
- Mobile devices

The layout automatically adjusts for smaller screens.

---

# Run the Project Locally

QOVA can run on:

- Windows
- macOS
- Linux

You only need Node.js, npm, Git, and a modern browser.

---

## Requirements

Install:

- Node.js 22.12 or newer
- npm
- Git

You can verify your installation with:

```bash
node --version
npm --version
git --version
```
