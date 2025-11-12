<template>
  <el-config-provider :locale="elementLocale">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="logo">
          <img v-if="!isCollapse" src="/alisa-logo.jpg" alt="Alisa Cake" class="logo-image" />
          <el-icon v-else :size="28" color="#fff">
            <Coffee />
          </el-icon>
          <span v-if="!isCollapse">Alisa Cake</span>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :router="true"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item
            v-for="item in menuItems"
            :key="item.path"
            :index="item.path"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>
              {{ $t(`menu.${item.key}`) }}
              <el-badge 
                v-if="item.path === '/tables' && pendingTableOrders > 0" 
                :value="pendingTableOrders" 
                class="item-badge"
              />
              <el-badge 
                v-if="item.path === '/delivery' && pendingDeliveryOrders > 0" 
                :value="pendingDeliveryOrders" 
                class="item-badge"
              />
              <el-badge 
                v-if="item.path === '/takeaway' && pendingTakeawayOrders > 0" 
                :value="pendingTakeawayOrders" 
                class="item-badge"
              />
            </template>
          </el-menu-item>
        </el-menu>
      </el-aside>

    <!-- 主体内容 -->
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header>
        <div class="header-left">
          <el-icon
            class="collapse-icon"
            :size="20"
            @click="isCollapse = !isCollapse"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>
        
        <div class="header-right">
          <!-- 语言切换 -->
          <el-dropdown @command="changeLanguage" style="margin-right: 20px">
            <div class="language-selector">
              <el-icon :size="18"><Promotion /></el-icon>
              <span>{{ languageText }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh" :class="{ active: locale === 'zh' }">
                  中文
                </el-dropdown-item>
                <el-dropdown-item command="en" :class="{ active: locale === 'en' }">
                  English
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 用户信息 -->
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-icon :size="18"><User /></el-icon>
              <span>{{ userInfo?.name || $t('dashboard.currentUser') }}</span>
              <el-icon :size="14"><CaretBottom /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">{{ $t('user.profile') }}</el-dropdown-item>
                <el-dropdown-item command="logout" divided>{{ $t('user.logout') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
    </el-container>
  </el-config-provider>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessageBox, ElMessage, ElNotification } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import {
  Coffee,
  Fold,
  Expand,
  User,
  CaretBottom,
  Promotion,
  DataLine,
  Grid,
  Menu,
  Document,
  Setting,
  Van,
  ShoppingBag,
  DocumentCopy
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { getOrders, getDeliveryOrders, getTakeawayOrders } from '@/api/orders'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t, locale } = useI18n()

const isCollapse = ref(false)
const userInfo = computed(() => authStore.userInfo)
const activeMenu = computed(() => route.path)

// 订单数量统计
const pendingTableOrders = ref(0)
const pendingDeliveryOrders = ref(0)
const pendingTakeawayOrders = ref(0)

// 已通知的订单ID集合
const notifiedOrders = new Set()

// 轮询定时器
let pollingTimer = null

// Element Plus语言配置
const elementLocale = computed(() => {
  if (locale.value === 'en') return en
  // 缅语暂时使用英文,因为Element Plus没有缅语包
  if (locale.value === 'my') return en
  return zhCn
})

const languageText = computed(() => {
  const map = { zh: '中文', en: 'English' }
  return map[locale.value] || '中文'
})

const menuItems = [
  { path: '/dashboard', key: 'dashboard', icon: DataLine },
  { path: '/tables', key: 'tables', icon: Grid },
  { path: '/delivery', key: 'delivery', icon: Van },
  { path: '/takeaway', key: 'takeaway', icon: ShoppingBag },
  { path: '/order-history', key: 'orderHistory', icon: DocumentCopy },
  { path: '/categories', key: 'categories', icon: Menu },
  { path: '/products', key: 'products', icon: Coffee },
  { path: '/settings', key: 'settings', icon: Setting }
]

// 检查是否是今天的订单
const isTodayOrder = (orderTime) => {
  const today = new Date()
  const orderDate = new Date(orderTime)
  return today.getFullYear() === orderDate.getFullYear() &&
         today.getMonth() === orderDate.getMonth() &&
         today.getDate() === orderDate.getDate()
}

// 检查订单并发送通知
const checkNewOrders = async () => {
  try {
    // 获取所有待处理订单
    const [tableRes, deliveryRes, takeawayRes] = await Promise.all([
      getOrders(),
      getDeliveryOrders(),
      getTakeawayOrders()
    ])

    if (tableRes.success) {
      // 只统计今天的待处理订单
      const pendingOrders = tableRes.data.filter(order => 
        order.status === 'pending' && isTodayOrder(order.created_at)
      )
      pendingTableOrders.value = pendingOrders.length

      // 检查新订单并通知
      pendingOrders.forEach(order => {
        if (!notifiedOrders.has(order.id)) {
          notifiedOrders.add(order.id)
          showOrderNotification('餐桌订单', order)
        }
      })
    }

    if (deliveryRes.success) {
      // 只统计今天的待处理订单
      const pendingOrders = deliveryRes.data.filter(order => 
        order.status === 'pending' && isTodayOrder(order.created_at)
      )
      pendingDeliveryOrders.value = pendingOrders.length

      pendingOrders.forEach(order => {
        if (!notifiedOrders.has(order.id)) {
          notifiedOrders.add(order.id)
          showOrderNotification('外卖配送', order)
        }
      })
    }

    if (takeawayRes.success) {
      // 只统计今天的待处理订单
      const pendingOrders = takeawayRes.data.filter(order => 
        order.status === 'pending' && isTodayOrder(order.created_at)
      )
      pendingTakeawayOrders.value = pendingOrders.length

      pendingOrders.forEach(order => {
        if (!notifiedOrders.has(order.id)) {
          notifiedOrders.add(order.id)
          showOrderNotification('来店自取', order)
        }
      })
    }
  } catch (error) {
    console.error('检查订单失败:', error)
  }
}

// 显示订单通知
const showOrderNotification = (type, order) => {
  // 播放提示音
  playNotificationSound()

  // 显示桌面通知
  ElNotification({
    title: `新${type}订单`,
    message: `订单号: ${order.order_no}\n金额: K ${(order.total_amount / 100).toFixed(2)}\n${order.table_number ? '桌号: ' + order.table_number : ''}\n${order.remark ? '备注: ' + order.remark : ''}`,
    type: 'success',
    duration: 0, // 不自动关闭
    position: 'top-right',
    showClose: true,
    onClick: () => {
      // 点击通知跳转到对应页面
      if (type === '餐桌订单') {
        router.push('/tables')
      } else if (type === '外卖配送') {
        router.push('/delivery')
      } else if (type === '来店自取') {
        router.push('/takeaway')
      }
    }
  })
}

// 播放提示音
const playNotificationSound = () => {
  try {
    // 使用Web Audio API生成简单的提示音
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // 设置音调和音量
    oscillator.frequency.value = 800 // 频率800Hz
    gainNode.gain.value = 0.3 // 音量30%
    
    // 播放200ms
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.2)
    
    // 200ms后再播放一次
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator()
      const gainNode2 = audioContext.createGain()
      
      oscillator2.connect(gainNode2)
      gainNode2.connect(audioContext.destination)
      
      oscillator2.frequency.value = 1000
      gainNode2.gain.value = 0.3
      
      oscillator2.start()
      oscillator2.stop(audioContext.currentTime + 0.2)
    }, 250)
  } catch (error) {
    console.log('播放提示音失败:', error)
  }
}

