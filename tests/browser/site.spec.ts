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

test('artwork loops, pauses by keyboard, and respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const art = page.locator('[data-aperture]');
  const signal = art.locator('.aperture-signal').first();
  await art.scrollIntoViewIfNeeded();
  await expect(art).toHaveClass(/is-running/);
  const elapsed = () => signal.evaluate((el) => Number(el.getAnimations()[0]?.currentTime || 0));
  const before = await elapsed();
  await expect.poll(elapsed).toBeGreaterThan(before + 100);
  const timing = await signal.evaluate((el) => {
    const animation = el.getAnimations()[0];
    return {
      duration: animation.effect!.getTiming().duration,
      repeats: animation.effect!.getTiming().iterations === Infinity,
    };
  });
  expect(timing).toEqual({ duration: 12000, repeats: true });
  await expect(art.locator('.aperture-focus')).toHaveCSS('filter', 'none');
  const pause = page.getByRole('button', { name: 'Pause aperture animation', exact: true });
  await pause.focus();
  await page.keyboard.press('Space');
  const resume = page.getByRole('button', { name: 'Resume aperture animation', exact: true });
  await expect(resume).toBeFocused();
  await expect(art).not.toHaveClass(/is-running/);
  await expect(signal).toHaveCSS('animation-play-state', 'paused');
  await page.keyboard.press('Enter');
  await expect(art).toHaveClass(/is-running/);

  // Check both sides of the cycle boundary without a slow wall-clock sleep.
  const boundary = await art.evaluate((figure) => {
    const signals = [...figure.querySelectorAll('.aperture-signal')];
    const sample = (time: number) =>
      signals.map((el) => {
        const animation = el.getAnimations()[0];
        animation.pause();
        animation.currentTime = time;
        return Number(getComputedStyle(el).opacity);
      });
    const before = sample(23990);
    const after = sample(24010);
    signals.forEach((el) => el.getAnimations()[0].play());
    return { before, after };
  });
  boundary.before.forEach((value, i) =>
    expect(Math.abs(value - boundary.after[i])).toBeLessThan(0.01),
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(pause).toBeHidden();
  await expect(signal).toHaveCSS('animation-name', 'none');
  await expect(signal).toHaveCSS('opacity', '0.65');
  await expect(art.locator('.aperture-focus')).toHaveCSS('filter', 'none');
});

test('artwork pauses out of view and in hidden tabs without overriding a manual pause', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const art = page.locator('[data-aperture]');
  await art.scrollIntoViewIfNeeded();
  await expect(art).toHaveClass(/is-running/);
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(art).not.toHaveClass(/is-running/);
  await art.scrollIntoViewIfNeeded();
  await expect(art).toHaveClass(/is-running/);

  // Headless browsers keep tabs visible. Dispatch the browser lifecycle event
  // with its visibility value to exercise the same handler in both engines.
  const visibility = (hidden: boolean) =>
    page.evaluate((value) => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => value });
      document.dispatchEvent(new Event('visibilitychange'));
    }, hidden);
  await visibility(true);
  await expect(art).not.toHaveClass(/is-running/);
  await visibility(false);
  await expect(art).toHaveClass(/is-running/);
  await page.getByRole('button', { name: 'Pause aperture animation', exact: true }).click();
  await page.locator('footer').scrollIntoViewIfNeeded();
  await visibility(true);
  await visibility(false);
  await art.scrollIntoViewIfNeeded();
  await expect(art).not.toHaveClass(/is-running/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(art).not.toHaveClass(/is-running/);
  await page.getByRole('button', { name: 'Resume aperture animation', exact: true }).click();
  await expect(art).toHaveClass(/is-running/);
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
  await expect(page.getByRole('button', { name: 'Pause aperture animation' })).toBeHidden();
  await expect(page.locator('.aperture-signal').first()).toHaveCSS('animation-name', 'none');
  await expect(page.getByRole('img', { name: 'Synthetic-aperture imaging' })).toBeVisible();
  await page.getByRole('link', { name: 'Technical program', exact: true }).click();
  await expect(page.locator('#research-themes')).toBeVisible();
  await page.goto('http://127.0.0.1:4321/attend/');
  await page.getByText('Is CISA 2027 an in-person conference?', { exact: true }).click();
  await expect(page.locator('details[open]')).toContainText('Yes.');
  await context.close();
});

test('populated speaker and schedule layouts handle long content', async ({ page }) => {
  for (const route of ['/', '/speakers/', '/speakers/fixture-current/', '/program/']) {
    await page.goto(`http://127.0.0.1:4322${route}`);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
      ).toBe(false);
      await page.screenshot({
        path: `artifacts/screenshots/${test.info().project.name}-populated-${route.replaceAll('/', '') || 'home'}-${width}.png`,
        fullPage: true,
      });
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
