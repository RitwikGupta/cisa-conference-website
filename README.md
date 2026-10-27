# CISA 2027

A static Astro website for the IEEE Conference on Computational Imaging Using Synthetic Apertures. Pages are rendered at build time, with small scripts for the mobile menu and aperture illustration.

## Run locally

Use Node 24 (`nvm use`) and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Astro. No account, backend, or environment file is required. Defaults produce a non-indexed local preview.

## Edit content

- `src/content/pages/`: page introductions and prose in Markdown.
- `src/content/event/2027.yaml`: shared conference identity, dates, venue, contact address, PDF, and confirmed participation links.
- `src/data/themes.yaml`: the six research themes.
- `src/content/speakers/`: one Markdown file per speaker.
- `src/content/program/`: one YAML file per program item.
- `src/content/deadlines/`: one YAML file per deadline.
- `src/content/organizers/`: current committee profiles and local portraits.
- `src/content/pages/exhibits.md` and `src/data/sponsorship.ts`: exhibitor invitation and approved sponsor packages.
- `src/content/archive/2026/`: historical pages at `/2026/`; original supplied prospectus extracts are in `public/archive/2026/`.

See [the editing guide](docs/editing.md) for examples and [the source inventory](docs/content-inventory.md) for information still requiring confirmation. Draft example records are intentionally excluded from the generated website.

## Validate

```sh
npm run verify
npm run test:matrix
npx playwright install chromium webkit
npm run test:browser
```

The matrix checks both GitHub project paths and a custom-domain root. It also builds a separate fixture site with populated speakers, a portrait, a deadline, and a schedule. Test content never enters the production build. Browser checks cover current and archived pages at five widths, Chromium and mobile WebKit, accessibility, reduced motion, the menu, no-JavaScript navigation, long content, and edition-specific migration behavior. Artifacts are written to the ignored `artifacts/` folder.

Run `npm run format` before committing changes. GitHub Actions checks pull requests; successful checks on `main` trigger deployment.

## Publish

The deployment workflow uses GitHub Pages and reads its configured origin and project path through the official Pages action. Choose **GitHub Actions** as the Pages source in repository settings. An account-level custom domain is inherited automatically: this repository’s initial preview is `https://ritwikgupta.me/cisa-conference-website/`.

For custom-domain launch, follow [the deployment guide](docs/deployment.md). Do not change DNS until the preview has been checked and content is ready.

## Design assets

The aperture motif, CISA wordmark, and social card are original SVG artwork in this repository. Inter is self-hosted through Fontsource under the SIL Open Font License. Institutional marks remain the property of their respective organizations; sources are recorded in the content inventory.
