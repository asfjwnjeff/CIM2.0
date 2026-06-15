# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile-navigation.spec.ts >> CIM 移动端 - 底部导航 >> 移动首页统计卡片显示正常
- Location: e2e\mobile-navigation.spec.ts:40:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=待审批')
Expected: visible
Error: strict mode violation: locator('text=待审批') resolved to 3 elements:
    1) <div data-inspector-line="135" data-inspector-column="12" class="text-sm text-[#5A5A5A]" data-inspector-relative-path="src\\app\\mobile\\page.tsx">待审批</div> aka getByRole('button', { name: '待审批' })
    2) <h2 data-inspector-line="161" data-inspector-column="10" data-inspector-relative-path="src\\app\\mobile\\page.tsx" class="text-sm font-semibold text-[#0A0A0A] flex items-center gap-1.5">…</h2> aka getByRole('heading', { name: '待审批' })
    3) <div data-inspector-line="173" data-inspector-column="10" data-inspector-relative-path="src\\app\\mobile\\page.tsx" class="bg-white rounded-xl border border-[#EBEBEB] px-4 py-8 text-center text-sm text-[#999999]">暂无待审批事项</div> aka getByText('暂无待审批事项')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=待审批')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e6]: CIM 2.0
    - main [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]:
          - generic [ref=e10]:
            - heading "你好，系统管理员" [level=1] [ref=e11]
            - paragraph [ref=e12]: 信息技术部
          - generic [ref=e14]: 系
        - generic [ref=e15]:
          - button "4 待审批" [ref=e16]:
            - generic [ref=e18]: "4"
            - generic [ref=e19]: 待审批
          - button "0 今日待跟进" [ref=e20]:
            - generic [ref=e22]: "0"
            - generic [ref=e23]: 今日待跟进
          - button "0 逾期提醒" [ref=e24]:
            - generic [ref=e26]: "0"
            - generic [ref=e27]: 逾期提醒
          - button "0 未读消息" [ref=e28]:
            - generic [ref=e30]: "0"
            - generic [ref=e31]: 未读消息
        - generic [ref=e32]:
          - button "新建审批" [ref=e33]:
            - img [ref=e34]
            - generic [ref=e36]: 新建审批
          - button "新建跟进" [ref=e37]:
            - img [ref=e38]
            - generic [ref=e40]: 新建跟进
        - generic [ref=e41]:
          - generic [ref=e42]:
            - heading "待审批" [level=2] [ref=e43]:
              - img [ref=e44]
              - text: 待审批
            - button "全部" [ref=e46]:
              - text: 全部
              - img [ref=e47]
          - generic [ref=e49]:
            - button "应用材料(中国)有限公司 草稿 货代" [ref=e50]:
              - generic [ref=e51]:
                - generic [ref=e52]: 应用材料(中国)有限公司
                - generic [ref=e53]: 草稿
              - generic [ref=e55]: 货代
            - button "飞雅贸易(上海)有限公司 审批中 仓库" [ref=e56]:
              - generic [ref=e57]:
                - generic [ref=e58]: 飞雅贸易(上海)有限公司
                - generic [ref=e59]: 审批中
              - generic [ref=e61]: 仓库
            - button "荏原机械(中国)有限公司 审批中 运输" [ref=e62]:
              - generic [ref=e63]:
                - generic [ref=e64]: 荏原机械(中国)有限公司
                - generic [ref=e65]: 审批中
              - generic [ref=e67]: 运输
        - generic [ref=e68]:
          - generic [ref=e69]:
            - heading "跟进提醒" [level=2] [ref=e70]:
              - img [ref=e71]
              - text: 跟进提醒
            - button "全部" [ref=e73]:
              - text: 全部
              - img [ref=e74]
          - generic [ref=e76]: 暂无逾期提醒
    - navigation [ref=e77]:
      - link "首页" [ref=e78] [cursor=pointer]:
        - /url: /mobile
        - img [ref=e80]
        - generic [ref=e82]: 首页
      - link "审批" [ref=e83] [cursor=pointer]:
        - /url: /mobile/approvals
        - img [ref=e85]
        - generic [ref=e87]: 审批
      - link "消息" [ref=e88] [cursor=pointer]:
        - /url: /mobile/notifications
        - img [ref=e90]
        - generic [ref=e92]: 消息
      - link "跟进" [ref=e93] [cursor=pointer]:
        - /url: /mobile/followups
        - img [ref=e95]
        - generic [ref=e97]: 跟进
  - button "Open Next.js Dev Tools" [ref=e103] [cursor=pointer]:
    - img [ref=e104]
  - alert [ref=e107]
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
  36  |     await page.locator('a[href="/mobile"]').first().click();
  37  |     await expect(page).toHaveURL(/\/mobile(\?|$)/);
  38  |   });
  39  | 
  40  |   test('移动首页统计卡片显示正常', async ({ page }) => {
  41  |     await page.goto('/mobile');
  42  | 
  43  |     // 验证四个统计卡片
> 44  |     await expect(page.locator('text=待审批')).toBeVisible();
      |                                            ^ Error: expect(locator).toBeVisible() failed
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