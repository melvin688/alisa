<template>
  <div class="cart-page">
    <van-nav-bar :title="$t('menu.cart')" left-arrow @click-left="goBack" />

    <div v-if="cartStore.itemCount === 0" class="empty-cart">
      <van-empty :description="$t('cart.empty')" />
      <van-button type="primary" @click="goBack">{{ $t('common.back') }}</van-button>
    </div>

    <div v-else class="cart-content">
      <!-- 桌号信息 -->
      <div class="table-info">
        <van-cell-group inset>
          <van-cell :title="$t('cart.tableNumber')" :value="cartStore.tableNumber" />
        </van-cell-group>
      </div>

      <!-- 购物车列表 -->
      <div class="cart-list">
        <van-swipe-cell v-for="(item, index) in cartStore.items" :key="index">
          <div class="cart-item">
            <van-image :src="item.image || '/placeholder.jpg'" fit="cover" />
            <div class="item-info">
              <div class="item-name">
                {{ getProductName(item) }}
                <van-icon 
                  name="cross" 
                  class="delete-icon" 
                  @click="confirmRemove(index)"
                />
              </div>
              <div class="item-options" v-if="item.selectedOptions">
                <span v-for="(option, type) in item.selectedOptions" :key="type">
                  {{ getOptionName(option) }}
                </span>
              </div>
              <div class="item-footer">
                <span class="item-price">{{ formatPrice(calculateItemPrice(item)) }} MMK</span>
                <div class="quantity-controls">
                  <van-button 
                    size="small" 
                    icon="minus" 
                    @click="decreaseQuantity(index)"
                    :disabled="item.quantity <= 1"
                  />
                  <span class="quantity-display">{{ item.quantity }}</span>
                  <van-button 
                    size="small" 
                    icon="plus" 
                    @click="increaseQuantity(index)"
                  />
                </div>
              </div>
            </div>
          </div>
          <template #right>
            <van-button 
              square 
              type="danger" 
              :text="$t('common.delete')" 
              @click="confirmRemove(index)"
              class="swipe-delete"
            />
          </template>
        </van-swipe-cell>
      </div>

      <!-- 备注 -->
      <div class="remark-section">
        <van-field
          v-model="remark"
          rows="2"
          autosize
          type="textarea"
          maxlength="200"
          :placeholder="$t('cart.remarkPlaceholder')"
          show-word-limit
        />
      </div>

      <!-- 底部结算 -->
      <div class="cart-footer">
        <div class="total-info">
          <span>{{ $t('menu.total') }}:</span>
          <span class="total-price">{{ formatPrice(cartStore.totalAmount) }} MMK</span>
        </div>
        <van-button type="primary" block @click="submitOrder" :loading="submitting">
          {{ $t('cart.confirmOrder') }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant'
import { useCartStore } from '@/stores/cart'
import { createOrder } from '@/api'

const router = useRouter()
const { t, locale } = useI18n()
const cartStore = useCartStore()

const remark = ref('')
const submitting = ref(false)

function goBack() {
  router.back()
}

// 增加数量
function increaseQuantity(index) {
  const currentQty = cartStore.items[index].quantity
  cartStore.updateQuantity(index, currentQty + 1)
  showToast({
    message: t('common.success'),
    duration: 500
  })
}

// 减少数量
function decreaseQuantity(index) {
  const currentQty = cartStore.items[index].quantity
  if (currentQty > 1) {
    cartStore.updateQuantity(index, currentQty - 1)
    showToast({
      message: t('common.success'),
      duration: 500
    })
  } else {
    // 数量为1时，询问是否删除
    confirmRemove(index)
  }
}

// 更新数量
function updateQuantity(index, quantity) {
  if (quantity <= 0) {
    confirmRemove(index)
  } else {
    cartStore.updateQuantity(index, quantity)
  }
}

// 确认删除
function confirmRemove(index) {
  const item = cartStore.items[index]
  const productName = getProductName(item)
  
  showConfirmDialog({
    title: t('common.delete'),
    message: `${t('common.confirm')}${t('common.delete')} "${productName}"?`,
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel')
  }).then(() => {
    cartStore.removeItem(index)
    showToast({
      message: t('common.success'),
      type: 'success'
    })
  }).catch(() => {
    // 用户取消
  })
}

// 旧方法保留兼容
function removeItem(index) {
  confirmRemove(index)
}

function calculateItemPrice(item) {
  let price = parseFloat(item.price)
  
  if (item.selectedOptions) {
    Object.values(item.selectedOptions).forEach(option => {
      if (option && option.extra_price) {
        price += parseFloat(option.extra_price)
      }
    })
  }
  
  return price * item.quantity
}

async function submitOrder() {
  if (!cartStore.tableNumber) {
    showToast(t('cart.tableNumber') + '!')
    return
  }

  if (cartStore.itemCount === 0) {
    showToast(t('cart.empty'))
    return
  }

  submitting.value = true
  showLoadingToast({ message: t('common.loading'), forbidClick: true })

  try {
    // 构建订单数据
    const orderData = {
      table_number: cartStore.tableNumber,
      remark: remark.value,
      language: locale.value,
      items: cartStore.items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        options: item.selectedOptions ? Object.fromEntries(
          Object.entries(item.selectedOptions).map(([type, option]) => [type, option.id])
        ) : {}
      }))
    }

    const res = await createOrder(orderData)

    if (res.success) {
      closeToast()
      showToast(t('common.success'))
      
      // 清空购物车
      cartStore.clearCart()
      
      // 跳转到支付页面
      router.replace(`/payment/${res.data.order_no}`)
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    closeToast()
    showToast(error.message || t('common.error'))
  } finally {
    submitting.value = false
  }
}

