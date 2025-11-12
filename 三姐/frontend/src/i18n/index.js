import { createI18n } from 'vue-i18n'

const messages = {
  zh: {
    common: {
      confirm: '确认',
      cancel: '取消',
      submit: '提交',
      loading: '加载中...',
      success: '成功',
      error: '错误',
      back: '返回',
      backToHome: '返回首页',
      delete: '删除',
      add: '添加',
      minus: '减少'
    },
    menu: {
      title: '菜单',
      cart: '购物车',
      total: '合计',
      checkout: '去结算',
      addToCart: '加入购物车',
      selectOptions: '选择规格'
    },
    product: {
      size: '大小',
      temperature: '温度',
      sweetness: '甜度',
      hot: '热',
      iced: '冰',
      warm: '温',
      normal: '正常糖',
      less: '少糖',
      half: '半糖',
      none: '无糖',
      small: '小杯',
      medium: '中杯',
      large: '大杯',
      soldOut: '已售罄'
    },
    cart: {
      empty: '购物车是空的',
      quantity: '数量',
      subtotal: '小计',
      remark: '备注',
      remarkPlaceholder: '请输入备注信息(可选)',
      tableNumber: '桌号',
      selectTable: '选择桌号',
      confirmOrder: '确认订单',
      changeTableWarning: '切换桌号将清空当前购物车,确认继续吗?',
      tableChanged: '桌号已切换,购物车已清空',
      switchTableClear: '已切换桌号,购物车已清空',
      switchServiceTypeClear: '已切换服务类型,购物车已清空',
      selectTableRequired: '请选择桌号！',
      deliveryAddressRequiredMsg: '请填写配送地址！',
      pickupTimeRequiredMsg: '请填写取餐时间！',
      serviceType: {
        dineIn: '在店堂食',
        delivery: '外卖配送',
        takeaway: '来店自取'
      },
      serviceDesc: {
        dineIn: '自助下单 · 即点即做',
        delivery: '配送上门 · 请填写配送地址',
        takeaway: '到店自取 · 请填写取餐时间'
      },
      deliveryAddress: '配送地址',
      pickupTime: '取餐时间',
      deliveryAddressPlaceholder: '请填写详细配送地址，如：XX路XX号XX小区X栋XX室',
      pickupTimePlaceholder: '请填写预计取餐时间，如：今天下午3点、明天上午10点',
      deliveryAddressRequired: '配送地址（必填）',
      pickupTimeRequired: '取餐时间（必填）',
      remarkOptional: '备注（可选）'
    },
    order: {
      orderNumber: '订单号',
      status: '状态',
      pending: '待支付',
      paid: '已支付',
      preparing: '制作中',
      ready: '待取餐',
      completed: '已完成',
      cancelled: '已取消',
      createdAt: '下单时间',
      totalAmount: '总金额',
      items: '商品明细',
      goToPay: '去支付',
      paymentSuccess: '支付成功',
      allItemsDeleted: '所有商品已删除，返回菜单页'
    },
    payment: {
      title: '支付订单',
      method: '支付方式',
      kpay: 'KPAY支付',
      cash: '现金支付',
      processing: '处理中...',
      confirm: '确认订单',
      payNow: '立即支付',
      mockPay: '模拟支付（测试）',
      cashSuccess: '订单已提交，请现金支付给服务员',
      scanToPay: '使用KBZPay扫码向我支付',
      scanHint: '打开KBZPay扫描二维码完成支付'
    }
  },
  en: {
    common: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      submit: 'Submit',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      back: 'Back',
      backToHome: 'Back to Home',
      delete: 'Delete',
      add: 'Add',
      minus: 'Minus'
    },
    menu: {
      title: 'Menu',
      cart: 'Cart',
      total: 'Total',
      checkout: 'Checkout',
      addToCart: 'Add to Cart',
      selectOptions: 'Select Options'
    },
    product: {
      size: 'Size',
      temperature: 'Temperature',
      sweetness: 'Sweetness',
      hot: 'Hot',
      iced: 'Iced',
      warm: 'Warm',
      normal: 'Normal Sugar',
      less: 'Less Sugar',
      half: 'Half Sugar',
      none: 'No Sugar',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      soldOut: 'Sold Out'
    },
    cart: {
      empty: 'Cart is empty',
      quantity: 'Quantity',
      subtotal: 'Subtotal',
      remark: 'Remark',
      remarkPlaceholder: 'Enter remark (optional)',
      tableNumber: 'Table',
      selectTable: 'Select Table',
      confirmOrder: 'Confirm Order',
      changeTableWarning: 'Changing table will clear the cart, continue?',
      tableChanged: 'Table changed, cart cleared',
      switchTableClear: 'Table switched, cart cleared',
      switchServiceTypeClear: 'Service type switched, cart cleared',
      selectTableRequired: 'Please select a table!',
      deliveryAddressRequiredMsg: 'Please provide delivery address!',
      pickupTimeRequiredMsg: 'Please provide pickup time!',
      serviceType: {
        dineIn: 'Dine In',
        delivery: 'Delivery',
        takeaway: 'Takeaway'
      },
      serviceDesc: {
        dineIn: 'Self-service ordering',
        delivery: 'Home delivery · Please provide address',
        takeaway: 'Store pickup · Please provide pickup time'
      },
      deliveryAddress: 'Delivery Address',
      pickupTime: 'Pickup Time',
      deliveryAddressPlaceholder: 'Please enter detailed delivery address, e.g.: XX Road XX Building XX Room',
      pickupTimePlaceholder: 'Please enter pickup time, e.g.: 3 PM today, 10 AM tomorrow',
      deliveryAddressRequired: 'Delivery Address (Required)',
      pickupTimeRequired: 'Pickup Time (Required)',
      remarkOptional: 'Remark (Optional)'
    },
    order: {
      orderNumber: 'Order No.',
      status: 'Status',
      pending: 'Pending',
      paid: 'Paid',
      preparing: 'Preparing',
      ready: 'Ready',
      completed: 'Completed',
      cancelled: 'Cancelled',
      createdAt: 'Created At',
      totalAmount: 'Total Amount',
      items: 'Items',
      goToPay: 'Pay Now',
      paymentSuccess: 'Payment Success',
      allItemsDeleted: 'All items deleted, returning to menu'
    },
    payment: {
      title: 'Payment',
      method: 'Payment Method',
      kpay: 'KPAY',
      cash: 'Cash',
      processing: 'Processing...',
      confirm: 'Confirm Order',
      payNow: 'Pay Now',
      mockPay: 'Mock Payment (Test)',
      cashSuccess: 'Order submitted, please pay cash to waiter',
      scanToPay: 'Scan with KBZPay to Pay Me',
      scanHint: 'Open KBZPay and scan the QR code to complete payment'
    }
  }
}

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'zh',
  fallbackLocale: 'zh',
  messages
})

export default i18n
