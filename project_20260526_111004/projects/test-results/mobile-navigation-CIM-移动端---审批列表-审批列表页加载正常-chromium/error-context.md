# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile-navigation.spec.ts >> CIM 移动端 - 审批列表 >> 审批列表页加载正常
- Location: e2e\mobile-navigation.spec.ts:62:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=审批中')
Expected: visible
Error: strict mode violation: locator('text=审批中') resolved to 6 elements:
    1) <h1 data-inspector-line="63" data-inspector-column="6" class="text-lg font-bold text-[#0A0A0A]" data-inspector-relative-path="src\\app\\mobile\\approvals\\page.tsx">审批中心</h1> aka getByRole('heading', { name: '审批中心' })
    2) <button data-inspector-line="102" data-inspector-column="10" data-inspector-relative-path="src\\app\\mobile\\approvals\\page.tsx" class="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-white text-[#5A5A5A] border border-[#EBEBEB]">审批中</button> aka getByRole('button', { name: '审批中', exact: true })
    3) <span data-inspector-line="27" data-inspector-column="4" data-inspector-relative-path="src\\components\\mobile\\StatusBadge.tsx" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap bg-[#E8EBFF] text-[#2D3BFF] ">…</span> aka getByRole('button', { name: '上海华力集成电路制造有限公司 合同物流 5月29日 审批中' })
    4) <span data-inspector-line="27" data-inspector-column="4" data-inspector-relative-path="src\\components\\mobile\\StatusBadge.tsx" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap bg-[#E8EBFF] text-[#2D3BFF] ">…</span> aka getByRole('button', { name: '昇先创国际贸易(上海)有限公司 进出口 5月29日 审批中' })
    5) <span data-inspector-line="27" data-inspector-column="4" data-inspector-relative-path="src\\components\\mobile\\StatusBadge.tsx" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap bg-[#E8EBFF] text-[#2D3BFF] ">…</span> aka getByRole('button', { name: '荏原机械(中国)有限公司 运输 5月29日 审批中' })
    6) <span data-inspector-line="27" data-inspector-column="4" data-inspector-relative-path="src\\components\\mobile\\StatusBadge.tsx" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap bg-[#E8EBFF] text-[#2D3BFF] ">…</span> aka getByRole('button', { name: '飞雅贸易(上海)有限公司 仓库 5月29日 审批中' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=审批中')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e6]: CIM 2.0
    - main [ref=e7]:
      - generic [ref=e8]:
        - heading "审批中心" [level=1] [ref=e9]
        - generic [ref=e10]:
          - img [ref=e11]
          - textbox "搜索公司名称或服务产品..." [ref=e13]
        - generic [ref=e14]:
          - button "全部" [ref=e15]
          - button "审批中" [ref=e16]
          - button "已完成" [ref=e17]
          - button "已驳回" [ref=e18]
          - button "草稿" [ref=e19]
        - generic [ref=e20]:
          - button "长江存储科技有限责任公司 运输 5月30日 已驳回" [ref=e21]:
            - generic [ref=e23]:
              - generic [ref=e25]: 长江存储科技有限责任公司
              - generic [ref=e26]:
                - generic [ref=e27]: 运输
                - generic [ref=e29]: 5月30日
            - generic [ref=e30]: 已驳回
          - button "中芯国际集成电路制造有限公司 维修 5月30日 草稿" [ref=e32]:
            - generic [ref=e34]:
              - generic [ref=e36]: 中芯国际集成电路制造有限公司
              - generic [ref=e37]:
                - generic [ref=e38]: 维修
                - generic [ref=e40]: 5月30日
            - generic [ref=e41]: 草稿
          - button "上海裘瑞经贸有限公司 货代 5月29日 已驳回" [ref=e43]:
            - generic [ref=e45]:
              - generic [ref=e47]: 上海裘瑞经贸有限公司
              - generic [ref=e48]:
                - generic [ref=e49]: 货代
                - generic [ref=e51]: 5月29日
            - generic [ref=e52]: 已驳回
          - button "江苏鑫华半导体科技股份有限公司 一体化供应链 5月29日 已完成" [ref=e54]:
            - generic [ref=e56]:
              - generic [ref=e58]: 江苏鑫华半导体科技股份有限公司
              - generic [ref=e59]:
                - generic [ref=e60]: 一体化供应链
                - generic [ref=e62]: 5月29日
            - generic [ref=e63]: 已完成
          - button "武汉光库科技有限公司 关务 5月29日 已完成" [ref=e65]:
            - generic [ref=e67]:
              - generic [ref=e69]: 武汉光库科技有限公司
              - generic [ref=e70]:
                - generic [ref=e71]: 关务
                - generic [ref=e73]: 5月29日
            - generic [ref=e74]: 已完成
          - button "上海华力集成电路制造有限公司 合同物流 5月29日 审批中" [ref=e76]:
            - generic [ref=e78]:
              - generic [ref=e80]: 上海华力集成电路制造有限公司
              - generic [ref=e81]:
                - generic [ref=e82]: 合同物流
                - generic [ref=e84]: 5月29日
            - generic [ref=e85]: 审批中
          - button "昇先创国际贸易(上海)有限公司 进出口 5月29日 审批中" [ref=e87]:
            - generic [ref=e89]:
              - generic [ref=e91]: 昇先创国际贸易(上海)有限公司
              - generic [ref=e92]:
                - generic [ref=e93]: 进出口
                - generic [ref=e95]: 5月29日
            - generic [ref=e96]: 审批中
          - button "荏原机械(中国)有限公司 运输 5月29日 审批中" [ref=e98]:
            - generic [ref=e100]:
              - generic [ref=e102]: 荏原机械(中国)有限公司
              - generic [ref=e103]:
                - generic [ref=e104]: 运输
                - generic [ref=e106]: 5月29日
            - generic [ref=e107]: 审批中
          - button "飞雅贸易(上海)有限公司 仓库 5月29日 审批中" [ref=e109]:
            - generic [ref=e111]:
              - generic [ref=e113]: 飞雅贸易(上海)有限公司
              - generic [ref=e114]:
                - generic [ref=e115]: 仓库
                - generic [ref=e117]: 5月29日
            - generic [ref=e118]: 审批中
          - button "应用材料(中国)有限公司 货代 5月29日 草稿" [ref=e120]:
            - generic [ref=e122]:
              - generic [ref=e124]: 应用材料(中国)有限公司
              - generic [ref=e125]:
                - generic [ref=e126]: 货代
                - generic [ref=e128]: 5月29日
            - generic [ref=e129]: 草稿
    - navigation [ref=e132]:
      - link "首页" [ref=e133] [cursor=pointer]:
        - /url: /mobile
        - img [ref=e135]
        - generic [ref=e137]: 首页
      - link "审批" [ref=e138] [cursor=pointer]:
        - /url: /mobile/approvals
        - img [ref=e140]
        - generic [ref=e142]: 审批
      - link "消息" [ref=e143] [cursor=pointer]:
        - /url: /mobile/notifications
        - img [ref=e145]
        - generic [ref=e147]: 消息
      - link "跟进" [ref=e148] [cursor=pointer]:
        - /url: /mobile/followups
        - img [ref=e150]
        - generic [ref=e152]: 跟进
  - button "Open Next.js Dev Tools" [ref=e158] [cursor=pointer]:
    - img [ref=e159]
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
> 69  |     await expect(page.locator('text=审批中')).toBeVisible();
      |                                            ^ Error: expect(locator).toBeVisible() failed
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