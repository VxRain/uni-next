<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getCaptchaWithId } from '@/utils/httpApi'

interface Props {
  bizType: 'Login' | 'Signup' | 'Common'
}

const props = defineProps<Props>()

const captchaId = ref('')
const captchaSvg = ref('')
const captchaText = ref('')
const loading = ref(false)

// 将 SVG 字符串转换为 data URL
const svgDataUrl = computed(() => {
  if (!captchaSvg.value) return ''
  // 将 SVG 字符串转换为 base64 data URL
  const base64Svg = btoa(captchaSvg.value)
  return `data:image/svg+xml;base64,${base64Svg}`
})

// 获取验证码
async function fetchCaptcha() {
  loading.value = true
  try {
    const res = await getCaptchaWithId({
      query: {
        bizType: props.bizType,
      },
    })
    
    if (res.data?.code === 0) {
      captchaId.value = res.data.data.id
      captchaSvg.value = res.data.data.svg
      captchaText.value = '' // 清空输入
    } else {
      uni.showToast({ title: res.data?.msg || '获取验证码失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '获取验证码失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 刷新验证码
function refreshCaptcha() {
  fetchCaptcha()
}

// 暴露方法给父组件
defineExpose({
  getCaptchaData: () => ({
    captchaId: captchaId.value,
    captchaText: captchaText.value,
    captchaBizType: props.bizType,
  }),
  refreshCaptcha,
})

onMounted(() => {
  fetchCaptcha()
})
</script>

<template>
  <view class="captcha-item">
    <text class="label">验证码</text>
    <view class="captcha-wrapper">
      <input
        v-model="captchaText"
        class="captcha-input"
        placeholder="请输入验证码"
        placeholder-class="placeholder"
      />
      <view class="captcha-svg-wrapper" @tap="refreshCaptcha">
        <view v-if="loading" class="captcha-loading">加载中...</view>
        <image
          v-else-if="svgDataUrl"
          :src="svgDataUrl"
          class="captcha-svg"
          mode="scaleToFill"
        />
        <text v-else class="captcha-error">获取失败</text>
      </view>
    </view>
    <text class="refresh-hint">点击图片刷新</text>
  </view>
</template>

<style scoped lang="scss">
.captcha-item {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #374151;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.captcha-wrapper {
  display: flex;
  gap: 20rpx;
  align-items: stretch;
}

.captcha-input {
  flex: 1;
  height: 96rpx;
  background: #ffffff;
  border: 2rpx solid #e5e7eb;
  border-radius: 16rpx;
  padding: 0 32rpx;
  font-size: 30rpx;
  color: #1f2937;
  box-sizing: border-box;
  
  &:focus {
    border-color: #ff6b00;
  }
}

.placeholder {
  color: #9ca3af;
}

.captcha-svg-wrapper {
  width: 288rpx;
  height: 96rpx;
  background: #ffffff;
  border: 2rpx solid #e5e7eb;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  transition: border-color 0.2s;
  
  &:active {
    border-color: #ff6b00;
  }
}

.captcha-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.captcha-loading,
.captcha-error {
  font-size: 24rpx;
  color: #9ca3af;
}

.refresh-hint {
  display: block;
  font-size: 24rpx;
  color: #9ca3af;
  margin-top: 12rpx;
}
</style>
