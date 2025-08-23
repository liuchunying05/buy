<!-- 好友页面 -->
<template>
  <div class="friends-page">
    <div class="friends-container">
      <div class="friends-sidebar">
        <el-card class="sidebar-card">
          <template #header>
            <div class="card-header">
              <h3>好友管理</h3>
            </div>
          </template>
          
          <!-- 搜索区域 -->
          <div class="search-section">
            <el-input
              v-model="searchQuery"
              placeholder="输入用户名搜索"
              class="search-input"
              clearable
              @keyup.enter="searchUser"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button @click="searchUser">搜索</el-button>
              </template>
            </el-input>
          </div>
          
          <!-- 统计信息 -->
          <div class="stats-section">
            <div class="stat-item">
              <div class="stat-number">{{ friends.length }}</div>
              <div class="stat-label">好友数量</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ friends.filter(f => f.status === '在线').length }}</div>
              <div class="stat-label">在线好友</div>
            </div>
          </div>
          
          <!-- 快捷操作 -->
          <div class="quick-actions">
            <el-button type="primary" @click="refreshFriends" :icon="Refresh">刷新列表</el-button>
          </div>
        </el-card>
      </div>
      
      <div class="friends-content">
        <!-- 搜索结果区域 -->
        <el-card v-if="searchResult" class="search-result-card">
          <template #header>
            <div class="card-header">
              <h3>搜索结果</h3>
            </div>
          </template>
          
          <div class="user-card">
            <div class="user-info">
              <el-avatar :size="60" :src="processedSearchAvatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              <div class="user-details">
                <h3>{{ searchResult.username }}</h3>
                <div class="user-actions">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="addFriend(searchResult)"
                    :disabled="searchResult.isAlreadyFriend || searchResult.isSelf"
                  >
                    {{ searchResult.isAlreadyFriend ? '已是好友' : (searchResult.isSelf ? '不能添加自己' : '添加好友') }}
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 好友列表区域 -->
        <el-card class="friends-list-card">
          <template #header>
            <div class="card-header">
              <h3>我的好友</h3>
              <el-input
                v-model="filterQuery"
                placeholder="筛选好友"
                class="filter-input"
                clearable
              >
                <template #prefix>
                  <el-icon><Filter /></el-icon>
                </template>
              </el-input>
            </div>
          </template>
          
          <div v-if="filteredFriends.length === 0" class="empty-state">
            <el-empty description="暂无好友" v-if="friends.length === 0">
              <template #description>
                <p>还没有添加任何好友</p>
                <p>使用上方搜索功能添加好友吧！</p>
              </template>
            </el-empty>
            <el-empty description="无匹配结果" v-else>
              <template #description>
                <p>没有找到符合筛选条件的好友</p>
              </template>
            </el-empty>
          </div>
          
          <div v-else class="friends-grid">
            <div v-for="friend in filteredFriends" :key="friend._id" class="friend-card">
              <div class="friend-avatar">
                <el-avatar :size="70" :src="processAvatarUrl(friend.avatar) || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
                <span class="status-indicator" :class="getStatusClass(friend.status)"></span>
              </div>
              <div class="friend-info">
                <h3>{{ friend.username }}</h3>
                <p class="friend-status">{{ friend.status || '在线' }}</p>
              </div>
              <div class="friend-actions">
                <el-button type="primary" size="small" @click="startChat(friend)" icon="ChatDotRound">
                  发消息
                  <el-badge v-if="getUnreadCount(friend._id) > 0" :value="getUnreadCount(friend._id)" class="unread-badge" />
                </el-button>
                <el-button type="danger" size="small" @click="confirmRemoveFriend(friend)" icon="Delete">删除</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Filter, Refresh, Delete, ChatDotRound } from '@element-plus/icons-vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const searchQuery = ref('')
const filterQuery = ref('')
const searchResult = ref(null)
const friends = ref([])
const router = useRouter()
const unreadCounts = ref({}) // 存储未读消息数量

// 处理搜索结果头像URL
const processedSearchAvatar = computed(() => {
  if (!searchResult.value || !searchResult.value.avatar) return ''
  
  // 如果是本地预览URL或完整URL，直接返回
  if (searchResult.value.avatar.startsWith('blob:') || 
      searchResult.value.avatar.startsWith('http://') || 
      searchResult.value.avatar.startsWith('https://')) {
    return searchResult.value.avatar
  }
  // 如果是服务器路径，拼接完整URL
  return `http://localhost:3000${searchResult.value.avatar}`
})

