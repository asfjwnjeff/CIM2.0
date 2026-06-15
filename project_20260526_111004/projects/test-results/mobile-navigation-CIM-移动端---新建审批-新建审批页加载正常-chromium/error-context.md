# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile-navigation.spec.ts >> CIM 移动端 - 新建审批 >> 新建审批页加载正常
- Location: e2e\mobile-navigation.spec.ts:102:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=公司名称')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=公司名称')

```

```yaml
- banner: CIM 2.0
- main:
  - button:
    - img
  - heading "新建审批" [level=1]
  - button "公司信息":
    - text: 公司信息
    - img
  - text: 公司全称*
  - textbox "输入公司全称"
  - button "关联信息":
    - text: 关联信息
    - img
  - text: 服务产品*
  - combobox:
    - option "货代" [selected]
    - option "关务"
    - option "仓库"
    - option "运输"
    - option "进出口"
    - option "维修"
    - option "合同物流"
    - option "一体化供应链"
    - option "其他"
  - text: 结算账期*
  - textbox "如：月结30天"
  - text: 联系人*
  - textbox "输入联系人姓名"
  - button "业务信息":
    - text: 业务信息
    - img
  - text: 是否涉及贸易代理*
  - combobox:
    - option "否" [selected]
    - option "是"
  - text: 业务类型*
  - combobox:
    - option "保税" [selected]
    - option "口岸完税"
    - option "免税"
    - option "试单"
    - option "其他"
  - text: 货物类型*
  - textbox "如：半导体设备"
  - button "更多业务信息可选":
    - text: 更多业务信息可选
    - img
  - button "公司信息补充可选":
    - text: 公司信息补充可选
    - img
  - button "合规审核 · 货代":
    - text: 合规审核 · 货代
    - img
  - text: 运输及时率
  - spinbutton
  - text: "% 意向服务地区*"
  - button "上海"
  - button "无锡"
  - button "南京"
  - button "合肥"
  - button "杭州"
  - button "武汉"
  - button "成都"
  - button "西安"
  - button "北京"
  - button "大连"
  - button "厦门"
  - button "深圳"
  - button "广州"
  - text: 运输产品种类*
  - combobox:
    - option "请选择" [selected]
    - option "空运进口"
    - option "海运进口"
    - option "公路进口"
    - option "海运一贯式运输"
    - option "空运出口"
    - option "海运出口"
    - option "公路出口"
    - option "其他"
    - option "其他"
  - text: 出货国家/地区*
  - combobox:
    - option "请选择" [selected]
    - option "中国"
    - option "美国"
    - option "越南"
    - option "以色列"
    - option "伊朗"
  - text: 注册资本*
  - textbox "请输入"
  - text: 社保人数*
  - textbox "请输入"
  - text: 面积需求*
  - spinbutton
  - text: 货量需求*
  - spinbutton
  - text: 仓库地区*
  - button "上海"
  - button "无锡"
  - button "南京"
  - button "合肥"
  - button "杭州"
  - button "武汉"
  - button "成都"
  - button "西安"
  - button "北京"
  - button "大连"
  - button "厦门"
  - button "深圳"
  - button "广州"
  - button "其他"
  - text: 存储类型*
  - combobox:
    - option "请选择" [selected]
    - option "恒温恒湿"
    - option "常温"
  - button "暂存草稿" [disabled]
  - button "提交审批" [disabled]
- navigation:
  - link "首页":
    - /url: /mobile
    - img
    - text: 首页
  - link "审批":
    - /url: /mobile/approvals
    - img
    - text: 审批
  - link "消息":
    - /url: /mobile/notifications
    - img
    - text: 消息
  - link "跟进":
    - /url: /mobile/followups
    - img
    - text: 跟进
- alert
```

# Test source

```ts
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
> 108 |     await expect(page.locator('text=公司名称')).toBeVisible();
      |                                             ^ Error: expect(locator).toBeVisible() failed
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