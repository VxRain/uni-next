<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { listFavorites, unfavoriteQuestion, type ListFavoritesResponses } from '@/utils/httpApi'

type FavoriteItem = NonNullable<ListFavoritesResponses[200]['data']['list']>[number]

definePage({
  style: {
    navigationBarTitleText: '我的收藏',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
  },
})

// 状态
const qBankId = ref<number>(0)
const skuId = ref<number>(0)
const favoriteList = ref<FavoriteItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 是否还有更多数据
const hasMore = computed(() => {
  return favoriteList.value.length < total.value
})

// 获取收藏列表
const fetchFavorites = async (loadMore = false) => {
  if (loading.value) return

  loading.value = true
  error.value = null

  try {
    const response = await listFavorites({
      query: {
        qBankId: qBankId.value,
        page: loadMore ? currentPage.value : 1,
        take: pageSize.value,
      },
    })

    if (response.data?.code === 0) {
      const data = response.data.data
      if (loadMore) {
        favoriteList.value = [...favoriteList.value, ...(data.list || [])]
      } else {
        favoriteList.value = data.list || []
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
    console.error('获取收藏列表失败:', err)
  } finally {
    loading.value = false
  }
}

// 上拉加载更多
const loadMore = () => {
  if (loading.value || !hasMore.value) return
  currentPage.value++
  fetchFavorites(true)
}

// 取消收藏
const handleUnfavorite = async (item: FavoriteItem) => {
  try {
    uni.showLoading({ title: '处理中...' })
    const response = await unfavoriteQuestion({
      body: {
        questionId: item.id,
        qBankId: qBankId.value,
      },
    })

    if (response.data?.code === 0) {
      uni.showToast({ title: '已取消收藏', icon: 'success' })
      // 从列表中移除
      favoriteList.value = favoriteList.value.filter(f => f.id !== item.id)
      total.value--
    } else {
      uni.showToast({ title: response.data?.msg || '操作失败', icon: 'none' })
    }
  } catch (err) {
    console.error('取消收藏失败:', err)
    uni.showToast({ title: '操作失败，请稍后重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// 查看题目详情/开始练习
const handleViewQuestion = (item: FavoriteItem) => {
  if (!item.id) return

  uni.navigateTo({
    url: `/pages/quiz/index?id=${qBankId.value}&skuId=${skuId.value}&mode=favorite&questionId=${item.id}`
  })
}

// 格式化题型
const formatQuestionType = (type?: string) => {
  const typeMap: Record<string, string> = {
    SingleChoice: '单选题',
    MultipleChoice: '多选题',
    TrueFalse: '判断题',
    FillBlank: '填空题',
    ShortAnswer: '简答题',
  }
  return type ? typeMap[type] || type : '未知'
}

// 格式化时间
const formatTime = (time?: string | null) => {
  if (!time) return ''
  const date = new Date(time)
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
    fetchFavorites()
  }
})
</script>

<template>
  <view class="page-container">
    <!-- 加载状态 -->
    <view v-if="loading && favoriteList.length === 0" class="loading-state">
      <view class="i-carbon-circle-notch loading-icon" />
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error && favoriteList.length === 0" class="error-state">
      <view class="i-carbon-error error-icon" />
      <text class="error-text">{{ error }}</text>
      <view class="retry-btn" @click="fetchFavorites()">
        <text class="retry-text">重试</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else-if="favoriteList.length === 0" class="empty-state">
      <view class="i-carbon-star empty-icon" />
      <text class="empty-text">暂无收藏</text>
      <text class="empty-hint">收藏的题目会显示在这里</text>
    </view>

    <!-- 收藏列表 -->
    <view v-else class="content-container">
      <scroll-view
        class="scroll-view"
        scroll-y
        @scrolltolower="loadMore"
      >
        <view class="favorite-list">
          <view
            v-for="item in favoriteList"
            :key="item.id"
            class="favorite-item"
            @click="handleViewQuestion(item)"
          >
            <!-- 题目信息 -->
            <view class="question-header">
              <view class="question-type-tag">{{ formatQuestionType(String(item.type)) }}</view>
              <text class="favorite-time">{{ formatTime(item.favoritedAt) }}</text>
            </view>

            <!-- 题目题干 -->
            <text class="question-stem">{{ item.body?.stem || '题目内容暂无' }}</text>

            <!-- 底部操作 -->
            <view class="item-footer">
              <view class="action-btn unfavorite-btn" @click.stop="handleUnfavorite(item)">
                <view class="i-carbon-star-filled action-icon" />
                <text class="action-text">取消收藏</text>
              </view>
              <view class="action-btn view-btn">
                <view class="i-carbon-arrow-right action-icon" />
                <text class="action-text">查看详情</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多提示 -->
        <view v-if="loading && favoriteList.length > 0" class="load-more">
          <view class="i-carbon-circle-notch loading-icon-small" />
          <text class="load-more-text">加载中...</text>
        </view>
        <view v-else-if="!hasMore && favoriteList.length > 0" class="load-more">
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

/* 收藏列表 */
.favorite-list {
  padding: 12px;
}

.favorite-item {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.favorite-item:active {
  transform: scale(0.98);
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.question-type-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background-color: #fff5eb;
  color: #ff6b00;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
}

.favorite-time {
  font-size: 12px;
  color: #9ca3af;
}

.question-stem {
  display: block;
  font-size: 15px;
  color: #1f2937;
  line-height: 24px;
  margin-bottom: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.action-btn:active {
  background-color: #f3f4f6;
}

.unfavorite-btn {
  color: #ef4444;
}

.view-btn {
  color: #ff6b00;
}

.action-icon {
  font-size: 16px;
}

.action-text {
  font-size: 13px;
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
