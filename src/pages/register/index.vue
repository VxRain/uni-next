<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { signup } from '@/utils/httpApi'
import CaptchaInput from '@/components/CaptchaInput.vue'

const userStore = useUserStore()

// 表单数据
const formData = ref({
  username: '',
  password: '',
})

// 验证码组件引用
const captchaRef = ref<InstanceType<typeof CaptchaInput>>()

// UI 状态
const loading = ref(false)
const showPassword = ref(false)

// 表单验证
const validateForm = () => {
  if (!formData.value.username.trim()) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return false
  }
  
  if (!formData.value.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return false
  }
  
  if (formData.value.password.length < 6) {
    uni.showToast({ title: '密码长度至少6位', icon: 'none' })
    return false
  }
  
  // 获取验证码数据
  const captchaData = captchaRef.value?.getCaptchaData()
  if (!captchaData?.captchaText) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return false
  }
  
  return true
}

// 注册处理
const handleRegister = async () => {
  if (!validateForm()) return

  loading.value = true
  
  try {
    const captchaData = captchaRef.value?.getCaptchaData()
    
    const res = await signup({
      body: {
        username: formData.value.username,
        password: formData.value.password,
        captchaText: captchaData!.captchaText,
        captchaId: captchaData!.captchaId,
        captchaBizType: captchaData!.captchaBizType,
      },
    })
    
    if (res.data?.code === 0) {
      // 注册成功
      const { user, accessToken } = res.data.data
      
      userStore.setUserInfo(user, accessToken)
      
      uni.showToast({ title: '注册成功', icon: 'success' })
      
      // 返回上一页或跳转到首页
      setTimeout(() => {
        uni.navigateBack({
          fail: () => {
            uni.switchTab({ url: '/pages/index' })
          },
        })
      }, 500)
    } else {
      // 注册失败，刷新验证码
      uni.showToast({ title: res.data?.msg || '注册失败', icon: 'none' })
      captchaRef.value?.refreshCaptcha()
    }
  } catch (error: any) {
    uni.showToast({ title: error.response?.data?.msg || '注册失败', icon: 'none' })
    captchaRef.value?.refreshCaptcha()
  } finally {
    loading.value = false
  }
}

// 跳转登录页
const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' })
}
</script>

<template>
  <view class="register-page">
    <view class="content">
      <!-- 标题区域 -->
      <view class="header">
        <text class="title">注册</text>
        <text class="subtitle">创建新账号</text>
      </view>

      <!-- 注册表单 -->
      <view class="form">
        <!-- 用户名 -->
        <view class="form-item">
          <text class="label">用户名</text>
          <input
            v-model="formData.username"
            class="input"
            placeholder="请输入用户名"
            placeholder-class="placeholder"
          />
        </view>

        <!-- 密码 -->
        <view class="form-item">
          <text class="label">密码</text>
          <view class="input-wrapper">
            <input
              v-model="formData.password"
              class="input"
              :password="!showPassword"
              placeholder="至少6位"
              placeholder-class="placeholder"
            />
            <text class="toggle-btn" @tap="showPassword = !showPassword">
              {{ showPassword ? '隐藏' : '显示' }}
            </text>
          </view>
        </view>

        <!-- 验证码 -->
        <CaptchaInput ref="captchaRef" biz-type="Signup" />

        <!-- 注册按钮 -->
        <button
          class="register-btn"
          :class="{ loading }"
          :disabled="loading"
          @tap="handleRegister"
        >
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </view>

      <!-- 底部链接 -->
      <view class="footer">
        <text class="footer-text">已有账号？</text>
        <text class="link" @tap="goToLogin">立即登录</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.register-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  padding: 80rpx 60rpx;
}

.header {
  margin-bottom: 80rpx;
}

.title {
  display: block;
  font-size: 56rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 32rpx;
  color: #6b7280;
}

.form {
  margin-bottom: 60rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #374151;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.input {
  width: 100%;
  height: 96rpx;
  background: #ffffff;
  border: 2rpx solid #e5e7eb;
  border-radius: 16rpx;
  padding: 0 32rpx;
  font-size: 30rpx;
  color: #1f2937;
  box-sizing: border-box;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: #ff6b00;
  }
}

.placeholder {
  color: #9ca3af;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .input {
  padding-right: 120rpx;
}

.toggle-btn {
  position: absolute;
  right: 24rpx;
  font-size: 26rpx;
  color: #ff6b00;
  padding: 8rpx 16rpx;
}

.register-btn {
  width: 100%;
  height: 96rpx;
  background: #ff6b00;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 500;
  color: #ffffff;
  border: none;
  margin-top: 40rpx;
  transition: opacity 0.2s;
  
  &:active {
    opacity: 0.8;
  }
  
  &.loading {
    opacity: 0.6;
  }
}

.footer {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.footer-text {
  font-size: 28rpx;
  color: #6b7280;
}

.link {
  font-size: 28rpx;
  color: #ff6b00;
  font-weight: 500;
}
</style>
