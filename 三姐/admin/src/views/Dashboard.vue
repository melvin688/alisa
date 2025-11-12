<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card orders-card clickable" @click="$router.push('/order-history')">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #D84315 0%, #BF360C 100%)">
              <el-icon :size="30"><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ todayOrdersCount }}</div>
              <div class="stat-label">{{ $t('dashboard.todayOrders') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card revenue-card clickable" @click="$router.push('/order-history')">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%)">
              <el-icon :size="30"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">
                {{ Math.round(todayRevenue) }}
              </div>
              <div class="stat-label">{{ $t('dashboard.todayRevenue') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card products-card clickable" @click="$router.push('/products')">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #FFAB40 0%, #FF6F00 100%)">
              <el-icon :size="30"><Coffee /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ productsCount }}</div>
              <div class="stat-label">{{ $t('dashboard.productCount') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card tables-card clickable" @click="$router.push('/tables')">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #5C6BC0 0%, #3949AB 100%)">
              <el-icon :size="30"><Grid /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ tablesCount }}</div>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ShoppingCart, Money, Coffee, Grid, Plus, Document, Setting } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { getOrders, getDeliveryOrders, getTakeawayOrders } from '@/api/orders'
import { getProducts } from '@/api/products'
import { getTables } from '@/api/tables'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
const userInfo = computed(() => authStore.userInfo)

// 统计数据
const todayOrdersCount = ref(0)
const todayRevenue = ref(0)
const productsCount = ref(0)
const tablesCount = ref(0)

const roleText = computed(() => {
  const role = userInfo.value?.role
  if (role === 'admin') return t('dashboard.superAdmin')
  if (role === 'manager') return t('dashboard.manager')
  return t('dashboard.staff')
})

// 检查是否是今天的订单
const isTodayOrder = (orderTime) => {
  // 数据库存储的是缅甸时间 (UTC+6:30)
  // 获取缅甸当前日期
  const now = new Date()
  const myanmarOffset = 6.5 * 60 * 60 * 1000 // 6小时30分钟的毫秒数
  const myanmarNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + myanmarOffset)
  
  // orderTime 是缅甸时间字符串，直接解析
  const orderDate = new Date(orderTime)
  
  return myanmarNow.getFullYear() === orderDate.getFullYear() &&
         myanmarNow.getMonth() === orderDate.getMonth() &&
         myanmarNow.getDate() === orderDate.getDate()
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    // 获取所有订单（包括堂食、外卖、自取）
    const [tableRes, deliveryRes, takeawayRes, productsRes, tablesRes] = await Promise.all([
      getOrders(),
      getDeliveryOrders(),
      getTakeawayOrders(),
      getProducts(),
      getTables()
    ])

    // 合并所有订单
    let allOrders = []
    if (tableRes.success) allOrders = allOrders.concat(tableRes.data)
    if (deliveryRes.success) allOrders = allOrders.concat(deliveryRes.data)
    if (takeawayRes.success) allOrders = allOrders.concat(takeawayRes.data)

    // 筛选今天的订单（所有状态）
    const todayOrders = allOrders.filter(order => isTodayOrder(order.created_at))
    todayOrdersCount.value = todayOrders.length

    // 计算今日营业额:所有已完成订单的总金额（不包括已取消和待处理）
    const revenue = todayOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0)
    todayRevenue.value = revenue

    // 商品数量
    if (productsRes.success) {
      productsCount.value = productsRes.data.filter(p => p.is_available).length
    }

    // 餐桌数量
    if (tablesRes.success) {
      tablesCount.value = tablesRes.data.length
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

onMounted(() => {
  loadStatistics()
  // 每30秒刷新一次数据
  const timer = setInterval(loadStatistics, 30000)
  // 组件卸载时清除定时器
  onBeforeUnmount(() => clearInterval(timer))
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background: linear-gradient(180deg, #FFF8F0 0%, #F5F5F5 100%);
  min-height: calc(100vh - 60px);
}

.stat-card {
  margin-bottom: 20px;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 32px rgba(107, 68, 35, 0.2) !important;
}

.stat-card.clickable:active {
  transform: translateY(-2px) scale(1.01);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(107, 68, 35, 0.15) !important;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 0;
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #2C1810 0%, #6B4423 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 5px;
  letter-spacing: -1px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-value .unit {
  font-size: 16px;
  font-weight: 600;
  color: #8D6E63;
  -webkit-text-fill-color: #8D6E63;
}

.stat-label {
  font-size: 14px;
  color: #8D6E63;
  font-weight: 500;
}

/* 快速操作卡片 */
:deep(.el-card__header) {
  background: linear-gradient(135deg, #FFF8F0 0%, white 100%);
  border-bottom: 2px solid #F5E6D3;
  font-weight: 700;
  color: #6B4423;
  font-size: 16px;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(107, 68, 35, 0.25);
  transition: all 0.3s;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(107, 68, 35, 0.35);
}

:deep(.el-button--primary:active) {
  transform: translateY(0);
}

:deep(.el-button--success) {
  background: linear-gradient(135deg, #81C784 0%, #66BB6A 100%);
  border: none;
}

:deep(.el-button--warning) {
  background: linear-gradient(135deg, #FFB74D 0%, #FFA726 100%);
  border: none;
}

:deep(.el-button--info) {
  background: linear-gradient(135deg, #90A4AE 0%, #78909C 100%);
  border: none;
}

/* 系统信息卡片 */
:deep(.el-descriptions) {
  background: #FAFAFA;
}

:deep(.el-descriptions__label) {
  color: #6B4423;
  font-weight: 600;
}

:deep(.el-descriptions__content) {
  color: #333;
}
</style>
