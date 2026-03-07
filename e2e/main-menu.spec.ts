import { test, expect } from '@playwright/test';

test.describe('Main Menu', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('loads with the correct title', async ({ page }) => {
		const title = page.locator('.menu-title');
		await expect(title).toHaveText('sim2d');
	});

	test('displays at least 5 simulation cards', async ({ page }) => {
		const cards = page.locator('.sim-card');
		await expect(cards).toHaveCount(6);
	});

	test('clicking a card navigates to the simulation page', async ({ page }) => {
		const firstCard = page.locator('.sim-card').first();
		await firstCard.click();
		await expect(page.locator('.sim-layout')).toBeVisible();
		await expect(page.locator('canvas')).toBeVisible();
	});

	test('back button returns to the main menu', async ({ page }) => {
		const firstCard = page.locator('.sim-card').first();
		await firstCard.click();
		await expect(page.locator('.sim-layout')).toBeVisible();

		const backBtn = page.locator('.sim-back-btn');
		await backBtn.click();
		await expect(page.locator('.menu-title')).toHaveText('sim2d');
	});

	test('tag filter pills are visible and clickable', async ({ page }) => {
		const pills = page.locator('.tag-filter-pill');
		await expect(pills.first()).toBeVisible();

		const pillCount = await pills.count();
		expect(pillCount).toBeGreaterThanOrEqual(2);

		// Click a non-"All" pill and verify it becomes active
		const secondPill = pills.nth(1);
		await secondPill.click();
		await expect(secondPill).toHaveClass(/tag-filter-pill--active/);
	});
});
