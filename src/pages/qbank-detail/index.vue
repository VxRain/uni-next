<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { httpApi } from '@/utils/httpApi'

interface MenuItem {
  key: string
  label: string
  icon: string
}

interface Sku {
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
}

interface QBankDetail {
  id: number
  name: string
  subTitle: string | null
  desc: string | null
  content: string | null
  cover: string | null
  questionCount: number
  createdAt: any
  updatedAt: any
  skus?: Sku[]
}

definePage({
  style: {
    navigationBarTitleText: '题库详情',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
  },
})

// 状态
const qBankId = ref<number>(0)
const qBankDetail = ref<QBankDetail | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const selectedSkuId = ref<number | null>(null)

// 功能菜单
const menuItems: MenuItem[] = [
  { key: 'exam', label: '试卷', icon: 'i-carbon-document' },
  { key: 'random', label: '随机练习', icon: 'i-carbon-shuffle' },
  { key: 'sequence', label: '顺序练习', icon: 'i-carbon-sort-ascending' },
  { key: 'chapter', label: '章节练习', icon: 'i-carbon-tree-view' },
  { key: 'favorite', label: '我的收藏', icon: 'i-carbon-star-filled' },
  { key: 'wrong', label: '我的错题', icon: 'i-carbon-close-outline' },
  { key: 'note', label: '我的笔记', icon: 'i-carbon-edit' },
]

// 功能菜单点击
const handleMenuClick = (item: MenuItem) => {
  console.log('点击菜单:', item.key)
  // TODO: 根据不同类型跳转到对应页面
}

// 获取题库详情
const fetchQBankDetail = async () => {
  if (!qBankId.value) return

  loading.value = true
  error.value = null
  try {
    const response = await httpApi.qBank.getQBank(qBankId.value)
    if (response.data.code === 0) {
      qBankDetail.value = response.data.data
      // 默认选中第一个 SKU
      if (qBankDetail.value.skus && qBankDetail.value.skus.length > 0) {
        selectedSkuId.value = qBankDetail.value.skus[0].id
      }
    } else {
      error.value = response.data.msg || '加载失败'
    }
  } catch (err) {
    error.value = '网络请求失败，请稍后重试'
    console.error('获取题库详情失败:', err)
  } finally {
    loading.value = false
  }
}

// 选中的 SKU
const selectedSku = computed(() => {
  if (!qBankDetail.value?.skus || !selectedSkuId.value) return null
  return qBankDetail.value.skus.find(sku => sku.id === selectedSkuId.value)
})

// 格式化有效期
const formatValidText = (sku: Sku) => {
  if (sku.validType === 'Permanent') return '永久有效'
  if (sku.validType === 'Day' && sku.validDay) return `${sku.validDay}天`
  if (sku.validType === 'Fixed' && sku.validDate) {
    return `至 ${new Date(sku.validDate).toLocaleDateString()}`
  }
  return ''
}

// 格式化价格
const formatPrice = (price: number) => {
  return price > 0 ? `¥${price.toFixed(2)}` : '免费'
}

// 开始练习
const handleStartPractice = () => {
  if (!selectedSku.value) return
  // TODO: 跳转到练习页面
  console.log('开始练习', { qBankId: qBankId.value, skuId: selectedSku.value.id })
}

// 页面加载
onLoad((options: any) => {
  if (options.id) {
    qBankId.value = Number(options.id)
    fetchQBankDetail()
  }
})
</script>

