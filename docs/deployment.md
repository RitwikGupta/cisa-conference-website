# GitHub Pages deployment

## Preview

1. Push the repository to GitHub and choose **GitHub Actions** in Settings → Pages → Build and deployment.
2. The Check website workflow checks types, content publication, links, both hosting configurations, and browser behavior.
3. After checks pass on a push to `main`, the deployment workflow builds that checked commit and publishes its `dist` artifact.

The default origin is `https://OWNER.github.io` and the default base is `/REPOSITORY/`. All links and assets use this base. The default preview emits `noindex, nofollow` and a blocking `robots.txt`; this is search-engine guidance, not access control.

Repository variables can override the defaults:

| Variable           | Project preview example   | Custom-domain production      |
| ------------------ | ------------------------- | ----------------------------- |
| `SITE_URL`         | `https://OWNER.github.io` | `https://cisa-conference.org` |
| `BASE_PATH`        | `/REPOSITORY/`            | `/`                           |
| `PUBLIC_INDEXABLE` | `false`                   | `true`                        |

`SITE_URL` must contain only an origin, never the project path. Set `BASE_PATH=/` explicitly for an account-level `OWNER.github.io` repository.

## Custom-domain transition

1. Verify content and the project preview. Record the currently deployed commit for rollback.
2. Verify domain ownership in GitHub and set `cisa-conference.org` as the custom domain in the repository’s Pages settings.
3. Update the three repository variables to the production values above and run the deployment workflow.
4. Configure DNS using GitHub’s current official [custom domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site). Keep existing email/MX records unchanged.
5. Enable HTTPS once the certificate is available. Check the homepage, a nested page, a legacy redirect, fonts, logos, the PDF, the calendar, canonical URLs, sitemap, and robots.txt on the actual domain.

The Actions deployment manages the Pages artifact. Configure the custom domain in Pages settings; a source `CNAME` file is not used to configure this custom-workflow deployment.

No DNS changes are part of the initial preview release.

## Rollback

Revert the content or code change on `main` and let checks and deployment run again. For a domain transition issue, restore the previous Pages configuration, repository variables, and recorded DNS values before redeploying the previous working content.

## Validation artifacts

Browser screenshots and reports are uploaded by CI for 14 days. Locally, they are ignored under `artifacts/`. The fixture site under `.local/` is test-only and is never uploaded as the Pages artifact.
