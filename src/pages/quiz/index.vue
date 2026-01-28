<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { listQuestionsByQBank, submitQuizProgress, favoriteQuestion, unfavoriteQuestion, type ListQuestionsByQBankResponses } from '@/utils/httpApi'
import QuestionDrawerList from './components/QuestionDrawerList.vue'

// 从 SDK 类型中提取数据类型
type QuestionItem = ListQuestionsByQBankResponses[200]['data']['list'][number]
type QuestionBody = NonNullable<QuestionItem['body']>

definePage({
  style: {
    navigationBarTitleText: '答题',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
  },
})

// ==================== 状态管理 ====================
const qBankId = ref<number>(0)
const skuId = ref<number>(0)
const mode = ref<string>('sequence') // sequence, random, exam, etc.
const questions = ref<(QuestionItem | null)[]>([]) // 使用 null 作为占位符
const totalCount = ref(0) // API返回的总题目数量
const currentIndex = ref(0)
const userAnswers = ref<Map<number, string>>(new Map())
const submittedAnswers = ref<Set<number>>(new Set()) // 已提交的答案ID
const loading = ref(false)
const loadingPage = ref<number | null>(null) // 当前正在加载的页面
const loadedPages = ref<Set<number>>(new Set()) // 已加载的页面
const currentPage = ref(0) // 当前加载到的页面
const submitting = ref(false)
const error = ref<string | null>(null)
const pageSize = 50

// 系统信息缓存
const windowHeight = ref(0)

// 提交策略配置
const SUBMIT_STRATEGY = {
  BATCH_SIZE: 5, // 每答完5题自动提交一次
  AUTO_INTERVAL: 30000, // 30秒自动提交一次
}

// 触摸相关状态
const touchStartX = ref(0)
const touchStartY = ref(0)
const isDragging = ref(false)
const dragOffset = ref(0)
const dragDirection = ref<'left' | 'right' | null>(null)

// 性能优化：预加载相关
const preloadCache = ref<Map<number, QuestionItem>>(new Map())
const PRELOAD_RANGE = 2 // 预加载前后各2题

// ==================== 计算属性 ====================
const currentQuestion = computed(() => {
  return questions.value[currentIndex.value] || null
})

const currentBody = computed(() => {
  return currentQuestion.value?.body as QuestionBody | undefined
})

const currentOptions = computed(() => {
  if (!currentBody.value?.options) return []
  const options = currentBody.value.options
  
  // 直接原样返回 options，不做任何处理
  if (Array.isArray(options)) {
    return options.map((opt, index) => ({
      value: opt,
      index
    }))
  }
  
  return []
})

const progress = computed(() => {
  return `${currentIndex.value + 1} / ${totalCount.value || questions.value.length}`
})

// 生成题目数字数组（用于虚拟列表）
const questionNumbers = computed(() => {
  const total = totalCount.value || questions.value.length
  // 按5个一组，生成二维数组
  const groups: number[][] = []
  for (let i = 0; i < total; i += 5) {
    groups.push(Array.from({ length: Math.min(5, total - i) }, (_, j) => i + j + 1))
  }
  return groups
})

// 抽屉内容区域高度
const drawerHeight = computed(() => {
  // 使用缓存的窗口高度
  return windowHeight.value - 60
})

const canGoPrev = computed(() => currentIndex.value > 0)
const canGoNext = computed(() => currentIndex.value < (totalCount.value || questions.value.length) - 1)

// 当前题目的用户答案
const currentAnswer = computed({
  get: () => userAnswers.value.get(currentQuestion.value?.id || 0) || '',
  set: (value: string) => {
    if (currentQuestion.value) {
      const isNewAnswer = !userAnswers.value.has(currentQuestion.value.id)
      userAnswers.value.set(currentQuestion.value.id, value)
      
      // 只在是新答案时才考虑提交
      if (isNewAnswer) {
        checkAndScheduleSubmit()
      }
    }
  }
})

// 检查是否需要提交并调度
const answeredCount = ref(0)
const autoSubmitTimer = ref<number | null>(null)

