<template>
  <view class="profile-page">
    <!-- 用户信息卡片 -->
    <view class="user-card" @click="handleLogin" v-if="!userInfo">
      <view class="user-avatar">
        <view class="avatar-placeholder i-carbon-user-avatar"></view>
      </view>
      <view class="user-info">
        <text class="user-name">点击登录</text>
        <text class="user-desc">登录后查看更多功能</text>
      </view>
      <view class="i-carbon-chevron-right arrow"></view>
    </view>

    <view class="user-card logged-in" v-else @click="handleEditProfile">
      <view class="user-avatar">
        <image 
          class="avatar-img" 
          :src="userInfo.avatar || '/static/default-avatar.png'"
          mode="aspectFill"
        />
      </view>
      <view class="user-info">
        <text class="user-name">{{ userInfo.username }}</text>
        <text class="user-desc">ID: {{ userInfo.id }}</text>
      </view>
      <view class="i-carbon-chevron-right arrow"></view>
    </view>

    <!-- 学习统计卡片 -->
    <view class="stats-card" v-if="userInfo">
      <view class="stat-item">
        <text class="stat-value">0</text>
        <text class="stat-label">已练习</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">0</text>
        <text class="stat-label">已收藏</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">0</text>
        <text class="stat-label">错题数</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-card">
      <view class="menu-item" @click="handleMenuClick('history')">
        <view class="menu-icon i-carbon-document"></view>
        <text class="menu-title">答题记录</text>
        <view class="i-carbon-chevron-right menu-arrow"></view>
      </view>
      <view class="menu-item" @click="handleMenuClick('favorites')">
        <view class="menu-icon i-carbon-star"></view>
        <text class="menu-title">我的收藏</text>
        <view class="i-carbon-chevron-right menu-arrow"></view>
      </view>
      <view class="menu-item" @click="handleMenuClick('wrong')">
        <view class="menu-icon i-carbon-close-filled"></view>
        <text class="menu-title">错题本</text>
        <view class="i-carbon-chevron-right menu-arrow"></view>
      </view>
      <view class="menu-item" @click="handleMenuClick('notes')">
        <view class="menu-icon i-carbon-edit"></view>
        <text class="menu-title">我的笔记</text>
        <view class="i-carbon-chevron-right menu-arrow"></view>
      </view>
    </view>

    <!-- 其他功能 -->
    <view class="menu-card">
      <view class="menu-item" @click="handleMenuClick('settings')">
        <view class="menu-icon i-carbon-settings"></view>
        <text class="menu-title">设置</text>
        <view class="i-carbon-chevron-right menu-arrow"></view>
      </view>
      <view class="menu-item" @click="handleMenuClick('about')">
        <view class="menu-icon i-carbon-information"></view>
        <text class="menu-title">关于</text>
        <view class="i-carbon-chevron-right menu-arrow"></view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-card" v-if="userInfo">
      <view class="logout-btn" @click="handleLogout">
        <text>退出登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const handleMenuClick = (type: string) => {
  uni.showToast({
    title: `${type} 功能开发中`,
    icon: 'none'
  })
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })
      }
    }
  })
}

const handleLogin = () => {
  uni.navigateTo({
    url: '/pages/login/index'
  })
}

const handleEditProfile = () => {
  uni.navigateTo({
    url: '/pages/profile/edit'
  })
}
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

// 用户信息卡片
.user-card {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  transition: all 0.15s;

  &:active {
    transform: scale(0.98);
    background-color: #fafafa;
  }
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-placeholder {
  font-size: 64rpx;
  color: #bbb;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 60rpx;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.user-desc {
  font-size: 24rpx;
  color: #999;
}

.arrow {
  font-size: 32rpx;
  color: #ccc;
}

// 统计卡片
.stats-card {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background-color: #f0f0f0;
}

// 菜单卡片
.menu-card {
  background: white;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  gap: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
  transition: background-color 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: #fafafa;
  }
}

.menu-icon {
  font-size: 40rpx;
  color: #666;
  flex-shrink: 0;
}

.menu-title {
  flex: 1;
  font-size: 28rpx;
  color: #1a1a1a;
}

.menu-arrow {
  font-size: 32rpx;
  color: #ccc;
  flex-shrink: 0;
}

// 退出登录
.logout-card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-top: 48rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #ff4d4f;
  transition: all 0.15s;

  &:active {
    background-color: #fff1f0;
  }

  text {
    font-weight: 500;
  }
}
</style>
