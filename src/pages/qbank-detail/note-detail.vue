<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  getQuestionNoteById,
  createQuestionNote,
  updateQuestionNote,
  deleteQuestionNote,
  getQuestion,
  type GetQuestionNoteByIdResponses,
  type GetQuestionResponses,
} from '@/utils/httpApi'

type NoteDetail = NonNullable<GetQuestionNoteByIdResponses[200]['data']>
type QuestionDetail = NonNullable<GetQuestionResponses[200]['data']>

definePage({
  style: {
    navigationBarTitleText: '笔记详情',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
  },
})

// 状态
const noteId = ref<number>(0)
const qBankId = ref<number>(0)
const skuId = ref<number>(0)
const questionId = ref<number>(0)
const isCreateMode = ref(false)
const isEditMode = ref(false)

const noteDetail = ref<NoteDetail | null>(null)
const questionDetail = ref<QuestionDetail | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

// 编辑表单
const editContent = ref('')

// 获取笔记详情
const fetchNoteDetail = async () => {
  if (!noteId.value || isCreateMode.value) return

  loading.value = true
  error.value = null

  try {
    const response = await getQuestionNoteById({
      path: { id: noteId.value },
    })

    if (response.data?.code === 0) {
      noteDetail.value = response.data.data
      editContent.value = noteDetail.value.content || ''

      // 获取题目详情
      if (noteDetail.value.questionId) {
        fetchQuestionDetail(noteDetail.value.questionId)
      }
    } else {
      error.value = response.data?.msg || '加载失败'
    }
  } catch (err) {
    error.value = '网络请求失败，请稍后重试'
    console.error('获取笔记详情失败:', err)
  } finally {
    loading.value = false
  }
}

// 获取题目详情
const fetchQuestionDetail = async (id: number) => {
  try {
    const response = await getQuestion({
      path: { id },
    })

    if (response.data?.code === 0) {
      questionDetail.value = response.data.data
    }
  } catch (err) {
    console.error('获取题目详情失败:', err)
  }
}

