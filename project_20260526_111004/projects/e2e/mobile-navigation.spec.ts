import { test, expect } from '@playwright/test';

test.describe('CIM 移动端 - 底部导航', () => {
  test('移动首页加载并显示底部导航栏', async ({ page }) => {
    await page.goto('/mobile');

    // 验证页面标题
    await expect(page.locator('text=CIM 2.0')).toBeVisible();

    // 验证底部导航栏四个 tab
    await expect(page.locator('text=首页').last()).toBeVisible();
    await expect(page.locator('text=审批').last()).toBeVisible();
    await expect(page.locator('text=消息').last()).toBeVisible();
    await expect(page.locator('text=跟进').last()).toBeVisible();
  });

  test('底部导航 tab 切换正常', async ({ page }) => {
    await page.goto('/mobile');

    // 点击审批 tab
    await page.locator('a[href="/mobile/approvals"]').first().click();
    await expect(page).toHaveURL(/\/mobile\/approvals/);
    await expect(page.locator('text=审批中心')).toBeVisible();

    // 点击消息 tab
    await page.locator('a[href="/mobile/notifications"]').first().click();
    await expect(page).toHaveURL(/\/mobile\/notifications/);
    await expect(page.locator('text=消息中心')).toBeVisible();

    // 点击跟进 tab
    await page.locator('a[href="/mobile/followups"]').first().click();
    await expect(page).toHaveURL(/\/mobile\/followups/);
    await expect(page.locator('text=客户跟进')).toBeVisible();

    // 回到首页
    await page.locator('a[href="/mobile"]').first().click();
    await expect(page).toHaveURL(/\/mobile(\?|$)/);
  });

  test('移动首页统计卡片显示正常', async ({ page }) => {
    await page.goto('/mobile');

    // 验证四个统计卡片
    await expect(page.locator('text=待审批')).toBeVisible();
    await expect(page.locator('text=今日待跟进')).toBeVisible();
    await expect(page.locator('text=逾期提醒')).toBeVisible();
    await expect(page.locator('text=未读消息')).toBeVisible();

    // 验证快捷操作按钮
    await expect(page.locator('text=新建审批')).toBeVisible();
    await expect(page.locator('text=新建跟进')).toBeVisible();
  });

  test('桌面布局不显示底栏', async ({ page }) => {
    await page.goto('/');
    // 桌面端不应出现移动端底部导航
    await expect(page.locator('a[href="/mobile"]').first()).not.toBeVisible();
  });
});

test.describe('CIM 移动端 - 审批列表', () => {
  test('审批列表页加载正常', async ({ page }) => {
    await page.goto('/mobile/approvals');

    await expect(page.locator('text=审批中心')).toBeVisible();

    // 验证筛选按钮
    await expect(page.locator('text=全部')).toBeVisible();
    await expect(page.locator('text=审批中')).toBeVisible();

    // 验证搜索框
    await expect(page.locator('input[placeholder*="搜索"]')).toBeVisible();
  });

  test('审批详情页可从列表进入', async ({ page }) => {
    await page.goto('/mobile/approvals');

    // 如果有审批记录，点击第一个卡片
    const firstCard = page.locator('[class*="rounded-xl"]').filter({ hasText: /公司|审批/ }).first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      // 应跳转到详情页
      await expect(page).toHaveURL(/\/mobile\/approvals\//);
    }
  });
});

test.describe('CIM 移动端 - 消息中心', () => {
  test('消息中心加载正常', async ({ page }) => {
    await page.goto('/mobile/notifications');

    await expect(page.locator('text=消息中心')).toBeVisible();

    // 验证筛选标签
    await expect(page.locator('text=全部')).toBeVisible();
    await expect(page.locator('text=审批')).toBeVisible();
    await expect(page.locator('text=系统')).toBeVisible();
  });
});

test.describe('CIM 移动端 - 新建审批', () => {
  test('新建审批页加载正常', async ({ page }) => {
    await page.goto('/mobile/approvals/new');

    await expect(page.locator('text=新建审批')).toBeVisible();

    // 验证必填字段
    await expect(page.locator('text=公司名称')).toBeVisible();
    await expect(page.locator('text=服务产品')).toBeVisible();

    // 验证底部按钮
    await expect(page.locator('text=暂存草稿')).toBeVisible();
    await expect(page.locator('text=提交审批')).toBeVisible();
  });

  test('公司名称为空时提交被禁用', async ({ page }) => {
    await page.goto('/mobile/approvals/new');

    const submitBtn = page.locator('text=提交审批');
    await expect(submitBtn).toBeDisabled();
  });
});
