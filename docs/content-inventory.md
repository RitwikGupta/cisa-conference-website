# Content inventory and publication decisions

Reviewed October 11, 2026. The source website mixes editions. Current pages use the 2027 CFP, the approved redesign brief, and the user's edition-specific confirmations. The 2026 conference is under `/2026/` with the same homepage layout and main navigation as 2027, using its own dates, Albany venue, speakers, topics, deadlines, and sponsorship material. The header year selector switches between editions.

| Information                                                                                     | Source                                                                   | Treatment                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official title, June 1–3 dates, Maryland venue, fourth edition, contact, in-person presentation | Attached 2027 CFP                                                        | Published; the attached PDF and local download have identical SHA-256 hashes.                                                                                                                                  |
| All 17 topic categories, 4+1-page rules, and six deadlines                                      | 2027 CFP, including its image-based deadline box                         | Published. Date-only deadlines have no inferred cutoff times or timezones.                                                                                                                                     |
| VLMs, agentic imaging, and cryo-EM/ET connections                                               | Approved redesign brief                                                  | Published as research connections, not confirmed sessions.                                                                                                                                                     |
| Eight organizers, roles, biographies, and portraits                                             | Original organizer pages; user confirms these should be added for 2027   | Published on About with local portraits and expandable biographical summaries. Actual old organizer URLs redirect to individual profile anchors.                                                               |
| Iribe Center                                                                                    | Original homepage; user confirms the building                            | Published in the shared event record, Home, Attend, structured data, and calendar.                                                                                                                             |
| Four legacy keynote speakers                                                                    | Original keynote page; user identifies these as 2026                     | Biographical summaries preserved in `/2026/keynotes/`; current speakers remain unannounced.                                                                                                                    |
| SAR tutorial by Armin Doerry                                                                    | Original tutorial page; user identifies it as 2026                       | Scope and presenter biography in `/2026/tutorials/`; no current tutorial or registration inclusion inferred. The current source does not list diffusion-model or VLM tutorials.                                |
| OpenReview, ISBN, PDF eXpress, submission and presentation instructions                         | Original submissions page; user confirms these are 2026                  | Historical guidance in `/2026/submissions/`. The 2027 submission system is not available. Old IDs stay out of current pages.                                                                                   |
| Manuscript templates                                                                            | Source links name 2025 files                                             | Not promoted as 2027 resources. Older template binaries are not included in this archive.                                                                                                                      |
| Registration rates and destination; hotels                                                      | Original registration page                                               | Still unconfirmed for 2027. Hotels are now blank; virtual fee rows conflict with the in-person CFP.                                                                                                            |
| Sponsor prices, benefits, and exhibitor invitation                                              | Two prospectus screenshots supplied by the user; reuse approved for 2027 | Accessible HTML on `/exhibits/`, with College Park venue copy. Original extracts and an independent package snapshot preserved in `/2026/exhibits/`.                                                           |
| Climate Change Initiative                                                                       | Original flyer explicitly names Albany 2026; user confirms the year      | Historical scope and conflicting source dates in `/2026/climate/`. The 2027 CFP's climate research topic and submission deadline remain current.                                                               |
| Educational topic illustrations                                                                 | Original Topics galleries                                                | Omitted at the user's request.                                                                                                                                                                                 |
| Old program and proceedings                                                                     | Source program is incomplete and mixes years                             | No complete schedule, proceedings, attendance figures, or historical committee roster inferred. The archive preserves the available legacy information rather than claiming a complete original-site snapshot. |

## CFP verification

The supplied `CISA2027_CFP_V2.pdf` matches `public/downloads/CISA2027_CFP_V2.pdf` byte for byte: SHA-256 `34e8c11a1a14430b9463f3ff8184417b0e2130e21156e2f832f31fd7fbdfed8a`.

Visual review of the flyer confirms proposal submissions on December 1, 2026; initial and climate/natural-environment submissions on January 29, 2027; acceptance on February 19; advance registration on March 5; and camera-ready papers on May 7. The initial and camera-ready format is 4+1 pages. These current details remain unchanged.

## Asset sources

- IEEE-USA logo: [official asset](https://ieeeusa.org/wp-content/uploads/2020/08/ieee-usa-logo.png), stored in `public/affiliations/ieee-usa.png`.
- University of Maryland logo: [official asset](https://umd-main.files.svdcdn.com/production/umd/logos/default/primary-logo-dark.svg?dm=1722455539), stored in `public/affiliations/maryland.svg`.
- Organizer portraits: the corresponding original CISA organizer pages; local files in `src/content/organizers/portraits/`. Their verified WebP files have correct extensions despite the source server's misleading text MIME type.
- Prospectus extracts: user-supplied Sponsor Packages and Why Exhibit at CISA 2026 images, in `public/archive/2026/prospectus/`.
- Inter: `@fontsource-variable/inter`, under the SIL Open Font License.
- CISA mark, aperture illustration, and social card: original artwork for this rebuild.
- No unconfirmed 2027 speaker portraits or unattributed venue photography are published.

## Archive sources

- [Original keynotes](https://cisa-conference.org/keynotes/)
- [Original tutorials](https://cisa-conference.org/tutorials/)
- [Original submissions](https://cisa-conference.org/submissions/templates/)
- [Original climate flyer page](https://cisa-conference.org/climate/)
- [Original exhibits page](https://cisa-conference.org/exhibits/)

The updated organizer menu is a 2027 source; it does not establish a 2026 committee roster. Archived sponsor data is independent of current prices so later changes do not rewrite the historical package comparison.
