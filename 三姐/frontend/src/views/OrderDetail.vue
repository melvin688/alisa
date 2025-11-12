<template>
  <div class="order-detail-page">
    <van-nav-bar :title="$t('order.orderNumber')" left-arrow @click-left="goBack" />

    <div v-if="order" class="order-content">
      <!-- 订单状态 -->
      <div class="order-status">
        <van-steps :active="getStatusStep(order.status)" active-color="#07c160">
          <van-step>{{ $t('order.paid') }}</van-step>
          <van-step>{{ $t('order.preparing') }}</van-step>
          <van-step>{{ $t('order.ready') }}</van-step>
          <van-step>{{ $t('order.completed') }}</van-step>
        </van-steps>
      </div>

      <!-- 订单信息 -->
      <van-cell-group inset>
        <van-cell :title="$t('order.orderNumber')" :value="order.order_no" />
        <van-cell :title="$t('cart.tableNumber')" :value="order.table_number" />
        <van-cell :title="$t('order.status')">
          <template #value>
            <van-tag :type="getStatusType(order.status)">
              {{ getStatusText(order.status) }}
            </van-tag>
          </template>
        </van-cell>
        <van-cell :title="$t('order.createdAt')" :value="formatTime(order.created_at)" />
      </van-cell-group>

      <!-- 商品列表 -->
      <div class="order-items">
        <h3>{{ $t('order.items') }}</h3>
        <van-cell-group inset>
          <van-swipe-cell v-for="item in order.items" :key="item.id">
            <van-cell>
              <template #title>
                <div class="item-info">
                  <div class="item-title">
                    <span class="item-name">{{ getItemName(item) }}</span>
                    <span class="item-quantity">x{{ item.quantity }}</span>
                  </div>
                  <div class="item-options" v-if="item.options && Object.keys(item.options).length">
                    <span v-for="(optionId, type) in item.options" :key="type">
                      {{ type }}
                    </span>
                  </div>
                </div>
              </template>
              <template #value>
                <div class="item-price">
                  {{ formatPrice(item.subtotal) }} MMK
                </div>
              </template>
            </van-cell>
            <template #right>
              <van-button
                square
                type="danger"
                text="删除"
                class="delete-button"
                @click="deleteItem(item)"
              />
            </template>
          </van-swipe-cell>
        </van-cell-group>
      </div>

      <!-- 备注 -->
      <van-cell-group inset v-if="order.remark">
        <van-cell :title="$t('cart.remark')" :value="order.remark" />
      </van-cell-group>

      <!-- 总金额 -->
      <van-cell-group inset>
        <van-cell :title="$t('order.totalAmount')">
          <template #value>
            <span class="total-amount">{{ formatPrice(order.total_amount) }} MMK</span>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 操作按钮 -->
      <div class="order-actions" v-if="order.payment_status === 'pending'">
        <van-button type="primary" block @click="goToPay">
          {{ $t('order.goToPay') }}
        </van-button>
      </div>

      <div class="order-actions" v-else-if="order.status === 'paid' || order.status === 'preparing'">
        <van-button type="default" block @click="refreshOrder">
          {{ $t('common.loading') }}...
        </van-button>
      </div>
    </div>

    <van-empty v-else :description="$t('common.loading')" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast, showConfirmDialog } from 'vant'
import { getOrder, getProduct } from '@/api'
import moment from 'moment'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const order = ref(null)

onMounted(async () => {
  await loadOrder()
})

async function loadOrder() {
  try {
    const orderNo = route.params.orderNo
    const res = await getOrder(orderNo)
    
    if (res.success) {
      order.value = res.data
      
      // 为每个商品加载完整的产品信息以支持多语言
      if (order.value.items && order.value.items.length > 0) {
        for (let item of order.value.items) {
          try {
            const productRes = await getProduct(item.product_id)
            if (productRes.success) {
              item.product = productRes.data
            }
          } catch (error) {
            console.error(`Failed to load product ${item.product_id}:`, error)
          }
        }
      }
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    showToast(error.message || t('common.error'))
  }
}

async function refreshOrder() {
  await loadOrder()
  showToast(t('common.success'))
}

function goToPay() {
  router.push(`/payment/${order.value.order_no}`)
}

function goBack() {
  router.push('/menu')
}

function getStatusStep(status) {
  const steps = {
    'pending': 0,
    'paid': 0,
    'preparing': 1,
    'ready': 2,
    'completed': 3
  }
  return steps[status] || 0
}

function getStatusType(status) {
  const types = {
    'pending': 'warning',
    'paid': 'primary',
    'preparing': 'primary',
    'ready': 'success',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return types[status] || 'default'
}

function getStatusText(status) {
  return t(`order.${status}`)
}

function formatTime(time) {
  return moment(time).format('YYYY-MM-DD HH:mm:ss')
}

function formatPrice(price) {
  return parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 0 })
}

// 根据当前语言获取商品名称
function getItemName(item) {
  // 如果商品有多语言数据
  if (item.product) {
    if (locale.value === 'zh') return item.product.name_zh || item.product_name
    if (locale.value === 'en') return item.product.name_en || item.product_name
    if (locale.value === 'my') return item.product.name_my || item.product_name
  }
  
  // 降级方案：使用保存的商品名称
  return item.product_name
}

