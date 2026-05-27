# CIM2.0 前端 UI 设计规范文档

> 版本：v1.0 | 更新日期：2026-05-27 | 适用范围：CIM 客户信息管理系统（全模块）
>
> 技术栈：Next.js 16.1 App Router + React 19 + TypeScript 5 + shadcn/ui + Tailwind CSS v4

---

## 目录

1. [设计令牌 (Design Tokens)](#1-设计令牌)
2. [组件规范](#2-组件规范)
3. [表单布局规范](#3-表单布局规范)
4. [页面布局规范](#4-页面布局规范)
5. [交互规范](#5-交互规范)
6. [数据展示规范](#6-数据展示规范)
7. [文件组织规范](#7-文件组织规范)
8. [附录：开发约定](#8-附录开发约定)

---

## 1. 设计令牌

### 1.1 品牌色 (Brand Colors)

| Token | 色值 | 用途 |
|-------|------|------|
| `primary` | `#1A2FFF` | 主色：主要按钮、选中态、焦点环、链接、顶部导航背景起点 |
| `primaryHover` | `#3B52FF` | 悬停态：按钮 hover、顶部导航背景终点 |
| `primaryLight` | `#E8F0FF` | 浅色背景：侧边栏菜单悬停/选中背景、标签浅色底 |

在代码中通过 `BRAND_COLORS` 常量引用（`src/lib/ui-constants.tsx`）：

```typescript
export const BRAND_COLORS = {
  primary: '#1A2FFF',
  primaryHover: '#3B52FF',
  primaryLight: '#E8F0FF',
} as const;
```

Tailwind 任意值用法：`bg-[#1A2FFF]` / `text-[#1A2FFF]` / `ring-[#1A2FFF]` / `border-[#1A2FFF]`

### 1.2 功能色 (Semantic Colors)

| Token | 色值 | 用途 |
|-------|------|------|
| `success` | `#52C41A` | 成功状态、通过审批、正常经营 |
| `warning` | `#FAAD14` | 警告状态、待处理、即将到期 |
| `error` | `#FF4D4F` | 错误状态、驳回、删除操作、必填星号 |
| `info` | `#1890FF` | 信息提示、参考说明 |

典型用法：
- **成功卡片/标签**：`bg-[#E6F7F0] text-[#00A870]`（深绿文字配浅绿底）
- **警告卡片/标签**：`bg-[#FFF4E8] text-[#FF8A00]`（深橙文字配浅橙底）
- **错误卡片/标签**：`bg-[#FFEBEE] text-[#E53935]`（深红文字配浅红底）
- **错误提示框**：`bg-[#FFF1F0] border border-[#FFCCC7] rounded-lg text-sm text-[#FF4D4F]`

### 1.3 中性色 (Neutral Colors)

| Token | 色值 | Tailwind 类 | 用途 |
|-------|------|-------------|------|
| `textPrimary` | `#1A1A1A` | `text-[#1A1A1A]` | 正文标题、表单标签、重要文字 |
| `textSecondary` | `#666666` | `text-[#666666]` | 辅助说明文字、次要信息 |
| `textTertiary` | `#999999` | `text-[#999999]` | 占位符、禁用态文字、提示文字 |
| `border` | `#E0E0E0` | `border-[#E0E0E0]` | 输入框边框、下拉边框 |
| `borderLight` | `#EEEEEE` | `border-[#EEEEEE]` | 卡片边框、分割线 |
| `bgPage` | `#F5F6F8` | `bg-[#F5F6F8]` | 页面底色、标签导航背景 |
| `bgWhite` | `#FFFFFF` | `bg-white` | 卡片背景、输入框背景、白色容器 |

### 1.4 圆角 (Border Radius)

| 级别 | 值 | Tailwind 类 | 适用场景 |
|------|-----|------------|----------|
| 小圆角 | 6px | `rounded-md` | 输入框 (`Input`)、文本域 (`Textarea`)、Badge |
| 中圆角 | 8px | `rounded-lg` | 按钮、下拉触发器、弹窗面板、Tab 容器、表单区域 |
| 大圆角 | 12px | `rounded-xl` | 卡片 (`Card`)、侧边栏菜单项 |
| 全圆角 | 9999px | `rounded-full` | Badge、头像 (`Avatar`) |

### 1.5 字号 (Font Sizes)

| Token | Tailwind 类 | 实际大小 | 适用场景 |
|-------|------------|----------|----------|
| `text-xs` | `text-xs` | 12px | Badge 标签、辅助标注、表格小字 |
| `text-sm` | `text-sm` | 14px | 正文、表单字段、菜单项、按钮 |
| `text-base` | `text-base` | 16px | 默认正文、输入框文字 |
| `text-lg` | `text-lg` | 18px | 卡片标题、弹窗标题 |
| `text-xl` | `text-xl` | 20px | 页面标题 |
| `text-2xl` | `text-2xl` | 24px | 首页大标题、Hero 标题 |

### 1.6 间距 (Spacing)

| Token | 值 | 适用场景 |
|-------|-----|----------|
| `gap-1.5` | 6px | Badge 行内间距 |
| `gap-2` | 8px | 按钮内图标间距 |
| `gap-3` | 12px | 侧边栏菜单图标与文字间距 |
| `gap-4` | 16px | 网格列间距、卡片内字段间距 |
| `p-3` | 12px | 侧边栏内边距 |
| `p-4` | 16px | 菜单项内边距 |
| `p-5` | 20px | 主内容区内边距 |
| `p-6` | 24px | 卡片内边距 |
| `px-6` | 24px (水平) | 顶部导航栏水平内边距 |
| `space-y-6` | 24px | 表单区块垂直间距 |

### 1.7 阴影 (Shadows)

| 级别 | Tailwind 类 | 适用场景 |
|------|------------|----------|
| 轻微 | `shadow-sm` | 卡片 (`Card`) |
| 中等 | `shadow-md` | 侧边栏激活子项 |
| 深度 | `shadow-lg` | 侧边栏激活一级项 |
| 强烈 | `shadow-xl` | 顶部导航栏 |
| 内阴影 | `shadow-2xl` | 侧边栏整体 |

---

## 2. 组件规范

### 2.1 SearchableSelect（可搜索单选下拉）

基于 `Popover` + `Command`（cmdk）实现的可搜索单选下拉组件。

**文件位置：** `src/components/ui/searchable-select.tsx`

**导出类型：**

```typescript
export interface SelectOption<T = string> {
  value: T;
  label: string;
}
```

#### Props API

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `value` | `T` | 是 | - | 当前选中值 |
| `onChange` | `(value: T) => void` | 是 | - | 选择回调，选中后自动关闭弹窗 |
| `options` | `SelectOption<T>[]` | 是 | - | 选项列表 |
| `placeholder` | `string` | 否 | `'请选择'` | 未选中时的占位提示 |
| `searchPlaceholder` | `string` | 否 | `'搜索...'` | 搜索输入框占位文字 |
| `emptyText` | `string` | 否 | `'无匹配选项'` | 搜索无结果时的提示文字 |
| `disabled` | `boolean` | 否 | `false` | 禁用状态 |
| `className` | `string` | 否 | `''` | 触发器额外样式类 |
| `renderOption` | `(option: SelectOption<T>) => ReactNode` | 否 | - | 自定义选项渲染 |
| `renderTrigger` | `(option: SelectOption<T> \| undefined) => ReactNode` | 否 | - | 自定义触发器渲染 |

#### 视觉规范

**触发器 (Trigger)：**
- 宽度 100%，flex 布局，`items-center gap-2 px-3 py-2`
- 边框：`border border-[#E0E0E0] rounded-lg`
- hover 态：`hover:border-[#1A2FFF]`
- 文字：选中态 `text-[#1A1A1A]`，未选中占位色 `text-[#999999]`
- 右侧显示 `ChevronsUpDown` 图标（`w-4 h-4 opacity-50 shrink-0`）
- 禁用态：`opacity-50 cursor-not-allowed`

**弹出面板 (PopoverContent)：**
- 宽度匹配触发器：`w-[--radix-popover-trigger-width]`，`align="start"`
- 内部无内边距：`p-0`
- 包含 `Command` 组件：搜索输入框 (`CommandInput`) + 可滚动选项列表 (`ScrollArea` + `CommandItem`)
- 列表最大高度：`h-52`（约 208px，超出滚动）
- 空状态显示 `CommandEmpty` 中的 `emptyText`

**选项 (CommandItem)：**
- 每行 flex 布局，`items-center gap-2`
- 文字：`text-sm flex-1`
- 选中标记：选项值等于 `value` 时，右侧显示蓝色 `Check` 图标（`w-4 h-4 text-[#1A2FFF] shrink-0`）

#### 设计要点

- 选中选项后弹窗自动关闭（`setOpen(false)`）
- 点击触发器切换弹窗开/关
- 搜索支持 cmdk 内建模糊匹配
- 点击弹窗外区域自动关闭

#### 使用示例

```tsx
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { SelectOption } from '@/components/ui/searchable-select';

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: '正常' },
  { value: 'inactive', label: '停用' },
  { value: 'potential', label: '潜在' },
];

<SearchableSelect
  value={formData.status}
  onChange={(val) => updateField('status', val)}
  options={STATUS_OPTIONS}
  placeholder="请选择客户状态"
  searchPlaceholder="搜索状态..."
  emptyText="无匹配状态"
/>
```

---

### 2.2 SearchableMultiSelect（可搜索多选下拉）

基于 `Popover` + `Command` 实现，支持多选，已选项以 Badge 标签展示在触发器上方。

**文件位置：** `src/components/ui/searchable-multi-select.tsx`

#### Props API

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `values` | `T[]` | 是 | - | 当前选中的值数组 |
| `onChange` | `(values: T[]) => void` | 是 | - | 选择变更回调（返回完整选中数组） |
| `options` | `SelectOption<T>[]` | 是 | - | 选项列表 |
| `placeholder` | `string` | 否 | `'请选择'` | 触发器占位文字 |
| `searchPlaceholder` | `string` | 否 | `'搜索...'` | 搜索框占位文字 |
| `emptyText` | `string` | 否 | `'无匹配选项'` | 无结果提示文字 |
| `disabled` | `boolean` | 否 | `false` | 禁用状态 |
| `className` | `string` | 否 | `''` | 触发器额外样式 |
| `renderOption` | `(option: SelectOption<T>, isSelected: boolean) => ReactNode` | 否 | - | 自定义选项渲染，`isSelected` 标识当前是否选中 |
| `renderBadge` | `(option: SelectOption<T>, onRemove: () => void) => ReactNode` | 否 | - | 自定义 Badge 渲染 |

#### 视觉规范

**Badge 区域（有选中项时显示）：**
- 位于触发器上方，`flex flex-wrap gap-1.5`
- 每个 Badge：`variant="secondary"`，右侧有 X 关闭按钮
- X 按钮：`rounded-full hover:bg-gray-300 p-0.5`，点击移除该项
- 默认 Badge 样式：`gap-1 pr-1`，文字 `text-xs`

**触发器 (Trigger)：**
- 与 SearchableSelect 完全相同的外观样式
- 始终显示 `placeholder`（不替换为已选内容）

**弹出面板：**
- 与 SearchableSelect 完全相同的面板结构
- 关键区别：点击选项时**不关闭弹窗**，仅切换该项选中状态
- 选项右侧 Check 图标根据 `isSelected` 显示/隐藏

#### 设计要点

- 点击选项仅切换选中状态，弹窗保持打开（便于连续多选）
- 点击弹窗外区域关闭
- 可直接点击 Badge 上的 X 按钮移除单项
- 选项 `renderOption` 比单选多一个 `isSelected` 参数

#### 使用示例

```tsx
import { SearchableMultiSelect } from '@/components/ui/searchable-multi-select';

<SearchableMultiSelect
  values={formData.responsiblePersons}
  onChange={(vals) => updateField('responsiblePersons', vals)}
  options={userOptions}
  placeholder="请选择负责人"
  searchPlaceholder="搜索人员..."
  emptyText="无匹配人员"
/>
```

---

### 2.3 Input（文本输入框）

基于原生 `<input>` 封装，shadcn/ui 风格。

**文件位置：** `src/components/ui/input.tsx`

#### Props API

继承全部 `React.ComponentProps<'input'>`，无额外自定义 Props。

#### 视觉规范

- 宽度 100%：`w-full`
- 内边距：`px-3 py-1`（高度 `h-9`，即 36px）
- 边框：`border rounded-md`（Tailwind 默认 `border-input`）
- 字号：`text-base`（桌面端 `md:text-sm`）
- 焦点态：`focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- 禁用态：`disabled:opacity-50 disabled:cursor-not-allowed`
- 错误态：`aria-invalid:border-destructive aria-invalid:ring-destructive/20`

#### 设计要点

- 项目中使用 `FIELD_STYLES.input` 类名获取统一样式（`w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1A2FFF] focus:border-[#1A2FFF]`）
- 带标签时标签在上方（见 [3.1 表单字段布局](#31-表单字段布局)）

#### 使用示例

```tsx
// 基本用法
<Input
  value={formData.name}
  onChange={(e) => updateField('name', e.target.value)}
  placeholder="请输入客户名称"
  className={FIELD_STYLES.input}
/>

// 带标签
<label className={FIELD_STYLES.label}>
  客户名称{FIELD_STYLES.requiredStar}
</label>
<Input className={FIELD_STYLES.input} ... />
```

---

### 2.4 Textarea（文本域）

基于原生 `<textarea>` 封装。

**文件位置：** `src/components/ui/textarea.tsx`

#### Props API

继承全部 `React.ComponentProps<'textarea'>`。

#### 视觉规范

- 与 Input 相同的边框、圆角、焦点态样式
- 最小高度：`min-h-16`（64px），可使用 `min-h-[80px]` 或自定义
- 默认 `field-sizing-content`（自动高度）
- 字号：`text-base`（桌面端 `md:text-sm`）

#### 使用示例

```tsx
<Textarea
  value={formData.businessScope}
  onChange={(e) => updateField('businessScope', e.target.value)}
  placeholder="请输入经营范围"
  className="min-h-[80px]"
/>
```

---

### 2.5 Button（按钮）

基于 `class-variance-authority` (cva) + `@radix-ui/react-slot` 实现。

**文件位置：** `src/components/ui/button.tsx`

#### Props API

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `variant` | `'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link'` | 否 | `'default'` | 按钮变体 |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon' \| 'icon-sm' \| 'icon-lg'` | 否 | `'default'` | 按钮尺寸 |
| `asChild` | `boolean` | 否 | `false` | 是否作为子元素的容器（用于 Link 等） |
| 其他 | `React.ComponentProps<'button'>` | - | - | 继承原生 button 属性 |

#### 变体视觉规范

| Variant | 样式 | 用途 |
|---------|------|------|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/90` | 主按钮（实际渲染为品牌色 `#1A2FFF`） |
| `destructive` | `bg-destructive text-white hover:bg-destructive/90` | 危险操作 |
| `outline` | `border bg-background shadow-xs hover:bg-accent` | 次按钮、取消按钮 |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80` | 辅助按钮 |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` | 无背景按钮 |
| `link` | `text-primary underline-offset-4 hover:underline` | 链接样式按钮 |

#### 尺寸规范

| Size | 高度 | 水平内边距 | 用途 |
|------|------|-----------|------|
| `default` | `h-9` (36px) | `px-4 py-2` | 一般按钮 |
| `sm` | `h-8` (32px) | `px-3` | 紧凑按钮、表格操作 |
| `lg` | `h-10` (40px) | `px-6` | 强调按钮 |
| `icon` | `size-9` (36px) | - | 图标按钮 |
| `icon-sm` | `size-8` (32px) | - | 小图标按钮 |
| `icon-lg` | `size-10` (40px) | - | 大图标按钮 |

#### 全局特征

- 文本：`text-sm font-medium`
- 图标间距：`gap-2`，内嵌图标尺寸 `size-4`
- 圆角：`rounded-md`（8px）
- 焦点态：`focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- 禁用态：`disabled:pointer-events-none disabled:opacity-50`

#### 使用示例

```tsx
import { Button } from '@/components/ui/button';
import { Plus, Save } from 'lucide-react';

{/* 主按钮 */}
<Button onClick={handleSubmit}>
  <Save className="w-4 h-4" />
  保存
</Button>

{/* 次按钮 */}
<Button variant="outline" onClick={handleCancel}>
  取消
</Button>

{/* 图标按钮 */}
<Button variant="ghost" size="icon">
  <MoreHorizontal className="w-4 h-4" />
</Button>
```

---

### 2.6 Badge（标签/徽章）

基于 `class-variance-authority` 实现的小型标签组件。

**文件位置：** `src/components/ui/badge.tsx`

#### Props API

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `variant` | `'default' \| 'secondary' \| 'destructive' \| 'outline'` | 否 | `'default'` | 变体 |
| `asChild` | `boolean` | 否 | `false` | 是否作为子元素容器 |
| 其他 | `React.ComponentProps<'span'>` | - | - | 继承 span 属性 |

#### 视觉规范

- 基础样式：`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0`
- 内嵌图标尺寸：`size-3`（12px）
- Variant `secondary`（项目最常用）：`bg-secondary text-secondary-foreground`（灰色底，适合标签、人员芯片）
- Variant `default`：`bg-primary text-primary-foreground`（品牌色底白字）

#### 使用示例

```tsx
import { Badge } from '@/components/ui/badge';

{/* 用于 SearchableMultiSelect 中的选项标签 */}
<Badge variant="secondary" className="gap-1 pr-1">
  <span className="text-xs">张三</span>
  <button className="rounded-full hover:bg-gray-300 p-0.5">
    <X className="w-3 h-3" />
  </button>
</Badge>

{/* 状态指示 */}
<Badge variant="secondary">待处理</Badge>
```

---

### 2.7 Dialog（对话框/弹窗）

基于 `@radix-ui/react-dialog` 封装的模态对话框。

**文件位置：** `src/components/ui/dialog.tsx`

#### 子组件

| 组件 | 用途 |
|------|------|
| `Dialog` | 根容器 |
| `DialogTrigger` | 触发器 |
| `DialogContent` | 弹窗内容面板（含遮罩层和关闭按钮） |
| `DialogHeader` | 头部区域（标题 + 描述） |
| `DialogTitle` | 弹窗标题 |
| `DialogDescription` | 弹窗描述文字 |
| `DialogFooter` | 底部操作区（flex 右对齐） |
| `DialogClose` | 关闭按钮 |

#### 视觉规范

- **遮罩层**：`fixed inset-0 z-50 bg-black/50`，带淡入淡出动画
- **内容面板**：
  - 居中定位：`fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]`
  - `z-50`，`w-full max-w-[calc(100%-2rem)] sm:max-w-lg`（手机上留边距）
  - 背景 `bg-white`，`rounded-lg border`
  - 内边距 `p-6`，内部 gap `gap-4`
  - 缩放动画：`data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95`
- **关闭按钮**：绝对定位 `top-4 right-4`，opacity-70，hover:opacity-100
- **Header**：`flex flex-col gap-2 text-center sm:text-left`
- **Title**：`text-lg leading-none font-semibold`
- **Description**：`text-muted-foreground text-sm`
- **Footer**：`flex flex-col-reverse gap-2 sm:flex-row sm:justify-end`（手机端按钮纵向排列）

#### 使用示例

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogTrigger asChild>
    <Button variant="outline">选择用户</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[480px]">
    <DialogHeader>
      <DialogTitle>选择协作人</DialogTitle>
      <DialogDescription>选择要添加的协作人员</DialogDescription>
    </DialogHeader>
    {/* 内容区 */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
      <Button onClick={handleConfirm}>确定</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### 设计要点

- `DialogTrigger` 配合 `asChild` 可包裹自定义触发器（如 Button）
- 受控模式：通过 `open` + `onOpenChange` 控制
- 无键盘陷阱问题（由 Radix 处理）
- 弹窗出现时自动锁定背景滚动

---

### 2.8 Card（卡片容器）

**文件位置：** `src/components/ui/card.tsx`

#### 视觉规范

- 基础样式：`bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm`
- 内边距 `px-6`（通过 `CardContent` 控制）
- 圆角 `rounded-xl`（12px）
- 阴影 `shadow-sm`

#### 子组件与使用

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>基本信息</CardTitle>
    <CardDescription>填写客户的基本信息</CardDescription>
  </CardHeader>
  <CardContent>
    {/* 表单字段 */}
  </CardContent>
  <CardFooter>
    {/* 操作按钮 */}
  </CardFooter>
</Card>
```

---

### 2.9 Tabs（标签页切换）

基于 `@radix-ui/react-tabs` 封装。

**文件位置：** `src/components/ui/tabs.tsx`

#### 视觉规范

- **TabsList**（Tab 容器）：
  - `bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]`
  - 即背景色 `#F5F6F8`，圆角 8px，内边距 3px
- **TabsTrigger**（单个 Tab）：
  - `inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap`
  - 激活态：`data-[state=active]:bg-background data-[state=active]:shadow-sm`（白底 + 轻微阴影）
  - 禁用态：`disabled:pointer-events-none disabled:opacity-50`
- **TabsContent**：`flex-1 outline-none`

#### 使用示例

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="bg-[#F5F6F8] rounded-lg p-1">
    <TabsTrigger value="basic">企业基本信息</TabsTrigger>
    <TabsTrigger value="business">工商资质全景</TabsTrigger>
  </TabsList>
  <TabsContent value="basic">
    {/* 基本信息表单 */}
  </TabsContent>
  <TabsContent value="business">
    {/* 工商信息表单 */}
  </TabsContent>
</Tabs>
```

---

### 2.10 Avatar（头像）

基于 `@radix-ui/react-avatar` 封装。

**文件位置：** `src/components/ui/avatar.tsx`

#### 视觉规范

- 默认尺寸：`size-8`（32px），可通过 className 覆盖
- 形状：`rounded-full`
- Fallback：`bg-muted flex items-center justify-center`（灰色底居中文字）

#### 项目自定义模式：UserAvatar

项目中常用的用户头像使用渐变圆形背景：

```tsx
function UserAvatar({ userId, size }: { userId: string; size?: 'sm' | 'md' }) {
  const user = getUserById(userId);
  const initial = user ? user.name.charAt(0) : '?';
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#1A2FFF] to-[#3B52FF] text-white flex items-center justify-center font-medium shrink-0`}>
      {initial}
    </div>
  );
}
```

#### 设计要点

- 尺寸变体：`sm`（24px，`w-6 h-6 text-xs`）/ `md`（32px，`w-8 h-8 text-sm`）
- 背景：渐变蓝色 `bg-gradient-to-br from-[#1A2FFF] to-[#3B52FF]`
- 文字：白色，`font-medium`
- 显示内容：用户姓名的首字符

---

### 2.11 其他常用组件索引

| 组件 | 文件 | 用途 |
|------|------|------|
| `Popover` | `popover.tsx` | 弹出层容器（SearchableSelect 的基础） |
| `Command` | `command.tsx` | 搜索式命令面板（cmdk） |
| `ScrollArea` | `scroll-area.tsx` | 自定义滚动条容器 |
| `Skeleton` | `skeleton.tsx` | 数据加载骨架屏 |
| `Separator` | `separator.tsx` | 水平/垂直分割线 |
| `Tooltip` | `tooltip.tsx` | 鼠标悬停提示 |
| `Table` | `table.tsx` | 数据表格 |
| `Checkbox` | `checkbox.tsx` | 复选框 |
| `Switch` | `switch.tsx` | 开关切换 |
| `ProgressStepper` | `components/ProgressStepper.tsx` | 6 阶段跟进步骤条 |
| `CollaborationDialogs` | `components/CollaborationDialogs.tsx` | 协同/分配/移交弹窗 |

---

## 3. 表单布局规范

### 3.1 表单字段布局

每个表单字段使用 **标签在上、输入框在下** 的纵向布局：

```tsx
<div>
  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
    字段名称
    <span className="text-[#FF4D4F] ml-0.5">*</span>
  </label>
  <Input className={FIELD_STYLES.input} ... />
</div>
```

**开发约定：**
- 标签样式统一使用 `FIELD_STYLES.label`（`'block text-sm font-medium text-[#1A1A1A] mb-1'`）
- 必填星号统一使用 `FIELD_STYLES.requiredStar`（React 元素，避免 JSX 中重复创建 `<span>`）
- 输入框样式统一使用 `FIELD_STYLES.input` 或 `FIELD_STYLES.selectTrigger`

### 3.2 必填字段标识

必填字段在标签文字后附加红色星号：

```tsx
<label className={FIELD_STYLES.label}>
  客户名称{FIELD_STYLES.requiredStar}
</label>
```

- 颜色：`#FF4D4F`（error 色）
- 位置：标签文字右侧，间距 `ml-0.5`（2px）

### 3.3 表单网格布局

多列字段使用 CSS Grid 响应式布局：

| 场景 | Tailwind 类 | 说明 |
|------|------------|------|
| 2 列 | `grid grid-cols-1 md:grid-cols-2 gap-4` | 移动端单列，平板以上双列 |
| 4 列 | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4` | 移动端单列，平板双列，桌面四列 |
| 3 列 | `grid grid-cols-1 md:grid-cols-3 gap-4` | 移动端单列，平板以上三列 |

**关键规则：**
- 列内间距统一使用 `gap-4`（16px）
- 任何网格布局必须有移动端单列兜底（`grid-cols-1`）
- 宽字段（如地址、经营范围）使用 `md:col-span-2` 或 `lg:col-span-full`

使用示例：

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <div>
    <label className={FIELD_STYLES.label}>统一社会信用代码</label>
    <Input className={FIELD_STYLES.input} ... />
  </div>
  <div>
    <label className={FIELD_STYLES.label}>法人代表</label>
    <Input className={FIELD_STYLES.input} ... />
  </div>
  <div>
    <label className={FIELD_STYLES.label}>联系电话</label>
    <Input className={FIELD_STYLES.input} ... />
  </div>
  <div>
    <label className={FIELD_STYLES.label}>电子邮箱</label>
    <Input className={FIELD_STYLES.input} ... />
  </div>
</div>
```

### 3.4 表单区块间距

表单内不同逻辑区域之间使用 `space-y-6`（24px）：

```tsx
<div className="space-y-6">
  <section>
    <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">基本信息</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 字段 */}
    </div>
  </section>

  <section>
    <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">工商信息</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 字段 */}
    </div>
  </section>
</div>
```

### 3.5 表单错误提示

字段级验证错误在对应字段下方显示：

```tsx
<div className="bg-[#FFF1F0] border border-[#FFCCC7] rounded-lg text-sm text-[#FF4D4F] px-3 py-2 mt-1">
  请输入客户名称
</div>
```

- 背景色：`#FFF1F0`（极浅红）
- 边框色：`#FFCCC7`（浅红）
- 文字色：`#FF4D4F`（错误红）
- 圆角：`rounded-lg`（8px）
- 与上方字段间距：`mt-1`（4px）

### 3.6 表单整体结构

```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>基本信息</CardTitle>
      <CardDescription>填写客户基本信息</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 表单字段 */}
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>工商资质</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 表单字段 */}
      </div>
    </CardContent>
  </Card>

  {/* 提交区域 */}
  <div className="flex justify-end gap-3 pt-4 border-t border-[#EEEEEE]">
    <Button variant="outline" type="button" onClick={handleCancel}>取消</Button>
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? '保存中...' : '保存'}
    </Button>
  </div>
</form>
```

---

## 4. 页面布局规范

### 4.1 AppLayout 全局布局

所有页面由 `AppLayout` 包裹，提供统一的页面框架。

**文件位置：** `src/components/layout/AppLayout.tsx`

#### 布局参数

| 区域 | 规格 | 说明 |
|------|------|------|
| 顶部导航高度 | `h-[60px]` | 固定在顶部，`z-50` |
| 顶部导航背景 | `bg-gradient-to-r from-[#1A2FFF] via-[#2B45FF] to-[#3B52FF]` | 蓝色渐变 |
| 侧边栏宽度 | `w-[200px]` | 固定宽度，`top-[60px]` 开始 |
| 侧边栏背景 | `bg-white` | 白色底，右侧 `border-r border-[#E8ECF5]` |
| 内容区左边距 | `ml-[200px]` | 与侧边栏对齐 |
| 内容区内边距 | `p-5`（20px） | 统一内容区内边距 |
| 页面底色 | `bg-gradient-to-br from-[#F8F9FC] via-[#F1F3F8] to-[#E8ECF5]` | 微渐变淡蓝灰底色 |

#### 使用方式

```tsx
'use client';

import AppLayout from '@/components/layout/AppLayout';

export default function CustomersPage() {
  return (
    <AppLayout>
      {/* 页面内容 */}
    </AppLayout>
  );
}
```

#### 侧边栏导航

- 一级菜单：`px-4 py-3 rounded-xl text-sm`，激活态蓝色渐变 `from-[#1A2FFF] to-[#3B52FF] text-white font-semibold shadow-lg`
- 二级菜单：`pl-4 pr-4 py-2.5 rounded-lg text-sm`，激活态同蓝色渐变
- 菜单分组折叠/展开：ChevronDown 图标旋转 180 度
- 激活指示：菜单右侧 `w-1.5 h-1.5 rounded-full bg-white animate-pulse`
- 菜单间距：`mb-1`

#### 顶部导航栏

- 左侧：Logo 图标（`w-8 h-8 bg-white/20 rounded-lg backdrop-blur-sm`）+ 系统名称
- 右侧：当前用户名 + 用户头像（渐变圆，`w-9 h-9 bg-gradient-to-br from-white/30 to-white/10`）
- 系统名称：`text-lg font-bold tracking-wide`，"CIM 客户信息管理系统"

### 4.2 页面头部

每个模块页面应包含页面头部：

```tsx
<div className="flex items-center justify-between mb-5">
  <div className="flex items-center gap-3">
    {/* 返回按钮（子页面） */}
    <button
      onClick={() => router.back()}
      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F6F8] transition-colors"
    >
      <ArrowLeft className="w-5 h-5 text-[#666666]" />
    </button>
    <h1 className="text-xl font-bold text-[#1A1A1A]">页面标题</h1>
  </div>
  <div className="flex items-center gap-3">
    {/* 右侧操作按钮 */}
    <Button variant="outline">导出</Button>
    <Button><Plus className="w-4 h-4" />新增客户</Button>
  </div>
</div>
```

#### 设计要点

- 返回按钮仅子页面（详情/编辑/新增）显示，列表页不显示
- 标题使用 `text-xl font-bold text-[#1A1A1A]`
- 操作按钮区域使用 `flex items-center gap-3`
- 与下方内容间距：`mb-5`（20px）

### 4.3 卡片容器

内容区域使用 Card 组件作为容器：

```tsx
<Card>
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
    <CardDescription>卡片辅助说明文字</CardDescription>
  </CardHeader>
  <CardContent>
    {/* 内容 */}
  </CardContent>
</Card>
```

- 背景 `bg-white`、圆角 `rounded-xl`（12px）、边框 `border-[#EEEEEE]`
- 内边距 `p-6`（24px）
- 卡片间垂直间距：`space-y-6`（24px）

### 4.4 标签页导航 (Tab Navigation)

页面内的标签导航使用 Tabs 组件，配合自定义样式：

```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="bg-[#F5F6F8] rounded-lg p-1 mb-6">
    <TabsTrigger value="tab1">标签一</TabsTrigger>
    <TabsTrigger value="tab2">标签二</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">{/* 内容 */}</TabsContent>
  <TabsContent value="tab2">{/* 内容 */}</TabsContent>
</Tabs>
```

- Tab 导航与下方内容间距：`mb-6`（24px）
- 激活 Tab：白色背景 + `shadow-sm`
- 非激活 Tab：透明 + muted 文字色

### 4.5 响应式断点

| 断点 | 最小宽度 | 布局变化 |
|------|---------|----------|
| `sm` | 640px | Dialog 最大宽度变大 |
| `md` | 768px | 网格变为 2 列或 3 列 |
| `lg` | 1024px | 网格变为 4 列，表格可用 |
| `xl` | 1280px | 超大屏内容区最大宽度限制 |

---

## 5. 交互规范

### 5.1 下拉选择交互

#### 单选下拉 (SearchableSelect)

```
用户行为流程：
1. 点击触发器 → 弹出选项面板
2. 在搜索框输入 → 模糊过滤选项列表
3. 点击目标选项 → 选中该选项 → 面板自动关闭
4. 触发器显示选中项的 label
5. 点击面板外区域 → 面板关闭，选中项不变
```

#### 多选下拉 (SearchableMultiSelect)

```
用户行为流程：
1. 点击触发器 → 弹出选项面板
2. 在搜索框输入 → 模糊过滤选项列表
3. 点击目标选项 → 切换该项选中状态 → 面板保持打开
4. 触发器上方显示已选项 Badge 列表
5. 点击 Badge X 按钮 → 移除该项 → Badge 消失
6. 点击面板外区域 → 面板关闭
```

#### 通用规则

- 搜索输入框自动聚焦（打开面板后）
- Check 图标 `text-[#1A2FFF]` 标识已选中
- 选项列表最大高度 `h-52`（208px），超出后滚动
- 选项 hover 有高亮背景
- 空状态（无匹配结果）显示 `emptyText`

### 5.2 表单提交流程

```
1. 用户填写表单 → 点击提交按钮
2. 前端校验：
   - 必填字段不为空
   - 格式校验（邮箱、手机号等）
   - 长度限制
3. 校验失败 → 错误字段下方显示红色错误提示
4. 校验通过 → 按钮进入 loading 状态
   - 按钮显示 "处理中..." / "保存中..."
   - 按钮 disabled，不可重复点击
   - 可选：页面顶部显示进度提示
5. 操作成功：
   - 显示成功 toast 提示
   - 自动跳转到列表页 / 详情页
6. 操作失败：
   - 显示错误 toast 提示
   - 保持在当前页面
   - 不清空表单数据
```

#### Loading 状态实现

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  // 校验
  if (!validate()) return;

  setIsSubmitting(true);
  try {
    await saveData(formData);
    router.push('/customers');
  } catch (error) {
    // 错误处理
  } finally {
    setIsSubmitting(false);
  }
};

// JSX
<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? '保存中...' : '保存'}
</Button>
```

### 5.3 未保存更改提醒

当用户在表单页面有未保存的更改时，离开页面需要确认。

**实现方式：**

```tsx
const [isDirty, setIsDirty] = useState(false);

// 监听浏览器关闭/刷新
useEffect(() => {
  if (!isDirty) return;
  const handler = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = '';
  };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}, [isDirty]);

// 路由跳转拦截（Next.js App Router 不直接支持，推荐使用确认弹窗模式）
```

**对用户表现：**
- 浏览器原生 `beforeunload` 弹窗（关闭/刷新页面时）
- 应用内导航：在点击导航/返回按钮前检查 `isDirty`，弹出确认 Dialog

### 5.4 加载状态

#### 列表页加载

使用 `Skeleton` 组件展示骨架屏：

```tsx
{isLoading && (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
)}
```

#### 按钮加载

按钮改为禁用态 + 文字变更：

```tsx
<Button disabled={isSubmitting}>
  {isSubmitting ? '处理中...' : '确认提交'}
</Button>
```

### 5.5 列表页面视图切换

客户列表页支持卡片视图与表格视图切换（视图偏好存入 `localStorage`）：

```tsx
const [viewMode, setViewMode] = useState<ViewMode>(getStoredViewMode);

<div className="flex gap-1 bg-[#F5F6F8] rounded-lg p-1">
  <button
    onClick={() => { setViewMode('card'); setStoredViewMode('card'); }}
    className={`p-1.5 rounded ${viewMode === 'card' ? 'bg-white shadow-sm' : ''}`}
  >
    <LayoutGrid className="w-4 h-4" />
  </button>
  <button
    onClick={() => { setViewMode('table'); setStoredViewMode('table'); }}
    className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white shadow-sm' : ''}`}
  >
    <List className="w-4 h-4" />
  </button>
</div>
```

- 切换按钮容器：`bg-[#F5F6F8] rounded-lg p-1` + `flex gap-1`
- 激活按钮：`bg-white shadow-sm`
- 图标：`LayoutGrid` / `List`（Lucide React）
- 视图偏好存储键：`cim-customers-view-mode`

---

## 6. 数据展示规范

### 6.1 客户列表

客户列表支持两种视图模式：

#### 卡片视图 (Card View)

- 每个客户一张卡片，响应式网格排列
- 卡片内容：客户名称、客户编号、状态 Badge、负责人、联系电话
- Hover 效果：轻微阴影提升
- 点击卡片进入客户详情

#### 表格视图 (Table View)

- 使用 `Table` 组件展示
- 列：客户名称、客户编号、状态、跟进进度、负责人、创建时间、操作
- 表头固定在顶部（如需要）
- 操作列：查看、编辑、更多操作（DropdownMenu）

### 6.2 状态展示

#### 状态 Badge 配色方案

| 状态类型 | 状态值 | Badge 样式 |
|---------|-------|-----------|
| 客户状态 - 正常 | `active` | `bg-[#E6F7F0] text-[#00A870]` |
| 客户状态 - 停用 | `inactive` | `bg-[#EEEEEE] text-[#666666]` |
| 客户状态 - 潜在 | `potential` | `bg-[#FFF4E8] text-[#FF8A00]` |
| 客户状态 - 冻结 | `frozen` | `bg-[#FFEBEE] text-[#E53935]` |

```tsx
function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: 'bg-[#E6F7F0] text-[#00A870]',
    inactive: 'bg-[#EEEEEE] text-[#666666]',
    potential: 'bg-[#FFF4E8] text-[#FF8A00]',
    frozen: 'bg-[#FFEBEE] text-[#E53935]',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[status]}`}>
      {label}
    </span>
  );
}
```

#### 跟进进度 Badge

跟进进度有独立的配色方案，通过 `PROGRESS_STATUS_COLORS` 常量管理：

```tsx
function ProgressBadge({ status }: { status: ProgressStatus }) {
  const colors = PROGRESS_STATUS_COLORS[status];
  const label = PROGRESS_STATUS_LABELS[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      {label}
    </span>
  );
}
```

### 6.3 用户头像

#### 列表/卡片中的用户头像

使用渐变圆形 + 用户姓名首字符：

- 小尺寸：`w-6 h-6 text-xs`（24px，用于列表行内）
- 中尺寸：`w-8 h-8 text-sm`（32px，用于卡片）
- 背景：`bg-gradient-to-br from-[#1A2FFF] to-[#3B52FF]`
- 文字：白色 `font-medium`

#### 顶部导航栏用户头像

- 尺寸：`w-9 h-9`（36px）
- 背景：`bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm border border-white/20`
- 文字：`text-sm font-semibold`
- Hover：`hover:scale-105 transition-transform duration-200`

### 6.4 空状态

当列表/表格无数据时，展示空状态：

```tsx
<div className="flex flex-col items-center justify-center py-16">
  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#F5F6F8] mb-4">
    <Users className="w-8 h-8 text-[#999999]" />
  </div>
  <p className="text-[#999999] text-sm">暂无客户数据</p>
  <Button className="mt-4">
    <Plus className="w-4 h-4" />
    新增客户
  </Button>
</div>
```

- 图标：Lucide 对应模块图标，`w-8 h-8 text-[#999999]`
- 图标容器：`w-16 h-16 rounded-full bg-[#F5F6F8]`（64px 灰色圆形底）
- 提示文字：`text-[#999999] text-sm`
- 居中排列：`flex flex-col items-center justify-center`
- 垂直内边距：`py-16`（64px）
- 可选：新增按钮引导

### 6.5 数据表格

使用 `Table` 组件规范：

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>客户名称</TableHead>
      <TableHead>状态</TableHead>
      <TableHead>负责人</TableHead>
      <TableHead>创建时间</TableHead>
      <TableHead className="w-[100px]">操作</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {customers.map((customer) => (
      <TableRow key={customer.id}>
        <TableCell className="font-medium">{customer.name}</TableCell>
        <TableCell><StatusBadge status={customer.status} /></TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <UserAvatar userId={customer.responsiblePersons[0]} size="sm" />
            <span className="text-sm">{getUserName(customer.responsiblePersons[0])}</span>
          </div>
        </TableCell>
        <TableCell className="text-[#666666]">{customer.createdAt}</TableCell>
        <TableCell>
          {/* 操作按钮 */}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### 6.6 分页

使用 `Pagination` 组件，位于表格下方：

- 位置：列表/表格底部，右对齐或居中
- 显示：总条数、每页条数、当前页码、上/下一页按钮
- 项目使用 `Pagination` 组件（`src/components/ui/pagination.tsx`）

---

## 7. 文件组织规范

### 7.1 目录结构

```
src/
├── components/
│   ├── ui/                        # 共享 UI 组件（shadcn/ui 扩展）
│   │   ├── searchable-select.tsx  # 可搜索单选下拉
│   │   ├── searchable-multi-select.tsx  # 可搜索多选下拉
│   │   ├── button.tsx             # 按钮
│   │   ├── input.tsx              # 输入框
│   │   ├── textarea.tsx           # 文本域
│   │   ├── badge.tsx              # 标签
│   │   ├── dialog.tsx             # 对话框
│   │   ├── card.tsx               # 卡片容器
│   │   ├── tabs.tsx               # 标签页
│   │   ├── table.tsx              # 表格
│   │   └── ...                    # 其他 shadcn/ui 组件
│   ├── layout/
│   │   └── AppLayout.tsx          # 全局布局（顶部导航+侧边栏+内容区）
│   ├── ProgressStepper.tsx        # 跟进进度步骤条
│   ├── CollaborationDialogs.tsx   # 协同/分配/移交弹窗
│   └── RuleGroupEditor.tsx        # 规则组编辑器
├── lib/
│   ├── types.ts                   # 所有 TypeScript 类型定义
│   ├── store.tsx                  # 全局状态（useReducer + Context）
│   ├── ui-constants.tsx           # UI 常量（颜色、样式类、必填星号）
│   ├── sample-data.ts             # 示例数据 + 业务常量
│   └── utils.ts                   # 工具函数（cn、格式化等）
├── app/                           # Next.js App Router 页面
│   ├── page.tsx                   # 首页
│   ├── customers/                 # 客户管理模块
│   │   ├── page.tsx               # 客户列表
│   │   ├── new/page.tsx           # 新增客户
│   │   ├── [id]/page.tsx          # 客户详情
│   │   └── [id]/edit/page.tsx     # 编辑客户
│   ├── followup/                  # 跟进记录模块
│   ├── opportunities/             # 商机管理模块
│   ├── quotes/                    # 售前报价模块
│   ├── approvals/                 # 风控审批模块
│   ├── entities/                  # 主体管理模块
│   ├── rules/                     # 规则配置模块
│   ├── approval/                  # 审批流程配置
│   └── settings/                  # 系统设置
└── db/
    └── schema.ts                  # 数据库 Schema（Drizzle ORM）
```

### 7.2 文件大小限制

- **单文件最大 800 行**（硬性上限）
- 超出时拆分子组件到同目录下
- 典型文件范围：200-400 行

### 7.3 组件文件约定

- 每个组件一个文件，保持单文件职责单一
- 组件使用 `function` 声明（非箭头函数），便于 DevTools 识别
- 所有交互页面文件顶部必须声明 `'use client'`
- 纯工具/类型文件不加 `'use client'`
- 导出类型（interface/type）从定义处直接 export，便于跨文件引用

### 7.4 模块目录模式

每个业务模块（如 `customers/`）遵循以下路由模式：

| 路由 | 文件 | 说明 |
|------|------|------|
| 列表 | `page.tsx` | 模块列表页 |
| 新增 | `new/page.tsx` | 新增记录表单 |
| 详情 | `[id]/page.tsx` | 记录详情展示 |
| 编辑 | `[id]/edit/page.tsx` | 编辑记录表单 |

### 7.5 常量与配置组织

| 常量类型 | 存放位置 | 示例 |
|---------|---------|------|
| UI 样式常量 | `src/lib/ui-constants.tsx` | `FIELD_STYLES`, `BRAND_COLORS`, `SEMANTIC_COLORS` |
| 业务映射常量 | `src/lib/sample-data.ts` | `PROGRESS_STATUS_LABELS`, `INDUSTRY_CHAIN_LEVEL_LABELS` |
| 状态颜色映射 | `src/lib/sample-data.ts` | `PROGRESS_STATUS_COLORS`, `INDUSTRY_CHAIN_LEVEL_COLORS` |
| 模拟用户数据 | `src/lib/sample-data.ts` | `MOCK_USERS` |
| 类型定义 | `src/lib/types.ts` | `Customer`, `Quote`, `ProgressStatus` 等 |

---

## 8. 附录：开发约定

### 8.1 色彩使用规则

1. **品牌色 `#1A2FFF`** 用于：主要按钮背景、选中态标识、焦点环、链接文字、顶部导航
2. **品牌色悬停 `#3B52FF`** 用于：按钮 hover、渐变背景终点
3. **品牌色浅色 `#E8F0FF`** 用于：菜单激活/悬停背景、选中卡片背景
4. **功能色**（success / warning / error / info）：仅用于状态标识、提示信息
5. **中性色**：正文文字 #1A1A1A、辅助文字 #666666、边框 #E0E0E0

### 8.2 Tailwind 使用规范

- 优先使用 Tailwind 内置类，其次使用任意值（`bg-[#1A2FFF]`）
- 项目不使用 CSS Module，所有样式通过 Tailwind 类或内联 style 实现
- 常见复用样式封装为常量（`FIELD_STYLES`）而非 CSS 类，保持 StyleX 一致

### 8.3 TypeScript 规范

- 组件 Props 使用 interface 定义，不使用 `React.FC`
- 公开暴露的类型（如 `SelectOption`）从组件文件 export
- 避免 `any`，使用泛型处理通用组件
- 数据操作使用不可变更新（spread）

### 8.4 图标规范

- 统一使用 **Lucide React** 图标库
- 图标默认尺寸：`w-4 h-4`（16px）
- 小图标：`w-3 h-3`（12px，Badge 内 X 按钮等）
- 大图标：`w-5 h-5`（20px，侧边栏菜单图标）
- 空状态图标：`w-8 h-8`（32px）
- 图标颜色继承父元素文字色（`stroke="currentColor"`）

### 8.5 文案规范

- 所有面向用户的文字使用**中文**
- 占位符（placeholder）使用"请..."格式：`placeholder="请输入客户名称"`
- 按钮文字简洁明了：`保存` / `取消` / `新增客户` / `搜索`
- 空状态提示使用"暂无..."格式：`暂无客户数据`
- 错误提示直接描述问题：`请输入客户名称` / `邮箱格式不正确`

### 8.6 无障碍 (Accessibility) 基础要求

- 表单字段必须有 `label` 关联（通过 `htmlFor` 或包裹）
- 按钮必须有可识别文本或 `aria-label`
- Dialog 关闭按钮有 `sr-only` 的"关闭"文字
- 图标按钮使用 `aria-label` 提供文本描述
- 颜色不能是传达信息的唯一方式（配合图标或文字）

### 8.7 组件开发检查清单

新组件开发前请确认：

- [ ] Props 类型已定义完整（含 JSDoc 或注释说明）
- [ ] 支持 `className` 透传以允许外部样式覆盖
- [ ] 支持 `disabled` 状态（如适用）
- [ ] 禁用态有视觉反馈（`opacity-50 cursor-not-allowed` 或等价）
- [ ] 空状态有兜底展示
- [ ] Loading 状态有视觉反馈（如适用）
- [ ] 错误状态有视觉反馈（如适用）
- [ ] 使用 `'use client'` 指令（如有交互逻辑）
- [ ] 遵循不可变更新模式
- [ ] 所有文案使用中文
