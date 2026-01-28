<template>
  <scroll-view
    class="quiz-drawer-list"
    scroll-y
    :scroll-top="scrollTopValue"
    @scroll="handleScroll"
  >
    <!-- 占位容器，撑开滚动高度 -->
    <view class="list-spacer" :style="{ height: totalHeight + 'px' }">
      <!-- 可见区域的行 -->
      <view
        v-for="row in visibleRows"
        :key="row.index"
        class="question-row"
        :style="{ transform: `translateY(${row.offset}px)` }"
      >
        <view
          v-for="item in row.data"
          :key="item"
          class="grid-item"
          :class="{
            'grid-current': item - 1 === currentIndex,
            'grid-answered': questions[item - 1] && userAnswers.has(questions[item - 1]!.id)
          }"
          @click="$emit('select', item - 1)"
        >
          <text class="grid-text">{{ item }}</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  // 题目数字数组（按5个一组）
  questionNumbers: number[][]
  // 当前题目索引
  currentIndex: number
  // 题目数据
  questions: any[]
  // 用户答案
  userAnswers: Map<number, string>
  // 容器高度
  containerHeight: number
}

const props = defineProps<Props>()

defineEmits<{
  (e: 'select', index: number): void
}>()

// 滚动位置
const scrollTopValue = ref(0)

// 每行高度（5个格子 + padding）
const ITEM_HEIGHT = 72

// 缓冲区大小（上下各渲染的行数）
const BUFFER_SIZE = 2

// 计算总高度
const totalHeight = computed(() => {
  return props.questionNumbers.length * ITEM_HEIGHT
})

// 计算可见范围
const visibleRowRange = computed(() => {
  const startIndex = Math.floor(scrollTopValue.value / ITEM_HEIGHT)
  const endIndex = Math.min(
    props.questionNumbers.length - 1,
    Math.ceil((scrollTopValue.value + props.containerHeight) / ITEM_HEIGHT)
  )
  
  // 添加缓冲区（上下各BUFFER_SIZE行）
  const bufferedStartIndex = Math.max(0, startIndex - BUFFER_SIZE)
  const bufferedEndIndex = Math.min(
    props.questionNumbers.length - 1,
    endIndex + BUFFER_SIZE
  )
  
  return {
    start: bufferedStartIndex,
    end: bufferedEndIndex
  }
})

// 计算可见行
const visibleRows = computed(() => {
  const result = []
  for (let i = visibleRowRange.value.start; i <= visibleRowRange.value.end; i++) {
    result.push({
      data: props.questionNumbers[i],
      index: i,
      offset: i * ITEM_HEIGHT
    })
  }
  return result
})

// 处理滚动事件
const handleScroll = (e: any) => {
  scrollTopValue.value = e.detail.scrollTop
}

// 滚动到指定索引
const scrollToIndex = (index: number) => {
  const rowIndex = Math.floor(index / 5)
  scrollTopValue.value = rowIndex * ITEM_HEIGHT
}

// 自动滚动到当前题目（当 currentIndex 变化时）
watch(() => props.currentIndex, (newIndex) => {
  scrollToIndex(newIndex)
}, { flush: 'post' })

// 暴露方法给父组件
defineExpose({
  scrollToIndex
})
</script>

<style lang="scss" scoped>
.quiz-drawer-list {
  width: 100%;
  height: 100%;
}

.list-spacer {
  position: relative;
  width: 100%;
}

.question-row {
  position: absolute;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  padding: 6px 16px;
  will-change: transform;
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
</style>
