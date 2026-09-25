import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/program/', '/speakers/', '/contribute/', '/attend/', '/about/'];
const widths = [360, 390, 768, 1024, 1440];

for (const route of routes) {
  test(`${route} is readable across all five widths and accessible`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.locator('main')).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(overflow, `${route} overflows at ${width}px`).toBe(false);
      await page.screenshot({
        path: `artifacts/screenshots/${test.info().project.name}-${route.replaceAll('/', '') || 'home'}-${width}.png`,
        fullPage: true,
      });
    }
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  });
}

test('mobile menu opens, closes with Escape, and returns focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menu' });
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(navigation).toBeHidden();
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(navigation).toBeHidden();
  await expect(menu).toBeFocused();
  await menu.click();
  await navigation.getByRole('link', { name: 'Program', exact: true }).click();
  await expect(page).toHaveURL(/\/program\/$/);
  await expect(page.locator('h1')).toBeVisible();
});

test('keyboard skip link reaches main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('artwork finishes, can replay, and respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const art = page.locator('[data-aperture]');
  await art.scrollIntoViewIfNeeded();
  const replay = page.getByRole('button', { name: /Replay the four-second/ });
  await expect(replay).toBeEnabled({ timeout: 7000 });
  await replay.click();
  await expect(art).toHaveClass(/is-running/);
  await expect(replay).toBeDisabled();
  await expect(replay).toBeEnabled({ timeout: 7000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(replay).toBeHidden();
  await expect(art).not.toHaveClass(/is-running/);
});

test('essential pages and navigation work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
  await expect(page.getByRole('button', { name: /Replay/ })).toBeHidden();
  await page.getByRole('link', { name: 'Explore the program', exact: true }).click();
  await expect(page.locator('#research-themes')).toBeVisible();
  await page.goto('http://127.0.0.1:4321/attend/');
  await page.getByText('Is CISA 2027 an in-person conference?', { exact: true }).click();
  await expect(page.locator('details[open]')).toContainText('Yes.');
  await context.close();
});

test('populated speaker and schedule layouts handle long content', async ({ page }) => {
  for (const route of ['/', '/speakers/', '/speakers/fixture-current/', '/program/']) {
    await page.goto(`http://127.0.0.1:4322${route}`);
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
      ).toBe(false);
    }
    expect(await page.locator('body').innerText()).not.toContain('DO_NOT_PUBLISH');
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  }
});

test('200% page-zoom equivalent reflow retains content and controls', async ({ browser }) => {
  // A 1024px display at 200% browser zoom exposes 512 CSS pixels. CSS zoom on
  // body is not browser zoom: it does not trigger viewport media queries.
  const context = await browser.newContext({
    viewport: { width: 512, height: 450 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/contribute/');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
  ).toBe(false);
  await expect(page.getByRole('link', { name: 'Download the PDF' })).toBeVisible();
  await context.close();
});
