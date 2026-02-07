<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getQuizProgress, type GetQuizProgressResponses } from '@/utils/httpApi'

type ProgressItem = NonNullable<GetQuizProgressResponses[200]['data']['list']>[number]

definePage({
  style: {
    navigationBarTitleText: '答题记录',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
  },
})

// 状态
const qBankId = ref<number>(0)
const skuId = ref<number>(0)
const progressList = ref<ProgressItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 是否还有更多数据
const hasMore = computed(() => {
  return progressList.value.length < total.value
})

// 获取答题记录
const fetchProgress = async (loadMore = false) => {
  if (loading.value) return

  loading.value = true
  error.value = null

  try {
    const response = await getQuizProgress({
      query: {
        qBankId: qBankId.value,
        page: loadMore ? currentPage.value : 1,
        take: pageSize.value,
      },
    })

    if (response.data?.code === 0) {
      const data = response.data.data
      if (loadMore) {
        progressList.value = [...progressList.value, ...(data.list || [])]
      } else {
        progressList.value = data.list || []
      }
      total.value = data.totalCount || 0
      if (!loadMore) {
        currentPage.value = 1
      }
    } else {
      error.value = response.data?.msg || '加载失败'
    }
  } catch (err) {
    error.value = '网络请求失败，请稍后重试'
    console.error('获取答题记录失败:', err)
  } finally {
    loading.value = false
  }
}

// 上拉加载更多
const loadMore = () => {
  if (loading.value || !hasMore.value) return
  currentPage.value++
  fetchProgress(true)
}

// 继续练习
const handleContinue = (item: ProgressItem) => {
  if (!item.qBank?.id) return

  uni.navigateTo({
    url: `/pages/quiz/index?id=${item.qBank.id}&skuId=${skuId.value}&mode=sequence`
  })
}

// 格式化时间
const formatTime = (time?: string | null) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return minutes < 1 ? '刚刚' : `${minutes}分钟前`
  }

  // 小于24小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }

  // 小于7天
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }

  // 超过7天显示具体日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 页面加载
onLoad((options: any) => {
  if (options.qBankId) {
    qBankId.value = Number(options.qBankId)
  }
  if (options.skuId) {
    skuId.value = Number(options.skuId)
  }

  if (qBankId.value) {
    fetchProgress()
  }
})
</script>

<template>
  <view class="page-container">
    <!-- 加载状态 -->
    <view v-if="loading && progressList.length === 0" class="loading-state">
      <view class="i-carbon-circle-notch loading-icon" />
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error && progressList.length === 0" class="error-state">
      <view class="i-carbon-error error-icon" />
      <text class="error-text">{{ error }}</text>
      <view class="retry-btn" @click="fetchProgress()">
        <text class="retry-text">重试</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else-if="progressList.length === 0" class="empty-state">
      <view class="i-carbon-document-blank empty-icon" />
      <text class="empty-text">暂无答题记录</text>
      <text class="empty-hint">开始答题后会显示在这里</text>
    </view>

    <!-- 答题记录列表 -->
    <view v-else class="content-container">
      <scroll-view
        class="scroll-view"
        scroll-y
        @scrolltolower="loadMore"
      >
        <view class="progress-list">
          <view
            v-for="item in progressList"
            :key="item.id"
            class="progress-item"
            @click="handleContinue(item)"
          >
            <!-- 题库信息 -->
            <view class="qbank-info">
              <view class="i-carbon-book qbank-icon" />
              <text class="qbank-name">{{ item.qBank?.name || '未知题库' }}</text>
            </view>

            <!-- 统计信息 -->
            <view class="stats-row">
              <view class="stat-card">
                <text class="stat-label">题库题数</text>
                <text class="stat-value">{{ item.qBank?.questionCount || 0 }}</text>
              </view>
            </view>

            <!-- 时间信息 -->
            <view class="time-info">
              <view class="time-item">
                <view class="i-carbon-time time-icon" />
                <text class="time-text">创建于 {{ formatTime(item.createdAt) }}</text>
              </view>
              <view v-if="item.updatedAt && item.updatedAt !== item.createdAt" class="time-item">
                <view class="i-carbon-renew time-icon" />
                <text class="time-text">更新于 {{ formatTime(item.updatedAt) }}</text>
              </view>
            </view>

            <!-- 操作按钮 -->
            <view class="item-footer">
              <view class="action-btn continue-btn">
                <view class="i-carbon-play action-icon" />
                <text class="action-text">继续练习</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多提示 -->
        <view v-if="loading && progressList.length > 0" class="load-more">
          <view class="i-carbon-circle-notch loading-icon-small" />
          <text class="load-more-text">加载中...</text>
        </view>
        <view v-else-if="!hasMore && progressList.length > 0" class="load-more">
          <text class="load-more-text">已加载全部</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.loading-icon {
  font-size: 40px;
  color: #ff6b00;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
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
  font-size: 14px;
  color: #6b7280;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.error-icon {
  font-size: 48px;
  color: #ef4444;
  margin-bottom: 12px;
}

.error-text {
  font-size: 15px;
  color: #6b7280;
  margin-bottom: 16px;
}

.retry-btn {
  padding: 8px 24px;
  background-color: #ff6b00;
  border-radius: 8px;
}

.retry-text {
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 13px;
  color: #9ca3af;
}

/* 内容容器 */
.content-container {
  height: 100vh;
}

.scroll-view {
  height: 100%;
}

/* 答题记录列表 */
.progress-list {
  padding: 12px;
}

.progress-item {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.progress-item:active {
  transform: scale(0.98);
}

/* 题库信息 */
.qbank-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.qbank-icon {
  font-size: 20px;
  color: #ff6b00;
}

.qbank-name {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

/* 统计信息 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.stat-label {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #ff6b00;
}

/* 时间信息 */
.time-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.time-icon {
  font-size: 14px;
  color: #9ca3af;
}

.time-text {
  font-size: 13px;
  color: #6b7280;
}

/* 底部操作 */
.item-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.continue-btn {
  background-color: #fff5eb;
  color: #ff6b00;
}

.action-btn:active {
  opacity: 0.7;
}

.action-icon {
  font-size: 16px;
}

.action-text {
  font-size: 14px;
  font-weight: 500;
}

/* 加载更多 */
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 8px;
}

.loading-icon-small {
  font-size: 16px;
  color: #ff6b00;
  animation: spin 1s linear infinite;
}

.load-more-text {
  font-size: 13px;
  color: #9ca3af;
}
</style>