// 保存笔记
const handleSave = async () => {
  if (!editContent.value.trim()) {
    uni.showToast({ title: '请输入笔记内容', icon: 'none' })
    return
  }

  saving.value = true
  try {
    if (isCreateMode.value) {
      // 创建笔记
      if (!questionId.value || !qBankId.value) {
        uni.showToast({ title: '缺少必要参数', icon: 'none' })
        return
      }

      const response = await createQuestionNote({
        body: {
          questionId: questionId.value,
          qBankId: qBankId.value,
          content: editContent.value.trim(),
        },
      })

      if (response.data?.code === 0) {
        uni.showToast({ title: '创建成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      } else {
        uni.showToast({ title: response.data?.msg || '创建失败', icon: 'none' })
      }
    } else {
      // 更新笔记
      const response = await updateQuestionNote({
        path: { id: noteId.value },
        body: {
          content: editContent.value.trim(),
        },
      })

      if (response.data?.code === 0) {
        uni.showToast({ title: '保存成功', icon: 'success' })
        isEditMode.value = false
        // 刷新笔记详情
        if (noteDetail.value) {
          noteDetail.value.content = editContent.value.trim()
        }
      } else {
        uni.showToast({ title: response.data?.msg || '保存失败', icon: 'none' })
      }
    }
  } catch (err) {
    console.error('保存笔记失败:', err)
    uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' })
  } finally {
    saving.value = false
  }
}

// 删除笔记
const handleDelete = () => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这条笔记吗?',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '删除中...' })
          const response = await deleteQuestionNote({
            path: { id: noteId.value },
          })

          if (response.data?.code === 0) {
            uni.showToast({ title: '删除成功', icon: 'success' })
            setTimeout(() => {
              uni.navigateBack()
            }, 1000)
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

// 进入编辑模式
const enterEditMode = () => {
  isEditMode.value = true
  editContent.value = noteDetail.value?.content || ''
}

// 取消编辑
const cancelEdit = () => {
  if (isCreateMode.value) {
    uni.navigateBack()
    return
  }

  isEditMode.value = false
  editContent.value = noteDetail.value?.content || ''
}

// 格式化时间
const formatTime = (time?: string | null) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 页面加载
onLoad((options: any) => {
  if (options.noteId) {
    noteId.value = Number(options.noteId)
    fetchNoteDetail()
  }

  if (options.qBankId) {
    qBankId.value = Number(options.qBankId)
  }

  if (options.skuId) {
    skuId.value = Number(options.skuId)
  }

  if (options.questionId) {
    questionId.value = Number(options.questionId)
    fetchQuestionDetail(questionId.value)
  }

  if (options.create === '1') {
    isCreateMode.value = true
    isEditMode.value = true
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
      <view class="retry-btn" @click="fetchNoteDetail">
        <text class="retry-text">重试</text>
      </view>
    </view>

    <!-- 内容区域 -->
    <view v-else class="content-container">
      <!-- 题目信息 -->
      <view v-if="questionDetail" class="question-section">
        <view class="section-header">
          <view class="i-carbon-document header-icon" />
          <text class="section-title">关联题目</text>
        </view>
        <view class="question-card">
          <text class="question-stem">{{ questionDetail?.body?.stem }}</text>
        </view>
      </view>

      <!-- 编辑模式 -->
      <view v-if="isEditMode" class="edit-section">
        <view class="section-header">
          <view class="i-carbon-edit header-icon" />
          <text class="section-title">{{ isCreateMode ? '创建笔记' : '编辑笔记' }}</text>
        </view>
        <textarea
          v-model="editContent"
          class="note-textarea"
          placeholder="记录你的学习心得..."
          :maxlength="1000"
          :show-count="true"
          :auto-height="true"
        />
        <view class="edit-actions">
          <view class="action-btn cancel-btn" @click="cancelEdit">
            <text class="action-text">取消</text>
          </view>
          <view class="action-btn save-btn" @click="handleSave">
            <text class="action-text">{{ saving ? '保存中...' : '保存' }}</text>
          </view>
        </view>
      </view>

      <!-- 查看模式 -->
      <view v-else class="view-section">
        <view class="section-header">
          <view class="i-carbon-notebook header-icon" />
          <text class="section-title">笔记内容</text>
        </view>
        <view class="note-content-view">
          <text class="note-text">{{ noteDetail?.content }}</text>
        </view>

        <!-- 笔记信息 -->
        <view class="note-info">
          <view class="info-item">
            <view class="i-carbon-time info-icon" />
            <text class="info-text">创建时间：{{ formatTime(noteDetail?.createdAt) }}</text>
          </view>
          <view v-if="noteDetail?.updatedAt && noteDetail.updatedAt !== noteDetail.createdAt" class="info-item">
            <view class="i-carbon-renew info-icon" />
            <text class="info-text">更新时间：{{ formatTime(noteDetail?.updatedAt) }}</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="action-bar">
          <view class="action-btn-group">
            <view class="action-btn edit-btn" @click="enterEditMode">
              <view class="i-carbon-edit btn-icon" />
              <text class="btn-text">编辑</text>
            </view>
            <view class="action-btn delete-btn" @click="handleDelete">
              <view class="i-carbon-trash-can btn-icon" />
              <text class="btn-text">删除</text>
            </view>
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
  padding: 12px;
}

/* 通用区块 */
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.header-icon {
  font-size: 18px;
  color: #ff6b00;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

/* 题目区块 */
.question-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.question-card {
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.question-stem {
  display: block;
  font-size: 15px;
  color: #1f2937;
  line-height: 24px;
}

/* 编辑区块 */
.edit-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
}

.note-textarea {
  width: 100%;
  min-height: 200px;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
  font-size: 15px;
  color: #1f2937;
  line-height: 24px;
  margin-bottom: 16px;
}

.edit-actions {
  display: flex;
  gap: 12px;
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

.cancel-btn {
  background-color: #f3f4f6;
}

.save-btn {
  background: linear-gradient(135deg, #ff6b00 0%, #ff8533 100%);
}

.action-text {
  font-size: 15px;
  font-weight: 500;
}

.cancel-btn .action-text {
  color: #6b7280;
}

.save-btn .action-text {
  color: #ffffff;
}

/* 查看区块 */
.view-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
}

.note-content-view {
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.note-text {
  display: block;
  font-size: 15px;
  color: #1f2937;
  line-height: 24px;
  white-space: pre-wrap;
}

/* 笔记信息 */
.note-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-icon {
  font-size: 14px;
  color: #9ca3af;
}

.info-text {
  font-size: 13px;
  color: #6b7280;
}

/* 操作栏 */
.action-bar {
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.action-btn-group {
  display: flex;
  gap: 12px;
}

.action-btn-group .action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.edit-btn {
  background-color: #fff5eb;
  color: #ff6b00;
}

.delete-btn {
  background-color: #fef2f2;
  color: #ef4444;
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-size: 14px;
  font-weight: 500;
}
</style>
