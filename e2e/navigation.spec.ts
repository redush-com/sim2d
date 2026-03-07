import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
	test('/ shows the main menu', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('.menu-title')).toHaveText('sim2d');
		await expect(page.locator('.menu-grid')).toBeVisible();
	});

	test('/sim/boids shows a simulation with canvas', async ({ page }) => {
		await page.goto('/sim/boids');
		await expect(page.locator('.sim-layout')).toBeVisible();
		await expect(page.locator('canvas')).toBeVisible();
	});

	test('/login shows the sign-in page', async ({ page }) => {
		await page.goto('/login');
		await expect(page.locator('.login-wrapper')).toBeVisible();
	});

	test('/profile redirects to /login when not authenticated', async ({ page }) => {
		await page.goto('/profile');
		await page.waitForURL('**/login');
		await expect(page.locator('.login-wrapper')).toBeVisible();
	});

	test('clicking the logo navigates to home', async ({ page }) => {
		await page.goto('/sim/boids');
		await expect(page.locator('.sim-layout')).toBeVisible();

		const logo = page.locator('.navbar-logo');
		await logo.click();
		await expect(page.locator('.menu-title')).toHaveText('sim2d');
	});

	test('unknown routes redirect to home', async ({ page }) => {
		await page.goto('/nonexistent-route');
		await expect(page.locator('.menu-title')).toHaveText('sim2d');
	});
});
