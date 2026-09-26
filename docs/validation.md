# Validation record

Scientific scope, call for papers, deadlines, and terrapin reconstruction animation validated September 25, 2026 using Node 24.21.0.

- Astro type checking: zero errors, warnings, or hints.
- Content validation, publication, and deployment helpers: six passing unit tests. Deadline checks cover date-only records, timezone-qualified timestamps, invalid dates, and the requirement to provide exactly one date format.
- Static builds: verified the GitHub Pages project subpath and custom-domain root, including page links, fragments, fonts, logos, PDF downloads, calendar, metadata, robots.txt, sitemap, and legacy redirects.
- Populated-content fixture: verified a long speaker name, affiliation, portrait, biography, abstract, timed deadline, and scheduled keynote. The homepage, call for papers, speaker listing, speaker profile, and program fixture were checked at all five viewport widths. Draft and previous-edition entries remained excluded.
- Browser tests: 42 passing tests across Chromium and mobile WebKit, with every main page checked at 360, 390, 768, 1024, and 1440 CSS pixels. Populated fixture reviews run separately per page so the combined review does not exceed the CI test timeout.
- Accessibility: no axe WCAG A/AA violations in the checked pages. Keyboard skip navigation, mobile menu dismissal/focus, reduced motion, keyboard pause/resume, full-width artwork bounds, unobstructed hero links, loop-boundary continuity, offscreen pauses, and navigation without JavaScript passed. Hidden-tab lifecycle events were simulated in the headless tests; manual pauses remained in effect through visibility and motion-preference changes.
- Reflow: verified the effective 512 CSS-pixel viewport corresponding to a 1024-pixel display at 200% browser zoom.
- Manual visual review: desktop and mobile homepage, program, speaker, contribution, attendance, and About layouts; institutional marks; complete page screenshots.

The homepage and call for papers were visually reviewed at all five widths, including the faint hero background on mobile. After correcting the terrapin's proportions and positioning, the resolved artwork was reviewed again at every width. Regression checks measure the rendered SVG's horizontal and vertical scale and the terrapin and sampling arc bounds at 320, 360, 390, 600, 694, 768, 800, 801, 1024, and 1440 pixels. The artwork retains uniform scaling and at least eight pixels of space within every hero edge. Two complete 12-second animation cycles with reflected echoes were captured and inspected: measurements accumulate over eight seconds, a diffuse estimate sharpens into a terrapin silhouette and detailed shell, the reconstruction holds for two seconds, and the final two seconds crossfade back to the initial state. The title and body text remained readable throughout. Browser checks verify all nine sequential sampling highlights, outgoing pulses followed by echoes moving in the reverse direction, reception rings, reconstruction stages, and loop continuity. Every return completes before the resolved hold at second 8; echoes and reception rings are hidden in the static views. Reduced-motion and JavaScript-disabled views keep the resolved static illustration and hide the control; the accessible description identifies the terrapin reconstruction. Hero links use filled and outlined buttons, with room for the playback control on narrow screens. Pale teal research sections retain AA text contrast.

The scientific scope and all 17 topic categories were checked against the approved flyer. The HTML call includes the 4+1-page format, special-session and tutorial proposals, and the in-person presentation requirement. All six published deadlines match between Home and Call for Papers; Attend uses the same advance-registration record. Date-only values render without timezone conversion or added cutoff times, all displayed deadlines include the year, and the existing timed fixture retains its timezone-qualified value. The downloadable PDF is unchanged.

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
| Cumulative layout shift  | 0.032       |

SEO scoring is intentionally reduced by the preview’s `noindex` metadata and blocking robots.txt. Enable indexing only at production-domain launch. Lighthouse is a lab measurement and will vary by device and network; WebKit device emulation does not replace testing on physical iOS hardware.

Reports and screenshots are saved locally in `artifacts/` and browser artifacts are retained by GitHub Actions. Re-run the documented checks when changing layouts, navigation, content schemas, or hosting configuration.
