import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('both editions share the homepage layout and keep navigation and content within their year', async ({
  page,
}) => {
  const followNavigation = async (name: string) => {
    const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true });
    if (await nav.isHidden()) await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await nav.getByRole('link', { name, exact: true }).click();
  };
  await page.goto('/');
  const navigation2027 = (await page.locator('.primary-nav > a').allTextContents()).map((label) =>
    label.trim(),
  );
  const headings2027 = await page.locator('main h2').allTextContents();
  await page.goto('/2026/');
  await expect(page.locator('.hero h1')).toContainText('2026 IEEE Conference');
  await expect(page.locator('.hero .event-details')).toContainText('May 26–29, 2026');
  await expect(page.locator('.hero .event-details')).toContainText('University at Albany');
  await expect(page.locator('.hero .event-details')).not.toContainText('Iribe Center');
  expect(
    (await page.locator('.primary-nav > a').allTextContents()).map((label) => label.trim()),
  ).toEqual(navigation2027);
  expect(await page.locator('main h2').allTextContents()).toEqual(headings2027);
  await expect(page.locator('.archive-notice, .archive-links')).toHaveCount(0);
  await expect(page.locator('.speaker-card')).toHaveCount(3);
  for (const link of await page.locator('.primary-nav > a').all())
    await expect(link).toHaveAttribute('href', /^\/2026\//);
  await followNavigation('Speakers');
  await expect(page.locator('.speaker-card')).toHaveCount(4);
  await page.getByRole('link', { name: 'Jinwei Ye', exact: true }).click();
  await expect(page).toHaveURL(/\/2026\/speakers\/#jinwei-ye$/);
  await expect(page.locator('#jinwei-ye')).toBeVisible();
  await followNavigation('Program');
  await page
    .getByRole('link', { name: 'Introduction to Synthetic Aperture Radar', exact: true })
    .click();
  await expect(page).toHaveURL(/\/2026\/tutorials\/$/);
  await expect(page.locator('main')).toContainText('Armin Doerry');
  await followNavigation('Call for papers');
  await expect(page).toHaveURL(/\/2026\/contribute\/$/);
  await expect(page.locator('main')).toContainText('67324X');
  await expect(page.locator('[data-deadline="initial-submissions"] time')).toHaveAttribute(
    'datetime',
    '2026-03-24',
  );
});

test('header year selector switches editions and supports keyboard dismissal', async ({
  page,
  browserName,
}) => {
  await page.goto('/');
  const switcher = page.locator('.edition-switcher');
  const toggle = switcher.locator('summary');
  const years = page.getByRole('navigation', { name: 'Conference year', exact: true });
  await expect(toggle).toContainText('2027');
  await expect(years).toBeHidden();
  await expect(page.locator('footer a[href="/2026/"]')).toHaveCount(0);
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(years).toBeVisible();
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(years.getByRole('link', { name: '2027', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(years).toBeHidden();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.locator('h1').click();
  await expect(years).toBeHidden();
  await page.setViewportSize({ width: 360, height: 800 });
  await toggle.click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.screenshot({
    path: `artifacts/screenshots/${test.info().project.name}-year-switcher-360.png`,
  });
  await years.getByRole('link', { name: '2026', exact: true }).click();
  await expect(page).toHaveURL(/\/2026\/$/);
  await expect(toggle).toContainText('2026');
  await expect(page.locator('main')).toContainText('University at Albany');
  await toggle.click();
  await years.getByRole('link', { name: '2027', exact: true }).click();
  await expect(page).toHaveURL(/:\d+\/$/);
  await expect(toggle).toContainText('2027');
});

test('header year selector works without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`${baseURL}/`);
    await page.locator('.edition-switcher summary').click();
    await page
      .getByRole('navigation', { name: 'Conference year', exact: true })
      .getByRole('link', { name: '2026', exact: true })
      .click();
    await expect(page).toHaveURL(/\/2026\/$/);
    await expect(page.locator('.edition-switcher summary')).toContainText('2026');
  } finally {
    await context.close();
  }
});

test('current participation information and archived instructions retain their edition', async ({
  page,
}) => {
  await page.goto('/about/');
  await expect(page.locator('.organizer-card')).toHaveCount(9);
  await expect(page.locator('#miguel-heredia-conde')).toContainText('General Co-Chair');
  await page.locator('#bhupendra-raut summary').click();
  await expect(page.locator('#bhupendra-raut details[open]')).toContainText('weather radar');
  await page.goto('/attend/');
  await expect(page.locator('main')).toContainText('Iribe Center');
  await page.goto('/contribute/');
  await expect(page.locator('main a[href*="openreview.net"]')).toHaveCount(0);
  await expect(page.locator('main')).toContainText('The submission portal will be announced.');
  await page.goto('/speakers/');
  await expect(page.locator('main')).toContainText('Speakers will be announced.');
  await page.goto('/keynotes/');
  await expect(page).toHaveURL(/\/2026\/keynotes\/$/);
  await expect(page.locator('main')).toContainText('Harbir Antil');
  await expect(page.locator('.archive-notice')).toHaveCount(0);
  await expect(page.locator('.wordmark-year').first()).toHaveText('2026');
  await page.goto('/submissions/templates/');
  await expect(page).toHaveURL(/\/2026\/submissions\/$/);
  await expect(page.locator('main a[href*="IEEE.org/CISA/2026"]')).toHaveCount(1);
  await page.goto('/climate/');
  await expect(page).toHaveURL(/\/2026\/climate\/$/);
  await page.locator('.edition-switcher summary').click();
  await page
    .getByRole('navigation', { name: 'Conference year', exact: true })
    .getByRole('link', { name: '2027', exact: true })
    .click();
  await expect(page.locator('.wordmark-year').first()).toHaveText('2027');
});

test('sponsor packages match the approved benefits and fit mobile screens', async ({ page }) => {
  await page.goto('/exhibits/');
  const table = page.getByRole('table');
  for (const price of ['$8,000', '$6,000', '$4,000', '$2,000'])
    await expect(table).toContainText(price);
  const expected = [
    ['Best paper award sponsor', 1],
    ['Name and logo on event signage', 2],
    ['Exhibit booth space', 2],
    ['Career event at a local restaurant', 3],
    ['Option to organize a conference workshop or panel', 3],
    ['Recognition in conference emails and announcements', 3],
    ['Promotion on the conference website and in the daily newsletter', 4],
    ['Acknowledgment during the opening reception and banquet', 4],
  ] as const;
  for (const [benefit, included] of expected)
    await expect(
      table.getByRole('row').filter({ hasText: benefit }).locator('td.included'),
    ).toHaveCount(included);
  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  const region = page.getByRole('region', { name: 'Sponsor package comparison' });
  expect(await region.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await expect(
    page.getByRole('link', { name: 'info@cisa-conference.org' }).first(),
  ).toHaveAttribute('href', /mailto:info@cisa-conference.org/);
});