<template>
  <view class="page-container">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <view class="i-carbon-circle-notch loading-icon" />
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-state">
      <view class="i-carbon-error error-icon" />
      <text class="error-text">{{ error }}</text>
      <view class="retry-btn" @click="fetchQBankDetail">
        <text class="retry-text">重试</text>
      </view>
    </view>

    <!-- 内容区域 -->
    <view v-else-if="qBankDetail" class="content-container">
      <!-- 头部信息 -->
      <view class="header-section">
        <!-- 封面 -->
        <view v-if="qBankDetail.cover" class="cover-wrapper">
          <image :src="qBankDetail.cover" class="cover-image" mode="aspectFill" />
        </view>

        <!-- 基本信息 -->
        <view class="info-wrapper" :class="{ 'no-cover': !qBankDetail.cover }">
          <text class="qbank-name">{{ qBankDetail.name }}</text>
          <text v-if="qBankDetail.subTitle" class="qbank-subtitle">{{ qBankDetail.subTitle }}</text>

          <!-- 统计信息 -->
          <view class="stats-row">
            <view class="stat-item">
              <view class="i-carbon-book stat-icon" />
              <text class="stat-text">{{ qBankDetail.questionCount }} 题</text>
            </view>
            <view v-if="qBankDetail.skus && qBankDetail.skus.length > 0" class="stat-item">
              <view class="i-carbon-tag stat-icon" />
              <text class="stat-text">{{ qBankDetail.skus.length }} 个套餐</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 描述 -->
      <view v-if="qBankDetail.desc" class="section-card">
        <text class="section-title">题库简介</text>
        <text class="desc-text">{{ qBankDetail.desc }}</text>
      </view>

      <!-- 功能菜单 -->
      <view class="section-card">
        <view class="menu-grid">
          <view
            v-for="item in menuItems"
            :key="item.key"
            class="menu-item"
            @click="handleMenuClick(item)"
          >
            <view :class="item.icon" class="menu-icon" />
            <text class="menu-label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <!-- 套餐选择 -->
      <view v-if="qBankDetail.skus && qBankDetail.skus.length > 0" class="section-card">
        <text class="section-title">选择套餐</text>
        <view class="sku-list">
          <view
            v-for="sku in qBankDetail.skus"
            :key="sku.id"
            class="sku-card"
            :class="{ 'sku-card-selected': selectedSkuId === sku.id }"
            @click="selectedSkuId = sku.id"
          >
            <view class="sku-header">
              <text class="sku-name">{{ sku.name }}</text>
              <text class="sku-price">{{ formatPrice(sku.price) }}</text>
            </view>
            <view v-if="sku.desc" class="sku-desc">{{ sku.desc }}</view>
            <view class="sku-footer">
              <view class="sku-valid">
                <view class="i-carbon-time valid-icon" />
                <text class="valid-text">{{ formatValidText(sku) }}</text>
              </view>
              <view v-if="sku.marketPrice > sku.price" class="market-price">
                市场价 ¥{{ sku.marketPrice.toFixed(2) }}
              </view>
            </view>
            <view v-if="selectedSkuId === sku.id" class="sku-check">
              <view class="i-carbon-checkmark-filled check-icon" />
            </view>
          </view>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="bottom-bar">
        <view v-if="selectedSku" class="price-info">
          <text class="price-label">当前选择：</text>
          <text class="price-value">{{ selectedSku.name }}</text>
          <text class="price-text">{{ formatPrice(selectedSku.price) }}</text>
        </view>
        <view class="action-btn" @click="handleStartPractice">
          <text class="action-text">开始练习</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
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

/* 内容容器 */
.content-container {
  padding-bottom: 20px;
}

/* 头部区域 */
.header-section {
  background-color: #ffffff;
  margin-bottom: 12px;
}

.cover-wrapper {
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.info-wrapper {
  padding: 16px;
}

.info-wrapper.no-cover {
  padding-top: 20px;
}

.qbank-name {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  line-height: 28px;
  margin-bottom: 8px;
}

.qbank-subtitle {
  display: block;
  font-size: 14px;
  color: #ff6b00;
  line-height: 20px;
  margin-bottom: 12px;
}

.stats-row {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 14px;
  color: #9ca3af;
}

.stat-text {
  font-size: 13px;
  color: #6b7280;
}

/* 通用卡片 */
.section-card {
  background-color: #ffffff;
  padding: 16px;
  margin-bottom: 12px;
}

.section-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

/* 描述 */
.desc-text {
  display: block;
  font-size: 14px;
  color: #6b7280;
  line-height: 22px;
}

/* 功能菜单 */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px 8px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.menu-item:active {
  background-color: #f3f4f6;
}

.menu-icon {
  font-size: 28px;
  color: #ff6b00;
  margin-bottom: 6px;
}

.menu-label {
  font-size: 12px;
  color: #4b5563;
  text-align: center;
  line-height: 16px;
}

/* 套餐列表 */
.sku-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sku-card {
  position: relative;
  background-color: #f9fafb;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 14px 44px 14px 14px;
  transition: all 0.2s ease;
}

.sku-card-selected {
  background-color: #fff5eb;
  border-color: #ff6b00;
}

.sku-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.sku-name {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
  flex: 1;
}

.sku-price {
  font-size: 18px;
  font-weight: 600;
  color: #ff6b00;
  margin-right: 8px;
}

.sku-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 20px;
  margin-bottom: 8px;
}

.sku-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sku-valid {
  display: flex;
  align-items: center;
  gap: 4px;
}

.valid-icon {
  font-size: 12px;
  color: #9ca3af;
}

.valid-text {
  font-size: 12px;
  color: #9ca3af;
}

.market-price {
  font-size: 12px;
  color: #9ca3af;
  text-decoration: line-through;
}

.sku-check {
  position: absolute;
  top: 10px;
  right: 10px;
}

.check-icon {
  font-size: 20px;
  color: #ff6b00;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #ffffff;
  border-top: 1px solid #f3f4f6;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.price-info {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-label {
  font-size: 13px;
  color: #6b7280;
}

.price-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.price-text {
  font-size: 18px;
  font-weight: 600;
  color: #ff6b00;
  margin-left: 4px;
}

.action-btn {
  margin-left: auto;
  padding: 10px 32px;
  background: linear-gradient(135deg, #ff6b00 0%, #ff8533 100%);
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);
}

.action-text {
  font-size: 15px;
  color: #ffffff;
  font-weight: 600;
}
</style>
