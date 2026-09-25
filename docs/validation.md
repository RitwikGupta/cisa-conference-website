# Validation record

Validated September 25, 2026 using Node 24.21.0.

- Astro type checking: zero errors, warnings, or hints.
- Publication and deployment helpers: three passing unit tests.
- Static builds: verified the GitHub Pages project subpath and custom-domain root, including page links, fragments, fonts, logos, PDF downloads, calendar, metadata, robots.txt, sitemap, and legacy redirects.
- Populated-content fixture: verified a long speaker name, affiliation, portrait, biography, abstract, deadline, and scheduled keynote. Draft and previous-edition entries remained excluded.
- Browser tests: 24 passing tests across Chromium and mobile WebKit, with every main page checked at 360, 390, 768, 1024, and 1440 CSS pixels.
- Accessibility: no axe WCAG A/AA violations in the checked pages. Keyboard skip navigation, mobile menu dismissal/focus, reduced motion, replay, and navigation without JavaScript passed.
- Reflow: verified the effective 512 CSS-pixel viewport corresponding to a 1024-pixel display at 200% browser zoom.
- Manual visual review: desktop and mobile homepage, program, speaker, contribution, attendance, and About layouts; institutional marks; complete page screenshots.

## Mobile Lighthouse

Local production build, simulated mobile conditions:

| Measurement              | Result      |
| ------------------------ | ----------- |
| Performance              | 100         |
| Accessibility            | 100         |
| Best practices           | 100         |
| Largest contentful paint | 1.2 seconds |
| Cumulative layout shift  | 0.002       |

The initial mobile-navigation layout shift was corrected before recording these results. SEO scoring is intentionally reduced by the preview’s `noindex` metadata and blocking robots.txt. Enable indexing only at production-domain launch. Lighthouse is a lab measurement and will vary by device and network; WebKit device emulation does not replace testing on physical iOS hardware.

Reports and screenshots are saved locally in `artifacts/` and browser artifacts are retained by GitHub Actions. Re-run the documented checks when changing layouts, navigation, content schemas, or hosting configuration.
