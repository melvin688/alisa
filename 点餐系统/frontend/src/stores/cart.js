import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const tableNumber = ref('')

  // 购物车商品数量
  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  // 购物车总金额
  const totalAmount = computed(() => {
    return items.value.reduce((sum, item) => {
      let price = parseFloat(item.price)
      
      // 计算规格加价
      if (item.selectedOptions) {
        Object.values(item.selectedOptions).forEach(option => {
          if (option && option.extra_price) {
            price += parseFloat(option.extra_price)
          }
        })
      }
      
      return sum + (price * item.quantity)
    }, 0)
  })

  // 添加到购物车
  function addToCart(product, selectedOptions = {}) {
    // 检查是否已存在相同商品和规格
    const existingIndex = items.value.findIndex(item => {
      if (item.id !== product.id) return false
      
      // 比较规格是否相同
      const optionsMatch = JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
      return optionsMatch
    })

    if (existingIndex > -1) {
      // 已存在，增加数量
      items.value[existingIndex].quantity++
    } else {
      // 不存在，添加新项
      items.value.push({
        ...product,
        selectedOptions,
        quantity: 1
      })
    }
  }

  // 更新数量
  function updateQuantity(index, quantity) {
    if (quantity <= 0) {
      removeItem(index)
    } else {
      items.value[index].quantity = quantity
    }
  }

  // 移除商品
  function removeItem(index) {
    items.value.splice(index, 1)
  }

  // 清空购物车
  function clearCart() {
    items.value = []
  }

  // 设置桌号
  function setTableNumber(number) {
    tableNumber.value = number
  }

  return {
    items,
    tableNumber,
    itemCount,
    totalAmount,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    setTableNumber
  }
})
