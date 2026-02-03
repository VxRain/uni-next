import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserInfo {
  id: number
  username: string
  nickname: string | null
  status: number
  mobile: string | null
  email: string | null
  avatar: string | null
  invitorId: number | null
  createdAt: string
  updatedAt: string | null
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>('')

  // 初始化：从本地存储恢复
  function init() {
    const savedToken = uni.getStorageSync('token')
    const savedUserInfo = uni.getStorageSync('userInfo')
    
    if (savedToken) {
      token.value = savedToken
    }
    if (savedUserInfo) {
      userInfo.value = savedUserInfo
    }
  }

  // 设置用户信息和 token
  function setUserInfo(info: UserInfo, accessToken: string) {
    userInfo.value = info
    token.value = accessToken
    uni.setStorageSync('userInfo', info)
    uni.setStorageSync('token', accessToken)
  }

  // 清除用户信息
  function clearUserInfo() {
    userInfo.value = null
    token.value = ''
    uni.removeStorageSync('userInfo')
    uni.removeStorageSync('token')
  }

  // 检查是否已登录
  function isLoggedIn(): boolean {
    return !!token.value
  }

  // 退出登录
  function logout() {
    clearUserInfo()
  }

  return {
    userInfo,
    token,
    init,
    setUserInfo,
    clearUserInfo,
    isLoggedIn,
    logout,
  }
})
