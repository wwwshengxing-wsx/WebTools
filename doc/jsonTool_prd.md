# JSON 工具 PRD

## 概述
- 目标：提供一个前端 JSON 处理工具，支持用户粘贴/编写 JSON 文本，并立即查看格式化预览和可折叠的结构化树视图。
- 背景：参考原型截图中的左右双栏界面，左侧为原始 JSON 编辑区，右侧为高亮的树状展示区，并配备工具栏按钮（格式化、运行、导出、折叠控制、复制、清除、保留转义开关等）。
- 成功标准：输入合法 JSON 时必须实时展示解析结果；错误时给出明确提示；提供一键格式化与导出，交互流畅无明显卡顿。

## 用户场景
- **开发者/测试人员**：粘贴 API 返回体，快速查看结构、检查字段并复制片段。
- **产品/运营**：读取外部提供的 JSON 文档，通过树状视图核对字段名称和金额数值。
- **学习者**：尝试修改 JSON 字段并观察解析错误提示，理解 JSON 语法。

## 关键体验
1. 双栏布局：左侧文本编辑器、右侧树视图，保持同步高度。
2. 工具栏常驻顶部，提供主要操作按钮与一个“保留转义”复选框。
3. 当 JSON 无法解析时，右侧改为错误面板，显示错误信息与指向的行/列（若可获取）。
4. 右侧树节点可逐级展开/折叠；支持全局展开/折叠控制。
5. 提供一键复制、下载（.json 文件）、清空文本等便捷操作。

## 功能需求
### 布局
- 桌面端采用左右 50/50 栅格，自适应小屏时堆叠为上下结构。
- 顶部工具栏包含主要按钮、辅助图标按钮以及 "保留转义" 开关。

### 文本输入面板
- 默认填充示例 JSON（与截图类似的金融账单结构），帮助用户快速体验。
- 使用等宽字体与行号背景，支持大文本滚动。
- 输入改变时在 300ms 防抖后尝试解析，更新右侧视图。
- 提供操作：
  - `格式化`：Pretty print 当前 JSON，两个空格缩进。
  - `在线运行`：显式触发解析（与自动解析共存，便于与原型按钮对齐）。
  - `清空`：快速清除文本。

### 解析与错误处理
- 解析失败时记录 `errorMessage`，并在右侧以卡片展示错误详情。
- 如果可获得错误位置（使用 `JSON.parse` 的 `message`），提取行列信息展示。

### 树状视图
- 对解析成功的 JSON 值进行递归渲染：
  - 对象显示键和值类型标签。
  - 数组显示索引与统一类型信息。
  - 字符串/数字/布尔/null 使用不同颜色强调。
- 每个容器节点有展开切换；默认展开根节点，子节点默认展开一层。
- 工具栏按钮：`全部展开`、`全部折叠`、`复制结果`、`导出 JSON`。
- "保留转义" 开关影响复制与导出逻辑：
  - 开关开启 → 输出保持 `\n`, `\t` 等转义字符。
  - 关闭 → 输出为真实字符（例如换行符）。

### 文件 & 复制
- `复制结果`：将当前格式化 JSON 文本写入剪贴板，并展示 Toast/提示文本。
- `导出 JSON`：下载名为 `json-tool-export.json` 的文件，内容为格式化 JSON。

## 非功能需求
- 解析与格式化操作需在 16ms 内完成 100KB 文本（良好体验）。
- 所有按钮需可通过键盘焦点访问，并提供 `aria-label`。
- 移动端最小宽度 320px 下仍可使用（纵向排列）。

## 实现拆解
### 状态层
- `src/pages/JsonTools/hooks/useJsonTool.ts`
  - 管理 `rawInput`, `parsedValue`, `error`, `isPreserveEscapes`, `lastFormatted`。
  - 暴露操作：`setRawInput`, `format`, `runParse`, `togglePreserveEscapes`, `setAllExpanded`, `copy`, `download`, `clear`。
  - 提供树节点展开状态（字典存储 `pathString -> bool`）。
  - 实现复制 & 下载时的字符串构造。

### 组件层
- `src/pages/JsonTools/index.tsx`
  - 页面布局与组织；挂接 hook；传递 props 给子组件。
- `src/pages/JsonTools/components/Toolbar.tsx`
  - 渲染主按钮（格式化、在线运行）及辅助图标按钮（展开/折叠、复制、下载、清空），包含保留转义复选框。
- `src/pages/JsonTools/components/TextEditor.tsx`
  - 文本域 + 行号背景，暴露 `value`, `onChange`。
- `src/pages/JsonTools/components/TreePreview.tsx`
  - 根据 `parsedValue` 与 `expandState` 渲染树；内部组合 `TreeNode` 子组件。
- `src/pages/JsonTools/components/ErrorPanel.tsx`
  - 当解析失败时显示错误标题与 message。

### 辅助模块
- `src/pages/JsonTools/lib/jsonStringify.ts`
  - 封装格式化 & 转义处理。
- `src/pages/JsonTools/lib/sampleJson.ts`
  - 提供默认示例数据常量。
- `src/pages/JsonTools/utils/tree.ts`
  - 生成路径标识、判断值类型等。

### 测试
- `src/pages/JsonTools/__tests__/JsonToolsPage.test.tsx`
  - 渲染页面并验证示例 JSON 树节点。
  - 模拟错误输入，确认错误提示出现。
  - 点击 `格式化` 按钮后文本被 pretty print。
  - 切换 `保留转义` 开关影响复制逻辑（通过模拟 clipboard）。

## 时间线
1. 完成文档与路由调整：0.5 天。
2. 开发 Hook 与组件：1.5 天。
3. 单元测试与交互打磨：0.5 天。

## 未决问题
- 是否需要支持 JSONPath 查询？（原型未体现，暂不实现）。
- 是否需要记住用户状态到 localStorage？当前计划为会话内状态。
- 是否需支持 YAML/CSV 等额外格式？暂不支持。