// 删除商品
async function deleteItem(item) {
  try {
    await showConfirmDialog({
      title: t('common.confirm'),
      message: `${t('common.delete')} ${getItemName(item)}?`,
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel')
    })
    
    // 从订单中删除该商品
    const itemIndex = order.value.items.findIndex(i => i.id === item.id)
    if (itemIndex > -1) {
      order.value.items.splice(itemIndex, 1)
      
      // 重新计算总金额
      order.value.total_amount = order.value.items.reduce((sum, item) => {
        return sum + parseFloat(item.subtotal)
      }, 0)
      
      showToast(t('common.success'))
      
      // 如果所有商品都被删除，返回菜单页
      if (order.value.items.length === 0) {
        showToast(t('order.allItemsDeleted'))
        setTimeout(() => {
          router.push('/menu')
        }, 1500)
      }
    }
  } catch (error) {
    // 用户取消删除
    if (error !== 'cancel') {
      console.error('Delete error:', error)
    }
  }
}
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background: #f7f8fa;
}

/* 手机端优化: 订单内容区域 */
.order-content {
  padding: 16px 12px 40px;
}

/* 手机端优化: 订单状态步骤条 */
.order-status {
  background: white;
  padding: 24px 20px;
  margin-bottom: 16px;
  border-radius: 12px;
}

.order-status :deep(.van-step__title) {
  font-size: 13px;
  color: #969799;
  margin-top: 8px;
}

.order-status :deep(.van-step--finish .van-step__title) {
  color: #07c160;
  font-weight: 600;
}

.order-status :deep(.van-step__circle) {
  width: 8px;
  height: 8px;
}

.order-status :deep(.van-step__line) {
  background: #ebedf0;
}

/* 手机端优化: 订单信息卡片 */
.order-content :deep(.van-cell-group) {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.order-content :deep(.van-cell) {
  padding: 14px 16px;
  font-size: 14px;
}

.order-content :deep(.van-cell__title) {
  color: #646566;
  font-weight: 500;
}

.order-content :deep(.van-cell__value) {
  color: #323233;
  font-weight: 600;
}

/* 手机端优化: 状态标签 */
.order-content :deep(.van-tag) {
  padding: 4px 10px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 4px;
}

/* 手机端优化: 商品列表区域 */
.order-items {
  margin: 16px 0;
}

.order-items h3 {
  padding: 0 12px 12px;
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

/* 手机端优化: 商品项 */
.order-items :deep(.van-cell) {
  padding: 16px;
  align-items: flex-start;
}

.order-items :deep(.van-swipe-cell) {
  margin-bottom: 1px;
}

.item-info {
  width: 100%;
}

.item-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 15px;
  line-height: 1.4;
  color: #323233;
  font-weight: 600;
}

.item-name {
  flex: 1;
  margin-right: 12px;
  word-break: break-word;
}

/* 手机端优化: 数量显示 */
.item-quantity {
  color: #969799;
  font-weight: 500;
  margin-left: 12px;
  flex-shrink: 0;
}

/* 手机端优化: 规格选项 */
.item-options {
  font-size: 12px;
  color: #969799;
  line-height: 1.5;
  margin-top: 4px;
}

.item-options span:not(:last-child)::after {
  content: ' / ';
}

/* 手机端优化: 商品价格 */
.item-price {
  color: #ee0a24;
  font-size: 15px;
  font-weight: 700;
}

.order-items :deep(.van-cell__value) {
  margin-top: 2px;
}

/* 删除按钮 */
.delete-button {
  height: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

/* 手机端优化: 总金额 */
.total-amount {
  color: #ee0a24;
  font-size: 20px;
  font-weight: 700;
}

/* 手机端优化: 操作按钮 */
.order-actions {
  margin-top: 32px;
  padding: 0 4px;
}

.order-actions :deep(.van-button) {
  height: 50px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
}

/* 手机端优化: 加载状态 */
.order-detail-page :deep(.van-empty) {
  padding-top: 120px;
}

.order-detail-page :deep(.van-empty__image) {
  width: 140px;
  height: 140px;
}

.order-detail-page :deep(.van-empty__description) {
  font-size: 15px;
  margin-top: 16px;
}

/* 响应式: 超小屏幕 (iPhone SE) */
@media (max-width: 375px) {
  .order-status {
    padding: 20px 16px;
  }
  
  .order-status :deep(.van-step__title) {
    font-size: 12px;
  }
  
  .item-title {
    font-size: 14px;
  }
  
  .total-amount {
    font-size: 18px;
  }
  
  .order-actions :deep(.van-button) {
    height: 46px;
    font-size: 15px;
  }
}

/* 响应式: 大屏手机 */
@media (min-width: 414px) {
  .order-content {
    padding: 20px 16px 40px;
  }
  
  .order-status {
    padding: 28px 24px;
  }
  
  .item-title {
    font-size: 16px;
  }
  
  .total-amount {
    font-size: 22px;
  }
  
  .order-actions :deep(.van-button) {
    height: 52px;
  }
}
</style>
