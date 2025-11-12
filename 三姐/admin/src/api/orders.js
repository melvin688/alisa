import request from '../utils/request'

// 获取所有订单
export function getOrders(params) {
  return request({
    url: '/orders/admin/list',
    method: 'get',
    params
  })
}

// 获取特定桌台的订单
export function getTableOrders(tableId) {
  return request({
    url: `/orders/admin/table/${tableId}`,
    method: 'get'
  })
}

// 获取外卖配送订单
export function getDeliveryOrders() {
  return request({
    url: '/orders/admin/delivery',
    method: 'get'
  })
}

// 获取来店自取订单
export function getTakeawayOrders() {
  return request({
    url: '/orders/admin/takeaway',
    method: 'get'
  })
}

// 更新订单状态
export function updateOrderStatus(id, status) {
  return request({
    url: `/orders/admin/status/${id}`,
    method: 'put',
    data: { status }
  })
}

// 打印订单
export function printOrder(id) {
  return request({
    url: `/orders/admin/print/${id}`,
    method: 'post'
  })
}

// 删除订单商品
export function deleteOrderItem(itemId) {
  return request({
    url: `/orders/admin/item/${itemId}`,
    method: 'delete'
  })
}

// 删除订单
export function deleteOrder(id) {
  return request({
    url: `/orders/admin/${id}`,
    method: 'delete'
  })
}
