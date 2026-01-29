<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

onLaunch(() => {
  // 初始化用户状态，从本地存储恢复登录信息
  const userStore = useUserStore()
  userStore.init()
})
</script>

<style></style>
