<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { isLoggedIn, userInfo, requireLogin, logout } = useAuth()

const testResults = ref<string[]>([])

function addResult(message: string) {
  testResults.value.push(`✓ ${message}`)
  console.log(message)
}

// 测试1：检查登录状态
function testLoginStatus() {
  addResult(`登录状态: ${isLoggedIn() ? '已登录' : '未登录'}`)
}

// 测试2：获取用户信息
function testUserInfo() {
  if (userInfo.value) {
    addResult(`用户信息: ${JSON.stringify(userInfo.value)}`)
  } else {
    addResult('用户信息: 未登录')
  }
}

// 测试3：显示登录弹窗
function testLoginModal() {
  addResult('显示登录弹窗')
  requireLogin()
}

// 测试4：退出登录
async function testLogout() {
  if (isLoggedIn()) {
    const confirmed = await logout()
    if (confirmed) {
      addResult('已退出登录')
    }
  } else {
    addResult('未登录，无法退出')
  }
}

// 清空测试结果
function clearResults() {
  testResults.value = []
}
</script>

<template>
  <view class="test-page">
    <view class="header">
      <text class="title">认证功能测试</text>
      <text class="subtitle">测试登录/注册模块的各项功能</text>
    </view>

    <!-- 测试按钮 -->
    <view class="button-group">
      <button class="test-btn" @tap="testLoginStatus">
        <text class="btn-icon">🔍</text>
        <text>检查登录状态</text>
      </button>

      <button class="test-btn" @tap="testUserInfo">
        <text class="btn-icon">👤</text>
        <text>获取用户信息</text>
      </button>

      <button class="test-btn primary" @tap="testLoginModal">
        <text class="btn-icon">🔐</text>
        <text>显示登录弹窗</text>
      </button>

      <button 
        v-if="isLoggedIn()" 
        class="test-btn danger" 
        @tap="testLogout"
      >
        <text class="btn-icon">🚪</text>
        <text>退出登录</text>
      </button>

      <button class="test-btn secondary" @tap="clearResults">
        <text class="btn-icon">🗑️</text>
        <text>清空结果</text>
      </button>
    </view>

    <!-- 测试结果 -->
    <view v-if="testResults.length > 0" class="results">
      <view class="results-header">
        <text>测试结果</text>
      </view>
      <view class="results-list">
        <view v-for="(result, index) in testResults" :key="index" class="result-item">
          <text>{{ result }}</text>
        </view>
      </view>
    </view>

    <!-- 快速链接 -->
    <view class="links">
      <view class="link-item" @tap="() => uni.navigateTo({ url: '/pages/login/index' })">
        <text class="link-icon">📄</text>
        <text class="link-text">前往登录页</text>
        <text class="link-arrow">→</text>
      </view>
      <view class="link-item" @tap="() => uni.navigateTo({ url: '/pages/register/index' })">
        <text class="link-icon">✏️</text>
        <text class="link-text">前往注册页</text>
        <text class="link-arrow">→</text>
      </view>
      <view class="link-item" @tap="() => uni.navigateTo({ url: '/pages/login-demo/index' })">
        <text class="link-icon">📚</text>
        <text class="link-text">查看完整示例</text>
        <text class="link-arrow">→</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.test-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 40rpx;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  display: block;
  font-size: 44rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 12rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #6b7280;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.test-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 100rpx;
  border-radius: 20rpx;
  font-size: 30rpx;
  font-weight: 500;
  border: none;
  background: #ffffff;
  color: #1f2937;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.98);
  }
  
  &.primary {
    background: linear-gradient(135deg, #ff6b00 0%, #ff8533 100%);
    color: #ffffff;
    box-shadow: 0 8px 24px rgba(255, 107, 0, 0.25);
  }
  
  &.danger {
    background: #ffffff;
    color: #ef4444;
    border: 2px solid #ef4444;
  }
  
  &.secondary {
    background: #ffffff;
    color: #6b7280;
  }
}

.btn-icon {
  font-size: 36rpx;
}

.results {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.results-header {
  font-size: 32rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #f3f4f6;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.result-item {
  font-size: 26rpx;
  color: #4b5563;
  line-height: 1.6;
  font-family: monospace;
}

.links {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: #ffffff;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.98);
    background: #f9fafb;
  }
}

.link-icon {
  font-size: 40rpx;
}

.link-text {
  flex: 1;
  font-size: 30rpx;
  color: #1f2937;
}

.link-arrow {
  font-size: 32rpx;
  color: #9ca3af;
}
</style>
