# Validation record

Full-width hero and footer refinement validated September 25, 2026 using Node 24.21.0.

- Astro type checking: zero errors, warnings, or hints.
- Publication and deployment helpers: three passing unit tests.
- Static builds: verified the GitHub Pages project subpath and custom-domain root, including page links, fragments, fonts, logos, PDF downloads, calendar, metadata, robots.txt, sitemap, and legacy redirects.
- Populated-content fixture: verified a long speaker name, affiliation, portrait, biography, abstract, deadline, and scheduled keynote. The homepage, speaker listing, speaker profile, and program fixture were checked at all five viewport widths. Draft and previous-edition entries remained excluded.
- Browser tests: 28 passing tests across Chromium and mobile WebKit, with every main page checked at 360, 390, 768, 1024, and 1440 CSS pixels.
- Accessibility: no axe WCAG A/AA violations in the checked pages. Keyboard skip navigation, mobile menu dismissal/focus, reduced motion, keyboard pause/resume, full-width artwork bounds, unobstructed hero links, loop-boundary continuity, offscreen pauses, and navigation without JavaScript passed. Hidden-tab lifecycle events were simulated in the headless tests; manual pauses remained in effect through visibility and motion-preference changes.
- Reflow: verified the effective 512 CSS-pixel viewport corresponding to a 1024-pixel display at 200% browser zoom.
- Manual visual review: desktop and mobile homepage, program, speaker, contribution, attendance, and About layouts; institutional marks; complete page screenshots.

The homepage hero was visually reviewed at all five widths, including the cropped background on mobile. Two complete 12-second sampling cycles were captured and inspected; both image features stayed resolved and the title and body text remained readable through the sweep. Hero links use filled and outlined buttons, with room for the playback control on narrow screens. Pale teal research sections retain AA text contrast.

The simplified footer was reviewed across all six pages and rechecked in both browser engines after correcting email wrapping at tablet widths. It retains identity, copyright, and contact without a navigation list. Home and About no longer repeat the call-for-papers attribution; the affiliation logos and committee name remain without explanatory labels.

The copy review covered all six pages, shared components, metadata, the 404 page, and the regenerated social preview. Decorative section labels, promotional banners, numbered topics, and slogans were removed.

## Mobile Lighthouse

Local production build, simulated mobile conditions:

| Measurement              | Result      |
| ------------------------ | ----------- |
| Performance              | 100         |
| Accessibility            | 100         |
| Best practices           | 100         |
| Largest contentful paint | 1.2 seconds |
| Cumulative layout shift  | 0           |

SEO scoring is intentionally reduced by the preview’s `noindex` metadata and blocking robots.txt. Enable indexing only at production-domain launch. Lighthouse is a lab measurement and will vary by device and network; WebKit device emulation does not replace testing on physical iOS hardware.

Reports and screenshots are saved locally in `artifacts/` and browser artifacts are retained by GitHub Actions. Re-run the documented checks when changing layouts, navigation, content schemas, or hosting configuration.
