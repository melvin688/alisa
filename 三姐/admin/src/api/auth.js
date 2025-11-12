import request from '@/utils/request'

export const login = (username, password) => {
  return request({
    url: '/admin/login',
    method: 'POST',
    data: { username, password }
  })
}

export const getProfile = () => {
  return request({
    url: '/admin/profile',
    method: 'GET'
  })
}

export const logout = () => {
  return request({
    url: '/admin/logout',
    method: 'POST'
  })
}
