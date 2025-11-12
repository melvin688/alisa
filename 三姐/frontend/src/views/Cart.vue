<template>
  <div class="cart-page">
    <van-nav-bar :title="$t('menu.cart')" left-arrow @click-left="goBack">
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

    <div v-if="cartStore.itemCount === 0" class="empty-cart">
      <van-empty :description="$t('cart.empty')" />
      <van-button type="primary" @click="goBack">{{ $t('common.back') }}</van-button>
    </div>

    <div v-else class="cart-content">
      <!-- 服务类型信息 -->
      <div class="service-info">
        <van-cell-group inset>
          <van-cell 
            :title="getServiceTypeLabel()" 
            :value="serviceType === 'dine-in' ? cartStore.tableNumber : ''" 
            :label="getServiceTypeDesc()"
          />
        </van-cell-group>
      </div>

      <!-- 购物车列表 -->
      <div class="cart-list">
        <van-swipe-cell v-for="(item, index) in cartStore.items" :key="index">
          <div class="cart-item">
            <van-image :src="getImageUrl(item.image_url)" fit="cover" />
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
                <span class="item-price">{{ formatPrice(calculateItemPrice(item)) }}</span>
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
          :placeholder="getRemarkPlaceholder()"
          :label="getRemarkLabel()"
          :required="serviceType !== 'dine-in'"
          show-word-limit
        />
      </div>

      <!-- 底部结算 -->
      <div class="cart-footer">
        <div class="total-info">
          <span>{{ $t('menu.total') }}:</span>
          <span class="total-price">{{ formatPrice(cartStore.totalAmount) }}</span>
        </div>
        <van-button type="primary" block @click="submitOrder" :loading="submitting">
          {{ $t('cart.confirmOrder') }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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
const serviceType = ref(localStorage.getItem('serviceType') || 'dine-in')

// 获取服务类型标签
const getServiceTypeLabel = () => {
  const typeMap = {
    'dine-in': 'dineIn',
    'delivery': 'delivery',
    'takeaway': 'takeaway'
  }
  return t(`cart.serviceType.${typeMap[serviceType.value]}`)
}

// 获取服务类型描述
const getServiceTypeDesc = () => {
  const typeMap = {
    'dine-in': 'dineIn',
    'delivery': 'delivery',
    'takeaway': 'takeaway'
  }
  return t(`cart.serviceDesc.${typeMap[serviceType.value]}`)
}

// 获取备注标签
const getRemarkLabel = () => {
  const labels = {
    'dine-in': t('cart.remarkOptional'),
    'delivery': t('cart.deliveryAddressRequired'),
    'takeaway': t('cart.pickupTimeRequired')
  }
  return labels[serviceType.value] || t('cart.remark')
}

// 获取备注占位符
const getRemarkPlaceholder = () => {
  const placeholders = {
    'dine-in': t('cart.remarkPlaceholder'),
    'delivery': t('cart.deliveryAddressPlaceholder'),
    'takeaway': t('cart.pickupTimePlaceholder')
  }
  return placeholders[serviceType.value] || ''
}

function goBack() {
  router.back()
}

// 返回首页
function goHome() {
  router.push('/')
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
  // 验证服务类型相关信息
  if (serviceType.value === 'dine-in' && !cartStore.tableNumber) {
    showToast(t('cart.selectTableRequired'))
    return
  }

  if (serviceType.value === 'delivery' && !remark.value.trim()) {
    showToast(t('cart.deliveryAddressRequiredMsg'))
    return
  }

  if (serviceType.value === 'takeaway' && !remark.value.trim()) {
    showToast(t('cart.pickupTimeRequiredMsg'))
    return
  }

  if (cartStore.itemCount === 0) {
    showToast(t('cart.empty'))
    return
  }

  submitting.value = true
  showLoadingToast({ message: t('common.loading'), forbidClick: true })

  try {
    // 获取或生成设备ID
    let deviceId = localStorage.getItem('deviceId')
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('deviceId', deviceId)
    }

    // 构建订单数据
    const orderData = {
      table_number: serviceType.value === 'dine-in' ? cartStore.tableNumber : null,
      service_type: serviceType.value,
      remark: remark.value,
      language: locale.value,
      deviceId: deviceId,
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

function getImageUrl(imageUrl) {
  if (!imageUrl) {
    // 返回咖啡主题占位图
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0ZGRjhGMCIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+4piVPC90ZXh0Pgo8L3N2Zz4='
  }
  if (imageUrl.startsWith('http')) return imageUrl
  // 使用环境变量构建完整URL
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  return `${apiUrl}${path}`
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF8F0 0%, #F5F5F5 100%);
}

/* 手机端优化: 空购物车 */
.empty-cart {
  padding: 120px 20px 80px;
  text-align: center;
  animation: fadeInUp 0.6s ease;
}

.empty-cart :deep(.van-empty__image) {
  width: 180px;
  height: 180px;
  opacity: 0.8;
}

.empty-cart :deep(.van-empty__description) {
  font-size: 16px;
  margin-top: 20px;
  color: #8D6E63;
  font-weight: 500;
}

.empty-cart :deep(.van-button) {
  margin-top: 32px;
  height: 48px;
  padding: 0 40px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
  box-shadow: 0 4px 16px rgba(107, 68, 35, 0.3);
  letter-spacing: 0.5px;
}

.cart-content {
  padding-bottom: 140px;
  animation: fadeInUp 0.5s ease;
}

/* 手机端优化: 桌号信息 */
.table-info {
  margin: 14px;
}

.table-info :deep(.van-cell-group) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  background: linear-gradient(135deg, #FFF8F0 0%, white 100%);
}

.table-info :deep(.van-cell) {
  font-weight: 600;
  font-size: 16px;
  padding: 18px 20px;
  background: transparent;
}

.table-info :deep(.van-cell__title) {
  color: #6B4423;
  font-weight: 700;
}

.table-info :deep(.van-cell__value) {
  background: linear-gradient(135deg, #D84315 0%, #6B4423 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 1px;
}

/* 手机端优化: 购物车列表 */
.cart-list {
  background: white;
  margin: 0 14px 14px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

/* 手机端优化: 购物车商品项 */
.cart-item {
  display: flex;
  padding: 18px;
  gap: 14px;
  border-bottom: 2px solid #FFF8F0;
  animation: slideInRight 0.4s ease;
  transition: background 0.3s;
}

.cart-item:active {
  background: #FAFAFA;
}

.cart-item:last-child {
  border-bottom: none;
}

/* 手机端优化: 商品图片 */
.cart-item :deep(.van-image) {
  width: 90px;
  height: 90px;
  border-radius: 14px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* 手机端优化: 商品名称 */
.item-name {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.4;
  color: #2C1810;
}

/* 手机端优化: 删除图标 */
.delete-icon {
  color: #D84315;
  font-size: 22px;
  cursor: pointer;
  padding: 4px;
  transition: all 0.3s;
  flex-shrink: 0;
  margin-top: -2px;
  background: rgba(216, 67, 21, 0.1);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon:active {
  transform: scale(0.85) rotate(90deg);
  background: rgba(216, 67, 21, 0.2);
}

/* 手机端优化: 规格选项 */
.item-options {
  font-size: 13px;
  color: #8D6E63;
  margin-bottom: auto;
  line-height: 1.6;
  margin-top: 2px;
  font-weight: 500;
}

.item-options span:not(:last-child)::after {
  content: ' / ';
  color: #BCAAA4;
}

/* 手机端优化: 商品底部信息 */
.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
}

/* 手机端优化: 商品价格 */
.item-price {
  background: linear-gradient(135deg, #D84315 0%, #6B4423 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
  font-size: 19px;
  letter-spacing: -0.5px;
}

/* 手机端优化: 数量控制按钮 */
.quantity-controls {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%);
  padding: 4px 8px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.quantity-controls :deep(.van-button) {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: all 0.3s;
}

.quantity-controls :deep(.van-button:active) {
  transform: scale(0.9);
}

.quantity-controls :deep(.van-button--primary) {
  background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
}

.quantity-controls :deep(.van-button .van-icon) {
  font-size: 16px;
  font-weight: bold;
}

/* 手机端优化: 数量显示 */
.quantity-display {
  min-width: 36px;
  text-align: center;
  font-weight: 800;
  font-size: 17px;
  color: #6B4423;
}

/* 手机端优化: 侧滑删除按钮 */
.swipe-delete {
  height: 100%;
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #D84315 0%, #BF360C 100%);
}

/* 手机端优化: 备注区域 */
.remark-section {
  margin: 0 14px 14px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.remark-section :deep(.van-field) {
  padding: 18px 20px;
  font-size: 15px;
  background: linear-gradient(135deg, #FFF8F0 0%, white 100%);
}

.remark-section :deep(.van-field__control) {
  line-height: 1.6;
  color: #333;
}

.remark-section :deep(.van-field__control::placeholder) {
  color: #BCAAA4;
}

/* 手机端优化: 底部结算栏 */
.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20px;
  box-shadow: 0 -4px 20px rgba(107, 68, 35, 0.15);
  border-top: 2px solid #FFF8F0;
  z-index: 999;
}

/* 手机端优化: 总价信息 */
.total-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  font-size: 17px;
}

.total-info > span:first-child {
  color: #6B4423;
  font-weight: 700;
  font-size: 16px;
}

/* 手机端优化: 总价金额 */
.total-price {
  background: linear-gradient(135deg, #D84315 0%, #6B4423 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
  animation: pulse 2s infinite;
}

/* 手机端优化: 确认订单按钮 */
.cart-footer :deep(.van-button) {
  height: 52px;
  border-radius: 26px;
  font-size: 17px;
  font-weight: 700;
  background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
  box-shadow: 0 6px 20px rgba(107, 68, 35, 0.4);
  letter-spacing: 1px;
  transition: all 0.3s;
}

.cart-footer :deep(.van-button:active) {
  transform: translateY(2px);
  box-shadow: 0 3px 10px rgba(107, 68, 35, 0.4);
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
