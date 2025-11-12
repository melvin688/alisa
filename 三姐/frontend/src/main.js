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

// 注册 Service Worker (离线缓存支持)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker 注册成功:', registration.scope);
      })
      .catch((error) => {
        console.log('❌ Service Worker 注册失败:', error);
      });
  });
}

