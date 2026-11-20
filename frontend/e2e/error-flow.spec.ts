import { expect, test } from '@playwright/test'

// Runs against the real backend (http://localhost:8080) and PostgreSQL.
// Start them first: `docker compose up -d db` and `cd backend && ./mvnw spring-boot:run`.
// Each run uses a unique title so it does not depend on existing data.
test('create, search, view, edit and delete an error on a phone', async ({ page }) => {
  const stamp = Date.now()
  const title = `NPE in UserService ${stamp}`
  const edited = `${title} (fixed)`

  await page.goto('/')
  await page.getByRole('link', { name: 'New error' }).first().click()
  await expect(page.getByRole('heading', { name: 'New error' })).toBeVisible()

  await page.getByLabel(/Title/).fill(title)
  await page.getByLabel(/Error message/).fill('java.lang.NullPointerException: user is null')
  await page.getByLabel('Source').fill('Java')
  await page.getByLabel('Tags').fill('NPE, spring')
  await page.getByRole('button', { name: 'Save error' }).click()

  // Saved: lands on the detail page.
  await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible()
  await expect(page.getByText('java.lang.NullPointerException: user is null')).toBeVisible()

  // Search from the list by a word in the message.
  await page.getByRole('link', { name: '← All errors' }).click()
  await page.getByRole('searchbox').fill('user is null')
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(page.getByRole('link', { name: new RegExp(title) })).toBeVisible()

  // Edit the title.
  await page.getByRole('link', { name: new RegExp(title) }).click()
  await page.getByRole('link', { name: 'Edit' }).click()
  await page.getByLabel(/Title/).fill(edited)
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByRole('heading', { name: edited, level: 1 })).toBeVisible()

  // Delete (confirm dialog accepted) returns to the list without the record.
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByRole('heading', { name: 'Errors', level: 1 })).toBeVisible()
  await page.getByRole('searchbox').fill(edited)
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(page.getByText('No errors match this search.')).toBeVisible()
})

test('form shows validation messages before sending', async ({ page }) => {
  await page.goto('/errors/new')
  await page.getByRole('button', { name: 'Save error' }).click()
  await expect(page.getByText('Title is required')).toBeVisible()
  await expect(page.getByText('Error message is required')).toBeVisible()
})
