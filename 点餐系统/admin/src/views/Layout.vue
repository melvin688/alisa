<template>
  <el-config-provider :locale="elementLocale">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="logo">
          <el-icon :size="28" color="#fff">
            <Coffee />
          </el-icon>
          <span v-if="!isCollapse">{{ $t('login.title').split('管理后台')[0] || 'Admin' }}</span>
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
            <template #title>{{ $t(`menu.${item.key}`) }}</template>
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
                <el-dropdown-item command="my" :class="{ active: locale === 'my' }">
                  မြန်မာ
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessageBox, ElMessage } from 'element-plus'
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
  Setting
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t, locale } = useI18n()

const isCollapse = ref(false)
const userInfo = computed(() => authStore.userInfo)
const activeMenu = computed(() => route.path)

// Element Plus语言配置
const elementLocale = computed(() => {
  if (locale.value === 'en') return en
  // 缅语暂时使用英文,因为Element Plus没有缅语包
  if (locale.value === 'my') return en
  return zhCn
})

const languageText = computed(() => {
  const map = { zh: '中文', en: 'English', my: 'မြန်မာ' }
  return map[locale.value] || '中文'
})

const menuItems = [
  { path: '/dashboard', key: 'dashboard', icon: DataLine },
  { path: '/tables', key: 'tables', icon: Grid },
  { path: '/categories', key: 'categories', icon: Menu },
  { path: '/products', key: 'products', icon: Coffee },
  { path: '/orders', key: 'orders', icon: Document },
  { path: '/settings', key: 'settings', icon: Setting }
]

onMounted(async () => {
  if (!authStore.userInfo) {
    await authStore.getProfile()
  }
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
    ElMessage.info(t('user.profileDeveloping'))
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  transition: width 0.3s;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #1f2d3d;
}

.el-menu {
  border-right: none;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-icon {
  cursor: pointer;
  transition: transform 0.3s;
}

.collapse-icon:hover {
  transform: scale(1.2);
}

.header-right {
  display: flex;
  align-items: center;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
  font-size: 14px;
}

.language-selector:hover {
  background-color: #f5f7fa;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}

:deep(.el-dropdown-menu__item.active) {
  color: #409EFF;
  font-weight: bold;
}
</style>
