# React Counter

## 项目简介
React Counter 是一个基于 Vite + React + TypeScript 构建的示例应用，展示如何使用 React 状态管理构建响应式计数器，并配合 Vitest 与 Testing Library 进行单元测试。

## 功能说明
- 显示当前计数值并随操作实时更新。
- 点击 `+1` 按钮可递增计数，`-1` 按钮可递减计数。
- 点击 `Reset` 将计数重置为 0。
- 通过 `aria-live` 属性提升读屏器对计数变化的可访问性。

## 快速开始
1. 安装依赖：`npm install`
2. 启动开发服务器：`npm run dev`，默认访问地址为 `http://localhost:5173`

## 常用脚本
- `npm run dev`：启动 Vite 开发服务器并开启热更新。
- `npm run build`：编译 TypeScript 并产出生产构建到 `dist/`。
- `npm run preview`：本地预览生产构建结果。
- `npm run test`：使用 Vitest 运行单元测试。
- `npm run lint`：使用 ESLint 扫描代码质量问题。
- `npm run format`：使用 Prettier 统一代码风格。

## 项目结构
```
public/         # 静态资源（由 Vite 直接服务）
src/            # 应用源代码
  ├─ components # 可复用 UI 组件
  ├─ hooks      # 自定义 Hook 与状态逻辑
  ├─ __tests__  # Vitest + RTL 单元测试
  ├─ main.tsx   # 应用入口，挂载根组件
  └─ App.tsx    # 计数器页面
```

## 技术栈
- React 18 + TypeScript
- Vite 5（开发与打包）
- ESLint & Prettier（代码质量与格式）
- Vitest + Testing Library（测试）

## 贡献指南
- 遵循仓库约定的 2 空格缩进、单引号与尾随逗号风格。
- 提交前请确认 `npm run lint`、`npm run test`、`npm run build` 均通过。
- 提交信息推荐使用 Conventional Commits 语义化格式。

