import { ViteSSG } from 'vite-ssg';
import App from './App.vue';
import type { UserModule } from './types';
import routes from './router/routes';
console.log('routes: ', routes);

import '@unocss/reset/tailwind.css';
import './styles/main.css';
import 'uno.css';

export const createApp = ViteSSG(App, { routes, base: import.meta.env.BASE_URL }, (ctx) => {
    // install all modules under `modules/`
    Object.values(
        import.meta.glob<{ install: UserModule }>('./modules/*.ts', { eager: true }),
    ).forEach((i) => i.install?.(ctx));
    // ctx.app.use(Previewer)
});