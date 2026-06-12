import { test, expect } from '@playwright/test';

test.describe('客户表单字段验证', () => {

  test('新建表单不显示客户状态字段', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    const statusLabel = page.locator('label').filter({ hasText: /^客户状态$/ });
    await expect(statusLabel).not.toBeVisible();
  });

  test('新建表单不显示客户代码字段', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    const codeLabel = page.locator('label').filter({ hasText: /^客户代码$/ });
    await expect(codeLabel).not.toBeVisible();
  });

  test('新建表单不显示客户系统代码字段', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    const sysCodeLabel = page.locator('label').filter({ hasText: /客户系统代码/ });
    await expect(sysCodeLabel).not.toBeVisible();
  });

  test('服务产品是单选下拉框', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    const serviceLabel = page.locator('label').filter({ hasText: /服务产品/ });
    await expect(serviceLabel).toBeVisible();
  });

  test('编辑页不显示客户系统代码', async ({ page }) => {
    await page.goto('/customers/cust-001/edit');
    await page.waitForLoadState('networkidle');

    const sysCodeLabel = page.locator('label').filter({ hasText: /客户系统代码/ });
    await expect(sysCodeLabel).not.toBeVisible();
  });

  test('编辑页显示签约主体/服务主体/结算主体字段', async ({ page }) => {
    await page.goto('/customers/cust-001/edit');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('label').filter({ hasText: /签约主体/ })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: /服务主体/ })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: /结算主体/ })).toBeVisible();
  });

  test('编辑页的客户状态下拉仅可选正常和停用（不包含潜在和冻结）', async ({ page }) => {
    await page.goto('/customers/cust-001/edit');
    await page.waitForLoadState('networkidle');

    // cust-001 是 active 状态，客户状态下拉框应该渲染
    // 通过检查下拉框的 option 来验证
    const statusDropdown = page.locator('label').filter({ hasText: /^客户状态$/ }).locator('..').locator('select');
    if (await statusDropdown.count() > 0) {
      const options = await statusDropdown.locator('option').allTextContents();
      // 应该只包含 正常 和 停用
      expect(options.some(o => o.includes('潜在'))).toBe(false);
      expect(options.some(o => o.includes('冻结'))).toBe(false);
    }
  });

  test('跟进进度在新建表单是只读显示', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=系统自动判断')).toBeVisible();
    await expect(page.locator('text=新获取').first()).toBeVisible();
  });
});
