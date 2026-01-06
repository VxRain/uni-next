<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { httpApi } from '@/utils/httpApi'

interface QuestionBank {
  id: number
  name: string
  subTitle: string | null
  desc: string | null
  content: string | null
  cover: string | null
  questionCount: number
  createdAt: any
  updatedAt: any
  skus?: {
    id: number
    qBankId: number
    name: string
    desc: string | null
    price: number
    marketPrice: number
    validType: 'Day' | 'Fixed' | 'Permanent'
    validDay: number | null
    validDate: string | null
    createdAt: any
    updatedAt: any
  }[]
}

definePage({
  style: {
    navigationBarTitleText: '题库',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
  },
})

// 状态
const searchKeyword = ref('')
const questionBanks = ref<QuestionBank[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// API 数据获取
const fetchQuestionBanks = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await httpApi.qBank.listQBanks({
      page: 1,
      take: 50,
      withSkus: true,
    })
    if (response.data.code === 0) {
      questionBanks.value = response.data.data.list
    } else {
      error.value = response.data.msg || '加载失败'
    }
  } catch (err) {
    error.value = '网络请求失败，请稍后重试'
    console.error('获取题库列表失败:', err)
  } finally {
    loading.value = false
  }
}

// 过滤后的列表
const filteredBanks = computed(() => {
  if (!searchKeyword.value) {
    return questionBanks.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return questionBanks.value.filter(bank => {
    return (
      bank.name.toLowerCase().includes(keyword) ||
      (bank.desc && bank.desc.toLowerCase().includes(keyword)) ||
      (bank.subTitle && bank.subTitle.toLowerCase().includes(keyword))
    )
  })
})

// 组件挂载时获取数据
onMounted(() => {
  fetchQuestionBanks()
})

function handleBankClick(bank: QuestionBank) {
  uni.navigateTo({
    url: `/pages/question-detail/index?id=${bank.id}`,
  })
}
</script>

<template>
  <view class="page-container">
    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-box">
        <view class="i-carbon-search search-icon" />
        <input
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索题库..."
          placeholder-class="search-placeholder"
        >
        <view
          v-if="searchKeyword"
          class="i-carbon-close search-clear"
          @click="searchKeyword = ''"
        />
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading && filteredBanks.length === 0" class="loading-state">
      <view class="i-carbon-circle-notch loading-icon" />
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-state">
      <view class="i-carbon-error error-icon" />
      <text class="error-text">{{ error }}</text>
      <view class="retry-btn" @click="fetchQuestionBanks">
        <text class="retry-text">重试</text>
      </view>
    </view>

    <!-- 题库列表 -->
    <view v-else class="bank-list">
      <view
        v-for="bank in filteredBanks"
        :key="bank.id"
        class="bank-card"
        @click="handleBankClick(bank)"
      >
        <!-- 卡片头部 -->
        <view class="card-header">
          <text class="bank-title">{{ bank.name }}</text>
          <view class="i-carbon-chevron-right card-arrow" />
        </view>

        <!-- 副标题 -->
        <text v-if="bank.subTitle" class="bank-subtitle">{{ bank.subTitle }}</text>

        <!-- 描述 -->
        <text v-if="bank.desc" class="bank-description">{{ bank.desc }}</text>

        <!-- 底部信息 -->
        <view class="card-footer">
          <view class="footer-info">
            <view class="i-carbon-book footer-icon" />
            <text class="footer-text">{{ bank.questionCount }} 题</text>
          </view>
          <view v-if="bank.skus && bank.skus.length > 0" class="footer-info">
            <view class="i-carbon-tag footer-icon" />
            <text class="footer-text">{{ bank.skus.length }} 个套餐</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredBanks.length === 0" class="empty-state">
        <view class="i-carbon-search-locate empty-icon" />
        <text class="empty-text">没有找到相关题库</text>
        <text class="empty-hint">试试其他关键词吧</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 搜索区域 */
.search-section {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f5f5f5;
  padding: 12px 16px 8px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  height: 40px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 0 12px;
}

.search-icon {
  font-size: 18px;
  color: #9ca3af;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 14px;
  color: #1f2937;
}

.search-placeholder {
  color: #9ca3af;
}

.search-clear {
  font-size: 16px;
  color: #9ca3af;
  padding: 4px;
  margin-left: 8px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
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
  padding: 60px 20px;
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

/* 题库列表 */
.bank-list {
  padding: 12px 16px 20px;
}

.bank-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.bank-card:active {
  transform: scale(0.99);
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.bank-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  line-height: 22px;
}

.card-arrow {
  font-size: 16px;
  color: #d1d5db;
  flex-shrink: 0;
  margin-left: 8px;
}

/* 副标题 */
.bank-subtitle {
  display: block;
  font-size: 13px;
  color: #ff6b00;
  line-height: 20px;
  margin-bottom: 6px;
}

/* 描述 */
.bank-description {
  display: block;
  font-size: 13px;
  color: #6b7280;
  line-height: 20px;
  margin-bottom: 12px;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 10px;
  border-top: 1px solid #f3f4f6;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.footer-icon {
  font-size: 14px;
  color: #9ca3af;
}

.footer-text {
  font-size: 12px;
  color: #6b7280;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 15px;
  color: #6b7280;
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 13px;
  color: #9ca3af;
}
</style>
