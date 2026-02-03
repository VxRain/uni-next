<template>
  <view class="edit-page">
    <!-- 加载状态 -->
    <view class="loading-state" v-if="loading">
      <view class="i-carbon-circle-notch loading-icon"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 表单内容 -->
    <view v-else>
      <!-- 头像卡片 -->
      <view class="avatar-card" @click="handleChooseAvatar">
        <view class="avatar-wrapper">
          <image 
            class="avatar-img" 
            :src="formData.avatar || '/static/default-avatar.png'"
            mode="aspectFill"
          />
          <view class="avatar-mask">
            <view class="i-carbon-camera camera-icon"></view>
            <text class="camera-text">更换头像</text>
          </view>
        </view>
      </view>

      <!-- 基本信息卡片 -->
      <view class="form-card">
        <view class="form-item">
          <text class="item-label">昵称</text>
          <input 
            class="item-input" 
            v-model="formData.nickname" 
            placeholder="请输入昵称"
            :maxlength="20"
          />
        </view>
        
        <view class="form-item">
          <text class="item-label">手机号</text>
          <text class="item-value">{{ formData.mobile || '未设置' }}</text>
        </view>
        
        <view class="form-item">
          <text class="item-label">邮箱</text>
          <text class="item-value">{{ formData.email || '未设置' }}</text>
        </view>
      </view>

      <!-- 个人资料卡片 -->
      <view class="form-card">
        <view class="form-item">
          <text class="item-label">真实姓名</text>
          <input 
            class="item-input" 
            v-model="formData.profile.realName" 
            placeholder="请输入真实姓名"
          />
        </view>
        
        <view class="form-item">
          <text class="item-label">性别</text>
          <view class="gender-group">
            <view 
              class="gender-item" 
              :class="{ active: formData.profile.gender === 0 }"
              @click="formData.profile.gender = 0"
            >
              <text>未知</text>
            </view>
            <view 
              class="gender-item" 
              :class="{ active: formData.profile.gender === 1 }"
              @click="formData.profile.gender = 1"
            >
              <text>男</text>
            </view>
            <view 
              class="gender-item" 
              :class="{ active: formData.profile.gender === 2 }"
              @click="formData.profile.gender = 2"
            >
              <text>女</text>
            </view>
          </view>
        </view>
        
        <view class="form-item form-item-column">
          <text class="item-label">个性签名</text>
          <textarea 
            class="item-textarea" 
            v-model="formData.profile.bio" 
            placeholder="写点什么介绍一下自己吧"
            :maxlength="100"
          />
        </view>
      </view>

      <!-- 保存按钮 -->
      <view class="save-section">
        <button class="save-btn" @click="handleSave" :disabled="saving">
          <text v-if="!saving">保存</text>
          <text v-else>保存中...</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { updateUser, getUser } from '@/utils/httpApi'

definePage({
  style: {
    navigationBarTitleText: '编辑资料',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
  },
})

const userStore = useUserStore()
const saving = ref(false)
const loading = ref(true)

const formData = reactive({
  avatar: '',
  nickname: '',
  mobile: '',
  email: '',
  profile: {
    realName: '',
    bio: '',
    gender: 0,
  }
})

// 获取用户信息
const fetchUserInfo = async () => {
  if (!userStore.userInfo) {
    loading.value = false
    return
  }

  try {
    // 获取用户信息，包含 profile
    const userResponse = await getUser({
      path: {
        id: userStore.userInfo.id
      },
      query: {
        withProfile: true
      }
    })

    if (userResponse.data?.data) {
      const userData = userResponse.data.data
      // 更新本地存储
      userStore.setUserInfo(userData, userStore.token)
      
      // 初始化基本信息
      formData.avatar = userData.avatar || ''
      formData.nickname = userData.nickname || ''
      formData.mobile = userData.mobile || ''
      formData.email = userData.email || ''
      
      // 初始化 profile 信息
      if (userData.profile) {
        formData.profile.realName = userData.profile.realName || ''
        formData.profile.bio = userData.profile.bio || ''
        formData.profile.gender = userData.profile.gender || 0
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    uni.showToast({
      title: '获取用户信息失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUserInfo()
})

const handleChooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 这里应该上传图片到服务器，然后获取URL
      // 暂时直接使用本地路径
      formData.avatar = res.tempFilePaths[0]
      uni.showToast({
        title: '头像上传功能开发中',
        icon: 'none'
      })
    }
  })
}

const handleSave = async () => {
  if (!userStore.userInfo) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }

  // 验证必填项
  if (!formData.nickname?.trim()) {
    uni.showToast({
      title: '请输入昵称',
      icon: 'none'
    })
    return
  }

  saving.value = true

  try {
    const response = await updateUser({
      path: {
        id: userStore.userInfo.id
      },
      body: {
        nickname: formData.nickname || undefined,
        avatar: formData.avatar || undefined,
        profile: {
          realName: formData.profile.realName || undefined,
          bio: formData.profile.bio || undefined,
          gender: formData.profile.gender,
        }
      }
    })

    if (response.data?.data) {
      // 更新本地用户信息
      userStore.setUserInfo(response.data.data, userStore.token)
      
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })

      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error: any) {
    console.error('保存失败:', error)
    uni.showToast({
      title: error.message || '保存失败',
      icon: 'none'
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.edit-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  gap: 24rpx;
}

.loading-icon {
  font-size: 80rpx;
  color: #ff6b00;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

// 头像卡片
.avatar-card {
  background: white;
  border-radius: 16rpx;
  padding: 48rpx 0;
  margin-bottom: 24rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.15s;

  &:active {
    background-color: #fafafa;
  }
}

.avatar-wrapper {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
}

.avatar-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56rpx;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
}

.camera-icon {
  font-size: 28rpx;
  color: white;
}

.camera-text {
  font-size: 20rpx;
  color: white;
}

// 表单卡片
.form-card {
  background: white;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
  transition: background-color 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: #fafafa;
  }
}

.form-item-column {
  flex-direction: column;
  align-items: flex-start;
  gap: 16rpx;
}

.item-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #1a1a1a;
  font-weight: 500;
  flex-shrink: 0;
}

.item-input {
  flex: 1;
  font-size: 28rpx;
  color: #1a1a1a;
  text-align: right;

  &::placeholder {
    color: #ccc;
  }
}

.item-value {
  flex: 1;
  font-size: 28rpx;
  color: #999;
  text-align: right;
}

.item-textarea {
  width: 100%;
  font-size: 28rpx;
  color: #1a1a1a;
  min-height: 120rpx;
  line-height: 1.6;

  &::placeholder {
    color: #ccc;
  }
}

// 性别选择
.gender-group {
  flex: 1;
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;
}

.gender-item {
  padding: 12rpx 32rpx;
  border-radius: 8rpx;
  background-color: #f5f5f5;
  font-size: 26rpx;
  color: #666;
  transition: all 0.15s;

  &.active {
    background-color: #ff6b00;
    color: white;
  }

  &:active {
    transform: scale(0.95);
  }
}

// 保存按钮
.save-section {
  padding: 24rpx 0;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #ff6b00 0%, #ff8534 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 0, 0.3);
  transition: all 0.15s;

  &:active:not([disabled]) {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 0, 0.3);
  }

  &[disabled] {
    opacity: 0.6;
  }

  text {
    font-size: 32rpx;
    font-weight: 600;
    color: white;
  }
}
</style>
