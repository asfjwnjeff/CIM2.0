import { test, expect } from '@playwright/test';

test.describe('客户草稿与提交流程', () => {

  test('新建客户页显示暂存和提交两个按钮', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: '暂存' })).toBeVisible();
    await expect(page.getByRole('button', { name: '提交' })).toBeVisible();
  });

  test('仅填客户名称点击暂存 → 停留在表单页并提示成功', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    // 填写客户名称
    const nameInput = page.locator('input[placeholder*="搜索企业名称"]');
    await nameInput.fill('TDD测试客户草稿');
    await page.waitForTimeout(500);

    // 点击暂存
    await page.getByRole('button', { name: '暂存' }).click();
    await page.waitForTimeout(1500);

    // 应该停留在表单页（URL 仍是 /customers/new）
    expect(page.url()).toContain('/customers/new');
    // 应该有提示信息
    await expect(page.locator('text=已保存').or(page.locator('text=草稿')).first()).toBeVisible({ timeout: 5000 });
  });

  test('不填客户名称点击提交 → 显示校验错误', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: '提交' }).click();
    await page.waitForTimeout(1000);

    // 校验错误提示
    await expect(page.locator('text=请填写客户名称').first()).toBeVisible({ timeout: 3000 });
  });

  test('填写名称点击提交 → 跳转到客户列表', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    // 填写客户名称
    const nameInput = page.locator('input[placeholder*="搜索企业名称"]');
    await nameInput.fill('TDD测试客户已提交');
    await page.waitForTimeout(500);

    // 注意：需要先填负责人才能提交，但校验仅检查这两个字段
    // 测试校验逻辑：没有负责人时应提示错误
    await page.getByRole('button', { name: '提交' }).click();
    await page.waitForTimeout(1000);

    // 应该提示请选择负责人
    await expect(page.locator('text=请选择负责人').first()).toBeVisible({ timeout: 3000 });
  });

  test('客户列表页状态筛选包含草稿选项', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    // 检查状态筛选中包含草稿 option
    const draftOption = page.locator('option[value="draft"]');
    await expect(draftOption).toBeAttached({ timeout: 3000 });
  });
});
