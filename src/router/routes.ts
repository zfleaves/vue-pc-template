import type { RouteRecordRaw } from 'vue-router'


const routes: RouteRecordRaw[] = [
    { path: '/', component: () => import('@/pages/home/index.vue'), meta: {} },
    { path: '/home', component: () => import('@/pages/home/index.vue') },
    { path: '/about', component: () => import('@/pages/about/index.vue') }
]

export default routes;