<template>
  <div class="page-container">
    <!-- 顶部操作栏 -->
    <div class="header-actions">
      <div class="header-title">
        <span>{{ $t('delivery.title') }}</span>
        <el-tag type="info" style="margin-left: 12px;">{{ orderList.length }} {{ $t('delivery.deliveryOrders') }}</el-tag>
      </div>
      <div class="header-buttons">
        <el-button 
          type="primary" 
          :icon="Printer"
          @click="handlePrintAll"
          :loading="printing"
          :disabled="orderList.length === 0"
        >
          {{ $t('delivery.printAll') }}
        </el-button>
        <el-button 
          type="danger" 
          :icon="Delete"
          @click="handleClearAll"
          :loading="clearing"
          :disabled="orderList.length === 0"
        >
          {{ $t('delivery.clearAll') }}
        </el-button>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="orders-grid" v-loading="loading">
      <el-empty 
        v-if="!loading && orderList.length === 0" 
        :description="$t('delivery.noOrders')"
        :image-size="200"
      />
      
      <el-card
        v-for="order in orderList"
        :key="order.id"
        class="order-card"
        @click="viewOrderDetail(order)"
      >
        <!-- 订单头部 -->
        <template #header>
          <div class="order-card-header">
            <div class="order-info">
              <span class="order-number">#{{ order.order_no }}</span>
              <el-tag :type="getServiceTypeTag(order.service_type)" size="small" style="margin-left: 8px;">
                {{ getServiceTypeLabel(order.service_type) }}
              </el-tag>
              <el-tag :type="getPaymentMethodTag(order.payment_method)" size="small" style="margin-left: 4px;">
                {{ getPaymentMethodLabel(order.payment_method) }}
              </el-tag>
              <el-tag :type="getOrderStatusType(order.status)" size="small" style="margin-left: 4px;">
                {{ $t(`orders.status.${order.status}`) }}
              </el-tag>
            </div>
            <div class="order-time">
              {{ formatTime(order.created_at) }}
            </div>
          </div>
        </template>

        <!-- 订单内容 -->
        <div class="order-card-body">
          <!-- 配送信息 -->
          <div class="delivery-info">
            <div class="info-item">
              <el-icon><Location /></el-icon>
              <span class="info-label">{{ $t('delivery.deliveryAddress') }}:</span>
              <span class="info-value">{{ order.remark || '-' }}</span>
            </div>
          </div>

          <!-- 订单商品 -->
          <div class="order-items" v-if="order.items && order.items.length > 0">
            <div v-for="item in order.items" :key="item.id" class="item-row">
              <span class="item-name">{{ getProductName(item) }}</span>
              <span class="item-qty">x{{ item.quantity }}</span>
              <span class="item-price">K {{ item.price }}</span>
            </div>
          </div>

          <!-- 订单金额 -->
          <div class="order-amount">
            <span class="amount-label">{{ $t('orders.total') }}:</span>
            <span class="amount-value">{{ order.total_amount }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="$t('orders.orderDetail')"
      width="600px"
    >
      <div v-if="currentOrder" class="order-detail">
        <div class="detail-section">
          <h4>{{ $t('orders.orderNumber') }}</h4>
          <p>#{{ currentOrder.order_no }}</p>
        </div>
        
        <div class="detail-section">
          <h4>{{ $t('delivery.deliveryAddress') }}</h4>
          <p>{{ currentOrder.remark || '-' }}</p>
        </div>

        <div class="detail-section">
          <h4>{{ $t('orders.items') }}</h4>
          <el-table :data="currentOrder.items" style="width: 100%">
            <el-table-column :label="$t('products.name')" prop="name">
              <template #default="{ row }">
                {{ getProductName(row) }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('products.price')" width="100">
              <template #default="{ row }">
                K {{ row.price }}
              </template>
            </el-table-column>
            <el-table-column label="数量" width="80">
              <template #default="{ row }">
                x{{ row.quantity }}
              </template>
            </el-table-column>
            <el-table-column label="小计" width="100">
              <template #default="{ row }">
                K {{ row.price * row.quantity }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="detail-section">
          <h4>{{ $t('orders.total') }}</h4>
          <p class="total-amount">{{ currentOrder.total_amount }}</p>
        </div>

        <div class="detail-section">
          <h4>{{ $t('orders.status') }}</h4>
          <el-select v-model="currentOrder.status" @change="handleStatusChange">
            <el-option label="待处理" value="pending" />
            <el-option label="制作中" value="preparing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :icon="Printer" @click="printOrder(currentOrder)">
          {{ $t('orders.actions.print') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Printer, 
  Delete, 
  Location,
  User,
  ShoppingCart
} from '@element-plus/icons-vue'
import { getDeliveryOrders, updateOrderStatus, printOrder as printOrderAPI, deleteOrder } from '@/api/orders'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const loading = ref(false)
const printing = ref(false)
const clearing = ref(false)
const orderList = ref([])
const detailVisible = ref(false)
const currentOrder = ref(null)

// 加载外卖订单
const loadOrders = async () => {
  loading.value = true
  try {
    const res = await getDeliveryOrders()
    if (res.success) {
      orderList.value = res.data || []
    }
  } catch (error) {
    console.error('加载外卖订单失败:', error)
    ElMessage.error(t('common.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 查看订单详情
const viewOrderDetail = (order) => {
  currentOrder.value = order
  detailVisible.value = true
}

// 更新订单状态
const handleStatusChange = async () => {
  try {
    const res = await updateOrderStatus(currentOrder.value.id, currentOrder.value.status)
    if (res.success) {
      ElMessage.success(t('orders.messages.statusUpdated'))
      await loadOrders()
    }
  } catch (error) {
    console.error('更新订单状态失败:', error)
    ElMessage.error(t('orders.messages.statusFailed'))
  }
}

// 打印订单
const printOrder = async (order) => {
  try {
    const res = await printOrderAPI(order.id)
    if (res.success) {
      ElMessage.success(t('orders.messages.printed'))
    }
  } catch (error) {
    console.error('打印订单失败:', error)
    ElMessage.error(t('orders.messages.printFailed'))
  }
}

// 打印全部订单
const handlePrintAll = async () => {
  try {
    await ElMessageBox.confirm(
      t('delivery.printAllConfirm'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )
    
    printing.value = true
    for (const order of orderList.value) {
      await printOrder(order)
    }
    ElMessage.success(t('delivery.printSuccess'))
  } catch (error) {
    if (error !== 'cancel') {
      console.error('打印失败:', error)
    }
  } finally {
    printing.value = false
  }
}

// 清空全部订单
const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm(
      t('delivery.clearAllConfirm'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'error'
      }
    )
    
    clearing.value = true
    for (const order of orderList.value) {
      await deleteOrder(order.id)
    }
    ElMessage.success(t('delivery.clearSuccess'))
    await loadOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空失败:', error)
    }
  } finally {
    clearing.value = false
  }
}

// 获取服务类型标签样式
const getServiceTypeTag = (serviceType) => {
  const typeMap = {
    'dine-in': 'success',
    'delivery': 'warning',
    'takeaway': 'primary'
  }
  return typeMap[serviceType] || 'info'
}

// 获取服务类型标签文本
const getServiceTypeLabel = (serviceType) => {
  const labelMap = {
    'dine-in': '堂食',
    'delivery': '外卖',
    'takeaway': '自取'
  }
  return labelMap[serviceType] || '堂食'
}

// 获取支付方式标签样式
const getPaymentMethodTag = (paymentMethod) => {
  const typeMap = {
    'kpay': 'success',
    'cash': 'warning'
  }
  return typeMap[paymentMethod] || 'info'
}

// 获取支付方式标签文本
const getPaymentMethodLabel = (paymentMethod) => {
  const labelMap = {
    'kpay': 'KBZPAY',
    'cash': '现金'
  }
  return labelMap[paymentMethod] || '现金'
}

// 获取订单状态类型
const getOrderStatusType = (status) => {
  const typeMap = {
    'pending': 'info',
    'preparing': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取商品名称（根据当前语言）
const getProductName = (item) => {
  if (locale.value === 'zh') {
    return item.name_zh || item.name || ''
  } else if (locale.value === 'en') {
    return item.name_en || item.name || ''
  } else if (locale.value === 'my') {
    return item.name_my || item.name || ''
  }
  return item.name || ''
}

onMounted(() => {
  loadOrders()
  // 每30秒自动刷新
  setInterval(loadOrders, 30000)
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-buttons {
  display: flex;
  gap: 12px;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 16px;
}

.order-card {
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 8px;
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.order-number {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.order-time {
  font-size: 13px;
  color: #909399;
}

.order-card-body {
  padding-top: 12px;
}

.delivery-info {
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.info-label {
  color: #606266;
  font-weight: 500;
}

.info-value {
  color: #303133;
  flex: 1;
}

.order-items {
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.item-row:last-child {
  border-bottom: none;
}

.item-name {
  flex: 1;
  color: #303133;
  font-size: 14px;
}

.item-qty {
  margin: 0 16px;
  color: #606266;
  font-size: 14px;
}

.item-price {
  color: #303133;
  font-weight: 500;
  font-size: 14px;
}

.order-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 2px solid #ebeef5;
}

.amount-label {
  font-size: 14px;
  color: #606266;
}

.amount-value {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.order-detail {
  padding: 16px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin-bottom: 12px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.detail-section p {
  color: #303133;
  font-size: 15px;
  line-height: 1.6;
}

.total-amount {
  font-size: 24px;
  font-weight: 600;
  color: #f56c6c;
}
</style>
