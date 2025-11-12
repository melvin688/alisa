<template>
  <div class="menu-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="Alisa Cake" fixed left-arrow @click-left="goHome">
      <template #right>
        <van-dropdown-menu>
          <van-dropdown-item v-model="currentLang" :options="langOptions" @change="changeLang" />
        </van-dropdown-menu>
      </template>
    </van-nav-bar>

    <!-- 桌号选择 (仅在店堂食时显示) -->
    <div v-if="serviceType === 'dine-in'" class="table-selector">
      <van-field
        v-model="tableNumber"
        :label="$t('cart.tableNumber')"
        placeholder="A01"
        readonly
        clickable
        @click="showTablePicker = true"
      />
    </div>

    <!-- 分类标签 -->
    <van-tabs v-model:active="activeCategory" @change="onCategoryChange" sticky offset-top="46px">
      <van-tab v-for="category in categories" :key="category.id" :title="getCategoryName(category)">
        <!-- 商品列表 -->
        <div class="product-list">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-item"
            @click="selectProduct(product)"
          >
            <div class="product-image">
              <van-image
                :src="getImageUrl(product.image_url)"
                fit="cover"
                error-icon="photo-fail"
                loading-icon="photo"
              >
                <template #error>
                  <div class="image-error">
                    <van-icon name="photo-fail" size="40" />
                  </div>
                </template>
              </van-image>
            </div>
            <div class="product-info">
              <div class="product-name">{{ getProductName(product) }}</div>
              <div class="product-desc">{{ getProductDesc(product) }}</div>
              <div class="product-footer">
                <span class="product-price">{{ formatPrice(product.price) }}</span>
                <van-button
                  type="primary"
                  size="small"
                  round
                  @click.stop="quickAdd(product)"
                >
                  <van-icon name="plus" />
                </van-button>
              </div>
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <!-- 购物车按钮 -->
    <div class="cart-bar" @click="goToCart">
      <van-badge :content="cartStore.itemCount" max="99">
        <van-icon name="shopping-cart-o" size="24" />
      </van-badge>
      <span class="cart-total">{{ formatPrice(cartStore.totalAmount) }}</span>
      <van-button type="primary" size="small">{{ $t('menu.checkout') }}</van-button>
    </div>

    <!-- 商品规格选择弹窗 -->
    <van-popup v-model:show="showProductPopup" round position="bottom">
      <div class="product-popup" v-if="selectedProduct">
        <div class="popup-header">
          <van-image :src="getImageUrl(selectedProduct.image_url)" fit="cover" />
          <div class="popup-info">
            <h3>{{ getProductName(selectedProduct) }}</h3>
            <p class="popup-price">{{ formatPrice(calculatePrice()) }}</p>
          </div>
        </div>

        <!-- 规格选择 -->
        <div class="options-section" v-if="hasOptions">
          <!-- 大小 -->
          <div class="option-group" v-if="selectedProduct.options?.size?.length">
            <h4>{{ $t('product.size') }}</h4>
            <van-radio-group v-model="selectedOptions.size">
              <van-radio
                v-for="option in selectedProduct.options.size"
                :key="option.id"
                :name="option.id"
              >
                {{ getOptionName(option) }}
                <span v-if="option.extra_price > 0">+{{ option.extra_price }}</span>
              </van-radio>
            </van-radio-group>
          </div>

          <!-- 温度 -->
          <div class="option-group" v-if="selectedProduct.options?.temperature?.length">
            <h4>{{ $t('product.temperature') }}</h4>
            <van-radio-group v-model="selectedOptions.temperature">
              <van-radio
                v-for="option in selectedProduct.options.temperature"
                :key="option.id"
                :name="option.id"
              >
                {{ getOptionName(option) }}
                <span v-if="option.extra_price > 0" class="extra-price">+{{ option.extra_price }}</span>
              </van-radio>
            </van-radio-group>
          </div>

          <!-- 甜度 -->
          <div class="option-group" v-if="selectedProduct.options?.sweetness?.length">
            <h4>{{ $t('product.sweetness') }}</h4>
            <van-radio-group v-model="selectedOptions.sweetness">
              <van-radio
                v-for="option in selectedProduct.options.sweetness"
                :key="option.id"
                :name="option.id"
              >
                {{ getOptionName(option) }}
                <span v-if="option.extra_price > 0" class="extra-price">+{{ option.extra_price }}</span>
              </van-radio>
            </van-radio-group>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="popup-footer">
          <van-stepper v-model="productQuantity" min="1" />
          <van-button type="primary" block @click="confirmAddToCart">
            {{ $t('menu.addToCart') }}
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 桌号选择器 -->
    <van-popup v-model:show="showTablePicker" round position="bottom">
      <van-picker
        :columns="tableColumns"
        @confirm="onTableConfirm"
        @cancel="showTablePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant'