// 处理好友头像URL的函数
const processAvatarUrl = (avatarPath) => {
  if (!avatarPath) return ''
  
  // 如果是本地预览URL或完整URL，直接返回
  if (avatarPath.startsWith('blob:') || 
      avatarPath.startsWith('http://') || 
      avatarPath.startsWith('https://')) {
    return avatarPath
  }
  // 如果是服务器路径，拼接完整URL
  return `http://localhost:3000${avatarPath}`
}

// 过滤后的好友列表
const filteredFriends = computed(() => {
  if (!filterQuery.value) return friends.value
  
  return friends.value.filter(friend => 
    friend.username.toLowerCase().includes(filterQuery.value.toLowerCase()) ||
    (friend.status && friend.status.toLowerCase().includes(filterQuery.value.toLowerCase()))
  )
})

// 获取状态样式类
const getStatusClass = (status) => {
  if (!status || status === '在线') return 'status-online'
  if (status === '离线') return 'status-offline'
  if (status === '忙碌') return 'status-busy'
  return 'status-online'
}

// 获取当前用户信息
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    ElMessage.error('请先登录')
    router.push('/login')
    return null
  }
  try {
    const user = JSON.parse(userStr)
    console.log('当前用户信息:', user) // 调试信息
    if (!user.id && !user._id) {
      console.error('用户信息中缺少ID字段')
      ElMessage.error('用户信息不完整')
      return null
    }
    return {
      ...user,
      _id: user.id || user._id // 确保有_id字段
    }
  } catch (error) {
    console.error('解析用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
    return null
  }
}

// 搜索用户
const searchUser = async () => {
  const currentUser = getCurrentUser()
  if (!currentUser) return

  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索内容')
    return
  }

  try {
    const response = await axios.get(`http://localhost:3000/api/users/search?username=${searchQuery.value}`)
    if (response.data) {
      // 检查搜索到的用户是否已经是好友
      const isAlreadyFriend = friends.value.some(friend => friend._id === response.data._id)
      // 不允许添加自己为好友
      const isSelf = response.data._id === currentUser._id
      searchResult.value = {
        ...response.data,
        isAlreadyFriend,
        isSelf
      }
    } else {
      searchResult.value = null
      ElMessage.info('未找到该用户')
    }
  } catch (error) {
    console.error('搜索用户失败:', error)
    ElMessage.error('搜索失败')
  }
}

// 添加好友
const addFriend = async (user) => {
  const currentUser = getCurrentUser()
  if (!currentUser) return

  // 防止添加自己为好友
  if (user._id === currentUser._id) {
    ElMessage.warning('不能添加自己为好友')
    return
  }

  try {
    console.log('添加好友请求参数:', { userId: currentUser._id, friendId: user._id }) // 调试信息
    const response = await axios.post('http://localhost:3000/api/friends/add', {
      userId: currentUser._id,
      friendId: user._id
    })
    
    if (response.data.success) {
      ElMessage.success('添加好友成功')
      // 更新好友列表
      await fetchFriends()
      // 更新搜索结果状态
      if (searchResult.value) {
        searchResult.value.isAlreadyFriend = true
      }
    }
  } catch (error) {
    console.error('添加好友失败:', error)
    ElMessage.error(error.response?.data?.message || '添加好友失败')
  }
}

// 获取好友列表
const fetchFriends = async () => {
  const currentUser = getCurrentUser()
  if (!currentUser) return

  try {
    console.log('获取好友列表，用户ID:', currentUser._id) // 调试信息
    const response = await axios.get(`http://localhost:3000/api/friends/${currentUser._id}`)
    friends.value = response.data
    console.log('获取到的好友列表:', response.data) // 调试信息
  } catch (error) {
    console.error('获取好友列表失败:', error)
    ElMessage.error(error.response?.data?.message || '获取好友列表失败')
  }
}

// 刷新好友列表
const refreshFriends = () => {
  fetchFriends()
  ElMessage.success('好友列表已刷新')
}