function getProductName(product) {
  if (locale.value === 'my') return product.name_my || product.name_zh
  if (locale.value === 'en') return product.name_en || product.name_zh
  return product.name_zh
}

function getOptionName(option) {
  if (locale.value === 'my') return option.name_my || option.name_zh
  if (locale.value === 'en') return option.name_en || option.name_zh
  return option.name_zh
}

function formatPrice(price) {
  return parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 0 })
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f7f8fa;
}

/* 手机端优化: 空购物车 */
.empty-cart {
  padding: 120px 20px 80px;
  text-align: center;
}

.empty-cart :deep(.van-empty__image) {
  width: 160px;
  height: 160px;
}

.empty-cart :deep(.van-empty__description) {
  font-size: 15px;
  margin-top: 16px;
}

.empty-cart :deep(.van-button) {
  margin-top: 24px;
  height: 44px;
  padding: 0 32px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
}

.cart-content {
  padding-bottom: 120px;
}

/* 手机端优化: 桌号信息 */
.table-info {
  margin: 12px;
}

.table-info :deep(.van-cell-group) {
  border-radius: 12px;
  overflow: hidden;
}

.table-info :deep(.van-cell) {
  font-weight: 600;
  font-size: 15px;
  padding: 14px 16px;
}

.table-info :deep(.van-cell__title) {
  color: #323233;
}

.table-info :deep(.van-cell__value) {
  color: #1989fa;
  font-size: 17px;
  font-weight: 700;
}

/* 手机端优化: 购物车列表 */
.cart-list {
  background: white;
  margin: 0 12px 12px;
  border-radius: 12px;
  overflow: hidden;
}

/* 手机端优化: 购物车商品项 */
.cart-item {
  display: flex;
  padding: 16px;
  gap: 12px;
  border-bottom: 1px solid #f7f8fa;
}

.cart-item:last-child {
  border-bottom: none;
}

/* 手机端优化: 商品图片 */
.cart-item :deep(.van-image) {
  width: 85px;
  height: 85px;
  border-radius: 10px;
  flex-shrink: 0;
  background: #f5f5f5;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* 手机端优化: 商品名称 */
.item-name {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.4;
  color: #323233;
}

/* 手机端优化: 删除图标 */
.delete-icon {
  color: #ee0a24;
  font-size: 20px;
  cursor: pointer;
  padding: 2px;
  transition: transform 0.2s;
  flex-shrink: 0;
  margin-top: -2px;
}

.delete-icon:active {
  transform: scale(0.85);
}

/* 手机端优化: 规格选项 */
.item-options {
  font-size: 12px;
  color: #969799;
  margin-bottom: auto;
  line-height: 1.5;
  margin-top: 2px;
}

.item-options span:not(:last-child)::after {
  content: ' / ';
}

/* 手机端优化: 商品底部信息 */
.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

/* 手机端优化: 商品价格 */
.item-price {
  color: #ee0a24;
  font-weight: 700;
  font-size: 17px;
}

/* 手机端优化: 数量控制按钮 */
.quantity-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity-controls :deep(.van-button) {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
}

.quantity-controls :deep(.van-button .van-icon) {
  font-size: 16px;
}

/* 手机端优化: 数量显示 */
.quantity-display {
  min-width: 32px;
  text-align: center;
  font-weight: 700;
  font-size: 16px;
  color: #323233;
}

/* 手机端优化: 侧滑删除按钮 */
.swipe-delete {
  height: 100%;
  font-size: 15px;
  font-weight: 600;
}

/* 手机端优化: 备注区域 */
.remark-section {
  margin: 0 12px 12px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.remark-section :deep(.van-field) {
  padding: 14px 16px;
  font-size: 14px;
}

.remark-section :deep(.van-field__control) {
  line-height: 1.6;
}

/* 手机端优化: 底部结算栏 */
.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
  border-top: 1px solid #ebedf0;
  z-index: 999;
}

/* 手机端优化: 总价信息 */
.total-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
}

.total-info > span:first-child {
  color: #646566;
  font-weight: 500;
}

/* 手机端优化: 总价金额 */
.total-price {
  color: #ee0a24;
  font-size: 22px;
  font-weight: 700;
}

/* 手机端优化: 确认订单按钮 */
.cart-footer :deep(.van-button) {
  height: 48px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
}

/* 响应式: 超小屏幕 (iPhone SE) */
@media (max-width: 375px) {
  .cart-item {
    padding: 14px 12px;
  }
  
  .cart-item :deep(.van-image) {
    width: 75px;
    height: 75px;
  }
  
  .item-name {
    font-size: 14px;
  }
  
  .item-price {
    font-size: 16px;
  }
  
  .quantity-controls :deep(.van-button) {
    width: 28px;
    height: 28px;
  }
  
  .total-price {
    font-size: 20px;
  }
}

/* 响应式: 大屏手机 */
@media (min-width: 414px) {
  .cart-item :deep(.van-image) {
    width: 90px;
    height: 90px;
  }
  
  .item-name {
    font-size: 16px;
  }
}
</style>