import { useCartStore } from '@/stores/cart'
import { getCategories, getProducts, getTables } from '@/api'

const router = useRouter()
const { t, locale } = useI18n()
const cartStore = useCartStore()

const currentLang = ref(locale.value)
const langOptions = [
  { text: '中文', value: 'zh' },
  { text: 'English', value: 'en' }
]

const tableNumber = ref(cartStore.tableNumber || '')
const showTablePicker = ref(false)
const tableColumns = ref([])
const serviceType = ref(localStorage.getItem('serviceType') || 'dine-in')

const categories = ref([])
const products = ref([])
const activeCategory = ref(0)

const showProductPopup = ref(false)
const selectedProduct = ref(null)
const selectedOptions = ref({})
const productQuantity = ref(1)

// 过滤当前分类的商品
const filteredProducts = computed(() => {
  if (!categories.value[activeCategory.value]) return []
  const categoryId = categories.value[activeCategory.value].id
  return products.value.filter(p => p.category_id === categoryId)
})

// 是否有规格选项
const hasOptions = computed(() => {
  if (!selectedProduct.value) return false
  const opts = selectedProduct.value.options
  return opts?.size?.length || opts?.temperature?.length || opts?.sweetness?.length
})

onMounted(async () => {
  await loadTables()
  await loadCategories()
  await loadProducts()
  
  // 从localStorage读取桌号（如果有的话）
  const savedTableNumber = localStorage.getItem('tableNumber')
  if (savedTableNumber) {
    tableNumber.value = savedTableNumber
    cartStore.setTableNumber(savedTableNumber)
  } else if (!tableNumber.value && tableColumns.value.length > 0) {
    // 如果没有保存的桌号，自动选择第一个
    tableNumber.value = tableColumns.value[0].value
    cartStore.setTableNumber(tableNumber.value)
  }
})

// 返回首页
function goHome() {
  router.push('/')
}

// 加载桌台
async function loadTables() {
  try {
    const res = await getTables()
    if (res.success) {
      tableColumns.value = res.data.map(t => ({
        text: t.table_number,
        value: t.table_number
      }))
    }
  } catch (error) {
    console.error('加载桌台失败:', error)
  }
}

// 加载分类
async function loadCategories() {
  try {
    showLoadingToast({ message: t('common.loading'), forbidClick: true })
    const res = await getCategories()
    if (res.success) {
      categories.value = res.data
    }
  } catch (error) {
    showToast(t('common.error'))
  } finally {
    closeToast()
  }
}

// 加载商品
async function loadProducts() {
  try {
    const res = await getProducts()
    if (res.success) {
      products.value = res.data
      
      // 设置默认规格选项
      products.value.forEach(product => {
        if (product.options) {
          ['size', 'temperature', 'sweetness'].forEach(type => {
            if (product.options[type]) {
              const defaultOption = product.options[type].find(o => o.is_default)
              if (!defaultOption && product.options[type].length > 0) {
                product.options[type][0].is_default = true
              }
            }
          })
        }
      })
    }
  } catch (error) {
    showToast(t('common.error'))
  }
}

// 切换语言
function changeLang(value) {
  locale.value = value
  localStorage.setItem('language', value)
}

// 分类切换
function onCategoryChange() {
  // 可以在这里添加切换动画等
}

