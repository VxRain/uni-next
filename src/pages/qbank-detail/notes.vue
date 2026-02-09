<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { listQuestionNotes, deleteQuestionNote, type ListQuestionNotesResponses } from '@/utils/httpApi'

type NoteItem = NonNullable<ListQuestionNotesResponses[200]['data']['list']>[number]

definePage({
  style: {
    navigationBarTitleText: '我的笔记',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
  },
})

// 状态
const qBankId = ref<number>(0)
const skuId = ref<number>(0)
const noteList = ref<NoteItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 是否还有更多数据
const hasMore = computed(() => {
  return noteList.value.length < total.value
})

// 获取笔记列表
const fetchNotes = async (loadMore = false) => {
  if (loading.value) return

  loading.value = true
  error.value = null

  try {
    const response = await listQuestionNotes({
      query: {
        qBankId: qBankId.value,
        page: loadMore ? currentPage.value : 1,
        take: pageSize.value,
      },
    })

    if (response.data?.code === 0) {
      const data = response.data.data
      if (loadMore) {
        noteList.value = [...noteList.value, ...(data.list || [])]
      } else {
        noteList.value = data.list || []
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
    console.error('获取笔记列表失败:', err)
  } finally {
    loading.value = false
  }
}

// 上拉加载更多
const loadMore = () => {
  if (loading.value || !hasMore.value) return
  currentPage.value++
  fetchNotes(true)
}

// 删除笔记
const handleDelete = async (item: NoteItem) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这条笔记吗?',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '删除中...' })
          const response = await deleteQuestionNote({
            path: { id: item.id },
          })

          if (response.data?.code === 0) {
            uni.showToast({ title: '删除成功', icon: 'success' })
            // 从列表中移除
            noteList.value = noteList.value.filter(n => n.id !== item.id)
            total.value--
          } else {
            uni.showToast({ title: response.data?.msg || '删除失败', icon: 'none' })
          }
        } catch (err) {
          console.error('删除笔记失败:', err)
          uni.showToast({ title: '删除失败，请稍后重试', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 查看笔记详情
const handleViewNote = (item: NoteItem) => {
  uni.navigateTo({
    url: `/pages/qbank-detail/note-detail?noteId=${item.id}&qBankId=${qBankId.value}&skuId=${skuId.value}`
  })
}

// 新建笔记
const handleCreateNote = () => {
  uni.navigateTo({
    url: `/pages/qbank-detail/note-detail?qBankId=${qBankId.value}&skuId=${skuId.value}&create=1`
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
    day: '2-digit'
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
    fetchNotes()
  }
})

// 从详情页返回时刷新列表
onShow(() => {
  // 如果已经加载过数据，则刷新
  if (noteList.value.length > 0 || currentPage.value > 1) {
    currentPage.value = 1
    fetchNotes()
  }
})
</script>

<template>
  <view class="page-container">
    <!-- 加载状态 -->
    <view v-if="loading && noteList.length === 0" class="loading-state">
      <view class="i-carbon-circle-notch loading-icon" />
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error && noteList.length === 0" class="error-state">
      <view class="i-carbon-error error-icon" />
      <text class="error-text">{{ error }}</text>
      <view class="retry-btn" @click="fetchNotes()">
        <text class="retry-text">重试</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else-if="noteList.length === 0" class="empty-state">
      <view class="i-carbon-document-blank empty-icon" />
      <text class="empty-text">暂无笔记</text>
      <text class="empty-hint">记录学习心得，巩固知识要点</text>
      <view class="create-btn-empty" @click="handleCreateNote">
        <text class="create-text">创建第一条笔记</text>
      </view>
    </view>

    <!-- 笔记列表 -->
    <view v-else class="content-container">
      <scroll-view
        class="scroll-view"
        scroll-y
        @scrolltolower="loadMore"
      >
        <view class="note-list">
          <view
            v-for="item in noteList"
            :key="item.id"
            class="note-item"
            @click="handleViewNote(item)"
          >
            <!-- 笔记内容 -->
            <text class="note-content">{{ item.content || '无内容' }}</text>

            <!-- 底部信息 -->
            <view class="note-footer">
              <view class="footer-left">
                <view class="footer-item">
                  <view class="i-carbon-time footer-icon" />
                  <text class="footer-text">{{ formatTime(item.createdAt) }}</text>
                </view>
                <view v-if="item.likeCount && item.likeCount > 0" class="footer-item">
                  <view class="i-carbon-thumbs-up footer-icon" />
                  <text class="footer-text">{{ item.likeCount }}</text>
                </view>
              </view>

              <view class="action-btns">
                <view class="action-btn delete-btn" @click.stop="handleDelete(item)">
                  <view class="i-carbon-trash-can action-icon" />
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多提示 -->
        <view v-if="loading && noteList.length > 0" class="load-more">
          <view class="i-carbon-circle-notch loading-icon-small" />
          <text class="load-more-text">加载中...</text>
        </view>
        <view v-else-if="!hasMore && noteList.length > 0" class="load-more">
          <text class="load-more-text">已加载全部</text>
        </view>
      </scroll-view>

      <!-- 浮动新建按钮 -->
      <view class="fab-btn" @click="handleCreateNote">
        <view class="i-carbon-add fab-icon" />
      </view>
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
  margin-bottom: 24px;
}

.create-btn-empty {
  padding: 10px 24px;
  background: linear-gradient(135deg, #ff6b00 0%, #ff8533 100%);
  border-radius: 24px;
}

.create-text {
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
}

/* 内容容器 */
.content-container {
  height: 100vh;
  position: relative;
}

.scroll-view {
  height: 100%;
}

/* 笔记列表 */
.note-list {
  padding: 12px;
  padding-bottom: 80px;
}

.note-item {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.note-item:active {
  transform: scale(0.98);
}

.note-content {
  display: block;
  font-size: 15px;
  color: #1f2937;
  line-height: 24px;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.note-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer-item {
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
  color: #9ca3af;
}

.action-btns {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.action-btn:active {
  background-color: #f3f4f6;
}

.delete-btn {
  color: #ef4444;
}

.action-icon {
  font-size: 18px;
}

/* 浮动按钮 */
.fab-btn {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6b00 0%, #ff8533 100%);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(255, 107, 0, 0.4);
  transition: transform 0.2s ease;
}

.fab-btn:active {
  transform: scale(0.9);
}

.fab-icon {
  font-size: 24px;
  color: #ffffff;
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
