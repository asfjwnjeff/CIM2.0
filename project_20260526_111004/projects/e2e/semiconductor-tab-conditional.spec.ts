import { test, expect } from '@playwright/test';

test.describe('半导体Tab条件显示', () => {

  test('编辑页-半导体客户显示半导体产业链定位Tab', async ({ page }) => {
    // cust-001 应用材料 industryCategory=半导体
    await page.goto('/customers/cust-001/edit');
    await page.waitForLoadState('networkidle');
    const semiTab = page.locator('button').filter({ hasText: '半导体产业链定位' });
    await expect(semiTab).toBeVisible({ timeout: 3000 });
  });

  test('详情页-半导体客户显示半导体产业链定位Tab', async ({ page }) => {
    await page.goto('/customers/cust-001');
    await page.waitForLoadState('networkidle');
    const semiTab = page.locator('button').filter({ hasText: '半导体产业链定位' });
    await expect(semiTab).toBeVisible({ timeout: 3000 });
  });
});
