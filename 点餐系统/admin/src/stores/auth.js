import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getProfile as getProfileApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const userInfo = ref(null)

  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('admin_token', newToken)
    } else {
      localStorage.removeItem('admin_token')
    }
  }

  const setUserInfo = (info) => {
    userInfo.value = info
  }

  const login = async (username, password) => {
    const res = await loginApi(username, password)
    if (res.success) {
      setToken(res.data.token)
      setUserInfo(res.data.admin)
    }
    return res
  }

  const getProfile = async () => {
    const res = await getProfileApi()
    if (res.success) {
      setUserInfo(res.data)
    }
    return res
  }

  const logout = () => {
    setToken('')
    setUserInfo(null)
  }

  return {
    token,
    userInfo,
    login,
    getProfile,
    logout
  }
})
