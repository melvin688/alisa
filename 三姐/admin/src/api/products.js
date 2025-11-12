import request from '../utils/request'

// 获取所有商品
export function getProducts() {
  return request({
    url: '/products/admin/list',
    method: 'get'
  })
}

// 创建商品
export function createProduct(data) {
  return request({
    url: '/products/admin/create',
    method: 'post',
    data
  })
}

// 更新商品
export function updateProduct(id, data) {
  return request({
    url: `/products/admin/update/${id}`,
    method: 'put',
    data
  })
}

// 删除商品
export function deleteProduct(id) {
  return request({
    url: `/products/admin/delete/${id}`,
    method: 'delete'
  })
}
