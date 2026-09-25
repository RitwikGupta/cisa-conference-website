import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/program/', '/speakers/', '/contribute/', '/attend/', '/about/'];
const widths = [360, 390, 768, 1024, 1440];

for (const route of routes) {
  test(`${route} is readable across all five widths and accessible`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('footer nav')).toHaveCount(0);
    await expect(page.locator('footer a[href="mailto:info@cisa-conference.org"]')).toBeVisible();
    await expect(page.locator('main')).not.toContainText(
      /named in the 2027 call for papers|host institution|is issued by/i,
    );
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

test('hero background spans the section and leaves links and playback accessible', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const hero = page.locator('.hero');
  const art = page.locator('[data-aperture]');
  const control = art.getByRole('button', { name: 'Pause aperture animation' });
  await expect(control).toBeVisible();
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    const heroBox = (await hero.boundingBox())!;
    const artBox = (await art.boundingBox())!;
    const controlBox = (await control.boundingBox())!;
    expect(heroBox.x).toBe(0);
    expect(heroBox.width).toBe(width);
    expect(artBox).toEqual(heroBox);
    expect(controlBox.width).toBeGreaterThanOrEqual(44);
    expect(controlBox.height).toBeGreaterThanOrEqual(44);
    for (const link of await hero.getByRole('link').all()) {
      await link.scrollIntoViewIfNeeded();
      const controlBox = (await control.boundingBox())!;
      const box = (await link.boundingBox())!;
      const overlaps =
        box.x < controlBox.x + controlBox.width &&
        box.x + box.width > controlBox.x &&
        box.y < controlBox.y + controlBox.height &&
        box.y + box.height > controlBox.y;
      expect(overlaps, `hero link overlaps playback at ${width}px`).toBe(false);
      expect(
        await link.evaluate((element) => {
          const box = element.getBoundingClientRect();
          return element.contains(
            document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2),
          );
        }),
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await hero.getByRole('link', { name: 'Call for papers', exact: true }).click();
  await expect(page).toHaveURL(/\/contribute\/$/);
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
    const signals = [...figure.querySelectorAll('.aperture-motion')];
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
  await expect(art.locator('.aperture-resolved')).toHaveCSS('opacity', '1');
  await expect(art.locator('.aperture-coarse')).toHaveCSS('opacity', '0');
  await expect(art.locator('.aperture-packet').first()).toHaveCSS('opacity', '0');
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
  await expect(page.locator('.aperture-resolved')).toHaveCSS('opacity', '1');
  await expect(page.locator('.aperture-coarse')).toHaveCSS('opacity', '0');
  await page.getByRole('link', { name: 'Technical program', exact: true }).click();
  await expect(page.locator('#research-themes')).toBeVisible();
  await page.goto('http://127.0.0.1:4321/attend/');
  await page.getByText('Is CISA 2027 an in-person conference?', { exact: true }).click();
  await expect(page.locator('details[open]')).toContainText('Yes.');
  await context.close();
});

test('populated speaker and schedule layouts handle long content', async ({ page }) => {
  for (const route of [
    '/',
    '/speakers/',
    '/speakers/fixture-current/',
    '/program/',
    '/contribute/',
  ]) {
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

test('measurement pulses travel and reconstruction resolves before the cycle fades', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const art = page.locator('[data-aperture]');
  await expect(art).toHaveClass(/is-running/);
  const phase = (time: number) =>
    art.evaluate((figure, time) => {
      figure.querySelectorAll('.aperture-motion').forEach((element) => {
        const animation = element.getAnimations()[0];
        animation.pause();
        animation.currentTime = time;
      });
      const opacity = (selector: string) =>
        Number(getComputedStyle(figure.querySelector(selector)!).opacity);
      return {
        coarse: opacity('.aperture-coarse'),
        intermediate: opacity('.aperture-intermediate'),
        resolved: opacity('.aperture-resolved'),
        signals: [...figure.querySelectorAll('.aperture-signal')].map((el) =>
          Number(getComputedStyle(el).opacity),
        ),
        packet: parseFloat(
          getComputedStyle(figure.querySelector('.aperture-packet')!).strokeDashoffset,
        ),
      };
    }, time);
  expect(await phase(0)).toMatchObject({ coarse: 1, intermediate: 0, resolved: 0 });
  for (let i = 0; i < 9; i++) {
    const state = await phase(400 + i * 850);
    expect(state.signals[i]).toBeGreaterThan(0.9);
  }
  const start = await phase(300);
  const later = await phase(600);
  expect(later.packet).toBeLessThan(start.packet);
  expect((await phase(4500)).intermediate).toBe(1);
  expect(await phase(9000)).toMatchObject({ coarse: 0, intermediate: 0, resolved: 1 });
  expect((await phase(10000)).resolved).toBeGreaterThan(0.99);
  const reset = await phase(11000);
  expect(reset.coarse).toBeCloseTo(0.5, 2);
  expect(reset.resolved).toBeCloseTo(0.5, 2);
});

test('flyer dates are consistent across pages and preserve date-only precision', async ({
  page,
}) => {
  const expected = [
    ['proposals', '2026-12-01', 'December 1, 2026'],
    ['initial-submissions', '2027-01-29', 'January 29, 2027'],
    ['climate-submissions', '2027-01-29', 'January 29, 2027'],
    ['acceptance', '2027-02-19', 'February 19, 2027'],
    ['advance-registration', '2027-03-05', 'March 5, 2027'],
    ['camera-ready', '2027-05-07', 'May 7, 2027'],
  ];
  for (const route of ['/', '/contribute/']) {
    await page.goto(route);
    await expect(page.locator('[data-deadline]')).toHaveCount(6);
    for (const [id, date, label] of expected) {
      const time = page.locator(`[data-deadline="${id}"] time`);
      await expect(time).toHaveAttribute('datetime', date);
      await expect(time).toHaveText(label);
    }
  }
  await expect(page.locator('article.prose ul li strong')).toHaveCount(17);
  await expect(page.locator('article.prose')).toContainText('4+1-page');
  await page.goto('/attend/');
  await expect(page.locator('[data-deadline="advance-registration"] time')).toHaveText(
    'March 5, 2027',
  );
  await page.goto('http://127.0.0.1:4322/contribute/');
  const timed = page.locator('[data-deadline="fixture"] time');
  await expect(timed).toHaveAttribute('datetime', '2027-01-29T23:59:00-05:00');
  await expect(timed).toContainText('2027, 11:59 p.m. Eastern');
});
