const { test, expect, beforeEach, describe } = require('@playwright/test');
const apiUrl = 'http://localhost:3001/api';

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // Vacía la base de datos
    await request.post(`${apiUrl}/testing/reset`);
    // Crea usuario
    await request.post(`${apiUrl}/users`, {
      data: {
        username: 'testuser',
        name: 'Test User',
        password: 'testpass'
      }
    });
    await page.goto('http://localhost:5173');
  });

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Log in to application')).toBeVisible();
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible();
    await expect(page.locator('input[name="Username"]')).toBeVisible();
    await expect(page.locator('input[name="Password"]')).toBeVisible();
  });

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.locator('input[name="Username"]').fill('testuser');
      await page.locator('input[name="Password"]').fill('testpass');
      await page.getByRole('button', { name: 'login' }).click();
      await expect(page.getByText(/logged in/i)).toBeVisible();
    });

    test('fails with wrong credentials', async ({ page }) => {
      await page.locator('input[name="Username"]').fill('testuser');
      await page.locator('input[name="Password"]').fill('wrongpass');
      await page.getByRole('button', { name: 'login' }).click();
      await expect(page.getByText(/wrong credentials/i)).toBeVisible();
    });
  });

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.locator('input[name="Username"]').fill('testuser');
      await page.locator('input[name="Password"]').fill('testpass');
      await page.getByRole('button', { name: 'login' }).click();
    });

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click();
      await page.getByLabel('title').fill('Blog E2E');
      await page.getByLabel('author').fill('Author E2E');
      await page.getByLabel('url').fill('http://e2e.com');
      await page.getByRole('button', { name: 'create' }).click();
      await expect(page.getByText('Blog E2E Author E2E')).toBeVisible();
    });
  });
})