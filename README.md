# vue-pc-template-cli

> Vue PC 项目模板 CLI 工具，快速创建标准化的 Vue 3 项目模板

## 特性

- 🚀 快速创建项目
- 📦 基于 Vue 3 + TypeScript
- 🎨 内置多种开发工具和最佳实践
- 🔧 交互式配置
- 📱 支持多包管理器（pnpm/npm/yarn）

## 安装

```bash
# 使用 npm
npm install -g vue-pc-template-cli

# 使用 pnpm
pnpm add -g vue-pc-template-cli

# 使用 yarn
yarn global add vue-pc-template-cli
```

## 使用

```bash
# 使用完整命令
vue-pc-template my-project

# 或使用简写命令
vpc my-project
```

## 项目模板特性

- [`pnpm`](https://github.com/pnpm/pnpm) - 高性能的包管理工具
- [`Vue Router`](https://github.com/vuejs/router) - Vue3 路由
- [`Unocss、Tailwind CSS`](https://github.com/unocss/unocss) - 原子化 CSS 工具
- [`Pinia`](https://pinia.vuejs.org) - Vue 状态管理
- [`Vue I18n`](https://github.com/intlify/vue-i18n-next) - 国际化
- [`VueUse`](https://github.com/antfu/vueuse) - 实用的 Composition API 工具合集
- [`TypeScript`](https://www.typescriptlang.org/) - JavaScript 的超集
- [`Vitest`](https://github.com/vitest-dev/vitest) - 单元测试框架
- [`zfleaves-monitor-web`](https://www.npmjs.com/package/zfleaves-monitor-web) - 前端监控插件

## 命令行选项

创建项目时，CLI 会提供以下交互式选项：

- 项目名称
- 项目描述
- 包管理器选择（pnpm/npm/yarn）
- 是否立即安装依赖

## 项目结构

生成的项目结构如下：

```
my-project/
├── public/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── modules/
│   ├── pages/
│   ├── router/
│   ├── stores/
│   ├── styles/
│   └── utils/
├── test/
├── .env.development
├── .env.production
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 开发

```bash
# 克隆项目
git clone https://github.com/zfleaves/vue-pc-template-cli.git

# 安装依赖
pnpm install

# 本地测试
node bin/vue-pc-cli.js my-test-project
```

## 发布新版本

```bash
# 发布补丁版本 (v1.0.0 -> v1.0.1)
pnpm run publish:patch

# 发布次要版本 (v1.0.0 -> v1.1.0)
pnpm run publish:minor

# 发布主要版本 (v1.0.0 -> v2.0.0)
pnpm run publish:major
```

## 许可证

ISC

## 作者

zfleaves