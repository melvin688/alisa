<template>
  <div class="menu-page">
    <!-- 顶部导航 -->
    <van-nav-bar :title="$t('menu.title')" fixed>
      <template #right>
        <van-dropdown-menu>
          <van-dropdown-item v-model="currentLang" :options="langOptions" @change="changeLang" />
        </van-dropdown-menu>
      </template>
    </van-nav-bar>

    <!-- 桌号选择 -->
    <div class="table-selector">
      <van-field
        v-model="tableNumber"
        :label="$t('cart.tableNumber')"
        placeholder="A01"
        readonly
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
                :src="product.image || '/placeholder.jpg'"
                fit="cover"
                lazy-load
              />
            </div>
            <div class="product-info">
              <div class="product-name">{{ getProductName(product) }}</div>
              <div class="product-desc">{{ getProductDesc(product) }}</div>
              <div class="product-footer">
                <span class="product-price">{{ formatPrice(product.price) }} MMK</span>
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
      <span class="cart-total">{{ formatPrice(cartStore.totalAmount) }} MMK</span>
      <van-button type="primary" size="small">{{ $t('menu.checkout') }}</van-button>
    </div>

    <!-- 商品规格选择弹窗 -->
    <van-popup v-model:show="showProductPopup" round position="bottom">
      <div class="product-popup" v-if="selectedProduct">
        <div class="popup-header">
          <van-image :src="selectedProduct.image || '/placeholder.jpg'" fit="cover" />
          <div class="popup-info">
            <h3>{{ getProductName(selectedProduct) }}</h3>
            <p class="popup-price">{{ formatPrice(calculatePrice()) }} MMK</p>
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
                <span v-if="option.extra_price > 0">+{{ option.extra_price }} MMK</span>
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
  { text: 'မြန်မာ', value: 'my' },
  { text: 'English', value: 'en' }
]

const tableNumber = ref(cartStore.tableNumber || '')
const showTablePicker = ref(false)
const tableColumns = ref([])

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
  
  // 自动选择第一个桌号
  if (!tableNumber.value && tableColumns.value.length > 0) {
    tableNumber.value = tableColumns.value[0].value
    cartStore.setTableNumber(tableNumber.value)
  }
})

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
  
  // 如果桌号改变,提示并清空购物车
  if (tableNumber.value && newTableNumber !== tableNumber.value && cartStore.itemCount > 0) {
    showConfirmDialog({
      title: t('common.confirm'),
      message: t('cart.changeTableWarning'),
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel')
    }).then(() => {
      // 清空购物车
      cartStore.clearCart()
      tableNumber.value = newTableNumber
      cartStore.setTableNumber(newTableNumber)
      showTablePicker.value = false
      showToast(t('cart.tableChanged'))
    }).catch(() => {
      // 用户取消,不切换桌号
    })
  } else {
    tableNumber.value = newTableNumber
    cartStore.setTableNumber(newTableNumber)
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
  if (locale.value === 'my') return category.name_my || category.name_zh
  if (locale.value === 'en') return category.name_en || category.name_zh
  return category.name_zh
}

// 获取商品名称
function getProductName(product) {
  if (locale.value === 'my') return product.name_my || product.name_zh
  if (locale.value === 'en') return product.name_en || product.name_zh
  return product.name_zh
}

// 获取商品描述
function getProductDesc(product) {
  if (locale.value === 'my') return product.description_my || product.description_zh
  if (locale.value === 'en') return product.description_en || product.description_zh
  return product.description_zh
}

// 获取规格名称
function getOptionName(option) {
  if (locale.value === 'my') return option.name_my || option.name_zh
  if (locale.value === 'en') return option.name_en || option.name_zh
  return option.name_zh
}

// 格式化价格
function formatPrice(price) {
  return parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 0 })
}
</script>

<style scoped>
.menu-page {
  padding-bottom: 70px;
  min-height: 100vh;
  background: #f7f8fa;
}

.table-selector {
  margin-top: 46px;
  background: white;
  padding: 12px 15px;
}

