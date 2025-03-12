import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue' // 或 '@vueuse/head'
import App from './App.vue'

import '@unocss/reset/tailwind.css';
import './styles/main.css';
import 'uno.css';

const app = createApp(App)
const head = createHead()
// 注入头部管理插件
app.use(head)
// 注入状态管理插件
app.use(createPinia())
app.mount('#app')