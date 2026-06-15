# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile-navigation.spec.ts >> CIM 移动端 - 底部导航 >> 底部导航 tab 切换正常
- Location: e2e\mobile-navigation.spec.ts:17:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('a[href="/mobile"]').first()
    - locator resolved to <a href="/mobile" data-inspector-line="67" data-inspector-column="10" data-inspector-relative-path="src\\components\\mobile\\BottomTabBar.tsx" class="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors text-[#999999]">…</a>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <nextjs-portal></nextjs-portal> from <script data-nextjs-dev-overlay="true">…</script> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <nextjs-portal></nextjs-portal> from <script data-nextjs-dev-overlay="true">…</script> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    56 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <nextjs-portal></nextjs-portal> from <script data-nextjs-dev-overlay="true">…</script> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e6]: CIM 2.0
    - main [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]:
          - heading "客户跟进" [level=1] [ref=e10]
          - button [ref=e11]:
            - img [ref=e12]
        - generic [ref=e14]:
          - img [ref=e15]
          - textbox "搜索客户名或跟进内容..." [ref=e17]
        - generic [ref=e18]:
          - button "全部" [ref=e19]
          - button "KPI未达标" [ref=e20]
          - button "合同管理" [ref=e21]
          - button "业务会议" [ref=e22]
          - button "其他客户事项" [ref=e23]
        - generic [ref=e24]:
          - img [ref=e26]
          - heading "暂无跟进记录" [level=3] [ref=e28]
          - paragraph [ref=e29]: 点击右上角 + 添加新跟进
    - navigation [ref=e31]:
      - link "首页" [ref=e32] [cursor=pointer]:
        - /url: /mobile
        - img [ref=e34]
        - generic [ref=e36]: 首页
      - link "审批" [ref=e37] [cursor=pointer]:
        - /url: /mobile/approvals
        - img [ref=e39]
        - generic [ref=e41]: 审批
      - link "消息" [ref=e42] [cursor=pointer]:
        - /url: /mobile/notifications
        - img [ref=e44]
        - generic [ref=e46]: 消息
      - link "跟进" [active] [ref=e47] [cursor=pointer]:
        - /url: /mobile/followups
        - img [ref=e49]
        - generic [ref=e51]: 跟进
  - button "Open Next.js Dev Tools" [ref=e57] [cursor=pointer]:
    - img [ref=e58]
  - alert [ref=e61]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('CIM 移动端 - 底部导航', () => {
  4   |   test('移动首页加载并显示底部导航栏', async ({ page }) => {
  5   |     await page.goto('/mobile');
  6   | 
  7   |     // 验证页面标题
  8   |     await expect(page.locator('text=CIM 2.0')).toBeVisible();
  9   | 
  10  |     // 验证底部导航栏四个 tab
  11  |     await expect(page.locator('text=首页').last()).toBeVisible();
  12  |     await expect(page.locator('text=审批').last()).toBeVisible();
  13  |     await expect(page.locator('text=消息').last()).toBeVisible();
  14  |     await expect(page.locator('text=跟进').last()).toBeVisible();
  15  |   });
  16  | 
  17  |   test('底部导航 tab 切换正常', async ({ page }) => {
  18  |     await page.goto('/mobile');
  19  | 
  20  |     // 点击审批 tab
  21  |     await page.locator('a[href="/mobile/approvals"]').first().click();
  22  |     await expect(page).toHaveURL(/\/mobile\/approvals/);
  23  |     await expect(page.locator('text=审批中心')).toBeVisible();
  24  | 
  25  |     // 点击消息 tab
  26  |     await page.locator('a[href="/mobile/notifications"]').first().click();
  27  |     await expect(page).toHaveURL(/\/mobile\/notifications/);
  28  |     await expect(page.locator('text=消息中心')).toBeVisible();
  29  | 
  30  |     // 点击跟进 tab
  31  |     await page.locator('a[href="/mobile/followups"]').first().click();
  32  |     await expect(page).toHaveURL(/\/mobile\/followups/);
  33  |     await expect(page.locator('text=客户跟进')).toBeVisible();
  34  | 
  35  |     // 回到首页
> 36  |     await page.locator('a[href="/mobile"]').first().click();
      |                                                     ^ Error: locator.click: Test timeout of 30000ms exceeded.
  37  |     await expect(page).toHaveURL(/\/mobile(\?|$)/);
  38  |   });
  39  | 
  40  |   test('移动首页统计卡片显示正常', async ({ page }) => {
  41  |     await page.goto('/mobile');
  42  | 
  43  |     // 验证四个统计卡片
  44  |     await expect(page.locator('text=待审批')).toBeVisible();
  45  |     await expect(page.locator('text=今日待跟进')).toBeVisible();
  46  |     await expect(page.locator('text=逾期提醒')).toBeVisible();
  47  |     await expect(page.locator('text=未读消息')).toBeVisible();
  48  | 
  49  |     // 验证快捷操作按钮
  50  |     await expect(page.locator('text=新建审批')).toBeVisible();
  51  |     await expect(page.locator('text=新建跟进')).toBeVisible();
  52  |   });
  53  | 
  54  |   test('桌面布局不显示底栏', async ({ page }) => {
  55  |     await page.goto('/');
  56  |     // 桌面端不应出现移动端底部导航
  57  |     await expect(page.locator('a[href="/mobile"]').first()).not.toBeVisible();
  58  |   });
  59  | });
  60  | 
  61  | test.describe('CIM 移动端 - 审批列表', () => {
  62  |   test('审批列表页加载正常', async ({ page }) => {
  63  |     await page.goto('/mobile/approvals');
  64  | 
  65  |     await expect(page.locator('text=审批中心')).toBeVisible();
  66  | 
  67  |     // 验证筛选按钮
  68  |     await expect(page.locator('text=全部')).toBeVisible();
  69  |     await expect(page.locator('text=审批中')).toBeVisible();
  70  | 
  71  |     // 验证搜索框
  72  |     await expect(page.locator('input[placeholder*="搜索"]')).toBeVisible();
  73  |   });
  74  | 
  75  |   test('审批详情页可从列表进入', async ({ page }) => {
  76  |     await page.goto('/mobile/approvals');
  77  | 
  78  |     // 如果有审批记录，点击第一个卡片
  79  |     const firstCard = page.locator('[class*="rounded-xl"]').filter({ hasText: /公司|审批/ }).first();
  80  |     if (await firstCard.isVisible()) {
  81  |       await firstCard.click();
  82  |       // 应跳转到详情页
  83  |       await expect(page).toHaveURL(/\/mobile\/approvals\//);
  84  |     }
  85  |   });
  86  | });
  87  | 
  88  | test.describe('CIM 移动端 - 消息中心', () => {
  89  |   test('消息中心加载正常', async ({ page }) => {
  90  |     await page.goto('/mobile/notifications');
  91  | 
  92  |     await expect(page.locator('text=消息中心')).toBeVisible();
  93  | 
  94  |     // 验证筛选标签
  95  |     await expect(page.locator('text=全部')).toBeVisible();
  96  |     await expect(page.locator('text=审批')).toBeVisible();
  97  |     await expect(page.locator('text=系统')).toBeVisible();
  98  |   });
  99  | });
  100 | 
  101 | test.describe('CIM 移动端 - 新建审批', () => {
  102 |   test('新建审批页加载正常', async ({ page }) => {
  103 |     await page.goto('/mobile/approvals/new');
  104 | 
  105 |     await expect(page.locator('text=新建审批')).toBeVisible();
  106 | 
  107 |     // 验证必填字段
  108 |     await expect(page.locator('text=公司名称')).toBeVisible();
  109 |     await expect(page.locator('text=服务产品')).toBeVisible();
  110 | 
  111 |     // 验证底部按钮
  112 |     await expect(page.locator('text=暂存草稿')).toBeVisible();
  113 |     await expect(page.locator('text=提交审批')).toBeVisible();
  114 |   });
  115 | 
  116 |   test('公司名称为空时提交被禁用', async ({ page }) => {
  117 |     await page.goto('/mobile/approvals/new');
  118 | 
  119 |     const submitBtn = page.locator('text=提交审批');
  120 |     await expect(submitBtn).toBeDisabled();
  121 |   });
  122 | });
  123 | 
```