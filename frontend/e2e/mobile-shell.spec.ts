import { expect, test } from '@playwright/test'

test.describe('mobile app shell', () => {
  test('renders the error list without horizontal scrolling', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Errors', level: 1 })).toBeVisible()

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('brand link meets the 44px minimum touch target', async ({ page }) => {
    await page.goto('/')
    const box = await page.getByRole('link', { name: 'Error Vault' }).boundingBox()
    expect(box).not.toBeNull()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })

  test('unknown routes show the not-found page', async ({ page }) => {
    await page.goto('/does-not-exist')
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  })
})
