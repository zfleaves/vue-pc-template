import path from 'node:path';
import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Unocss from 'unocss/vite';
import Shiki from 'markdown-it-shiki';
import LinkAttributes from 'markdown-it-link-attributes';
import Markdown from 'vite-plugin-vue-markdown';
import VueMacros from 'unplugin-vue-macros/vite';
import VueI18n from '@intlify/unplugin-vue-i18n/vite';
import VueDevTools from 'vite-plugin-vue-devtools';
import WebfontDownload from 'vite-plugin-webfont-dl';

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
    plugins: [
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
        }),

        Components({
            extensions: ['vue'],
            include: [/\.vue$/],
            dts: 'src/components.d.ts',
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
})