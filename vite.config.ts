import path from 'node:path';
import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import generateSitemap from 'vite-ssg-sitemap';
import Components from 'unplugin-vue-components/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Unocss from 'unocss/vite';
import Shiki from 'markdown-it-shiki';
import LinkAttributes from 'markdown-it-link-attributes';
import Markdown from 'vite-plugin-vue-markdown';
import VueMacros from 'unplugin-vue-macros/vite';
import VueI18n from '@intlify/unplugin-vue-i18n/vite';
import VueDevTools from 'vite-plugin-vue-devtools';
import WebfontDownload from 'vite-plugin-webfont-dl';
import { visualizer } from 'rollup-plugin-visualizer';
import viteImagemin from 'vite-plugin-imagemin';
import viteCompression from 'vite-plugin-compression';
import externalGlobals from 'rollup-plugin-external-globals';

export default defineConfig({
    resolve: {
        alias: {
            '@/': `${path.resolve(__dirname, 'src')}/`,
            'api/': `${path.resolve(__dirname, 'src/api')}/`,
            'assets/': `${path.resolve(__dirname, 'src/assets')}/`,
            'stores/': `${path.resolve(__dirname, 'src/stores')}/`,
            'utils/': `${path.resolve(__dirname, 'src/utils')}/`,
            'pages/': `${path.resolve(__dirname, 'src/pages')}/`,
            'components/': `${path.resolve(__dirname, 'src/components')}/`,
            'hooks/': `${path.resolve(__dirname, 'src/hooks')}/`,
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                // 可选：如需全局变量/混合器，用 additionalData 注入
                additionalData: `@use "src/styles/variables" as *;`
            }
        }
    },
    server: {
        host: "0.0.0.0", // 服务器主机名，如果允许外部访问，可设置为"0.0.0.0"
        cors: true,
        port: 3030,
        open: true,
        proxy: {
            '/v4/web': {
                target: 'https://itest.clife.net',
                changeOrigin: true,
                rewrite: path => path.replace(/^\/api/, "")
            },
        }

    },
    plugins: [
        viteImagemin({
            gifsicle: { optimizationLevel: 3 },
            mozjpeg: { quality: 80 },
            pngquant: { quality: [0.8, 0.9] }
        }),
        viteCompression({
            verbose: true,
            disable: false,
            threshold: 10240,
            algorithm: "gzip",
            ext: ".gz"
        }),
        // Vue(),
        VueMacros({
            plugins: {
                vue: Vue({
                    include: [/\.vue$/],
                }),
            },
        }),

        AutoImport({
            imports: ['vue', 'vue-router', 'vue-i18n', '@vueuse/head', '@vueuse/core'],
            dts: 'src/auto-imports.d.ts',
            dirs: ['src/composables', 'src/stores'],
            vueTemplate: true,
            resolvers: [ElementPlusResolver()],
        }),

        Components({
            extensions: ['vue'],
            include: [/\.vue$/],
            dts: 'src/components.d.ts',
            resolvers: [ElementPlusResolver()],
        }),

        Unocss(),

        Markdown({
            wrapperClasses: 'prose prose-sm m-auto text-left',
            headEnabled: true,
            markdownItSetup(md) {
                // @ts-ignore
                md.use(Shiki, {
                    theme: {
                        light: 'vitesse-light',
                        dark: 'vitesse-dark',
                    },
                });
                // @ts-ignore
                md.use(LinkAttributes, {
                    matcher: (link: string) => /^https?:\/\//.test(link),
                    attrs: {
                        target: '_blank',
                        rel: 'noopener',
                    },
                });
            },
        }),

        VueI18n({
            runtimeOnly: true,
            compositionOnly: true,
            fullInstall: true,
            include: [path.resolve(__dirname, 'locales/**')],
        }),

        WebfontDownload(),

        VueDevTools(),

        visualizer({
            open: true, // 自动打开分析页面
            filename: 'stats.html' // 输出文件名[2,6](@ref)
        })
    ],

    test: {
        include: ['test/**/*.test.ts'],
        environment: 'jsdom',
        deps: {
            inline: ['@vue', '@vueuse', 'vue-demi'],
        },
    },

    ssr: {
        // SSG Vue-i18n workaround
        noExternal: [/vue-i18n/],
    },
    // @ts-ignore
    ssgOptions: {
        // 设置生成的 HTML 文件中 <script> 标签的加载方式为异步加载
        script: 'async',
        // 对生成的 HTML 文件进行压缩，去除不必要的空格和换行符，减小文件大小
        formatting: 'minify',
        // 配置 Critters 插件的选项
        crittersOptions: {
            // 禁用减少内联样式的功能，即不压缩内联样式
            reduceInlineStyles: false,
        },
        // 定义一个回调函数，在静态站点生成完成后执行
        onFinished() {
            // 调用 generateSitemap 函数生成网站的 sitemap.xml 文件
            generateSitemap();
        },
    },
    build: {
        outDir: "dist",
        // esbuild 打包更快，但是不能去除 console.log，去除 console 使用 terser 模式
        // minify: "esbuild",
        minify: "terser",
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        },
        rollupOptions: {
            output: {
                // 自动分割第三方库和公共模块
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return 'vendor'
                    }
                },
                // Static resource classification and packaging
                chunkFileNames: "assets/js/[name]-[hash].js",
                entryFileNames: "assets/js/[name]-[hash].js",
                assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
            },
            /**
             * 核心框架类（如 Vue、React）​
             * <head><script src="https://cdn.jsdelivr.net/npm/vue@3.4.21" defer></script></head>
             * defer 确保脚本下载不阻塞 HTML 解析，并在 DOM 解析完成后按顺序执行。
             * 这对于 Vue 等框架非常重要，因为它们通常依赖于 DOM 来正确初始化。
             * 此外，defer 还可以确保脚本在所有框架加载完成后执行，从而避免潜在的冲突。
             * UI 组件库（如 Element Plus、Ant Design）​<body> 末尾引入
             * <body>---页面内容---<script src="https://cdn.jsdelivr.net/npm/element-plus@2.7.3" async></script></body>
             * async 实现异步加载，下载完成后立即执行（不保证顺序），适用于非关键渲染路径的依赖
             * 工具类库（如 lodash、axios）<body> 末尾引入
             * 无特殊属性（默认同步加载）
             * 二、性能优化进阶方案
             * <head><link rel="preconnect" href="https://cdn.jsdelivr.net"><link rel="dns-prefetch" href="https://cdn.jsdelivr.net"></head>
             */
            // external: ['vue', 'axios'],
            // plugins: [
            //     externalGlobals({
            //         vue: 'Vue',
            //         axios: 'axios'
            //     })
            // ]
        }
    },
})