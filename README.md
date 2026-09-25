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

See [the editing guide](docs/editing.md) for examples and [the source inventory](docs/content-inventory.md) for information still requiring confirmation. Draft example records are intentionally excluded from the generated website.

## Validate

```sh
npm run verify
npm run test:matrix
npx playwright install chromium webkit
npm run test:browser
```

The matrix checks both GitHub project paths and a custom-domain root. It also builds a separate fixture site with populated speakers, a portrait, a deadline, and a schedule. Test content never enters the production build. Browser checks cover all six pages at the requested five widths, Chromium and mobile WebKit, accessibility, reduced motion, the menu, no-JavaScript navigation, and long content. Artifacts are written to the ignored `artifacts/` folder.

Run `npm run format` before committing changes. GitHub Actions checks pull requests; successful checks on `main` trigger deployment.

## Publish

The deployment workflow uses GitHub Pages, initially at `https://OWNER.github.io/REPOSITORY/`. It derives the owner and project path from repository metadata. Choose **GitHub Actions** as the Pages source in repository settings.

For custom-domain launch, follow [the deployment guide](docs/deployment.md). Do not change DNS until the preview has been checked and content is ready.

## Design assets

The aperture motif, CISA wordmark, and social card are original SVG artwork in this repository. Inter is self-hosted through Fontsource under the SIL Open Font License. Institutional marks remain the property of their respective organizations; sources are recorded in the content inventory.
