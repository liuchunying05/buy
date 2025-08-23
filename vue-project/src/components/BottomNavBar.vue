<!-- 底部导航栏 -->
<template>
  <div class="bottom-nav">
    <div class="nav-container">
      <div class="nav-item" :class="{ active: currentTab === 'home' }" @click="switchTab('home')">
        <el-icon><House /></el-icon>
        <span>主页</span>
      </div>
      <div class="nav-item" :class="{ active: currentTab === 'friends' }" @click="switchTab('friends')">
        <div class="icon-badge-container">
          <el-icon><User /></el-icon>
          <el-badge v-if="totalUnreadCount > 0" :value="totalUnreadCount" class="unread-badge" />
        </div>
        <span>好友</span>
      </div>
      <div class="nav-item" :class="{ active: currentTab === 'circle' }" @click="switchTab('circle')">
        <el-icon><ChatRound /></el-icon>
        <span>圈子</span>
      </div>
      <div class="nav-item" :class="{ active: currentTab === 'profile' }" @click="switchTab('profile')">
        <el-icon><UserFilled /></el-icon>
        <span>我的</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { House, User, ChatRound, UserFilled } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const currentTab = ref('home')
const unreadCounts = ref({})

// 计算未读消息总数
const totalUnreadCount = computed(() => {
  // 获取当前用户
  const userStr = localStorage.getItem('user')
  if (!userStr) return 0
  
  try {
    const user = JSON.parse(userStr)
    if (!user._id) return 0
    
    // 从新的未读消息计数存储中获取计数
    const allUnreadCountsStr = localStorage.getItem('all_unread_counts') || '{}'
    const allUnreadCounts = JSON.parse(allUnreadCountsStr)
    
    // 如果当前用户没有未读消息记录
    if (!allUnreadCounts[user._id]) return 0
    
    // 计算所有未读消息的总数
    let total = 0
    Object.values(allUnreadCounts[user._id]).forEach(count => {
      total += count
    })
    
    return total
  } catch (error) {
    console.error('解析未读消息数量失败:', error)
    return 0
  }
})

// 定期检查未读消息
const checkUnreadMessages = () => {
  // 每3秒检查一次未读消息
  setTimeout(checkUnreadMessages, 3000)
}

// 监听未读消息更新事件
const listenToUnreadMessagesUpdate = () => {
  window.addEventListener('unread-messages-updated', () => {
    // 强制重新计算未读消息总数
    unreadCounts.value = { ...unreadCounts.value }
  })
}

// 根据当前路由设置活动标签
onMounted(() => {
  updateActiveTab()
  checkUnreadMessages()
  listenToUnreadMessagesUpdate()
})

// 监听路由变化
watch(() => route.path, () => {
  updateActiveTab()
})

// 更新活动标签
const updateActiveTab = () => {
  const path = route.path
  if (path === '/') {
    currentTab.value = 'home'
  } else if (path === '/friends') {
    currentTab.value = 'friends'
  } else if (path === '/circle') {
    currentTab.value = 'circle'
  } else if (path === '/profile') {
    currentTab.value = 'profile'
  }
}

// 切换标签的方法
const switchTab = (tab) => {
  currentTab.value = tab
  switch(tab) {
    case 'home':
      router.push('/')
      break
    case 'friends':
      router.push('/friends')
      break
    case 'circle':
      router.push('/circle')
      break
    case 'profile':
      router.push('/profile')
      break
  }
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: #909399;
  transition: color 0.3s;
  padding: 8px 0;
}

.nav-item .el-icon {
  font-size: 24px;
  margin-bottom: 2px;
}

.nav-item span {
  font-size: 12px;
}

.nav-item.active {
  color: #409EFF;
}

.icon-badge-container {
  position: relative;
  display: inline-block;
}

.unread-badge :deep(.el-badge__content) {
  background-color: #f56c6c;
  position: absolute;
  top: -8px;
  right: -10px;
  transform: scale(0.8);
}
</style> 