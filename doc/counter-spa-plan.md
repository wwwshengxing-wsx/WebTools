# Counter SPA 重构方案

## 改动概览
- 引入 `react-router-dom`，将应用调整为 Router 驱动的 SPA，并以 `App` 作为布局壳层。
- 新增 `src/pages/CounterPage.tsx` 作为计数器页面入口，页面视图与状态逻辑通过组件与 Hook 解耦。
- 抽离无状态 UI 组件 `CounterView` 与状态 Hook `useCounter`，并在对应目录下共置样式文件。
- 配置 Vitest/RTL 的单元测试覆盖页面与 Hook，额外提供 Playwright e2e 用例验证真实交互路径。
- 补充 `doc/` 设计文档，记录结构调整与验证方法。
- 样式体系切换到 Tailwind CSS，移除手写样式文件并以原子化类实现同等视觉布局。

## 架构与目录调整
- `src/main.tsx` 仅保留根节点挂载与 Provider 引导，改为渲染 `RouterProvider`。
- 新增 `src/router.tsx`，集中定义路由表，后续扩展页面时只需在此处追加配置。
- `App.tsx` 改为提供应用壳层（标题、导航、`Outlet`），`App.css` 更新为壳层样式。
- 页面代码统一存放在 `src/pages/`，本次新增 `CounterPage` 并通过 Tailwind 类实现局部样式。
- 可复用视图组件放入 `src/components/`，新增 `CounterView`，使用 Tailwind 原子类专注渲染职责。
- 业务状态通过 `src/hooks/useCounter.ts` 暴露，便于在其它页面/组件中复用或扩展初始值策略。

## 样式系统迁移
- 安装并配置 `tailwindcss`, `postcss`, `autoprefixer`，在 `tailwind.config.js` 中声明 `./src/**/*.{ts,tsx}` 作为扫描范围。
- `src/index.css` 仅保留 Tailwind 指令与基础层覆写，具体布局由组件上的类名完成。
- 删除原有 `App.css`, `CounterPage.css`, `CounterView.css` 等样式文件，改用 Tailwind 实现渐变背景、玻璃拟态容器与按钮交互态。
- 保持可访问性属性不变，同时通过 Tailwind 的聚焦态工具类补强键盘可用性。

## 状态与视图解耦
- `useCounter` 负责集中管理计数器状态与操作（增/减/重置），并支持配置初始值，确保测试与复用友好。
- `CounterView` 接收纯粹的 props 来渲染 UI，包含无障碍属性（`role="status"` + `aria-live`），避免与状态耦合。
- `CounterPage` 只负责调度 Hook 产出的接口与视图组件组合，可在此叠加页面级描述信息或后续特性。

## 测试策略
- 单元测试：
  - `src/__tests__/useCounter.test.ts` 校验 Hook 的状态流与重置行为。
  - `src/__tests__/CounterPage.test.tsx` 通过 RTL 模拟真实点击，验证页面层行为。
  - `src/__tests__/App.test.tsx` 使用 `createMemoryRouter` 断言路由默认渲染与导航状态。
- 端到端测试：`e2e/counter.spec.ts` 依赖 Playwright，启动 Vite dev server 后执行完整 UI 交互链路。
- Vitest 排除了 `e2e/**`，避免 e2e 入口被单元测试收集；新增 npm 脚本 `test:e2e` 用于独立触发。

## 验证步骤
- 单元测试：`npm run test -- --run`
- e2e：
  1. （首次）`npx playwright install chromium` 下载运行所需浏览器。
  2. 执行 `npm run test:e2e`，Playwright 会自动启动 Vite dev server。

## 后续拓展建议
- 在 `src/router.tsx` 中追加其它业务页面时，复用同样的模式将状态/视图拆分。
- 若需要多语言或主题切换，可在 `main.tsx` 中包裹相应 Provider 而不影响页面结构。
- 可根据产品需求在 `useCounter` 扩展诸如步长、上限/下限等配置，保持页面层无状态逻辑。