// 开始轮询
const startPolling = () => {
  // 立即检查一次
  checkNewOrders()
  
  // 每10秒检查一次新订单
  pollingTimer = setInterval(() => {
    checkNewOrders()
  }, 10000)
}

// 停止轮询
const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

onMounted(async () => {
  if (!authStore.userInfo) {
    await authStore.getProfile()
  }
  
  // 开始轮询检查订单
  startPolling()
})

onUnmounted(() => {
  // 组件卸载时停止轮询
  stopPolling()
})

const changeLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('admin_locale', lang)
  ElMessage.success(t('common.success'))
}

const handleCommand = async (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm(t('user.logoutConfirm'), t('common.confirm'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }).then(() => {
      authStore.logout()
      ElMessage.success(t('user.logoutSuccess'))
      router.push('/login')
    }).catch(() => {})
  } else if (command === 'profile') {
    router.push('/profile')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-aside {
  background: linear-gradient(180deg, #6B4423 0%, #4E342E 100%);
  transition: width 0.3s;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.logo {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #fff;
  font-size: 20px;
  font-weight: 800;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, rgba(255, 248, 240, 0.1) 0%, transparent 100%);
  
  .logo-image {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  :deep(.el-icon) {
    padding: 8px;
    background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  span {
    background: linear-gradient(135deg, #FFF8F0 0%, #BCAAA4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

:deep(.el-menu) {
  border-right: none;
  background: transparent !important;
  
  .el-menu-item {
    margin: 8px 12px;
    border-radius: 12px;
    transition: all 0.3s;
    font-weight: 600;
    
    &:hover {
      background: rgba(255, 248, 240, 0.15) !important;
      transform: translateX(4px);
    }
    
    &.is-active {
      background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%) !important;
      color: white !important;
      box-shadow: 0 4px 12px rgba(141, 110, 99, 0.4);
      
      &::before {
        content: '';
        position: absolute;
        left: -12px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 24px;
        background: #FFF8F0;
        border-radius: 2px;
      }
    }
  }
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-bottom: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  z-index: 10;
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-icon {
  cursor: pointer;
  transition: all 0.3s;
  padding: 8px;
  border-radius: 8px;
  color: #6B4423;
  
  &:hover {
    background: #FFF8F0;
    transform: scale(1.15);
  }
}

.header-right {
  display: flex;
  align-items: center;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 10px;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 600;
  color: #6B4423;
  border: 2px solid transparent;
  
  &:hover {
    background: linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%);
    border-color: #E0E0E0;
    transform: translateY(-1px);
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 10px;
  transition: all 0.3s;
  font-weight: 600;
  color: #6B4423;
  border: 2px solid transparent;
  
  &:hover {
    background: linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%);
    border-color: #E0E0E0;
    transform: translateY(-1px);
  }
}

.el-main {
  background: linear-gradient(180deg, #FFF8F0 0%, #F5F5F5 100%);
  padding: 20px;
  overflow-y: auto;
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #F5F5F5;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #8D6E63 0%, #6B4423 100%);
    border-radius: 4px;
    
    &:hover {
      background: linear-gradient(180deg, #6B4423 0%, #4E342E 100%);
    }
  }
}

:deep(.el-dropdown-menu) {
  border-radius: 12px;
  border: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 8px;
  margin-top: 8px;
  
  .el-dropdown-menu__item {
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 600;
    transition: all 0.3s;
    
    &:hover {
      background: linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%);
      color: #6B4423;
    }
    
    &.active {
      color: #8D6E63;
      background: linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%);
      font-weight: 700;
    }
  }
  
  .el-dropdown-menu__item--divided {
    border-top: 2px solid #F5F5F5;
    margin-top: 8px;
  }
}

/* 菜单项徽章样式 */
:deep(.item-badge) {
  margin-left: 8px;
  
  .el-badge__content {
    background: linear-gradient(135deg, #FF5252 0%, #F44336 100%);
    border: 2px solid #fff;
    font-weight: bold;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>

