<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409EFF">
              <el-icon :size="30"><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">0</div>
              <div class="stat-label">{{ $t('dashboard.todayOrders') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67C23A">
              <el-icon :size="30"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥0</div>
              <div class="stat-label">{{ $t('dashboard.todayRevenue') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #E6A23C">
              <el-icon :size="30"><Coffee /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">0</div>
              <div class="stat-label">{{ $t('dashboard.productCount') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #F56C6C">
              <el-icon :size="30"><Grid /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">0</div>
              <div class="stat-label">{{ $t('dashboard.tableCount') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :md="12">
        <el-card :header="$t('dashboard.quickActions')">
          <el-space wrap>
            <el-button type="primary" :icon="Plus" @click="$router.push('/products')">
              {{ $t('dashboard.addProduct') }}
            </el-button>
            <el-button type="success" :icon="Grid" @click="$router.push('/tables')">
              {{ $t('dashboard.manageTables') }}
            </el-button>
            <el-button type="warning" :icon="Document" @click="$router.push('/orders')">
              {{ $t('dashboard.viewOrders') }}
            </el-button>
            <el-button type="info" :icon="Setting" @click="$router.push('/settings')">
              {{ $t('dashboard.systemSettings') }}
            </el-button>
          </el-space>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card :header="$t('dashboard.systemInfo')">
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="$t('dashboard.systemVersion')">v1.0.0</el-descriptions-item>
            <el-descriptions-item :label="$t('dashboard.currentUser')">{{ userInfo?.name || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="$t('dashboard.userRole')">{{ roleText }}</el-descriptions-item>
            <el-descriptions-item :label="$t('dashboard.lastLogin')">{{ userInfo?.last_login_at || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ShoppingCart, Money, Coffee, Grid, Plus, Document, Setting } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { t } = useI18n()
const userInfo = computed(() => authStore.userInfo)

const roleText = computed(() => {
  const role = userInfo.value?.role
  if (role === 'admin') return t('dashboard.superAdmin')
  if (role === 'manager') return t('dashboard.manager')
  return t('dashboard.staff')
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}
</style>
