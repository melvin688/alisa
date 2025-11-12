<template>
  <div class="payment-page">
    <van-nav-bar :title="$t('payment.title')" left-arrow @click-left="goBack" />

    <div v-if="order" class="payment-content">
      <!-- 订单信息 -->
      <div class="order-summary">
        <van-cell-group inset>
          <van-cell :title="$t('order.orderNumber')" :value="order.order_no" />
          <van-cell :title="$t('cart.tableNumber')" :value="order.table_number" />
          <van-cell :title="$t('order.totalAmount')">
            <template #value>
              <span class="amount">{{ formatPrice(order.total_amount) }} MMK</span>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 支付方式 -->
      <div class="payment-method">
        <h3>{{ $t('payment.method') }}</h3>
        <van-radio-group v-model="paymentMethod">
          <van-cell-group inset>
            <van-cell title="KPAY" clickable @click="paymentMethod = 'kpay'">
              <template #right-icon>
                <van-radio name="kpay" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>

      <!-- 支付按钮 -->
      <div class="payment-actions">
        <van-button
          type="primary"
          block
          size="large"
          :loading="paying"
          @click="pay"
        >
          {{ $t('payment.payNow') }}
        </van-button>

        <!-- 测试环境：模拟支付按钮 -->
        <van-button
          v-if="isDev"
          plain
          type="success"
          block
          size="large"
          @click="mockPay"
          style="margin-top: 10px;"
        >
          {{ $t('payment.mockPay') }}
        </van-button>
      </div>
    </div>

    <van-empty v-else :description="$t('common.loading')" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getOrder, createPayment, mockPaymentSuccess } from '@/api'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const order = ref(null)
const paymentMethod = ref('kpay')
const paying = ref(false)
const isDev = import.meta.env.DEV

onMounted(async () => {
  await loadOrder()
})

async function loadOrder() {
  try {
    const orderNo = route.params.orderNo
    const res = await getOrder(orderNo)
    
    if (res.success) {
      order.value = res.data
      
      // 如果已支付，跳转到订单详情
      if (order.value.payment_status === 'success') {
        showToast(t('order.paymentSuccess'))
        router.replace(`/order/${orderNo}`)
      }
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    showToast(error.message || t('common.error'))
    router.back()
  }
}

async function pay() {
  if (!order.value) return

  paying.value = true
  showLoadingToast({ message: t('payment.processing'), forbidClick: true })

  try {
    const res = await createPayment(order.value.order_no)
    
    closeToast()

    if (res.success) {
      // 跳转到 KPAY 支付页面
      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl
      } else {
        throw new Error('支付链接获取失败')
      }
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    closeToast()
    showToast(error.message || t('common.error'))
  } finally {
    paying.value = false
  }
}

// 模拟支付（仅开发环境）
async function mockPay() {
  if (!order.value) return

  paying.value = true
  showLoadingToast({ message: t('payment.processing'), forbidClick: true })

  try {
    const res = await mockPaymentSuccess(order.value.order_no)
    
    closeToast()

    if (res.success) {
      showToast(t('order.paymentSuccess'))
      
      // 延迟跳转到订单详情
      setTimeout(() => {
        router.replace(`/order/${order.value.order_no}`)
      }, 1500)
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    closeToast()
    showToast(error.message || t('common.error'))
  } finally {
    paying.value = false
  }
}

function goBack() {
  router.back()
}

function formatPrice(price) {
  return parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 0 })
}
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background: #f7f8fa;
}

/* 手机端优化: 支付内容区域 */
.payment-content {
  padding: 16px 12px 40px;
}

/* 手机端优化: 订单摘要 */
.order-summary {
  margin-bottom: 20px;
}

.order-summary :deep(.van-cell-group) {
  border-radius: 12px;
  overflow: hidden;
}

.order-summary :deep(.van-cell) {
  padding: 14px 16px;
  font-size: 15px;
}

.order-summary :deep(.van-cell__title) {
  color: #646566;
  font-weight: 500;
}

.order-summary :deep(.van-cell__value) {
  color: #323233;
  font-weight: 600;
}

/* 手机端优化: 总金额 */
.amount {
  color: #ee0a24;
  font-size: 20px;
  font-weight: 700;
}

/* 手机端优化: 支付方式区域 */
.payment-method {
  margin-bottom: 32px;
}

.payment-method h3 {
  padding: 0 12px 12px;
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.payment-method :deep(.van-cell-group) {
  border-radius: 12px;
  overflow: hidden;
}

.payment-method :deep(.van-cell) {
  padding: 16px;
  font-size: 15px;
}

.payment-method :deep(.van-cell__title) {
  font-weight: 600;
  color: #323233;
}

.payment-method :deep(.van-radio__icon) {
  font-size: 20px;
}

/* 手机端优化: 支付按钮 */
.payment-actions {
  margin-top: 40px;
  padding: 0 4px;
}

.payment-actions :deep(.van-button) {
  height: 50px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
}

.payment-actions :deep(.van-button:not(:first-child)) {
  margin-top: 12px;
}

/* 手机端优化: 加载状态 */
.payment-page :deep(.van-empty) {
  padding-top: 120px;
}

.payment-page :deep(.van-empty__image) {
  width: 140px;
  height: 140px;
}

.payment-page :deep(.van-empty__description) {
  font-size: 15px;
  margin-top: 16px;
}

/* 响应式: 超小屏幕 (iPhone SE) */
@media (max-width: 375px) {
  .amount {
    font-size: 18px;
  }
  
  .payment-actions :deep(.van-button) {
    height: 46px;
    font-size: 15px;
  }
}

/* 响应式: 大屏手机 */
@media (min-width: 414px) {
  .payment-content {
    padding: 20px 16px 40px;
  }
  
  .amount {
    font-size: 22px;
  }
  
  .payment-actions :deep(.van-button) {
    height: 52px;
  }
}
</style>
