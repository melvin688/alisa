import request from '@/utils/request'

// 获取所有桌台
export const getTables = () => request.get('/tables')

// 获取桌台信息
export const getTable = (tableNumber) => request.get(`/tables/${tableNumber}`)

// 获取分类
export const getCategories = () => request.get('/categories')

// 获取商品列表
export const getProducts = (categoryId) => {
  const params = categoryId ? { category_id: categoryId } : {}
  // 添加时间戳防止缓存
  params._t = Date.now()
  return request.get('/products', { params })
}

// 获取商品详情
export const getProduct = (id) => request.get(`/products/${id}`)

// 创建订单
export const createOrder = (data) => request.post('/orders', data)

// 获取订单详情
export const getOrder = (orderNo) => request.get(`/orders/${orderNo}`)

// 获取桌台订单
export const getTableOrders = (tableNumber) => request.get(`/orders/table/${tableNumber}`)

// 更新订单状态
export const updateOrderStatus = (orderNo, status) => {
  return request.patch(`/orders/${orderNo}/status`, { status })
}

// 创建支付
export const createPayment = (orderNo) => {
  return request.post('/payment/create', { order_no: orderNo })
}

// 模拟支付成功
export const mockPaymentSuccess = (orderNo, paymentMethod = 'kpay') => {
  return request.post('/payment/mock-success', { 
    order_no: orderNo,
    payment_method: paymentMethod
  })
}

// 查询支付状态
export const getPaymentStatus = (orderNo) => {
  return request.get(`/payment/status/${orderNo}`)
}
