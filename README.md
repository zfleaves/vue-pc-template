# es6-vue-template

> ES6 Vue 项目模板

## ⛰️ 能力支持

- [`pnpm`](https://github.com/pnpm/pnpm) 使用pnpm包管理工具
- [`Vue Router`](https://github.com/vuejs/router) Vue3 路由
- [`Unocss、Tailwind CSS`](https://github.com/unocss/unocss) 使用unocss原子化css工具、tailwindcssURL_ADDRESS 使用unocss原子化css工具、tailwindcss 配合使用，减少CSS体积
- [`Pinia`](https://pinia.vuejs.org) - 直接的, 类型安全的, 使用 Composition API 的轻便灵活的 Vue 状态管理
- [`vite-plugin-vue-markdown`](https://github.com/antfu/vite-plugin-vue-markdown) - Markdown 作为组件，也可以让组件在 Markdown 中使用
- [`markdown-it-prism`](https://github.com/jGleitz/markdown-it-prism) - [Prism](https://prismjs.com/) 的语法高亮
- [`prism-theme-vars`](https://github.com/antfu/prism-theme-vars) - 利用 CSS 变量自定义 Prism.js 的主题
- [`Vue I18n`](https://github.com/intlify/vue-i18n-next) - 国际化
- [`VueUse`](https://github.com/antfu/vueuse) - 实用的 Composition API 工具合集
- [`@vueuse/head`](https://github.com/vueuse/head) - 响应式地操作文档头信息
- [`vite-plugin-vue-devtools`](https://github.com/webfansplz/vite-plugin-vue-devtools) - 旨在增强 Vue 开发者体验的 Vite 插件
- 使用 Composition API 地 [`<script setup>` SFC 语法](https://github.com/vuejs/rfcs/pull/227)
- [`TypeScript`](https://www.typescriptlang.org/)
- [`Vitest`](https://github.com/vitest-dev/vitest) - 基于 Vite 的单元测试框架

## 🛡️ 配置要求

- [node](https://nodejs.org/en) >=14.18

## 🔨 如何使用

1.下载代码仓库，执行如下指令

```sh
git clone https://github.com/zfleaves/vue-pc-template.git
cd vue-pc-template
```

2.安装依赖

> 前提条件：使用最新版本的 pnpm

```sh
pnpm run init # pnpm install
```

3.执行指令

开发
只需要执行以下命令就可以在 `http://localhost:5000` 中看到

```sh
pnpm dev
```

构建

```sh
pnpm build
```

然后会看到用于发布的 dist 文件夹被生成。
