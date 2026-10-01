# Verification results

Verified 30 September 2026 in Chromium on Linux. The main browser run passed the content, style, export and persistence checks. A mobile glow overflow was then fixed; a focused follow-up passed all five responsive widths, dialog, corrupted-storage and browser-error checks. The 38 passing scenarios combine those runs. The browser tests use jsQR to decode actual PNG data rather than checking image presence alone.

| Check                   | Result                                                                        |
| ----------------------- | ----------------------------------------------------------------------------- |
| Production Vite build   | Passed                                                                        |
| Oxlint                  | Passed                                                                        |
| Node unit tests         | 9 passed                                                                      |
| Browser checks          | 38 passed                                                                     |
| Actual PNG download     | Correct 1024 × 1024 dimensions; URL decoded correctly                         |
| Actual SVG download     | Contains vector QR geometry, not an embedded PNG                              |
| Required payload types  | URL, Unicode text, email, phone, secured Wi-Fi and open Wi-Fi exports decoded |
| Extra payload type      | vCard export decoded                                                          |
| Presets                 | All ten exported styles decoded, including dots and gradient                  |
| Patterns                | All eight decoded with a URL, longer Unicode text and escaped Wi-Fi content   |
| Campus examples         | All six content types produced valid previews                                 |
| New pattern persistence | Column pattern restored after refresh                                         |
| Logo                    | Uploaded PNG logo export decoded                                              |
| Invalid URL             | Preview cleared and download disabled                                         |
| Scan warnings           | Low contrast flagged                                                          |
| Persistence             | Wi-Fi fields, hidden-network flag and customized colors restored after reload |
| Theme                   | Light theme survived reload                                                   |
| Responsive layout       | No horizontal overflow at widths 320, 390, 768, 1024 and 1440 px              |
| Help dialog             | Opened and closed with Escape                                                 |
| Corrupted localStorage  | Recovered without crashing                                                    |
| Browser runtime         | No uncaught page errors during test run                                       |

## Remaining human checks

- Test the public Vercel/Netlify deployment after publishing.
- Scan on actual Android/iOS cameras. Validate Wi-Fi joining and contact import on the target phones; automated tests verify encoded payloads, not OS-specific actions.
- Test printed codes at their intended size, with actual lighting and your final logo/colors.
- Review in Safari and Firefox; automated browser coverage here is Chromium only.

Customized styles can still reduce reliability. Passing representative tests does not guarantee every possible combination. The dotted preset initially failed decoding; preserving structural patterns and increasing dot coverage fixed the tested failure.
