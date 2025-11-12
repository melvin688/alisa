<template>
  <div class="orders-page">
    <van-nav-bar title="我的订单" left-arrow @click-left="goBack" fixed>
      <template #right>
        <van-button 
          plain 
          type="primary" 
          size="small" 
          @click="goHome"
        >
          {{ $t('common.backToHome') }}
        </van-button>
      </template>
    </van-nav-bar>

    <div class="orders-container">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="order in orderList"
            :key="order.id"
            class="order-card"
            @click="viewOrderDetail(order)"
          >
            <div class="order-header">
              <span class="order-number">#{{ order.order_no }}</span>
              <van-tag :type="getStatusType(order.status)">
                {{ getStatusText(order.status) }}
              </van-tag>
            </div>

            <div class="order-items">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="order-item"
              >
                <span class="item-name">{{ getProductName(item) }}</span>
                <span class="item-qty">x{{ item.quantity }}</span>
                <span class="item-price">{{ item.unit_price * item.quantity }}</span>
              </div>
            </div>

            <div class="order-footer">
              <div class="order-info">
                <span class="order-table">{{ order.table_number }}</span>
                <span class="order-time">{{ formatTime(order.created_at) }}</span>
              </div>
              <div class="order-total">
                <span class="total-label">合计：</span>
                <span class="total-amount">{{ order.total_amount }}</span>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>

      <van-empty
        v-if="!loading && orderList.length === 0"
        description="还没有订单"
        image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import moment from 'moment'
import request from '../utils/request'

const router = useRouter()
const { t, locale } = useI18n()

const orderList = ref([])
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)

// 获取订单列表
const fetchOrders = async () => {
  try {
    // 从localStorage获取设备ID或生成一个
    let deviceId = localStorage.getItem('deviceId')
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('deviceId', deviceId)
    }

    const res = await request({
      url: '/orders/my-orders',
      method: 'get',
      params: { deviceId }
    })

    if (res.success) {
      orderList.value = res.data || []
    }
  } catch (error) {
    console.error('获取订单失败:', error)
    showToast('获取订单失败')
  } finally {
    loading.value = false
    refreshing.value = false
    finished.value = true
  }
}

// 下拉刷新
const onRefresh = () => {
  finished.value = false
  fetchOrders()
}

// 加载更多
const onLoad = () => {
  fetchOrders()
}

// 查看订单详情
const viewOrderDetail = (order) => {
  showToast('订单详情')
}

// 返回
const goBack = () => {
  router.back()
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    preparing: 'primary',
    completed: 'success',
    cancelled: 'default'
  }
  return typeMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待处理',
    preparing: '制作中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

// 获取商品名称
const getProductName = (item) => {
  const lang = locale.value
  if (lang === 'zh') return item.name_zh || item.product_name
  if (lang === 'en') return item.name_en || item.product_name
  return item.product_name
}

// 格式化时间
const formatTime = (time) => {
  return moment(time).format('MM-DD HH:mm')
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.orders-container {
  padding: 56px 12px 12px;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.order-card .order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.order-card .order-header .order-number {
  font-weight: 700;
  font-size: 16px;
  color: #6B4423;
}

.order-card .order-items {
  margin-bottom: 12px;
}

.order-card .order-items .order-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
}

.order-card .order-items .order-item .item-name {
  flex: 1;
  color: #333;
}

.order-card .order-items .order-item .item-qty {
  color: #999;
  margin: 0 12px;
}

.order-card .order-items .order-item .item-price {
  color: #6B4423;
  font-weight: 600;
}

.order-card .order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.order-card .order-footer .order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-card .order-footer .order-info .order-table {
  font-size: 13px;
  color: #666;
}

.order-card .order-footer .order-info .order-time {
  font-size: 12px;
  color: #999;
}

.order-card .order-footer .order-total .total-label {
  font-size: 14px;
  color: #666;
}

.order-card .order-footer .order-total .total-amount {
  font-size: 18px;
  font-weight: 700;
  color: #D32F2F;
  margin-left: 8px;
}
</style>
