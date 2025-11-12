import request from '../utils/request'

// 获取所有餐桌
export function getTables() {
  return request({
    url: '/tables/admin/list',
    method: 'get'
  })
}

// 创建餐桌
export function createTable(data) {
  return request({
    url: '/tables/admin/create',
    method: 'post',
    data
  })
}

// 更新餐桌
export function updateTable(id, data) {
  return request({
    url: `/tables/admin/update/${id}`,
    method: 'put',
    data
  })
}

// 删除餐桌
export function deleteTable(id) {
  return request({
    url: `/tables/admin/delete/${id}`,
    method: 'delete'
  })
}