// 确认桌号
function onTableConfirm({ selectedValues }) {
  const newTableNumber = selectedValues[0]
  const oldTableNumber = tableNumber.value
  
  // 如果桌号改变且购物车有商品,提示并清空购物车
  if (oldTableNumber && newTableNumber !== oldTableNumber && cartStore.itemCount > 0) {
    showConfirmDialog({
      title: t('common.confirm'),
      message: t('cart.changeTableWarning'),
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel')
    }).then(() => {
      // 确认切换,清空购物车
      cartStore.clearCart()
      tableNumber.value = newTableNumber
      cartStore.setTableNumber(newTableNumber)
      localStorage.setItem('tableNumber', newTableNumber)
      showTablePicker.value = false
      showToast(t('cart.switchTableClear'))
    }).catch(() => {
      // 用户取消,保持当前桌号
      showTablePicker.value = false
    })
  } else if (newTableNumber !== oldTableNumber) {
    // 桌号改变但购物车为空,直接切换
    tableNumber.value = newTableNumber
    cartStore.setTableNumber(newTableNumber)
    localStorage.setItem('tableNumber', newTableNumber)
    showTablePicker.value = false
    showToast(`${t('cart.tableNumber')}: ${newTableNumber}`)
  } else {
    // 桌号未变,关闭选择器
    showTablePicker.value = false
  }
}

// 选择商品
function selectProduct(product) {
  selectedProduct.value = product
  productQuantity.value = 1
  
  // 设置默认规格
  selectedOptions.value = {}
  if (product.options) {
    ['size', 'temperature', 'sweetness'].forEach(type => {
      if (product.options[type]?.length) {
        const defaultOpt = product.options[type].find(o => o.is_default)
        selectedOptions.value[type] = defaultOpt ? defaultOpt.id : product.options[type][0].id
      }
    })
  }
  
  showProductPopup.value = true
}

// 快速加入购物车（无规格或使用默认规格）
function quickAdd(product) {
  if (!tableNumber.value) {
    showToast($t('cart.tableNumber') + '!')
    return
  }
  
  // 如果有规格选项，打开弹窗
  if (product.options?.size?.length || product.options?.temperature?.length || product.options?.sweetness?.length) {
    selectProduct(product)
    return
  }
  
  // 没有规格，直接加入
  cartStore.addToCart(product, {})
  showToast(t('common.success'))
}

// 确认加入购物车
function confirmAddToCart() {
  if (!tableNumber.value) {
    showToast(t('cart.tableNumber') + '!')
    return
  }
  
  // 构建选中的规格信息
  const options = {}
  Object.keys(selectedOptions.value).forEach(type => {
    const optionId = selectedOptions.value[type]
    const option = selectedProduct.value.options[type]?.find(o => o.id === optionId)
    if (option) {
      options[type] = option
    }
  })
  
  // 添加到购物车
  for (let i = 0; i < productQuantity.value; i++) {
    cartStore.addToCart(selectedProduct.value, options)
  }
  
  showToast(t('common.success'))
  showProductPopup.value = false
}

// 计算价格（含规格加价）
function calculatePrice() {
  if (!selectedProduct.value) return 0
  
  let price = parseFloat(selectedProduct.value.price)
  
  Object.values(selectedOptions.value).forEach(optionId => {
    const allOptions = [
      ...(selectedProduct.value.options?.size || []),
      ...(selectedProduct.value.options?.temperature || []),
      ...(selectedProduct.value.options?.sweetness || [])
    ]
    const option = allOptions.find(o => o.id === optionId)
    if (option && option.extra_price) {
      price += parseFloat(option.extra_price)
    }
  })
  
  return price * productQuantity.value
}

// 去购物车
function goToCart() {
  if (cartStore.itemCount === 0) {
    showToast(t('cart.empty'))
    return
  }
  router.push('/cart')
}

// 获取分类名称
function getCategoryName(category) {
  if (locale.value === 'en') return category.name_en || category.name_zh
  return category.name_zh
}

// 获取商品名称
function getProductName(product) {
  if (locale.value === 'en') return product.name_en || product.name_zh
  return product.name_zh
}

// 获取商品描述
function getProductDesc(product) {
  if (locale.value === 'en') return product.description_en || product.description_zh || ''
  return product.description_zh || ''
}