// 确认删除好友
const confirmRemoveFriend = (friend) => {
  ElMessageBox.confirm(
    `确定要删除好友 ${friend.username} 吗？`,
    '删除好友',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    removeFriend(friend)
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 删除好友
const removeFriend = async (friend) => {
  const currentUser = getCurrentUser()
  if (!currentUser) return

  try {
    console.log('删除好友请求参数:', { userId: currentUser._id, friendId: friend._id }) // 调试信息
    const response = await axios.delete('http://localhost:3000/api/friends/remove', {
      data: {
        userId: currentUser._id,
        friendId: friend._id
      }
    })
    
    if (response.data.success) {
      ElMessage.success('删除好友成功')
      await fetchFriends()
    }
  } catch (error) {
    console.error('删除好友失败:', error)
    ElMessage.error(error.response?.data?.message || '删除好友失败')
  }
}

// 开始聊天
const startChat = (friend) => {
  // 清除未读消息计数
  const allUnreadCountsStr = localStorage.getItem('all_unread_counts') || '{}'
  const allUnreadCounts = JSON.parse(allUnreadCountsStr)
  
  // 获取当前用户
  const currentUser = getCurrentUser()
  if (!currentUser) return
  
  // 清除当前用户收到的来自该好友的未读消息计数
  if (allUnreadCounts[currentUser._id] && allUnreadCounts[currentUser._id][friend._id]) {
    allUnreadCounts[currentUser._id][friend._id] = 0
    localStorage.setItem('all_unread_counts', JSON.stringify(allUnreadCounts))
  }
  
  // 更新本地状态
  loadUnreadCounts()
  
  router.push({
    path: '/chat',
    query: {
      friendId: friend._id,
      friendName: friend.username
    }
  })
}

// 获取未读消息数量
const getUnreadCount = (friendId) => {
  // 获取当前用户
  const currentUser = getCurrentUser()
  if (!currentUser) return 0
  
  // 从新的未读消息计数存储中获取计数
  // 格式: { "userId": { "senderId1": count1, "senderId2": count2, ... } }
  const allUnreadCountsStr = localStorage.getItem('all_unread_counts') || '{}'
  const allUnreadCounts = JSON.parse(allUnreadCountsStr)
  
  // 检查当前用户是否有未读消息记录
  if (!allUnreadCounts[currentUser._id]) {
    return 0
  }
  
  // 返回来自特定好友的未读消息数量
  return allUnreadCounts[currentUser._id][friendId] || 0
}

// 加载所有未读消息计数
const loadUnreadCounts = () => {
  // 使用新的未读消息计数存储格式
  const allUnreadCountsStr = localStorage.getItem('all_unread_counts') || '{}'
  const allUnreadCounts = JSON.parse(allUnreadCountsStr)
  
  // 获取当前用户
  const currentUser = getCurrentUser()
  if (!currentUser) return
  
  // 更新本地状态
  const userUnreadCounts = {}
  
  // 如果当前用户有未读消息记录
  if (allUnreadCounts[currentUser._id]) {
    // 将未读消息计数转换为简单格式
    Object.keys(allUnreadCounts[currentUser._id]).forEach(senderId => {
      userUnreadCounts[senderId] = allUnreadCounts[currentUser._id][senderId]
    })
  }
  
  unreadCounts.value = userUnreadCounts
  console.log('已加载未读消息计数:', unreadCounts.value)
}

// 定期检查未读消息
const checkUnreadMessages = () => {
  loadUnreadCounts()
  // 每5秒检查一次未读消息
  setTimeout(checkUnreadMessages, 5000)
}

// 页面加载时获取好友列表
onMounted(() => {
  fetchFriends()
  loadUnreadCounts()
  checkUnreadMessages()
})
</script>

<style scoped>
.friends-page {
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
  padding: 30px 20px;
}

.friends-container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  gap: 30px;
  padding-bottom: 60px;
}

.friends-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.friends-content {
  flex-grow: 1;
}

.sidebar-card,
.search-result-card,
.friends-list-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.search-section {
  margin-bottom: 20px;
}

.stats-section {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 15px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.quick-actions {
  display: flex;
  justify-content: center;
}

.filter-input {
  width: 200px;
}

.user-card {
  padding: 15px;
  border-radius: 8px;
  background-color: #f9fafc;
  transition: all 0.3s;
}

.user-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  gap: 15px;
}

.user-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.user-details h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.friend-card {
  padding: 20px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.friend-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.friend-avatar {
  position: relative;
  margin-bottom: 15px;
}

.status-indicator {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  bottom: 0;
  right: 0;
  border: 2px solid #fff;
}

.status-online {
  background-color: #67c23a;
}

.status-offline {
  background-color: #909399;
}

.status-busy {
  background-color: #e6a23c;
}

.friend-info {
  margin-bottom: 15px;
}

.friend-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #303133;
}

.friend-status {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.friend-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.unread-badge :deep(.el-badge__content) {
  background-color: #f56c6c;
  right: -10px;
  top: -8px;
}

@media (max-width: 768px) {
  .friends-container {
    flex-direction: column;
  }
  
  .friends-sidebar {
    width: 100%;
  }
  
  .friends-grid {
    grid-template-columns: 1fr;
  }
}
</style> 