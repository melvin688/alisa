<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20"><User /></el-icon>
          <span>{{ $t('profile.title') }}</span>
        </div>
      </template>

      <!-- 用户信息展示 -->
      <div class="user-info-section">
        <el-avatar :size="80" class="avatar">
          <el-icon :size="40"><User /></el-icon>
        </el-avatar>
        <div class="user-details">
          <h3>{{ userInfo?.username || '未登录' }}</h3>
          <el-tag :type="getRoleType(userInfo?.role)">{{ getRoleText(userInfo?.role) }}</el-tag>
        </div>
      </div>

      <el-divider />

      <!-- 操作选项卡 -->
      <el-tabs v-model="activeTab">
        <!-- 修改用户名 -->
        <el-tab-pane :label="$t('profile.tabUsername')" name="username">
          <el-form :model="usernameForm" :rules="usernameRules" ref="usernameFormRef" label-width="120px">
            <el-form-item :label="$t('profile.currentUsername')">
              <el-input :value="userInfo?.username" disabled />
            </el-form-item>
            <el-form-item :label="$t('profile.newUsername')" prop="newUsername">
              <el-input v-model="usernameForm.newUsername" :placeholder="$t('profile.usernameRequired')" />
            </el-form-item>
            <el-form-item :label="$t('profile.currentPassword')" prop="password">
              <el-input 
                v-model="usernameForm.password" 
                type="password" 
                :placeholder="$t('profile.passwordRequired')"
                show-password 
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdateUsername" :loading="loading">
                {{ $t('profile.updateUsername') }}
              </el-button>
              <el-button @click="resetUsernameForm">{{ $t('common.reset') }}</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 修改密码 -->
        <el-tab-pane :label="$t('profile.tabPassword')" name="password">
          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px">
            <el-form-item :label="$t('profile.oldPassword')" prop="oldPassword">
              <el-input 
                v-model="passwordForm.oldPassword" 
                type="password" 
                :placeholder="$t('profile.passwordRequired')"
                show-password 
              />
            </el-form-item>
            <el-form-item :label="$t('profile.newPassword')" prop="newPassword">
              <el-input 
                v-model="passwordForm.newPassword" 
                type="password" 
                :placeholder="$t('profile.newPasswordLength')"
                show-password 
              />
            </el-form-item>
            <el-form-item :label="$t('profile.confirmPassword')" prop="confirmPassword">
              <el-input 
                v-model="passwordForm.confirmPassword" 
                type="password" 
                :placeholder="$t('profile.confirmPasswordRequired')"
                show-password 
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdatePassword" :loading="loading">
                {{ $t('profile.updatePassword') }}
              </el-button>
              <el-button @click="resetPasswordForm">{{ $t('common.reset') }}</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 添加管理员 -->
        <el-tab-pane :label="$t('profile.tabAddAdmin')" name="addAdmin" v-if="userInfo?.role === 'admin'">
          <el-alert
            :title="$t('common.warning')"
            type="info"
            :description="$t('profile.adminOnlyTip')"
            :closable="false"
            style="margin-bottom: 20px"
          />
          <el-form :model="adminForm" :rules="adminRules" ref="adminFormRef" label-width="120px">
            <el-form-item :label="$t('profile.newAdminUsername')" prop="username">
              <el-input v-model="adminForm.username" :placeholder="$t('profile.usernameRequired')" />
            </el-form-item>
            <el-form-item :label="$t('profile.newAdminPassword')" prop="password">
              <el-input 
                v-model="adminForm.password" 
                type="password" 
                :placeholder="$t('profile.newPasswordLength')"
                show-password 
              />
            </el-form-item>
            <el-form-item :label="$t('profile.role')" prop="role">
              <el-select v-model="adminForm.role" :placeholder="$t('profile.roleRequired')">
                <el-option :label="$t('profile.roleAdmin')" value="admin" />
                <el-option :label="$t('profile.roleManager')" value="manager" />
                <el-option :label="$t('profile.roleStaff')" value="staff" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('profile.currentPassword')" prop="currentPassword">
              <el-input 
                v-model="adminForm.currentPassword" 
                type="password" 
                :placeholder="$t('profile.currentPasswordRequired')"
                show-password 
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleAddAdmin" :loading="loading">
                {{ $t('profile.addAdmin') }}
              </el-button>
              <el-button @click="resetAdminForm">{{ $t('common.reset') }}</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import request from '@/utils/request'

const { t } = useI18n()
const authStore = useAuthStore()
const userInfo = computed(() => authStore.userInfo)

const activeTab = ref('username')
const loading = ref(false)

// 修改用户名表单
const usernameFormRef = ref()
const usernameForm = ref({
  newUsername: '',
  password: ''
})

