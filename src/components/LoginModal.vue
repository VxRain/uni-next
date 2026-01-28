<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { login } from '@/utils/httpApi'
import CaptchaInput from './CaptchaInput.vue'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

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

// 监听弹窗显示状态，重置表单
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

// 重置表单
function resetForm() {
  formData.value = {
    username: '',
    password: '',
  }
}

// 关闭弹窗
function handleClose() {
  emit('update:modelValue', false)
}

// 表单验证
function validateForm() {
  if (!formData.value.username.trim()) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return false
  }
  if (!formData.value.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
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

// 登录处理
async function handleLogin() {
  if (!validateForm()) return

  loading.value = true
  
  try {
    const captchaData = captchaRef.value?.getCaptchaData()
    
    const res = await login({
      body: {
        username: formData.value.username,
        password: formData.value.password,
        captchaText: captchaData!.captchaText,
        captchaId: captchaData!.captchaId,
        captchaBizType: captchaData!.captchaBizType,
      },
    })
    
    if (res.data?.code === 0) {
      // 登录成功
      const { user, accessToken } = res.data.data
      
      userStore.setUserInfo(user, accessToken)
      
      uni.showToast({ title: '登录成功', icon: 'success' })
      
      emit('success')
      handleClose()
    } else {
      // 登录失败，刷新验证码
      uni.showToast({ title: res.data?.msg || '登录失败', icon: 'none' })
      captchaRef.value?.refreshCaptcha()
    }
  } catch (error: any) {
    uni.showToast({ title: error.response?.data?.msg || '登录失败', icon: 'none' })
    captchaRef.value?.refreshCaptcha()
  } finally {
    loading.value = false
  }
}

// 跳转注册页
function goToRegister() {
  handleClose()
  uni.navigateTo({ url: '/pages/register/index' })
}

// 跳转登录页
function goToLogin() {
  handleClose()
  uni.navigateTo({ url: '/pages/login/index' })
}

// 阻止冒泡
function stopPropagation(e: any) {
  e.stopPropagation()
}
</script>

<template>
  <view
    v-if="modelValue"
    class="login-modal-overlay"
    @tap="handleClose"
  >
    <view
      class="login-modal-content"
      @tap="stopPropagation"
    >
      <!-- 关闭按钮 -->
      <view class="close-btn" @tap="handleClose">
        <text>×</text>
      </view>

      <!-- 标题 -->
      <view class="header">
        <text class="title">登录</text>
        <text class="subtitle">请输入您的账号信息</text>
      </view>

      <!-- 表单 -->
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
              placeholder="请输入密码"
              placeholder-class="placeholder"
            />
            <text class="toggle-btn" @tap="showPassword = !showPassword">
              {{ showPassword ? '隐藏' : '显示' }}
            </text>
          </view>
        </view>

        <!-- 验证码 -->
        <CaptchaInput ref="captchaRef" biz-type="Login" />

        <!-- 登录按钮 -->
        <button
          class="login-btn"
          :class="{ loading }"
          :disabled="loading"
          @tap="handleLogin"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </view>

      <!-- 底部链接 -->
      <view class="footer">
        <view class="footer-links">
          <text class="footer-text">还没有账号？</text>
          <text class="link" @tap="goToRegister">立即注册</text>
        </view>
        <view class="divider">
          <view class="line" />
          <text class="divider-text">或</text>
          <view class="line" />
        </view>
        <text class="full-page-link" @tap="goToLogin">
          前往完整登录页面
        </text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
}

.login-modal-content {
  width: 100%;
  max-width: 600rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 60rpx 50rpx 50rpx;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #9ca3af;
  line-height: 1;
}

.header {
  text-align: center;
  margin-bottom: 50rpx;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 12rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #6b7280;
}

.form {
  margin-bottom: 40rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.label {
  display: block;
  font-size: 26rpx;
  color: #374151;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.input {
  width: 100%;
  height: 88rpx;
  background: #f5f5f5;
  border: 2rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
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
  padding-right: 100rpx;
}

.toggle-btn {
  position: absolute;
  right: 20rpx;
  font-size: 24rpx;
  color: #ff6b00;
  padding: 8rpx 12rpx;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: #ff6b00;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 500;
  color: #ffffff;
  border: none;
  margin-top: 24rpx;
  
  &:active {
    opacity: 0.8;
  }
  
  &.loading {
    opacity: 0.6;
  }
}

.footer {
  text-align: center;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-bottom: 30rpx;
}

.footer-text {
  font-size: 26rpx;
  color: #6b7280;
}

.link {
  font-size: 26rpx;
  color: #ff6b00;
  font-weight: 500;
}

.divider {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.line {
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.divider-text {
  font-size: 24rpx;
  color: #9ca3af;
}

.full-page-link {
  font-size: 26rpx;
  color: #6b7280;
  padding: 12rpx;
  
  &:active {
    color: #ff6b00;
  }
}
</style>
