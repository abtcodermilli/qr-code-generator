# Presenting QOVA Studio

## A two-minute demo

1. **Start with a working example.** “This is a frontend-only QR designer. Everything is generated in the browser.” Change the URL to your portfolio; show the preview updating immediately.
2. **Show a real use case.** Select Wi-Fi, enter a sample SSID and password, and explain that the camera can use the encoded network details. Use sample credentials during your demonstration.
3. **Make it personal.** Apply a preset, change the data pattern, adjust the foreground color, and show that the preset stays editable. Show Tidal for a real gradient.
4. **Demonstrate engineering care.** Set foreground and background to the same color. Open the scan-check panel. Restore a safe preset and explain the quiet zone.
5. **Export and scan.** Download the PNG and scan it with another phone. Download SVG and explain why its vector geometry remains sharp when enlarged.
6. **Prove persistence.** Save a code, refresh, open My collection, and restore it. Its content and design return together.
7. **Finish on mobile.** Resize or open the deployed URL on a phone. Mention that the tests decode PNG exports, rather than only checking whether an image exists.

## Understand these before the interview

**How does the QR get generated?**
`encode()` validates fields and constructs the correct string, such as `mailto:`, `tel:`, `WIFI:` or `BEGIN:VCARD`. `matrixFor()` passes that string to the QR library. `makeSVG()` turns the matrix into SVG shapes. React recomputes it when content or design changes.

**Why use a library?**
Standards-based QR encoding and Reed–Solomon error correction are complex. The library implements the encoding; the app adds validated inputs, an original presentation, styled rendering, exports and persistence. Credit the library rather than claiming to have written the encoder.

**Why preserve a quiet zone?**
Cameras need a blank border to distinguish the symbol from surrounding content. The app measures this border in modules, so it scales with output size.

**What is error correction?**
The QR includes redundant information, letting readers recover some damaged data. A logo can cover data, so uploading one selects H. It is not a promise that any logo or damaged code will scan.

**Why is SVG different from PNG?**
SVG stores geometry; PNG stores pixels. This version exports the actual shapes instead of embedding a PNG inside an SVG file. PNG is generated from the same SVG so settings stay consistent.

**How is history stored?**
A bounded array of complete field/design snapshots is serialized to localStorage. Reads validate stored data. Writes catch quota/access failures and tell the user. Wi-Fi passwords are stored only when the user explicitly saves a Wi-Fi code.

**Why no reliability percentage?**
A number such as “98% scannable” would need real measurements. The UI gives specific checks; the test suite independently decodes sample exports. Physical phone testing is still necessary.

## Personalize it honestly

- Replace the sample URL with your deployed portfolio or keep your GitHub link.
- Pick your own favorite default palette and explain the choice.
- Read and modify a small function yourself; adding a useful feature you understand is more convincing than memorizing a script.
- Be clear about the libraries and AI assistance used. Do not claim work or understanding you do not have.
- A polished project can strengthen a submission; it cannot guarantee recruitment or ranking above other candidates.
