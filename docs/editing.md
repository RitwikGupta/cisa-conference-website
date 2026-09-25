# Editing the conference website

Make an edit in GitHub, propose it on a branch, and open a pull request. The checks must pass before merging to `main`. A successful check on `main` publishes the update.

## Confirmation and publication

Every event-specific speaker, program item, and deadline needs:

```yaml
edition: 2027
status: draft
source: Organizer confirmation or an authoritative source URL
```

Change `status` to `published` only after verifying that the details apply to 2027. Records from other editions are excluded even if marked published. Keep unconfirmed information out of the repository if it is confidential: draft status prevents website publication, not access to files in a public repository.

Do not copy dates, OpenReview IDs, hotel recommendations, ISBNs, rates, or speakers from an older year. The current source inventory records the unresolved information.

## Speakers

Duplicate the draft example under `src/content/speakers/` and give it a descriptive filename such as `jane-doe.md`. That filename becomes its public URL. Add a short biography below the YAML frontmatter.

```yaml
edition: 2027
status: published
source: Confirmed by the program chair on YYYY-MM-DD
name: Jane Doe
affiliation: University name
role: Keynote speaker
talkTitle: Confirmed talk title
abstract: A concise abstract for the talk.
featured: true
order: 1
portrait: ./portraits/jane-doe.jpg
portraitCredit: Photo courtesy of Jane Doe
website: https://example.edu/jane
```

Place portraits in a `portraits` subdirectory. Astro makes responsive optimized versions. Use a roughly square image with room around the face. `portrait`, `portraitCredit`, `website`, `talkTitle`, and `abstract` may be omitted. Up to three published entries with `featured: true` appear on the homepage in `order` sequence. Every published speaker appears on the Speakers page and gets a profile.

## Program and tutorials

Duplicate the YAML example in `src/content/program/`. `kind` must be `keynote`, `session`, `tutorial`, `poster`, or `break`. A tutorial appears in the tutorial section; other items without a time appear as confirmed highlights.

```yaml
edition: 2027
status: published
source: Approved 2027 program
title: Confirmed session title
kind: session
description: What the session covers.
date: '2027-06-01'
start: '09:00'
end: '10:00'
location: Confirmed room
speakerIds: [jane-doe]
order: 1
```

Times are in `America/New_York`, the conference’s local timezone. Omit `date`, `start`, and `end` until scheduled. Scheduled entries must have both start and end times within the event dates. Speaker IDs must match published 2027 speaker filenames. Lists, profiles, and daily schedules are generated from these records.

## Deadlines

Duplicate the deadline example. `datetime` must include a timezone offset; `dateLabel` must explicitly state the deadline’s timezone. The example’s date is fictional and unpublished. Published deadlines appear on Home and Contribute.

## Registration and submissions

Add an entry to the shared event file only once the current-year destination is verified:

```yaml
registration:
  url: https://confirmed-registration-provider.example/2027
  label: Register for CISA 2027
  confirmed: true
```

Use the same structure under `submission` for paper submissions. A link with `confirmed: false` is not shown as an action. Dates, manuscript rules, and fees belong in the page prose or deadline records once confirmed. Keep the downloadable CFP and HTML guidance consistent.

## Organizing committee

Duplicate the YAML example in `src/content/organizers/`, then set the verified `name`, `role`, optional `affiliation` and `website`, and display `order`. The same edition, source, and publication rules apply. Published members replace the announcement notice on About.

## Shared event information

Edit the event YAML once to update dates, venue, contact address, or the PDF location. The homepage, attendance details, contact links, event metadata, and calendar download use this source. Dates use quoted ISO strings. The calendar download covers all conference days without implying that conference sessions last all day.

## Copy and page structure

Each heading identifies its subject; each sentence provides information. Use literal headings such as “Technical program”, “Speakers”, and “Important dates”. Describe research through methods and applications. Keep VLMs, agentic imaging workflows, and cryo-EM/ET within the research scope without presenting them as confirmed sessions.

Avoid slogans, rhetorical questions, generic invitations, decorative labels above headings, numbered topic labels, and announcement badges. A pending notice needs one sentence, such as “Speakers will be announced.” Do not add a promotional panel to fill an empty page.

Page Markdown has `title`, `description`, and an optional `intro`. Omit `intro` when it repeats the title or body. Supporting page titles should be literal, while the homepage heading uses the official name from the shared event record. Research topics and their plain-text examples are maintained in `src/data/themes.yaml`.

Use ordinary links for navigation. Buttons are used for submission, registration, downloads, and interactive controls. The homepage’s Technical program and Call for papers navigation links are an intentional exception: they use filled and outlined button styles respectively. Speaker roles and session types are factual metadata, displayed as ordinary text alongside their associated content.

The footer contains conference identity, copyright, and the contact email; keep navigation in the header. Present conference affiliations as logos and names without repeating the call-for-papers attribution or adding explanatory labels.

## Branding and images

Design tokens live at the start of `src/styles/global.css`. The full-width SVG aperture background is in `src/components/Aperture.astro`; no raster or video is needed. Keep it behind the homepage introduction on warm white, with a feathered overlay protecting the text. On mobile it stays a faint cropped background, without a separate illustration block or added hero height. Keep the pause control clear of the buttons and allow pointer events only on the control. The 12-second sampling sweep repeats continuously while visible. Retain the resolved static image for reduced motion and JavaScript-disabled visits, the accessible pause/resume control, and automatic pauses when offscreen or in a hidden tab. Automatic pauses must not override a visitor’s manual pause.

For a new edition, update the current event selection in `src/lib/content.ts`, the wordmark year, page copy, calendar UID, and metadata tests together. This release intentionally does not provide an automatic annual rollover.
