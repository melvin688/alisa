<template>
  <div class="order-history">
    <el-card>
      <template #header>
        <div class="header-content">
          <div class="title">
            <el-icon :size="20"><DocumentCopy /></el-icon>
            <span>历史订单记录</span>
          </div>
        </div>
      </template>

      <!-- 筛选条件 -->
      <el-form :inline="true" class="filter-form">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :shortcuts="dateShortcuts"
            @change="handleDateChange"
          />
        </el-form-item>

        <el-form-item label="服务类型">
          <el-select v-model="serviceTypeFilter" placeholder="全部" clearable @change="loadOrders">
            <el-option label="全部" value="" />
            <el-option label="堂食" value="dine-in" />
            <el-option label="外卖配送" value="delivery" />
            <el-option label="来店自取" value="takeaway" />
          </el-select>
        </el-form-item>

        <el-form-item label="订单状态">
          <el-select v-model="statusFilter" placeholder="全部" clearable @change="loadOrders">
            <el-option label="全部" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="准备中" value="preparing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadOrders">搜索</el-button>
          <el-button :icon="Refresh" @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 统计信息 -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-statistic title="订单总数" :value="statistics.totalOrders">
            <template #suffix>单</template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="营业额" :value="Math.round(statistics.revenue)" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="已完成" :value="statistics.completedOrders">
            <template #suffix>单</template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="已取消" :value="statistics.cancelledOrders">
            <template #suffix>单</template>
          </el-statistic>
        </el-col>
      </el-row>

      <!-- 订单列表 -->
      <el-table :data="filteredOrders" v-loading="loading" border stripe>
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column label="服务类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.service_type === 'dine-in'" type="primary">堂食</el-tag>
            <el-tag v-else-if="row.service_type === 'delivery'" type="success">外卖</el-tag>
            <el-tag v-else-if="row.service_type === 'takeaway'" type="warning">自取</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="table_number" label="桌号/信息" width="100">
          <template #default="{ row }">
            {{ row.table_number || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="金额" width="100">
          <template #default="{ row }">
            <span class="amount">{{ Math.round(row.total_amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待处理</el-tag>
            <el-tag v-else-if="row.status === 'preparing'" type="primary">准备中</el-tag>
            <el-tag v-else-if="row.status === 'completed'" type="success">已完成</el-tag>
            <el-tag v-else-if="row.status === 'cancelled'" type="info">已取消</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payment_method" label="支付方式" width="100">
          <template #default="{ row }">
            {{ row.payment_method === 'cash' ? '现金' : 'KBZPAY' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="下单时间" width="160" />
        <el-table-column prop="completed_at" label="完成时间" width="160">
          <template #default="{ row }">
            {{ row.completed_at || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120">
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewOrderDetail(row)">
              详情
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDelete(row)"
              :disabled="row.status === 'pending' || row.status === 'preparing'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="filteredOrders.length"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: center"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="600px">
      <div v-if="selectedOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ selectedOrder.order_no }}</el-descriptions-item>
          <el-descriptions-item label="服务类型">
            <el-tag v-if="selectedOrder.service_type === 'dine-in'" type="primary">堂食</el-tag>
            <el-tag v-else-if="selectedOrder.service_type === 'delivery'" type="success">外卖</el-tag>
            <el-tag v-else-if="selectedOrder.service_type === 'takeaway'" type="warning">自取</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="桌号/信息">{{ selectedOrder.table_number || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag v-if="selectedOrder.status === 'pending'" type="warning">待处理</el-tag>
            <el-tag v-else-if="selectedOrder.status === 'preparing'" type="primary">准备中</el-tag>
            <el-tag v-else-if="selectedOrder.status === 'completed'" type="success">已完成</el-tag>
            <el-tag v-else-if="selectedOrder.status === 'cancelled'" type="info">已取消</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ selectedOrder.payment_method === 'cash' ? '现金' : 'KBZPAY' }}
          </el-descriptions-item>
          <el-descriptions-item label="支付状态">
            {{ selectedOrder.payment_status === 'paid' ? '已支付' : '未支付' }}
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ selectedOrder.created_at }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ selectedOrder.completed_at || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ selectedOrder.remark || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider>订单商品</el-divider>
        <el-table :data="selectedOrder.items" border>
          <el-table-column prop="product_name" label="商品名称" />
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column label="单价" width="100">
            <template #default="{ row }">
              {{ Math.round(row.unit_price) }}
            </template>
          </el-table-column>
          <el-table-column label="小计" width="100">
            <template #default="{ row }">
              {{ Math.round(row.subtotal) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="total-amount">
          <span>订单总额：</span>
          <span class="amount-value">{{ Math.round(selectedOrder.total_amount) }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DocumentCopy, Search, Refresh } from '@element-plus/icons-vue'

// 缅甸时区工具函数 (UTC+6:30)
const MYANMAR_OFFSET_MS = 6.5 * 60 * 60 * 1000

// 获取缅甸当前时间
const getMyanmarTime = () => {
  const now = new Date()
  return new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + MYANMAR_OFFSET_MS)
}

// 设置日期为缅甸时区的午夜
const setMyanmarMidnight = (date, isEndOfDay = false) => {
  const d = new Date(date)
  if (isEndOfDay) {
    d.setHours(23, 59, 59, 999)
  } else {
    d.setHours(0, 0, 0, 0)
  }
  return d
}
import { getOrders, getDeliveryOrders, getTakeawayOrders, deleteOrder } from '@/api/orders'

const loading = ref(false)
const allOrders = ref([])
const dateRange = ref([])
const serviceTypeFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const detailDialogVisible = ref(false)
const selectedOrder = ref(null)

// 日期快捷选项
const dateShortcuts = [
  {
    text: '今天',
    value: () => {
      const today = getMyanmarTime()
      return [today, today]
    }
  },
  {
    text: '最近7天',
    value: () => {
      const end = getMyanmarTime()
      const start = new Date(end.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近30天',
    value: () => {
      const end = getMyanmarTime()
      const start = new Date(end.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '本月',
    value: () => {
      const end = getMyanmarTime()
      const start = new Date(end.getFullYear(), end.getMonth(), 1)
      return [start, end]
    }
  }
]

// 筛选后的订单
const filteredOrders = computed(() => {
  let orders = allOrders.value

  // 日期筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    orders = orders.filter(order => {
      const orderDate = order.created_at.split(' ')[0]
      return orderDate >= start && orderDate <= end
    })
  }

  // 服务类型筛选
  if (serviceTypeFilter.value) {
    orders = orders.filter(order => order.service_type === serviceTypeFilter.value)
  }

  // 状态筛选
  if (statusFilter.value) {
    orders = orders.filter(order => order.status === statusFilter.value)
  }

  return orders
})

// 统计信息
const statistics = computed(() => {
  const orders = filteredOrders.value
  return {
    totalOrders: orders.length,
    revenue: orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0),
    completedOrders: orders.filter(order => order.status === 'completed').length,
    cancelledOrders: orders.filter(order => order.status === 'cancelled').length
  }
})

// 加载订单
const loadOrders = async () => {
  loading.value = true
  try {
    const [tableRes, deliveryRes, takeawayRes] = await Promise.all([
      getOrders(),
      getDeliveryOrders(),
      getTakeawayOrders()
    ])

    let orders = []
    if (tableRes.success) orders = orders.concat(tableRes.data)
    if (deliveryRes.success) orders = orders.concat(deliveryRes.data)
    if (takeawayRes.success) orders = orders.concat(takeawayRes.data)

    // 按创建时间倒序排序
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    
    allOrders.value = orders
  } catch (error) {
    console.error('加载订单失败:', error)
    ElMessage.error('加载订单失败')
  } finally {
    loading.value = false
  }
}

// 处理日期变化
const handleDateChange = () => {
  loadOrders()
}

// 重置筛选
const resetFilters = () => {
  dateRange.value = []
  serviceTypeFilter.value = ''
  statusFilter.value = ''
  loadOrders()
}

// 查看订单详情
const viewOrderDetail = (order) => {
  selectedOrder.value = order
  detailDialogVisible.value = true
}

// 删除订单
const handleDelete = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除订单 #${order.id} 吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteOrder(order.id)
    ElMessage.success('订单删除成功')
    loadOrders() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

onMounted(() => {
  // 默认显示今天的订单（缅甸时间）
  const today = getMyanmarTime()
  dateRange.value = [
    today.toISOString().split('T')[0],
    today.toISOString().split('T')[0]
  ]
  loadOrders()
})
</script>

<style scoped>
.order-history {
  padding: 20px;
  background: linear-gradient(180deg, #FFF8F0 0%, #F5F5F5 100%);
  min-height: calc(100vh - 60px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #6B4423;
}

.filter-form {
  background: #FFF8F0;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.amount {
  color: #D84315;
  font-weight: 700;
  font-size: 14px;
}

.order-detail {
  padding: 10px 0;
}

.total-amount {
  margin-top: 20px;
  text-align: right;
  font-size: 18px;
  font-weight: 700;
  color: #6B4423;
}

.amount-value {
  color: #D84315;
  font-size: 24px;
  margin-left: 10px;
}

:deep(.el-card) {
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 16px rgba(107, 68, 35, 0.1);
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #FFF8F0 0%, white 100%);
  border-bottom: 2px solid #F5E6D3;
}

:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-statistic) {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #FFF8F0 0%, white 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(107, 68, 35, 0.08);
}

:deep(.el-statistic__head) {
  color: #8D6E63;
  font-weight: 600;
}

:deep(.el-statistic__number) {
  color: #6B4423;
  font-weight: 800;
}
</style>
