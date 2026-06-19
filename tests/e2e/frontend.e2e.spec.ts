import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Premium Luxury Showcase/)

    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
  })
})
