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
      confirmOrder: '确认订单',
      changeTableWarning: '切换桌号将清空当前购物车,确认继续吗?',
      tableChanged: '桌号已切换,购物车已清空'
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
      paymentSuccess: '支付成功'
    },
    payment: {
      title: '支付订单',
      method: '支付方式',
      kpay: 'KPAY支付',
      processing: '处理中...',
      payNow: '立即支付',
      mockPay: '模拟支付（测试）'
    }
  },
  my: {
    common: {
      confirm: 'အတည်ပြုပါ',
      cancel: 'မလုပ်တော့ပါ',
      submit: 'တင်သွင်းမည်',
      loading: 'တင်နေသည်...',
      success: 'အောင်မြင်သည်',
      error: 'အမှား',
      back: 'နောက်သို့',
      delete: 'ဖျက်မည်',
      add: 'ထည့်မည်',
      minus: 'လျှော့မည်'
    },
    menu: {
      title: 'မီနူး',
      cart: 'စျေးခြင်း',
      total: 'စုစုပေါင်း',
      checkout: 'ငွေရှင်းမည်',
      addToCart: 'စျေးခြင်းထဲထည့်မည်',
      selectOptions: 'ရွေးချယ်မှုများ'
    },
    product: {
      size: 'အရွယ်အစား',
      temperature: 'အပူချိန်',
      sweetness: 'ချိုမှု',
      hot: 'ပူ',
      iced: 'အေး',
      warm: 'နွေး',
      normal: 'ပုံမှန်ချို',
      less: 'နည်းနည်းချို',
      half: 'တစ်ဝက်ချို',
      none: 'ချိုမထည့်',
      small: 'သေးငယ်သော',
      medium: 'အလတ်စား',
      large: 'ကြီးမား',
      soldOut: 'ရောင်းကုန်သွားပြီ'
    },
    cart: {
      empty: 'စျေးခြင်းအလွတ်',
      quantity: 'အရေအတွက်',
      subtotal: 'ခွဲစုစုပေါင်း',
      remark: 'မှတ်ချက်',
      remarkPlaceholder: 'မှတ်ချက်ထည့်ပါ (ရွေးချယ်ခွင့်)',
      tableNumber: 'စားပွဲနံပါတ်',
      confirmOrder: 'အော်ဒါအတည်ပြုမည်',
      changeTableWarning: 'စားပွဲနံပါတ်ပြောင်းလျှင် စျေးခြင်းရှင်းပစ်မည်, သေချာပါသလား?',
      tableChanged: 'စားပွဲနံပါတ်ပြောင်းပြီး, စျေးခြင်းရှင်းပြီး'
    },
    order: {
      orderNumber: 'အော်ဒါနံပါတ်',
      status: 'အခြေအနေ',
      pending: 'ငွေမရှင်းရသေး',
      paid: 'ငွေရှင်းပြီး',
      preparing: 'ပြင်ဆင်နေသည်',
      ready: 'ယူနိုင်ပြီ',
      completed: 'ပြီးစီး',
      cancelled: 'ပယ်ဖျက်ခဲ့သည်',
      createdAt: 'အော်ဒါအချိန်',
      totalAmount: 'စုစုပေါင်းငွေ',
      items: 'ပစ္စည်းများ',
      goToPay: 'ငွေရှင်းမည်',
      paymentSuccess: 'ငွေရှင်းအောင်မြင်သည်'
    },
    payment: {
      title: 'ငွေရှင်းခြင်း',
      method: 'ငွေရှင်းနည်းလမ်း',
      kpay: 'KPAY',
      processing: 'စီမံဆောင်ရွက်နေသည်...',
      payNow: 'ယခုငွေရှင်းမည်',
      mockPay: 'စမ်းသပ်ငွေရှင်းမှု'
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
      confirmOrder: 'Confirm Order',
      changeTableWarning: 'Changing table will clear the cart, continue?',
      tableChanged: 'Table changed, cart cleared'
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
      paymentSuccess: 'Payment Success'
    },
    payment: {
      title: 'Payment',
      method: 'Payment Method',
      kpay: 'KPAY',
      processing: 'Processing...',
      payNow: 'Pay Now',
      mockPay: 'Mock Payment (Test)'
    }
  }
}

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'zh',
  fallbackLocale: 'en',
  messages
})

export default i18n
