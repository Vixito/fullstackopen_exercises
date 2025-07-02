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
        password: 'testpass',
      },
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
      page.once('dialog', (dialog) => dialog.accept());
      await blogContainer.getByRole('button', { name: 'remove' }).click();

      // Verificar que el blog ya no está en la lista
      await expect(page.getByText(/^Blog to delete Author Delete$/)).not.toBeVisible();
    });

    test('only the creator sees the remove button', async ({ page, request }) => {
      // Crear un blog como testuser
      await page.getByRole('button', { name: 'create new blog' }).click();
      await page.getByLabel('title').fill('Blog private');
      await page.getByLabel('author').fill('Author Private');
      await page.getByLabel('url').fill('http://private.com');
      await page.getByRole('button', { name: 'create' }).click();

      // Cerrar sesión
      await page.getByRole('button', { name: /logout/i }).click();

      // Crear y loguear otro usuario
      await request.post('http://localhost:3001/api/users', {
        data: {
          username: 'otheruser',
          name: 'Other User',
          password: 'otherpass',
        },
      });
      await page.locator('input[name="Username"]').fill('otheruser');
      await page.locator('input[name="Password"]').fill('otherpass');
      await page.getByRole('button', { name: 'login' }).click();

      // Buscar el blog y mostrar detalles
      const blogEntry = page.getByText('Blog private Author Private').first();
      const blogContainer = blogEntry.locator('..');
      await blogContainer.getByRole('button', { name: 'view' }).click();

      // Verificar que el botón "remove" NO está visible
      await expect(blogContainer.getByRole('button', { name: 'remove' })).toHaveCount(0);
    });

    test('blogs are ordered by likes in descending order', async ({ page, request }) => {
      // Crear varios blogs con diferentes likes usando la API
      const tokenResponse = await request.post('http://localhost:3001/api/login', {
        data: { username: 'testuser', password: 'testpass' },
      });
      const token = tokenResponse.ok() ? (await tokenResponse.json()).token : null;

      const blogs = [
        { title: 'Most liked', author: 'A', url: 'http://a.com', likes: 10 },
        { title: 'Second liked', author: 'B', url: 'http://b.com', likes: 7 },
        { title: 'Least liked', author: 'C', url: 'http://c.com', likes: 2 },
      ];

      for (const blog of blogs) {
        await request.post('http://localhost:3001/api/blogs', {
          data: blog,
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      await page.reload();

      // Expandir todos los blogs para ver los likes
      const viewButtons = await page.getByRole('button', { name: 'view' }).all();
      for (const btn of viewButtons) {
        await btn.click();
      }

      // Obtener los textos de los blogs en pantalla
      const blogElements = await page.locator('.blog').all();
      const likes = [];
      for (const blog of blogElements) {
        const text = await blog.textContent();
        const match = text.match(/likes (\d+)/);
        if (match) likes.push(Number(match[1]));
      }

      // Comprobar que están ordenados de mayor a menor
      const sorted = [...likes].sort((a, b) => b - a);
      expect(likes).toEqual(sorted);
    });
  });
});