// 获取规格名称
function getOptionName(option) {
  if (locale.value === 'en') return option.name_en || option.name_zh
  return option.name_zh
}

// 格式化价格 - 移除 K 单位
function formatPrice(price) {
  return parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 0 })
}

// 获取图片完整URL
function getImageUrl(imageUrl) {
  if (!imageUrl) {
    return '' // 返回空字符串,让v-if="product.image_url"处理
  }
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  // 确保路径以/开头
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  // 使用环境变量构建完整URL
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  // 构建完整的图片URL (不添加时间戳,让浏览器缓存)
  const url = `${apiUrl}${path}`
  return url
}
</script>

<style scoped>
.menu-page {
  padding-bottom: 70px;
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF8F0 0%, #F5F5F5 100%);
}

.table-selector {
  margin-top: 46px;
  background: white;
  padding: 12px 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* 手机端优化: 桌号选择器 */
.table-selector :deep(.van-field) {
  font-size: 15px;
}

.table-selector :deep(.van-field__label) {
  font-weight: 600;
  min-width: 70px;
  color: #6B4423;
}

.table-selector :deep(.van-field__value) {
  color: #8D6E63;
  font-weight: 600;
}

/* Tabs 优化 */
:deep(.van-tabs__wrap) {
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

:deep(.van-tabs__nav) {
  padding: 8px 0;
}

:deep(.van-tab) {
  font-weight: 500;
  color: #666;
  transition: all 0.3s;
}

:deep(.van-tab--active) {
  color: #6B4423;
  font-weight: 600;
}

:deep(.van-tabs__line) {
  background: linear-gradient(90deg, #8D6E63 0%, #6B4423 100%);
  height: 3px;
  border-radius: 2px;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 14px;
  animation: fadeInUp 0.5s ease;
}

/* 手机端优化: 商品卡片 - 横向布局,参考图片设计 */
.product-item {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: scaleIn 0.4s ease;
  position: relative;
  display: flex;
  height: 140px;
}

.product-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #8D6E63 0%, #6B4423 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.product-item:active {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(107, 68, 35, 0.2);
}

.product-item:active::before {
  opacity: 1;
}

/* 手机端优化: 商品图片 - 左侧固定宽度 */
.product-image {
  width: 140px;
  height: 140px;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image::after {
  content: '☕';
  position: absolute;
  font-size: 56px;
  opacity: 0.1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.product-image :deep(.van-image) {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%);
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%);
  color: #8D6E63;
}

.product-info {
  flex: 1;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

/* 手机端优化: 商品名称 */
.product-name {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #2C1810;
  line-height: 1.4;
}

/* 手机端优化: 商品描述 */
.product-desc {
  font-size: 12px;
  color: #8D6E63;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  flex: 1;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 手机端优化: 价格显示 - 更大更醒目 */
.product-price {
  color: #D84315;
  font-weight: 800;
  font-size: 22px;
  letter-spacing: -0.5px;
  line-height: 1;
}

/* 手机端优化: 添加按钮 - 圆形设计 */
.product-footer :deep(.van-button) {
  min-width: 44px;
  height: 44px;
  padding: 0;
  font-size: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
  box-shadow: 0 4px 12px rgba(107, 68, 35, 0.35);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-footer :deep(.van-button:active) {
  transform: scale(0.92);
  box-shadow: 0 2px 8px rgba(107, 68, 35, 0.35);
}

.product-footer :deep(.van-icon) {
  font-size: 22px;
  font-weight: bold;
}

/* 手机端优化: 底部购物车栏 - 更醒目的设计 */
.cart-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 -4px 20px rgba(107, 68, 35, 0.15);
  z-index: 999;
  border-top: 2px solid #FFF8F0;
}

.cart-bar :deep(.van-badge) {
  margin-right: 18px;
}

.cart-bar :deep(.van-badge__wrapper) {
  position: relative;
  padding: 8px;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%);
  border-radius: 50%;
  transition: all 0.3s;
}

.cart-bar:active :deep(.van-badge__wrapper) {
  transform: scale(0.95);
}

.cart-bar :deep(.van-icon) {
  font-size: 28px;
  color: #6B4423;
}

.cart-bar :deep(.van-badge__wrapper .van-badge) {
  background: linear-gradient(135deg, #D84315 0%, #BF360C 100%);
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(216, 67, 21, 0.4);
  animation: pulse 2s infinite;
}

/* 手机端优化: 购物车总价 */
.cart-total {
  flex: 1;
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #D84315 0%, #6B4423 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-left: 10px;
  letter-spacing: -0.5px;
}

/* 手机端优化: 结算按钮 */
.cart-bar :deep(.van-button) {
  height: 48px;
  padding: 0 32px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
  box-shadow: 0 4px 16px rgba(107, 68, 35, 0.35);
  transition: all 0.3s;
  letter-spacing: 0.5px;
}

.cart-bar :deep(.van-button:active) {
  transform: translateY(2px);
  box-shadow: 0 2px 8px rgba(107, 68, 35, 0.35);
}

/* 手机端优化: 商品详情弹窗 - 更优雅的设计 */
.product-popup {
  padding: 24px 20px 20px;
  max-height: 75vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #FAFAFA;
}

.popup-header {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
  background: white;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

/* 手机端优化: 弹窗图片 */
.popup-header :deep(.van-image) {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%);
}

.popup-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.popup-info h3 {
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  color: #2C1810;
}

/* 手机端优化: 弹窗价格 */
.popup-price {
  background: linear-gradient(135deg, #D84315 0%, #6B4423 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

/* 手机端优化: 规格选项 */
.options-section {
  margin-bottom: 24px;
}

.option-group {
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.option-group h4 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 700;
  color: #6B4423;
  display: flex;
  align-items: center;
}

.option-group h4::before {
  content: '●';
  margin-right: 8px;
  color: #8D6E63;
}

.option-group :deep(.van-radio) {
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #FAFAFA;
  transition: all 0.3s;
}

.option-group :deep(.van-radio--checked) {
  background: linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%);
  border: 2px solid #8D6E63;
}

.option-group :deep(.van-radio__icon--checked) {
  background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
  border-color: #6B4423;
}

.option-group :deep(.van-radio__label) {
  font-size: 15px;
  line-height: 1.5;
  color: #333;
  font-weight: 500;
}

/* 加价标签样式 - 更醒目 */
.extra-price {
  margin-left: 8px;
  color: #D84315;
  font-size: 14px;
  font-weight: 700;
  padding: 2px 8px;
  background: rgba(216, 67, 21, 0.1);
  border-radius: 4px;
}

/* 手机端优化: 弹窗底部 */
.popup-footer {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 20px 0 8px;
  border-top: 2px solid #F0F0F0;
}

.popup-footer :deep(.van-stepper) {
  flex-shrink: 0;
  background: white;
  padding: 4px;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.popup-footer :deep(.van-stepper__input) {
  width: 48px;
  height: 36px;
  font-size: 16px;
  font-weight: 700;
  color: #6B4423;
}

.popup-footer :deep(.van-stepper__minus),
.popup-footer :deep(.van-stepper__plus) {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%);
  color: #6B4423;
  border-radius: 50%;
}

.popup-footer :deep(.van-stepper__plus) {
  background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
  color: white;
}

.popup-footer :deep(.van-button) {
  height: 48px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(107, 68, 35, 0.3);
  letter-spacing: 0.5px;
}

/* 响应式: 超小屏幕 (iPhone SE) */
@media (max-width: 375px) {
  .product-item {
    height: 130px;
  }
  
  .product-image {
    width: 130px;
    height: 130px;
  }
  
  .product-info {
    padding: 12px 10px;
  }
  
  .product-name {
    font-size: 15px;
  }
  
  .product-price {
    font-size: 20px;
  }
  
  .product-footer :deep(.van-button) {
    min-width: 40px;
    height: 40px;
  }
  
  .popup-header :deep(.van-image) {
    width: 80px;
    height: 80px;
  }
}

/* 响应式: 大屏手机 */
@media (min-width: 414px) {
  .product-item {
    height: 150px;
  }
  
  .product-image {
    width: 150px;
    height: 150px;
  }
  
  .product-name {
    font-size: 17px;
  }
  
  .product-price {
    font-size: 24px;
  }
}
</style>
