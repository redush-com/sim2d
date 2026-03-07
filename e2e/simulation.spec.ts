import { test, expect } from '@playwright/test';

test.describe('Simulation', () => {
	test('boids simulation starts with a canvas', async ({ page }) => {
		await page.goto('/sim/boids');
		const canvas = page.locator('canvas');
		await expect(canvas).toBeVisible();
	});

	test('side panel has sliders', async ({ page }) => {
		await page.goto('/sim/boids');
		await expect(page.locator('.sim-panel')).toBeVisible();

		const sliders = page.locator('.sim-panel input[type="range"]');
		const sliderCount = await sliders.count();
		expect(sliderCount).toBeGreaterThan(0);
	});

	test('back button navigates to main menu', async ({ page }) => {
		await page.goto('/sim/boids');
		await expect(page.locator('.sim-layout')).toBeVisible();

		const backBtn = page.locator('.sim-back-btn');
		await backBtn.click();
		await expect(page.locator('.menu-title')).toHaveText('sim2d');
	});
});
