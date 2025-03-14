import { ViteSSG } from 'vite-ssg';
import App from './App.vue';
import ElementPlus from 'element-plus'
import type { UserModule } from './types';
import routes from './router/routes';

import '@unocss/reset/tailwind.css';
import './styles/main.scss';
import 'uno.css';
import 'element-plus/dist/index.css'

export const createApp = ViteSSG(App, { routes, base: import.meta.env.BASE_URL }, (ctx) => {
    // install all modules under `modules/`
    Object.values(
        import.meta.glob<{ install: UserModule }>('./modules/*.ts', { eager: true }),
    ).forEach((i) => i.install?.(ctx));
    // ctx.app.use(Previewer)
    ctx.app.use(ElementPlus)
});