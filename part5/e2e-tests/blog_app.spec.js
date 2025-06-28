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
      await expect(page.getByText('Blog E2E Author E2E').first()).toBeVisible();
    });

    test('a blog can be liked', async ({ page }) => {
      await page.getByRole('button', { name: 'view' }).first().click();
      const likeButton = page.getByRole('button', { name: 'like' });
      await likeButton.click();
      await expect(page.getByText(/likes 1/)).toBeVisible();
    });

    test('the creator can delete their blog', async ({ page }) => {
      // Crear un blog
      await page.getByRole('button', { name: 'create new blog' }).click();
      await page.getByLabel('title').fill('Blog to delete');
      await page.getByLabel('author').fill('Author Delete');
      await page.getByLabel('url').fill('http://delete.com');
      await page.getByRole('button', { name: 'create' }).click();

      // Buscar el blog recién creado y mostrar sus detalles
      const blogEntry = page.getByText('Blog to delete Author Delete').first();
      // Subir al contenedor del blog y buscar el botón "view"
      const blogContainer = blogEntry.locator('..');
      await blogContainer.getByRole('button', { name: 'view' }).click();

      // Esperar a que el botón "remove" esté visible y hacer clic
      await expect(blogContainer.getByRole('button', { name: 'remove' })).toBeVisible();
      page.once('dialog', dialog => dialog.accept());
      await blogContainer.getByRole('button', { name: 'remove' }).click();

      // Verificar que el blog ya no está en la lista
      await expect(page.getByText('Blog to delete Author Delete')).not.toBeVisible();
    });
  });
});