import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

// Vant 组件库
import Vant from 'vant'
import 'vant/lib/index.css'

// 移动端全局样式优化
import './styles/mobile.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(Vant)

app.mount('#app')
