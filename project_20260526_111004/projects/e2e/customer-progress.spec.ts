import { test, expect } from '@playwright/test';

test.describe('客户跟进进度自动流转', () => {

  test('客户详情页显示 ProgressStepper 进度条', async ({ page }) => {
    await page.goto('/customers/cust-001');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=新获取').or(page.locator('text=待跟进')).or(page.locator('text=初步意向')).first()).toBeVisible({ timeout: 3000 });
  });

  test('ProgressStepper 为只读，不可点击操作', async ({ page }) => {
    await page.goto('/customers/cust-001');
    await page.waitForLoadState('networkidle');

    const stepperButtons = page.locator('[class*="stepper"] button, [class*="progress"] button');
    const count = await stepperButtons.count();
    expect(count).toBe(0);
  });

  test('客户详情页显示当前跟进状态标签', async ({ page }) => {
    await page.goto('/customers/cust-001');
    await page.waitForLoadState('networkidle');

    // 应用材料(cust-001) 的进度状态是 deal_closed/opportunity_confirmed → 成交/商机确认
    await expect(page.locator('text=成交').or(page.locator('text=商机确认')).first()).toBeVisible({ timeout: 3000 });
  });

  test('新建客户表单跟进进度显示系统自动判断', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    // 检查页面显示"系统自动判断"
    await expect(page.locator('text=系统自动判断')).toBeVisible({ timeout: 3000 });
    // 显示当前进度
    await expect(page.locator('text=新获取').first()).toBeVisible({ timeout: 3000 });
  });
});
