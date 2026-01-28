<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAuth } from '@/composables/useAuth'
import LoginModal from '@/components/LoginModal.vue'

const userStore = useUserStore()
const { isLoggedIn, userInfo, logout } = useAuth()

// 登录弹窗显示状态
const showLoginModal = ref(false)

// 示例：需要登录才能执行的操作
function handleRequireLogin() {
  if (isLoggedIn.value) {
    // 已登录，执行操作
    uni.showToast({ 
      title: `欢迎，${userInfo.value?.username}！`, 
      icon: 'success' 
    })
  } else {
    // 未登录，显示登录弹窗
    showLoginModal.value = true
  }
}

// 登录成功回调
function handleLoginSuccess() {
  // 登录成功后刷新页面状态
  uni.showToast({ title: '登录成功', icon: 'success' })
}

// 退出登录
async function handleLogout() {
  await logout()
}

// 跳转到完整登录页
function goToLoginPage() {
  uni.navigateTo({ url: '/pages/login/index' })
}

// 跳转到注册页
function goToRegisterPage() {
  uni.navigateTo({ url: '/pages/register/index' })
}
</script>

<template>
  <view class="demo-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">登录弹窗示例</text>
      <text class="page-subtitle">展示如何使用登录弹窗组件</text>
    </view>

    <!-- 用户信息卡片 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">当前登录状态</text>
      </view>
      <view class="card-body">
        <view v-if="isLoggedIn" class="user-info">
          <view class="info-row">
            <text class="info-label">用户名：</text>
            <text class="info-value">{{ userInfo?.username }}</text>
          </view>
          <view v-if="userInfo?.email" class="info-row">
            <text class="info-label">邮箱：</text>
            <text class="info-value">{{ userInfo.email }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">Token：</text>
            <text class="info-value token">{{ userStore.token?.slice(0, 20) }}...</text>
          </view>
        </view>
        <view v-else class="empty-state">
          <text class="empty-icon">👤</text>
          <text class="empty-text">未登录</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <view class="section-title">
        <text>操作示例</text>
      </view>
      
      <view class="button-group">
        <button 
          class="action-btn primary" 
          @tap="handleRequireLogin"
        >
          <text class="btn-icon">🔐</text>
          <text>需要登录的操作</text>
        </button>

        <button 
          v-if="!isLoggedIn"
          class="action-btn secondary" 
          @tap="showLoginModal = true"
        >
          <text class="btn-icon">🪟</text>
          <text>打开登录弹窗</text>
        </button>

        <button 
          v-if="isLoggedIn"
          class="action-btn danger" 
          @tap="handleLogout"
        >
          <text class="btn-icon">🚪</text>
          <text>退出登录</text>
        </button>

        <button 
          class="action-btn secondary" 
          @tap="goToLoginPage"
        >
          <text class="btn-icon">📄</text>
          <text>前往完整登录页</text>
        </button>

        <button 
          class="action-btn secondary" 
          @tap="goToRegisterPage"
        >
          <text class="btn-icon">✏️</text>
          <text>前往注册页</text>
        </button>
      </view>
    </view>

    <!-- 使用说明 -->
    <view class="tips-section">
      <view class="section-title">
        <text>使用说明</text>
      </view>
      <view class="tips-card">
        <view class="tip-item">
          <text class="tip-icon">💡</text>
          <view class="tip-content">
            <text class="tip-title">使用 LoginModal 组件</text>
            <text class="tip-code">import LoginModal from '@/components/LoginModal.vue'</text>
          </view>
        </view>
        <view class="tip-item">
          <text class="tip-icon">💡</text>
          <view class="tip-content">
            <text class="tip-title">控制弹窗显示</text>
            <text class="tip-code">const showLoginModal = ref(false)</text>
          </view>
        </view>
        <view class="tip-item">
          <text class="tip-icon">💡</text>
          <view class="tip-content">
            <text class="tip-title">监听登录成功</text>
            <text class="tip-code">&lt;LoginModal v-model="showLoginModal" @success="handleSuccess" /&gt;</text>
          </view>
        </view>
        <view class="tip-item">
          <text class="tip-icon">💡</text>
          <view class="tip-content">
            <text class="tip-title">使用 useAuth composable</text>
            <text class="tip-code">const { isLoggedIn, userInfo } = useAuth()</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 登录弹窗 -->
    <LoginModal 
      v-model="showLoginModal" 
      @success="handleLoginSuccess"
    />
  </view>
</template>

<style scoped lang="scss">
.demo-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 40rpx;
}

.page-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.page-title {
  display: block;
  font-size: 44rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 12rpx;
}

.page-subtitle {
  display: block;
  font-size: 28rpx;
  color: #6b7280;
}

.card {
  background: #ffffff;
  border-radius: 24rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  padding: 30rpx;
  border-bottom: 1px solid #f3f4f6;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1f2937;
}

.card-body {
  padding: 30rpx;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-row {
  display: flex;
  align-items: center;
}

.info-label {
  font-size: 28rpx;
  color: #6b7280;
  width: 140rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: 28rpx;
  color: #1f2937;
  flex: 1;
  
  &.token {
    font-family: monospace;
    font-size: 24rpx;
    color: #ff6b00;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
  gap: 20rpx;
}

.empty-icon {
  font-size: 80rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #9ca3af;
}

.action-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 20rpx;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 100rpx;
  border-radius: 20rpx;
  font-size: 30rpx;
  font-weight: 500;
  border: none;
  transition: all 0.2s;
  
  &.primary {
    background: linear-gradient(135deg, #ff6b00 0%, #ff8533 100%);
    color: #ffffff;
    box-shadow: 0 8px 24px rgba(255, 107, 0, 0.25);
    
    &:active {
      transform: scale(0.98);
      box-shadow: 0 4px 12px rgba(255, 107, 0, 0.25);
    }
  }
  
  &.secondary {
    background: #ffffff;
    color: #ff6b00;
    border: 2px solid #ff6b00;
    
    &:active {
      background: #fff5f0;
    }
  }
  
  &.danger {
    background: #ffffff;
    color: #ef4444;
    border: 2px solid #ef4444;
    
    &:active {
      background: #fef2f2;
    }
  }
}

.btn-icon {
  font-size: 36rpx;
}

.tips-section {
  margin-bottom: 30rpx;
}

.tips-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.tip-item {
  display: flex;
  gap: 20rpx;
}

.tip-icon {
  font-size: 40rpx;
  flex-shrink: 0;
}

.tip-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.tip-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #1f2937;
}

.tip-code {
  font-size: 24rpx;
  color: #ff6b00;
  background: #fff5f0;
  padding: 12rpx 16rpx;
  border-radius: 8rpx;
  font-family: monospace;
}
</style>
