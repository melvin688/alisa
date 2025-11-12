import request from '../utils/request'

// 获取所有分类
export function getCategories() {
  return request({
    url: '/categories/admin/list',
    method: 'get'
  })
}

// 创建分类
export function createCategory(data) {
  return request({
    url: '/categories/admin/create',
    method: 'post',
    data
  })
}

// 更新分类
export function updateCategory(id, data) {
  return request({
    url: `/categories/admin/update/${id}`,
    method: 'put',
    data
  })
}

// 删除分类
export function deleteCategory(id) {
  return request({
    url: `/categories/admin/delete/${id}`,
    method: 'delete'
  })
}
