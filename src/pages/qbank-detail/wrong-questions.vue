<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

definePage({
  style: {
    navigationBarTitleText: '我的错题',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
  },
})

// 状态
const qBankId = ref<number>(0)
const skuId = ref<number>(0)

// 返回题库详情
const goBack = () => {
  uni.navigateBack()
}

// 继续练习
const handlePractice = () => {
  if (!qBankId.value || !skuId.value) return

  uni.navigateTo({
    url: `/pages/quiz/index?id=${qBankId.value}&skuId=${skuId.value}&mode=sequence`
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
})
</script>

<template>
  <view class="page-container">
    <view class="content-wrapper">
      <!-- 功能开发中提示 -->
      <view class="placeholder-state">
        <view class="i-carbon-construction placeholder-icon" />
        <text class="placeholder-title">功能开发中</text>
        <text class="placeholder-text">错题本功能正在开发中，敬请期待</text>
        <text class="placeholder-hint">
          此功能需要后端支持专门的错题接口。当前API中的答题进度接口(`getQuizProgress`)只返回基本的进度记录信息,不包含题目级别的答题详情和正确性判断。
        </text>

        <!-- 建议方案 -->
        <view class="suggestion-card">
          <view class="suggestion-header">
            <view class="i-carbon-idea suggestion-icon" />
            <text class="suggestion-title">推荐方案</text>
          </view>
          <view class="suggestion-list">
            <view class="suggestion-item">
              <view class="i-carbon-dot-mark item-dot" />
              <text class="item-text">方案1: 后端新增 `getWrongQuestions` API,专门返回错题列表</text>
            </view>
            <view class="suggestion-item">
              <view class="i-carbon-dot-mark item-dot" />
              <text class="item-text">方案2: 在 `getQuizProgress` 响应中增加题目级别的答题记录和正确性信息</text>
            </view>
            <view class="suggestion-item">
              <view class="i-carbon-dot-mark item-dot" />
              <text class="item-text">方案3: 使用 `listQuestionsByQBank` 配合答题进度数据,前端筛选错题(性能较差)</text>
            </view>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="action-buttons">
          <view class="action-btn secondary-btn" @click="goBack">
            <text class="btn-text">返回</text>
          </view>
          <view class="action-btn primary-btn" @click="handlePractice">
            <text class="btn-text">继续练习</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-wrapper {
  width: 100%;
  padding: 20px;
}

/* 占位状态 */
.placeholder-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.placeholder-icon {
  font-size: 72px;
  color: #ff6b00;
  margin-bottom: 20px;
}

.placeholder-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.placeholder-text {
  font-size: 15px;
  color: #6b7280;
  text-align: center;
  margin-bottom: 16px;
}

.placeholder-hint {
  font-size: 13px;
  color: #9ca3af;
  line-height: 20px;
  text-align: center;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 24px;
}

/* 建议方案卡片 */
.suggestion-card {
  width: 100%;
  padding: 16px;
  background-color: #fff5eb;
  border: 1px solid #ff6b00;
  border-radius: 12px;
  margin-bottom: 24px;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.suggestion-icon {
  font-size: 20px;
  color: #ff6b00;
}

.suggestion-title {
  font-size: 16px;
  font-weight: 600;
  color: #ff6b00;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.item-dot {
  font-size: 12px;
  color: #ff6b00;
  margin-top: 4px;
  flex-shrink: 0;
}

.item-text {
  flex: 1;
  font-size: 13px;
  color: #6b7280;
  line-height: 20px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 12px;
  width: 100%;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  transition: opacity 0.2s ease;
}

.action-btn:active {
  opacity: 0.7;
}

.secondary-btn {
  background-color: #f3f4f6;
}

.primary-btn {
  background: linear-gradient(135deg, #ff6b00 0%, #ff8533 100%);
}

.btn-text {
  font-size: 15px;
  font-weight: 500;
}

.secondary-btn .btn-text {
  color: #6b7280;
}

.primary-btn .btn-text {
  color: #ffffff;
}
</style>
