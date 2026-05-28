import { test, expect } from '@playwright/test';

// Use .first() because some pages (e.g., /customers) wrap own <AppLayout>,
// creating 2 <aside> elements. The root layout's sidebar is the first one.
const HAMBURGER = 'header button[aria-label="展开侧栏"], header button[aria-label="收起侧栏"]';

/** Deduplicated collapse button in first aside */
function collapseBtn(page: any) {
  return page.locator('aside').first().locator('button[aria-label="收起侧栏"]');
}

/** Button by text in the first aside */
function asideBtn(page: any, text: string) {
  return page.locator('aside').first().locator(`button:has-text("${text}")`);
}

/** Link by text in the first aside */
function asideLink(page: any, text: string) {
  return page.locator('aside').first().locator(`a:has-text("${text}")`);
}

/** Wait for sidebar width transition (200ms) + text reveal delay (200ms) + buffer */
async function settle(ms = 500) {
  return new Promise(r => setTimeout(r, ms));
}

async function getSidebarWidth(page: any): Promise<number> {
  const box = await page.locator('aside').first().boundingBox();
  if (!box) throw new Error('Sidebar not found');
  return Math.round(box.width);
}

test.describe('Sidebar — Pure Manual Toggle Behavior', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ensure page and first aside are loaded
    await page.locator('aside').first().waitFor({ state: 'visible' });
  });

  /* ================================================================
     TEST 1: Initial state — sidebar should be collapsed (~56px)
     ================================================================ */
  test('1. Initial state: sidebar collapsed at ~56px', async ({ page }) => {
    const width = await getSidebarWidth(page);
    const collapsed = width >= 50 && width <= 62;
    console.log(`  [TEST 1] Sidebar width: ${width}px (expected ~56px)`);
    expect(collapsed).toBeTruthy();

    // Verify hamburger shows expand label
    const expandBtn = page.locator('header button[aria-label="展开侧栏"]');
    await expect(expandBtn).toBeVisible();

    // Verify collapse button is NOT in the first aside
    await expect(collapseBtn(page)).not.toBeAttached();
    console.log('  [TEST 1] PASS');
  });

  /* ================================================================
     TEST 2: Click hamburger — sidebar expands to ~240px
     ================================================================ */
  test('2. Expand: click hamburger → sidebar expands to ~240px', async ({ page }) => {
    await page.locator(HAMBURGER).click();
    await settle();
    const width = await getSidebarWidth(page);
    const expanded = width >= 230 && width <= 250;
    console.log(`  [TEST 2] Sidebar width: ${width}px (expected ~240px)`);
    expect(expanded).toBeTruthy();

    await expect(collapseBtn(page)).toBeVisible();
    console.log('  [TEST 2] PASS');
  });

  /* ================================================================
     TEST 3: Click collapse button — sidebar collapses to ~56px
     ================================================================ */
  test('3. Collapse: click "收起菜单" → sidebar collapses to ~56px', async ({ page }) => {
    await page.locator(HAMBURGER).click();
    await settle();
    await expect(collapseBtn(page)).toBeVisible();

    await collapseBtn(page).click();
    await settle();
    const width = await getSidebarWidth(page);
    const collapsed = width >= 50 && width <= 62;
    console.log(`  [TEST 3] Sidebar width: ${width}px (expected ~56px)`);
    expect(collapsed).toBeTruthy();

    await expect(collapseBtn(page)).not.toBeAttached();
    console.log('  [TEST 3] PASS');
  });

  /* ================================================================
     TEST 4: Expand again via hamburger
     ================================================================ */
  test('4. Expand again: click hamburger → sidebar expands to ~240px', async ({ page }) => {
    await page.locator(HAMBURGER).click();
    await settle();
    await collapseBtn(page).click();
    await settle();

    await page.locator(HAMBURGER).click();
    await settle();
    const width = await getSidebarWidth(page);
    const expanded = width >= 230 && width <= 250;
    console.log(`  [TEST 4] Sidebar width: ${width}px (expected ~240px)`);
    expect(expanded).toBeTruthy();
    await expect(collapseBtn(page)).toBeVisible();
    console.log('  [TEST 4] PASS');
  });

  /* ================================================================
     TEST 5: Click parent menu (风控审批) when expanded
     Expected: submenu with "审批列表", "流程配置", "自动规则" appears
     ================================================================ */
  test('5. Expanded: click "风控审批" → submenu appears', async ({ page }) => {
    await page.locator(HAMBURGER).click();
    await settle();

    const fengkongBtn = asideBtn(page, '风控审批');
    await expect(fengkongBtn).toBeVisible();

    // Before clicking, submenu items should NOT exist in DOM
    await expect(asideLink(page, '审批列表')).not.toBeAttached();

    await fengkongBtn.click();
    await settle(300);

    // Submenu items should now appear
    await expect(asideLink(page, '审批列表')).toBeVisible();
    await expect(asideLink(page, '流程配置')).toBeVisible();
    await expect(asideLink(page, '自动规则')).toBeVisible();
    console.log('  [TEST 5] Submenu items visible: 审批列表, 流程配置, 自动规则');
    console.log('  [TEST 5] PASS');
  });

  /* ================================================================
     TEST 6: Click same parent again → submenu collapses
     ================================================================ */
  test('6. Expanded: click "风控审批" again → submenu collapses', async ({ page }) => {
    await page.locator(HAMBURGER).click();
    await settle();

    const fengkongBtn = asideBtn(page, '风控审批');
    await fengkongBtn.click();
    await settle(300);
    await expect(asideLink(page, '审批列表')).toBeVisible();

    await fengkongBtn.click();
    await settle(300);

    await expect(asideLink(page, '审批列表')).not.toBeAttached();
    await expect(asideLink(page, '流程配置')).not.toBeAttached();
    console.log('  [TEST 6] PASS');
  });

  /* ================================================================
     TEST 7: Collapse sidebar while submenu is open
     Expected: Sidebar collapses to ~56px, submenu disappears
     ================================================================ */
  test('7. Collapse while submenu open: sidebar collapses, submenu gone', async ({ page }) => {
    await page.locator(HAMBURGER).click();
    await settle();

    await asideBtn(page, '风控审批').click();
    await settle(300);
    await expect(asideLink(page, '审批列表')).toBeVisible();

    await collapseBtn(page).click();
    await settle();

    const width = await getSidebarWidth(page);
    const collapsed = width >= 50 && width <= 62;
    console.log(`  [TEST 7] Sidebar width: ${width}px (expected ~56px)`);
    expect(collapsed).toBeTruthy();

    await expect(asideLink(page, '审批列表')).not.toBeAttached();
    console.log('  [TEST 7] PASS');
  });

  /* ================================================================
     TEST 8: Click parent menu when sidebar is collapsed
     Expected: Sidebar STAYS collapsed, NO submenu appears
     ================================================================ */
  test('8. Collapsed: click "风控审批" → sidebar stays collapsed, no submenu', async ({ page }) => {
    const widthBefore = await getSidebarWidth(page);
    console.log(`  [TEST 8] Sidebar width before click: ${widthBefore}px`);

    await asideBtn(page, '风控审批').click();
    await settle(300);

    const widthAfter = await getSidebarWidth(page);
    const stillCollapsed = widthAfter >= 50 && widthAfter <= 62;
    console.log(`  [TEST 8] Sidebar width after click: ${widthAfter}px`);
    expect(stillCollapsed).toBeTruthy();

    await expect(asideLink(page, '审批列表')).not.toBeAttached();
    console.log('  [TEST 8] PASS — sidebar stays collapsed, no submenu shown');
  });

  /* ================================================================
     TEST 9: Expand after clicking parent while collapsed
     Expected: "风控审批" submenu IS visible (it was toggled internally)
     ================================================================ */
  test('9. Toggle parent collapsed → expand: submenu shows the prior toggle', async ({ page }) => {
    // Click 风控审批 while collapsed (internal state toggled on)
    await asideBtn(page, '风控审批').click();
    await settle(100);

    // Now expand sidebar
    await page.locator(HAMBURGER).click();
    await settle(); // 500ms for transition + text reveal

    // Submenu should BE visible (because expandedMenus includes "风控审批")
    await expect(asideLink(page, '审批列表')).toBeVisible();
    await expect(asideLink(page, '流程配置')).toBeVisible();
    await expect(asideLink(page, '自动规则')).toBeVisible();
    console.log('  [TEST 9] PASS — submenu visible after expand (prior toggle registered)');
  });

  /* ================================================================
     TEST 10: Click leaf menu when collapsed
     Expected: Navigation happens, sidebar stays collapsed at ~56px
     ================================================================ */
  test('10. Collapsed: click leaf "客户管理" → navigates, sidebar stays collapsed', async ({ page }) => {
    await page.goto('/');

    const widthBefore = await getSidebarWidth(page);
    console.log(`  [TEST 10] Sidebar width before: ${widthBefore}px`);

    // Click leaf menu "客户管理" (a <Link>, not a button)
    await asideLink(page, '客户管理').click();
    await page.waitForLoadState('networkidle');
    await settle(500);

    const url = page.url();
    console.log(`  [TEST 10] URL after click: ${url}`);
    expect(url).toContain('/customers');

    const widthAfter = await getSidebarWidth(page);
    const stillCollapsed = widthAfter >= 50 && widthAfter <= 62;
    console.log(`  [TEST 10] Sidebar width after: ${widthAfter}px`);
    expect(stillCollapsed).toBeTruthy();

    await expect(collapseBtn(page)).not.toBeAttached();
    console.log('  [TEST 10] PASS — navigation succeeded, sidebar stayed collapsed');
  });

});
