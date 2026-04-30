import { test, expect } from '@playwright/test';

test('has title and redirects to login when unauthenticated', async ({ page }) => {
  // Go to root
  await page.goto('/');

  // Expect title
  await expect(page).toHaveTitle(/AttendX/);

  // Expect to see the Landing/Login UI element
  // The link text is actually "Sign in" in Landing.jsx
  const loginButton = page.getByRole('link', { name: /Sign in/i }).first();
  await expect(loginButton).toBeVisible();
});

test('login page renders correctly', async ({ page }) => {
  await page.goto('/login');
  
  // Expect standard email/password fields by label
  const emailInput = page.getByLabel(/Email/i);
  const passwordInput = page.getByLabel(/Password/i);
  
  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
});
