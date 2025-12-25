# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 **uni-app** 的跨平台应用项目，使用 Vue 3 + TypeScript + Vite 构建。项目支持编译到多个平台，包括 H5、各种小程序（微信、支付宝等）以及 App。

## 核心技术栈

- **框架**: uni-app (Vue 3 + TypeScript)
- **构建工具**: Vite + unh (uni-helper CLI)
- **状态管理**: Pinia
- **路由管理**: vue-router (H5) + uni-app 原生路由系统
- **UI 组件**: wot-design-uni
- **样式方案**: UnoCSS (原子化 CSS) + SCSS
- **HTTP 客户端**: axios (通过 @uni-helper/axios-adapter 适配 uni-app)
- **代码生成**: swagger-typescript-api (从 OpenAPI 规范自动生成类型安全的 API)

## 开发命令

### 核心命令
```bash
# 启动开发服务器 (默认 H5 平台)
pnpm dev

# 指定平台运行
pnpm dev:h5          # H5
pnpm dev:mp-weixin   # 微信小程序
pnpm dev:w           # H5 (别名)

# 构建生产版本
pnpm build

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
pnpm lint:fix        # 自动修复

# 从 OpenAPI 生成类型安全的 API 客户端
pnpm gen-api

# 查看项目信息
pnpm about
```

### 平台配置
平台切换在 `unh.config.ts` 中配置：
- 默认平台: `h5`
- 平台别名: `h5` → `w`/`h`, `mp-weixin` → `wx`

## 项目架构

### 目录结构
```
src/
├── components/      # 全局组件
├── pages/          # 页面文件 (由 vite-plugin-uni-pages 自动扫描)
├── stores/         # Pinia 状态管理
├── utils/          # 工具函数
│   ├── generatedApi/  # 自动生成的 API 类型和方法 (不要手动编辑)
│   └── httpApi.ts    # API 客户端实例配置
├── static/         # 静态资源
├── App.vue         # 应用根组件
├── main.ts         # 应用入口
├── manifest.json   # uni-app 应用配置 (自动生成)
└── pages.json      # 页面路由配置 (自动生成)
```

### 关键配置文件

#### vite.config.ts
Vite 构建配置，集成的插件：
- `@uni-helper/vite-plugin-uni-components`: 组件自动导入 (wot-design-uni)
- `@uni-helper/vite-plugin-uni-pages`: 页面自动扫描和路由生成
- `@uni-helper/vite-plugin-uni-layouts`: 布局系统
- `@uni-helper/vite-plugin-uni-manifest`: manifest.json 自动生成
- `UnoCSS`: 原子化 CSS

#### pages.config.ts
页面路由配置（会自动生成 `src/pages.json`）：
- 全局样式配置 (主题颜色、导航栏样式等)
- 支持分包配置

#### manifest.config.ts
uni-app 应用配置（会自动生成 `src/manifest.json`）：
- 各平台特定的配置 (微信小程序 appid、H5、App 等)
- 权限配置、模块配置等

#### uno.config.ts
UnoCSS 配置：
- `presetUni()`: uni-app 专用预设
- `presetIcons()`: 图标支持
- `transformerDirectives()` 和 `transformerVariantGroup()`: 指令和变体组

## API 开发工作流

项目使用 **swagger-typescript-api** 从 OpenAPI 规范自动生成类型安全的 API 客户端。

### 更新 API 定义
当后端 API 发生变化时：
```bash
# 从本地运行的 API 服务器生成 (http://127.0.0.1:3000/docs/openapi.json)
pnpm gen-api
```

生成的文件位于 `src/utils/generatedApi/Api.ts`，**不要手动编辑**。

### 使用 API 客户端
```typescript
import { httpApi } from '@/utils/httpApi'

// httpApi 实例包含所有自动生成的端点和方法
// 类型由 OpenAPI 规范自动推导
```

HTTP 客户端配置在 `src/utils/httpApi.ts`，使用 `@uni-helper/axios-adapter` 适配 uni-app 的网络请求 API。

## 样式开发

### UnoCSS
- 使用原子化 CSS 类名 (参见 [UnoCSS 文档](https://unocss.dev/))
- uni-app 专用预设提供跨平台兼容的原子类
- 图标使用: `<view class="i-carbon-home"></view>`

### 主题系统
- 主题配置在 `src/theme.json`
- 支持 H5 和微信小程序的暗黑模式

### SCSS
全局样式文件: `src/uni.scss`

## 页面开发

### 使用 definePage 宏定义页面配置

项目使用 `@uni-helper/vite-plugin-uni-pages` 插件，支持在 Vue SFC 文件内使用 `definePage` 宏动态定义页面配置。

**基本用法**：
```vue
<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '首页',
  },
})
</script>
```

**重要说明**：
- `definePage` 必须写在 `<script>` 内，且与 SFC 不同域（无法访问组件内部变量）
- 如无须特殊配置，可省略 `definePage`（页面 path 自动根据文件路径生成）
- 同一页面内仅可使用一个 `definePage`
- 支持对象形式、函数形式、异步函数
- 特殊需求可在 `pages.config.ts` 定义 `pages` 字段，它具有最高的优先级

详细文档：https://uni-helper.js.org/vite-plugin-uni-pages/definepage

## 组件开发

### 全局组件
wot-design-uni 组件会自动导入，无需手动 import：
```vue
<template>
  <wd-button type="primary">按钮</wd-button>
</template>
```

### 自定义组件
放置在 `src/components/` 目录的组件会自动注册。

## 状态管理

使用 Pinia (Composition API 风格)：
```typescript
// src/stores/example.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExampleStore = defineStore('example', () => {
  const state = ref('')
  function updateState(newValue: string) {
    state.value = newValue
  }
  return { state, updateState }
})
```

## TypeScript 配置

- 路径别名: `@/*` → `./src/*`
- 类型声明包含: uni-app、小程序 API、UnoCSS、wot-design-uni
- 严格模式已启用
- 使用 `@uni-helper/uni-types` 提供 uni-app 的完整类型支持

## 代码规范

项目使用 `@uni-helper/eslint-config`，基于 ESLint 9.x 配置。

运行 `pnpm lint` 检查代码质量，`pnpm lint:fix` 自动修复问题。

## 自动生成的文件

以下文件由构建工具自动生成，**不应手动编辑**：
- `src/manifest.json` (从 `manifest.config.ts` 生成)
- `src/pages.json` (从 `pages.config.ts` 生成)
- `src/utils/generatedApi/Api.ts` (从 OpenAPI 生成)
- `components.d.ts` (自动导入组件的类型声明)
