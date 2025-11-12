<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="40" color="#409EFF">
            <Coffee />
          </el-icon>
          <h2>{{ $t('login.title') }}</h2>
          
          <!-- 语言切换 -->
          <div class="language-switcher">
            <el-dropdown @command="changeLanguage">
              <el-button :icon="Promotion" circle size="small" />
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
          </div>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            :placeholder="$t('login.username')"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            :placeholder="$t('login.password')"
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            style="width: 100%"
            @click="handleLogin"
          >
            {{ $t('login.loginBtn') }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-tips">
        <p>{{ $t('login.defaultAccount') }}: admin</p>
        <p>{{ $t('login.defaultPassword') }}: admin123</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { User, Lock, Coffee, Promotion } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { t, locale } = useI18n()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = computed(() => ({
  username: [
    { required: true, message: t('login.usernameRequired'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' }
  ]
}))

const changeLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('admin_locale', lang)
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await authStore.login(form.username, form.password)
        if (res.success) {
          ElMessage.success(t('login.loginSuccess'))
          router.push('/')
        } else {
          ElMessage.error(res.message || t('login.loginFailed'))
        }
      } catch (error) {
        console.error('登录错误:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 248, 240, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: moveBackground 20s linear infinite;
  }
}

@keyframes moveBackground {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

.login-card {
  width: 440px;
  border-radius: 24px;
  border: none;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
  
  :deep(.el-card__header) {
    background: linear-gradient(135deg, #FFF8F0 0%, white 100%);
    border-bottom: none;
    padding: 32px;
    border-radius: 24px 24px 0 0;
  }
  
  :deep(.el-card__body) {
    padding: 32px;
    background: white;
    border-radius: 0 0 24px 24px;
  }
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  position: relative;
  
  :deep(.el-icon) {
    width: 60px;
    height: 60px;
    padding: 12px;
    background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
    border-radius: 16px;
    color: white !important;
    box-shadow: 0 8px 20px rgba(107, 68, 35, 0.3);
  }
  
  h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    background: linear-gradient(135deg, #6B4423 0%, #8D6E63 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.language-switcher {
  position: absolute;
  top: 0;
  right: 0;
  
  :deep(.el-button) {
    border: 2px solid #E0E0E0;
    background: white;
    transition: all 0.3s;
    
    &:hover {
      border-color: #8D6E63;
      background: #FFF8F0;
      transform: scale(1.1);
    }
  }
}

:deep(.el-form) {
  .el-form-item {
    margin-bottom: 24px;
  }
  
  .el-input__wrapper {
    border-radius: 12px;
    padding: 8px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 2px solid #F5F5F5;
    transition: all 0.3s;
    
    &:hover {
      border-color: #E0E0E0;
    }
    
    &.is-focus {
      border-color: #8D6E63;
      box-shadow: 0 4px 12px rgba(141, 110, 99, 0.2);
    }
  }
  
  .el-input__inner {
    font-size: 15px;
    font-weight: 500;
  }
  
  .el-button--primary {
    height: 48px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
    border: none;
    box-shadow: 0 6px 16px rgba(107, 68, 35, 0.3);
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(107, 68, 35, 0.4);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

.login-tips {
  margin-top: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%);
  border-radius: 12px;
  font-size: 14px;
  color: #6B4423;
  text-align: center;
  border: 2px solid #F5E6D3;
  
  p {
    margin: 8px 0;
    font-weight: 600;
    
    &:first-child {
      font-size: 15px;
    }
  }
}

:deep(.el-dropdown-menu) {
  border-radius: 12px;
  border: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 8px;
  
  .el-dropdown-menu__item {
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 600;
    transition: all 0.3s;
    
    &:hover {
      background: #FFF8F0;
      color: #6B4423;
    }
    
    &.active {
      color: #8D6E63;
      background: linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%);
      font-weight: 700;
    }
  }
}
</style>