const checkAndScheduleSubmit = () => {
  answeredCount.value++
  
  // 策略1: 每答完指定数量的题目自动提交
  if (answeredCount.value >= SUBMIT_STRATEGY.BATCH_SIZE) {
    submitUnansweredAnswers()
    answeredCount.value = 0
    return
  }
  
  // 策略2: 定时自动提交（防抖）
  if (autoSubmitTimer.value) {
    clearTimeout(autoSubmitTimer.value)
  }
  autoSubmitTimer.value = setTimeout(() => {
    submitUnansweredAnswers()
  }, SUBMIT_STRATEGY.AUTO_INTERVAL) as unknown as number
}

// ==================== 答案提交 ====================
// 提交未提交的答案
const submitUnansweredAnswers = async (showToast = false) => {
  if (submitting.value || userAnswers.value.size === 0) return

  // 筛选出未提交的答案
  const unsubmittedAnswers: Array<{ qId: number; answer: string }> = []
  userAnswers.value.forEach((answer, qId) => {
    if (!submittedAnswers.value.has(qId)) {
      unsubmittedAnswers.push({ qId, answer })
    }
  })

  if (unsubmittedAnswers.length === 0) return

  submitting.value = true
  try {
    await submitQuizProgress({
      body: {
        qBankId: qBankId.value,
        answerList: unsubmittedAnswers,
        lastIndex: currentIndex.value,
      },
    })

    // 标记为已提交
    unsubmittedAnswers.forEach(({ qId }) => {
      submittedAnswers.value.add(qId)
    })

    if (showToast) {
      uni.showToast({
        title: `已保存${unsubmittedAnswers.length}条答案`,
        icon: 'success'
      })
    }
  } catch (err) {
    console.error('保存答案失败:', err)
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

// 手动保存所有答案（包括已提交的）
const submitAnswers = async (showToast = false) => {
  if (submitting.value || userAnswers.value.size === 0) return

  submitting.value = true
  try {
    const answerList = Array.from(userAnswers.value.entries()).map(([qId, answer]) => ({
      qId,
      answer,
    }))

    await submitQuizProgress({
      body: {
        qBankId: qBankId.value,
        answerList,
        lastIndex: currentIndex.value,
      },
    })

    // 标记所有答案为已提交
    userAnswers.value.forEach((_, qId) => {
      submittedAnswers.value.add(qId)
    })

    if (showToast) {
      uni.showToast({
        title: '答案已保存',
        icon: 'success'
      })
    }
  } catch (err) {
    console.error('保存答案失败:', err)
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

// ==================== 收藏功能 ====================
// 切换收藏状态
const toggleFavorite = async () => {
  const question = currentQuestion.value
  if (!question || !qBankId.value) return

  const isFavorited = question.isFavorited || false
  
  try {
    let res
    let body = {
      questionId: question.id,
      qBankId: qBankId.value,
    }
    if (isFavorited) {
      res = await unfavoriteQuestion({ body })
    } else {
      res = await favoriteQuestion({ body })
    }
    // 只有接口返回成功时才更新本地状态
    if (res.data?.code === 0) {
      if (questions.value[currentIndex.value]) {
        questions.value[currentIndex.value] = {
          ...question,
          isFavorited: !isFavorited,
        }
      }
      uni.showToast({
        title: isFavorited ? '已取消收藏' : '已收藏',
        icon: 'success'
      })
    } else {
      // 接口返回失败
      uni.showToast({
        title: res.data?.msg || '操作失败',
        icon: 'none'
      })
    }
  } catch (err) {
    console.error('收藏操作失败:', err)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}
// 初始化题目数组（使用占位符）
const initializeQuestions = async () => {
  if (!qBankId.value) return
  
  loading.value = true
  error.value = null
  
  try {
    // 首先只获取第一页来得到 totalCount
    const response = await listQuestionsByQBank({
      path: { qBankId: qBankId.value },
      query: {
        page: 1,
        take: pageSize,
        withBody: true,
        withFavorited: true,
        withStat: false,
      },
    })

    if (response.data?.code === 0) {
      const data = response.data.data
      
      // 保存总题目数量
      if (data.totalCount !== undefined) {
        totalCount.value = data.totalCount
      }
      
      // 创建占位数组，所有位置都用 null 填充
      questions.value = Array(totalCount.value).fill(null)
      
      // 填充第一页的数据
      data.list.forEach((item, index) => {
        questions.value[index] = item
      })
      
      // 标记第一页已加载
      loadedPages.value.add(1)
      currentPage.value = 1
      
      // 预加载前几题
      preloadAdjacentQuestions()
    } else {
      error.value = response.data?.msg || '加载失败'
    }
  } catch (err) {
    error.value = '网络请求失败，请稍后重试'
    console.error('获取试题失败:', err)
  } finally {
    loading.value = false
  }
}

// 加载指定页面的数据
const loadPage = async (page: number) => {
  if (loadedPages.value.has(page) || loadingPage.value === page) {
    return // 已加载或正在加载中
  }
  
  loadingPage.value = page
  try {
    const response = await listQuestionsByQBank({
      path: { qBankId: qBankId.value },
      query: {
        page,
        take: pageSize,
        withBody: true,
        withFavorited: true,
        withStat: false,
      },
    })

    if (response.data?.code === 0) {
      const data = response.data.data
      
      // 计算该页数据在数组中的起始位置
      const startIndex = (page - 1) * pageSize
      
      // 填充数据到对应位置
      data.list.forEach((item, index) => {
        questions.value[startIndex + index] = item
      })
      
      // 标记该页已加载
      loadedPages.value.add(page)
    }
  } catch (err) {
    console.error(`加载第 ${page} 页失败:`, err)
  } finally {
    loadingPage.value = null
  }
}

// 预加载相邻题目（性能优化）
const preloadAdjacentQuestions = () => {
  const start = Math.max(0, currentIndex.value - PRELOAD_RANGE)
  const end = Math.min(totalCount.value - 1, currentIndex.value + PRELOAD_RANGE)

  for (let i = start; i <= end; i++) {
    if (!preloadCache.value.has(i)) {
      const question = questions.value[i]
      if (question?.body) {
        preloadCache.value.set(i, question)
      }
    }
  }

  // 清理过远的缓存
  const cacheSize = preloadCache.value.size
  if (cacheSize > PRELOAD_RANGE * 2 + 5) {
    const keysToDelete: number[] = []
    preloadCache.value.forEach((_, key) => {
      if (Math.abs(key - currentIndex.value) > PRELOAD_RANGE * 2) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => preloadCache.value.delete(key))
  }
}

// ==================== 题目切换 ====================
const goToPrev = async () => {
  if (!canGoPrev.value) return
  
  const newIndex = currentIndex.value - 1
  const targetPage = Math.floor(newIndex / pageSize) + 1
  
  // 检查目标页是否已加载
  if (!loadedPages.value.has(targetPage)) {
    await loadPage(targetPage)
  }
  
  currentIndex.value = newIndex
}

const goToNext = async () => {
  if (!canGoNext.value) return
  
  const newIndex = currentIndex.value + 1
  const targetPage = Math.floor(newIndex / pageSize) + 1
  
  // 检查目标页是否已加载
  if (!loadedPages.value.has(targetPage)) {
    await loadPage(targetPage)
  }
  
  currentIndex.value = newIndex
}

const goToIndex = async (index: number) => {
  if (index < 0 || index >= totalCount.value) return
  
  // 计算目标题目所在的页码（从1开始）
  const targetPage = Math.floor(index / pageSize) + 1
  
  // 检查该页是否已加载
  if (!loadedPages.value.has(targetPage)) {
    // 只加载目标页，不加载其他页面
    await loadPage(targetPage)
  }
  
  // 跳转到目标题目
  currentIndex.value = index
}

// ==================== 触摸事件处理 ====================
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isDragging.value = true
  dragOffset.value = 0
  dragDirection.value = null
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return

  const deltaX = e.touches[0].clientX - touchStartX.value
  const deltaY = e.touches[0].clientY - touchStartY.value

  // 判断滑动方向（水平滑动）
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
    dragDirection.value = deltaX > 0 ? 'right' : 'left'
    dragOffset.value = deltaX
  }
}

const handleTouchEnd = () => {
  if (!isDragging.value) return

  const threshold = 80 // 滑动阈值

  if (dragDirection.value === 'left' && dragOffset.value < -threshold) {
    // 向左滑动，下一题
    goToNext()
  } else if (dragDirection.value === 'right' && dragOffset.value > threshold) {
    // 向右滑动，上一题
    goToPrev()
  }

  // 重置状态
  isDragging.value = false
  dragOffset.value = 0
  dragDirection.value = null
}

// ==================== 富文本图片点击处理 ====================
const handleRichTextItemClick = (e: any) => {
  const { detail } = e
  if (detail && detail.node && detail.node.name === 'img') {
    const src = detail.node.attrs?.src
    if (src) {
      uni.previewImage({
        urls: [src]
      })
    }
  }
}

// ==================== 选项点击处理 ====================
// 获取选项的唯一标识
const getOptionKey = (option: any) => {
  // 使用预先生成的key
  return option.key || String.fromCharCode(65 + (option.index || 0))
}

// 获取选项显示的标签
const getOptionLabel = (option: any) => {
  return option.key || String.fromCharCode(65 + (option.index || 0))
}

// 获取选项显示的内容
const getOptionContent = (option: any) => {
  // 使用原始内容
  return option.original || option.label || option.text || JSON.stringify(option)
}

const handleOptionClick = (option: any, index: number) => {
  // 直接使用选项的原始值作为答案
  const optionValue = option.value
  const questionType = currentQuestion.value?.type || 0
  
  if (questionType === 1 || questionType === 2) {
    // 单选题：直接使用选项值
    currentAnswer.value = String(optionValue)
  } else if (questionType === 3 || questionType === 4) {
    // 多选题
    try {
      const current = currentAnswer.value ? JSON.parse(currentAnswer.value) : []
      const idx = current.indexOf(optionValue)
      
      if (idx > -1) {
        current.splice(idx, 1)
      } else {
        current.push(optionValue)
      }
      
      currentAnswer.value = JSON.stringify(current)
    } catch (e) {
      console.error('解析多选答案失败:', e)
      currentAnswer.value = JSON.stringify([optionValue])
    }
  }
}

// 判断选项是否被选中
const isOptionSelected = (option: any) => {
  const answer = currentAnswer.value
  if (!answer) return false
  
  const optionValue = option.value
  const questionType = currentQuestion.value?.type || 0
  
  if (questionType === 1 || questionType === 2) {
    // 单选题
    return answer === String(optionValue)
  } else if (questionType === 3 || questionType === 4) {
    // 多选题
    try {
      const current = JSON.parse(answer)
      return Array.isArray(current) && current.includes(optionValue)
    } catch {
      return false
    }
  }
  
  return false
}

// ==================== 题目卡片抽屉 ====================
const showDrawer = ref(false)

const toggleDrawer = () => {
  showDrawer.value = !showDrawer.value
}

// ==================== 生命周期 ====================
onLoad((options: any) => {
  if (options.id) {
    // 获取系统信息并缓存
    const systemInfo = uni.getSystemInfoSync()
    windowHeight.value = systemInfo.windowHeight
    
    qBankId.value = Number(options.id)
    skuId.value = Number(options.skuId || 0)
    mode.value = options.mode || 'sequence'
    initializeQuestions()
  }
})

onUnmounted(() => {
  // 组件卸载时保存所有未提交的答案
  if (autoSubmitTimer.value) {
    clearTimeout(autoSubmitTimer.value)
  }
  submitUnansweredAnswers()
})

// 监听题目索引变化
watch(currentIndex, async () => {
  await nextTick()
  preloadAdjacentQuestions()
})
</script>

<template>
  <view class="quiz-container">
    <!-- 加载状态 -->
    <view v-if="loading && questions.length === 0" class="loading-state">
      <view class="i-carbon-circle-notch loading-icon" />
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error && questions.length === 0" class="error-state">
      <view class="i-carbon-error error-icon" />
      <text class="error-text">{{ error }}</text>
      <view class="retry-btn" @click="initializeQuestions">
        <text class="retry-text">重试</text>
      </view>
    </view>

    <!-- 答题区域 -->
    <view v-else-if="currentQuestion" class="quiz-content">
      <!-- 顶部进度栏 -->
      <view class="progress-bar">
        <view class="progress-info">
          <text class="progress-text">{{ progress }}</text>
          <view v-if="submitting" class="i-carbon-circle-notch saving-icon" />
        </view>
      </view>

      <!-- 题目卡片容器（支持滑动） -->
      <view 
        class="question-card-wrapper"
        :class="{ 'dragging': isDragging }"
        :style="{ transform: isDragging ? `translateX(${dragOffset}px)` : 'translateX(0)' }"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- 题目加载中 -->
        <view v-if="loadingPage" class="question-loading">
          <view class="i-carbon-circle-notch loading-icon" />
          <text class="loading-text">加载题目中...</text>
        </view>
        
        <view v-else class="question-card">
          <!-- 题目类型标签 -->
          <view class="question-type-badge">
            <text class="type-text">{{ ['单选', '多选'][currentQuestion.type - 1] || '未知' }}</text>
          </view>

          <!-- 题干 -->
          <view class="question-stem">
            <rich-text 
              :nodes="currentBody?.stem || ''" 
              class="rich-text-content"
              @itemclick="handleRichTextItemClick"
            />
          </view>

          <!-- 选项列表 -->
          <view v-if="currentOptions.length > 0" class="options-list">
            <view
              v-for="(option, index) in currentOptions"
              :key="index"
              class="option-item"
              :class="{ 'option-selected': isOptionSelected(option) }"
              @click="handleOptionClick(option, index)"
            >
              <view 
                class="option-label"
                :class="{ 'option-label-rect': currentQuestion?.type === 2 }"
              >
                {{ getOptionLabel(option) }}
              </view>
              <text class="option-text">{{ option.value }}</text>
            </view>
          </view>

          <!-- 简答题输入框 -->
          <view v-else class="answer-input-wrapper">
            <textarea
              v-model="currentAnswer"
              class="answer-textarea"
              placeholder="请输入答案..."
              :auto-height="true"
            />
          </view>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="bottom-bar">
        <view 
          class="nav-btn prev-btn"
          :class="{ 'btn-disabled': !canGoPrev }"
          @click="goToPrev"
        >
          <view class="i-carbon-arrow-left btn-icon" />
        </view>

        <view class="center-actions">
          <view class="action-icon-btn" @click="toggleDrawer">
            <view class="i-carbon-list action-icon" />
          </view>
          <view 
            class="action-icon-btn" 
            :class="{ 'favorited': currentQuestion?.isFavorited }"
            @click="toggleFavorite"
          >
            <view class="action-icon" :class="currentQuestion?.isFavorited ? 'i-carbon-star-filled' : 'i-carbon-star'" />
          </view>
          <view class="action-icon-btn" @click="submitAnswers(true)">
            <view class="i-carbon-save action-icon" />
          </view>
        </view>

        <view 
          class="nav-btn next-btn"
          :class="{ 'btn-disabled': !canGoNext }"
          @click="goToNext"
        >
          <view class="i-carbon-arrow-right btn-icon" />
        </view>
      </view>
    </view>

    <!-- 题目抽屉 -->
    <view v-if="showDrawer" class="drawer-mask" @click="toggleDrawer" />
    <view class="question-drawer" :class="{ 'drawer-open': showDrawer }">
      <view class="drawer-header">
        <text class="drawer-title">题目列表</text>
        <view class="i-carbon-close drawer-close" @click="toggleDrawer" />
      </view>
      <view class="drawer-content">
        <QuestionDrawerList
          :question-numbers="questionNumbers"
          :current-index="currentIndex"
          :questions="questions"
          :user-answers="userAnswers"
          :container-height="drawerHeight"
          @select="goToIndex($event); toggleDrawer()"
        />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.quiz-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
}

.loading-icon {
  font-size: 48px;
  color: #ff6b00;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 15px;
  color: #6b7280;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
}

.error-icon {
  font-size: 48px;
  color: #ef4444;
}

.error-text {
  font-size: 15px;
  color: #6b7280;
}

.retry-btn {
  padding: 10px 24px;
  background-color: #ff6b00;
  border-radius: 20px;
}

.retry-text {
  font-size: 15px;
  color: #ffffff;
  font-weight: 500;
}

/* 答题内容 */
.quiz-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

/* 进度栏 */
.progress-bar {
  background-color: #ffffff;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.progress-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.saving-icon {
  font-size: 16px;
  color: #ff6b00;
  animation: rotate 1s linear infinite;
}

/* 题目卡片容器 */
.question-card-wrapper {
  flex: 1;
  overflow: hidden;
  padding: 16px;
  transition: transform 0.3s ease;
}

.question-card-wrapper.dragging {
  transition: none;
}

.question-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 题目类型标签 */
.question-type-badge {
  display: inline-block;
  padding: 4px 12px;
  background-color: #fff5eb;
  border-radius: 12px;
  margin-bottom: 16px;
}

.type-text {
  font-size: 12px;
  color: #ff6b00;
  font-weight: 500;
}

/* 题干 */
.question-stem {
  margin-bottom: 24px;
}

.rich-text-content {
  font-size: 16px;
  line-height: 26px;
  color: #1f2937;
  word-wrap: break-word;
  word-break: break-all;
}

/* 富文本内的图片样式 */
.rich-text-content ::v-deep img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 12px 0;
  border-radius: 8px;
}

/* 选项列表 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 14px;
  background-color: #f9fafb;
  border: 2px solid transparent;
  border-radius: 12px;
  transition: all 0.2s ease;
  gap: 12px;
}

.option-label {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e5e7eb;
  border-radius: 50%;
  font-size: 15px;
  font-weight: 600;
  color: #6b7280;
  flex-shrink: 0;
}

.option-label-rect {
  border-radius: 6px;
}

.option-selected .option-label {
  background-color: #ff6b00;
  color: #ffffff;
}

.option-selected {
  background-color: #fff5eb;
  border-color: #ff6b00;
}

.option-text {
  flex: 1;
  font-size: 15px;
  line-height: 24px;
  color: #374151;
  word-wrap: break-word;
  word-break: break-all;
}

/* 简答题输入框 */
.answer-input-wrapper {
  padding: 14px;
  background-color: #f9fafb;
  border-radius: 12px;
}

.answer-textarea {
  width: 100%;
  min-height: 120px;
  font-size: 15px;
  line-height: 24px;
  color: #374151;
}

/* 底部操作栏 */
.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #ffffff;
  border-top: 1px solid #f3f4f6;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background-color: #ff6b00;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.nav-btn:active {
  transform: scale(0.95);
  opacity: 0.8;
}

.btn-disabled {
  background-color: #e5e7eb;
  opacity: 0.5;
}

.btn-disabled:active {
  transform: none;
}

.btn-icon {
  font-size: 20px;
  color: #ffffff;
}

.btn-text {
  font-size: 15px;
  color: #ffffff;
  font-weight: 500;
}

.center-actions {
  display: flex;
  gap: 8px;
}

.action-icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.action-icon-btn:active {
  transform: scale(0.95);
  background-color: #e5e7eb;
}

.action-icon-btn.favorited {
  background-color: #fce7f3;
}

.action-icon-btn.favorited .action-icon {
  color: #ec4899;
}

.action-icon {
  font-size: 20px;
  color: #4b5563;
}

/* 题目抽屉 */
.drawer-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  transition: opacity 0.3s ease;
}

.question-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 320px;
  background-color: #ffffff;
  z-index: 101;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.drawer-open {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.drawer-close {
  font-size: 20px;
  color: #6b7280;
  padding: 4px;
}

.drawer-content {
  flex: 1;
  overflow: hidden;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  padding: 16px;
}

.grid-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.grid-current {
  background-color: #fff5eb;
  border-color: #ff6b00;
}

.grid-answered {
  background-color: #d1fae5;
}

.grid-text {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.grid-current .grid-text {
  color: #ff6b00;
}

/* 加载更多提示 */
.loading-more {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 0 0 16px 16px;
}

.loading-more-icon {
  font-size: 16px;
  color: #ff6b00;
  animation: rotate 1s linear infinite;
}

.loading-more-text {
  font-size: 13px;
  color: #6b7280;
}
</style>
