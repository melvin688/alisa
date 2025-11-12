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
            <van-cell title="KBZPay" clickable @click="paymentMethod = 'kpay'">
              <template #right-icon>
                <van-radio name="kpay" />
              </template>
            </van-cell>
            <van-cell :title="$t('payment.cash')" clickable @click="paymentMethod = 'cash'">
              <template #right-icon>
                <van-radio name="cash" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>

      <!-- KBZPay 收款码 -->
      <div v-if="paymentMethod === 'kpay'" class="qr-code-section">
        <div class="qr-code-container">
          <h3>{{ $t('payment.scanToPay') }}</h3>
          <div class="qr-code-wrapper">
            <img src="/kbzpay-qr.jpg" alt="KBZPay QR Code" class="qr-code-image" />
          </div>
          <div class="account-info">
            <p class="account-name">Nu Nu Khaung(******0500)</p>
            <div class="kbzpay-logo">
              <span>KBZ</span>
              <span>Pay</span>
            </div>
          </div>
          <div class="payment-hint">
            <van-icon name="info-o" />
            <span>{{ $t('payment.scanHint') }}</span>
          </div>
        </div>
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
          {{ $t('payment.confirm') }}
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

  // 如果选择现金支付，直接完成订单
  if (paymentMethod.value === 'cash') {
    payCash()
    return
  }

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

// 现金支付
async function payCash() {
  paying.value = true
  showLoadingToast({ message: t('payment.processing'), forbidClick: true })

  try {
    const res = await mockPaymentSuccess(order.value.order_no, 'cash')
    
    closeToast()

    if (res.success) {
      showToast(t('payment.cashSuccess'))
      
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

function handleImageError(e) {
  console.error('QR code image failed to load')
  e.target.style.display = 'none'
  showToast('收款码加载失败，请联系店员')
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
  margin-bottom: 20px;
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

/* KBZPay 收款码区域 */
.qr-code-section {
  margin: 20px 0;
}

.qr-code-container {
  background: linear-gradient(135deg, #1e5cb3 0%, #2d7dd2 100%);
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(30, 92, 179, 0.3);
}

.qr-code-container h3 {
  color: white;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.qr-code-wrapper {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.qr-code-image {
  width: 100%;
  max-width: 280px;
  height: auto;
  display: block;
  margin: 0 auto;
}

.qr-placeholder {
  width: 280px;
  height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
  font-size: 14px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  margin: 0 auto;
}

.qr-placeholder p {
  margin: 0;
  text-align: center;
  padding: 0 20px;
}

.account-info {
  margin-bottom: 16px;
}

.account-name {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.kbzpay-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.kbzpay-logo span:first-child {
  color: #1e5cb3;
  font-size: 20px;
}

.kbzpay-logo span:last-child {
  color: #2d7dd2;
  font-size: 20px;
}

.payment-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  margin-top: 16px;
}

.payment-hint :deep(.van-icon) {
  font-size: 16px;
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
