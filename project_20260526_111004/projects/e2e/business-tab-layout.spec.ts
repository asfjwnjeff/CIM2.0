import { test, expect } from '@playwright/test';

test.describe('工商资质全景Tab和布局调整', () => {

  // ============ 工商资质隐藏 ============

  test('新建客户页不显示工商资质全景Tab', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    // 不应该有"工商资质全景"tab按钮
    const bizTab = page.locator('button').filter({ hasText: '工商资质全景' });
    await expect(bizTab).not.toBeVisible();
  });

  test('编辑客户页显示工商资质全景Tab并包含第三方数据提示', async ({ page }) => {
    await page.goto('/customers/cust-001/edit');
    await page.waitForLoadState('networkidle');

    // 应该有"工商资质全景"tab
    const bizTab = page.locator('button').filter({ hasText: '工商资质全景' });
    await expect(bizTab).toBeVisible();

    // 点击进入 tab
    await bizTab.click();
    await page.waitForTimeout(500);

    // 应该显示第三方数据来源提示
    await expect(page.locator('text=以下信息来源于企查查').or(page.locator('text=第三方企业信息平台')).first()).toBeVisible({ timeout: 3000 });
  });

  test('客户详情页工商资质全景Tab包含第三方数据提示', async ({ page }) => {
    await page.goto('/customers/cust-001');
    await page.waitForLoadState('networkidle');

    const bizTab = page.locator('button').filter({ hasText: '工商资质全景' });
    await expect(bizTab).toBeVisible();
    await bizTab.click();
    await page.waitForTimeout(500);

    await expect(page.locator('text=以下信息来源于企查查').or(page.locator('text=第三方企业信息平台')).first()).toBeVisible({ timeout: 3000 });
  });

  // ============ 布局顺序 ============

  test('新建页核心字段(LOGO+名称+信用代码)位于企业基本信息区域顶部', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    // 核心字段应该在页面上方可见
    const logoLabel = page.locator('label').filter({ hasText: '客户LOGO' });
    const nameLabel = page.locator('label').filter({ hasText: /^客户名称/ });
    const creditLabel = page.locator('label').filter({ hasText: /统一社会信用/ });

    await expect(logoLabel).toBeVisible();
    await expect(nameLabel).toBeVisible();
    await expect(creditLabel).toBeVisible();

    // LOGO 应该出现在协同管理信息之前（y位置更靠上）
    const logoBox = await logoLabel.first().boundingBox();
    const collabBox = await page.locator('text=协同管理信息').boundingBox();
    expect(logoBox!.y).toBeLessThan(collabBox!.y);
  });

  // ============ 半导体产业链条件显示 ============

  test('新建页默认不显示半导体产业链定位字段', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    // 默认产业分类不是"半导体"，不应该显示半导体产业链定位
    const semiLabel = page.locator('label').filter({ hasText: '产业链层级' });
    await expect(semiLabel).not.toBeVisible();
  });

  test('新建页选择产业分类为半导体后显示产业链定位字段', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    // 找到产业分类下拉框并选择"半导体"
    const categoryLabel = page.locator('label').filter({ hasText: '产业分类' });
    const categoryButton = categoryLabel.locator('..').locator('button, [role="combobox"]');
    if (await categoryButton.count() > 0) {
      await categoryButton.first().click();
      await page.waitForTimeout(300);
      // 选择"半导体"
      await page.locator('[role="option"]').filter({ hasText: '半导体' }).first().click();
      await page.waitForTimeout(500);

      // 现在应该显示半导体产业链定位字段
      const levelLabel = page.locator('label').filter({ hasText: '产业链层级' });
      await expect(levelLabel).toBeVisible({ timeout: 3000 });

      const roleLabel = page.locator('label').filter({ hasText: '细分产业链角色' });
      await expect(roleLabel).toBeVisible({ timeout: 3000 });
    }
  });

  test('选择非半导体产业分类后产业链定位字段重新隐藏', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    // 先选半导体
    let categoryButton = page.locator('label').filter({ hasText: '产业分类' }).locator('..').locator('button, [role="combobox"]');
    if (await categoryButton.count() > 0) {
      await categoryButton.first().click();
      await page.waitForTimeout(300);
      await page.locator('[role="option"]').filter({ hasText: '半导体' }).first().click();
      await page.waitForTimeout(500);

      // 确认半导体字段出现
      await expect(page.locator('label').filter({ hasText: '产业链层级' })).toBeVisible({ timeout: 3000 });

      // 切换到其他
      categoryButton = page.locator('label').filter({ hasText: '产业分类' }).locator('..').locator('button, [role="combobox"]');
      await categoryButton.first().click();
      await page.waitForTimeout(300);
      await page.locator('[role="option"]').filter({ hasText: '消费品' }).first().click();
      await page.waitForTimeout(500);

      // 半导体字段应该隐藏
      await expect(page.locator('label').filter({ hasText: '产业链层级' })).not.toBeVisible();
    }
  });
});

test.describe('编辑/详情页布局重排', () => {

  test('编辑页核心字段(LOGO+名称+信用代码)位于协同管理信息上方', async ({ page }) => {
    await page.goto('/customers/cust-001/edit');
    await page.waitForLoadState('networkidle');

    const logoLabel = page.locator('label').filter({ hasText: '客户LOGO' }).first();
    const collabTitle = page.locator('h3').filter({ hasText: '协同管理信息' });

    await expect(logoLabel).toBeVisible({ timeout: 5000 });
    await expect(collabTitle).toBeVisible({ timeout: 5000 });

    const logoBox = await logoLabel.boundingBox();
    const collabBox = await collabTitle.boundingBox();
    expect(logoBox!.y).toBeLessThan(collabBox!.y);
  });

  test('详情页核心字段(LOGO+名称+信用代码)位于协同管理信息上方', async ({ page }) => {
    await page.goto('/customers/cust-001');
    await page.waitForLoadState('networkidle');

    const logoLabel = page.locator('label').filter({ hasText: '客户LOGO' }).first();
    const collabTitle = page.locator('h3').filter({ hasText: '协同管理信息' });

    await expect(logoLabel).toBeVisible({ timeout: 5000 });
    await expect(collabTitle).toBeVisible({ timeout: 5000 });

    const logoBox = await logoLabel.boundingBox();
    const collabBox = await collabTitle.boundingBox();
    expect(logoBox!.y).toBeLessThan(collabBox!.y);
  });
});