/* 手机端优化: 桌号选择器 */
.table-selector :deep(.van-field) {
  font-size: 15px;
}

.table-selector :deep(.van-field__label) {
  font-weight: 500;
  min-width: 70px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px;
}

/* 手机端优化: 商品卡片 */
.product-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-item:active {
  transform: scale(0.98);
  box-shadow: 0 1px 6px rgba(0,0,0,0.12);
}

/* 手机端优化: 商品图片高度 */
.product-image {
  width: 100%;
  height: 140px;
  background: #f5f5f5;
}

.product-image :deep(.van-image) {
  width: 100%;
  height: 100%;
}

.product-info {
  padding: 12px;
}

/* 手机端优化: 商品名称 */
.product-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #323233;
  line-height: 1.4;
}

/* 手机端优化: 商品描述 */
.product-desc {
  font-size: 11px;
  color: #969799;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

/* 手机端优化: 价格显示 */
.product-price {
  color: #ee0a24;
  font-weight: 700;
  font-size: 16px;
}

/* 手机端优化: 添加按钮 */
.product-footer :deep(.van-button) {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
}

/* 手机端优化: 底部购物车栏 */
.cart-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: white;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
  z-index: 999;
  border-top: 1px solid #ebedf0;
}

.cart-bar :deep(.van-badge) {
  margin-right: 15px;
}

.cart-bar :deep(.van-icon) {
  font-size: 28px;
}

/* 手机端优化: 购物车总价 */
.cart-total {
  flex: 1;
  font-size: 17px;
  font-weight: 700;
  color: #ee0a24;
  margin-left: 10px;
}

/* 手机端优化: 结算按钮 */
.cart-bar :deep(.van-button) {
  height: 44px;
  padding: 0 28px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
}

/* 手机端优化: 商品详情弹窗 */
.product-popup {
  padding: 20px 16px;
  max-height: 75vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.popup-header {
  display: flex;
  gap: 15px;
  margin-bottom: 24px;
}

/* 手机端优化: 弹窗图片 */
.popup-header :deep(.van-image) {
  width: 90px;
  height: 90px;
  border-radius: 12px;
  flex-shrink: 0;
}

.popup-info {
  flex: 1;
  min-width: 0;
}

.popup-info h3 {
  margin-bottom: 8px;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.4;
}

/* 手机端优化: 弹窗价格 */
.popup-price {
  color: #ee0a24;
  font-size: 22px;
  font-weight: 700;
}

/* 手机端优化: 规格选项 */
.options-section {
  margin-bottom: 24px;
}

.option-group {
  margin-bottom: 20px;
}

.option-group h4 {
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #323233;
}

.option-group :deep(.van-radio) {
  margin-bottom: 12px;
  padding: 10px 0;
}

.option-group :deep(.van-radio__label) {
  font-size: 14px;
  line-height: 1.5;
}

/* 手机端优化: 弹窗底部 */
.popup-footer {
  display: flex;
  gap: 16px;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #ebedf0;
}

.popup-footer :deep(.van-stepper) {
  flex-shrink: 0;
}

.popup-footer :deep(.van-stepper__input) {
  width: 40px;
  height: 32px;
  font-size: 15px;
  font-weight: 600;
}

.popup-footer :deep(.van-stepper__minus),
.popup-footer :deep(.van-stepper__plus) {
  width: 32px;
  height: 32px;
}

.popup-footer :deep(.van-button) {
  height: 44px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
}

/* 响应式: 超小屏幕 (iPhone SE) */
@media (max-width: 375px) {
  .product-list {
    gap: 10px;
    padding: 10px;
  }
  
  .product-image {
    height: 120px;
  }
  
  .product-name {
    font-size: 13px;
  }
  
  .product-price {
    font-size: 15px;
  }
  
  .popup-header :deep(.van-image) {
    width: 80px;
    height: 80px;
  }
}

/* 响应式: 大屏手机 */
@media (min-width: 414px) {
  .product-image {
    height: 160px;
  }
  
  .product-name {
    font-size: 15px;
  }
}
</style>
