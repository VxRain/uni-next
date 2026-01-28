import { useUserStore } from '@/stores/user'
import { computed } from 'vue'

/**
 * 认证相关的 composable
 * 提供统一的认证操作接口
 */
export function useAuth() {
  const userStore = useUserStore()

  // 响应式状态
  const isLoggedIn = computed(() => !!userStore.token)
  const userInfo = computed(() => userStore.userInfo)
  const token = computed(() => userStore.token)

  /**
   * 检查是否已登录，未登录则跳转登录页
   * @returns 是否已登录
   */
  function requireLogin(): boolean {
    if (isLoggedIn.value) {
      return true
    }
    uni.navigateTo({ url: '/pages/login/index' })
    return false
  }

  /**
   * 执行需要登录的操作
   * @param callback 已登录时执行的回调
   */
  function withLogin(callback: () => void) {
    if (requireLogin()) {
      callback()
    }
  }

  /**
   * 获取当前用户信息
   */
  function getCurrentUser() {
    return userStore.userInfo
  }

  /**
   * 退出登录
   */
  function logout() {
    return new Promise<boolean>((resolve) => {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            userStore.clearUserInfo()
            uni.showToast({ title: '已退出登录', icon: 'success' })
            resolve(true)
          } else {
            resolve(false)
          }
        },
      })
    })
  }

  return {
    // 状态
    isLoggedIn,
    userInfo,
    token,
    
    // 方法
    requireLogin,
    withLogin,
    getCurrentUser,
    logout,
  }
}