const usernameRules = {
  newUsername: [
    { required: true, message: t('profile.usernameRequired'), trigger: 'blur' },
    { min: 3, max: 20, message: t('profile.usernameLength'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('profile.passwordRequired'), trigger: 'blur' }
  ]
}

// 修改密码表单
const passwordFormRef = ref()
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.value.newPassword) {
    callback(new Error(t('profile.passwordNotMatch')))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: t('profile.passwordRequired'), trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: t('profile.newPasswordRequired'), trigger: 'blur' },
    { min: 6, message: t('profile.newPasswordLength'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('profile.confirmPasswordRequired'), trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 添加管理员表单
const adminFormRef = ref()
const adminForm = ref({
  username: '',
  password: '',
  role: 'staff',
  currentPassword: ''
})

const adminRules = {
  username: [
    { required: true, message: t('profile.usernameRequired'), trigger: 'blur' },
    { min: 3, max: 20, message: t('profile.usernameLength'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('profile.newPasswordRequired'), trigger: 'blur' },
    { min: 6, message: t('profile.newPasswordLength'), trigger: 'blur' }
  ],
  role: [
    { required: true, message: t('profile.roleRequired'), trigger: 'change' }
  ],
  currentPassword: [
    { required: true, message: t('profile.currentPasswordRequired'), trigger: 'blur' }
  ]
}

// 获取角色文本
const getRoleText = (role) => {
  const roleMap = {
    admin: t('profile.roleAdmin'),
    manager: t('profile.roleManager'),
    staff: t('profile.roleStaff')
  }
  return roleMap[role] || '未知'
}

// 获取角色标签类型
const getRoleType = (role) => {
  const typeMap = {
    admin: 'danger',
    manager: 'warning',
    staff: 'success'
  }
  return typeMap[role] || 'info'
}

// 修改用户名
const handleUpdateUsername = async () => {
  try {
    await usernameFormRef.value.validate()
    
    loading.value = true
    const response = await request({
      url: '/admin/update-username',
      method: 'post',
      data: {
        newUsername: usernameForm.value.newUsername,
        password: usernameForm.value.password
      }
    })

    if (response.success) {
      ElMessage.success(t('profile.updateUsernameSuccess'))
      // 更新用户信息
      authStore.userInfo.username = usernameForm.value.newUsername
      resetUsernameForm()
    } else {
      ElMessage.error(response.message || t('common.operationFailed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('修改失败：' + (error.message || '未知错误'))
    }
  } finally {
    loading.value = false
  }
}

// 修改密码
const handleUpdatePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    
    loading.value = true
    const response = await request({
      url: '/admin/update-password',
      method: 'post',
      data: {
        oldPassword: passwordForm.value.oldPassword,
        newPassword: passwordForm.value.newPassword
      }
    })

    if (response.success) {
      ElMessage.success(t('profile.updatePasswordSuccess'))
      resetPasswordForm()
      // 跳转到登录页
      setTimeout(() => {
        authStore.logout()
      }, 1500)
    } else {
      ElMessage.error(response.message || t('common.operationFailed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('修改失败：' + (error.message || '未知错误'))
    }
  } finally {
    loading.value = false
  }
}

// 添加管理员
const handleAddAdmin = async () => {
  try {
    await adminFormRef.value.validate()
    
    await ElMessageBox.confirm(
      t('profile.addAdminConfirm').replace('{0}', adminForm.value.username),
      t('profile.confirmAddTitle'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    loading.value = true
    const response = await request({
      url: '/admin/add-admin',
      method: 'post',
      data: {
        username: adminForm.value.username,
        password: adminForm.value.password,
        role: adminForm.value.role,
        currentPassword: adminForm.value.currentPassword
      }
    })

    if (response.success) {
      ElMessage.success(t('profile.addAdminSuccess'))
      resetAdminForm()
    } else {
      ElMessage.error(response.message || t('common.operationFailed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('添加失败：' + (error.message || '未知错误'))
    }
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetUsernameForm = () => {
  usernameForm.value = {
    newUsername: '',
    password: ''
  }
  usernameFormRef.value?.resetFields()
}

const resetPasswordForm = () => {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  passwordFormRef.value?.resetFields()
}

const resetAdminForm = () => {
  adminForm.value = {
    username: '',
    password: '',
    role: 'staff',
    currentPassword: ''
  }
  adminFormRef.value?.resetFields()
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #6B4423;
}

.user-info-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
}

.avatar {
  background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
  color: white;
}

.user-details h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #2C1810;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #6B4423;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #6B4423 0%, #4A2F1C 100%);
}

:deep(.el-tabs__item.is-active) {
  color: #6B4423;
}

:deep(.el-tabs__active-bar) {
  background-color: #6B4423;
}

:deep(.el-tabs__item:hover) {
  color: #8D6E63;
}
</style>
