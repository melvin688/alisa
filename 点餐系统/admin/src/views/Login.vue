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
                  <el-dropdown-item command="my" :class="{ active: locale === 'my' }">
                    မြန်မာ
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: relative;
}

.card-header h2 {
  margin: 0;
  color: #303133;
}

.language-switcher {
  position: absolute;
  top: 0;
  right: 0;
}

.login-tips {
  margin-top: 20px;
  padding: 15px;
  background-color: #f4f4f5;
  border-radius: 4px;
  font-size: 14px;
  color: #909399;
  text-align: center;
}

.login-tips p {
  margin: 5px 0;
}

:deep(.el-dropdown-menu__item.active) {
  color: #409EFF;
  font-weight: bold;
}
</style>
