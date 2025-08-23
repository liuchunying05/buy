<!-- 显示聊天记录 -->
<template>
  <div class="chat-container">
    <div class="chat-header">
      <el-button @click="goBack" class="back-button">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <div class="friend-info">
        <h2>{{ friendName }}</h2>
        <div class="status" :class="{ online: friendStatus === '在线' }">
          {{ friendStatus || '离线' }}
        </div>
      </div>
      <div class="friend-avatar-container" @click="showActionMenu = true">
        <el-avatar :size="40" :src="processedFriendAvatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
        <el-icon><ArrowDown /></el-icon>
      </div>
    </div>
    
    <!-- 操作菜单 -->
    <el-dialog
      v-model="showActionMenu"
      title="聊天设置"
      width="80%"
      :show-close="true"
      center
    >
      <div class="action-menu">
        <el-button type="danger" @click="confirmClearChat">清空聊天记录</el-button>
        <el-button type="danger" @click="confirmDeleteFriend">删除好友</el-button>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showActionMenu = false">取消</el-button>
        </span>
      </template>
    </el-dialog>
    
    <div class="messages-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-messages">
        <el-empty description="暂无消息记录" />
      </div>
      <div v-else class="messages-list">
        <div 
          v-for="(message, index) in messages" 
          :key="index" 
          class="message-item"
          :class="{ 'my-message': message.senderId === currentUser._id }"
        >
          <div class="message-avatar">
            <el-avatar 
              :size="40" 
              :src="message.senderId === currentUser._id ? currentUserAvatar : processedFriendAvatar" 
            />
          </div>
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
            <div class="message-time">
              {{ formatTime(message.timestamp) }}
              <span v-if="message.senderId === currentUser._id" class="read-status">
                {{ message.isRead ? '已读' : '未读' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="message-input">
      <el-input
        v-model="newMessage"
        placeholder="输入消息..."
        :rows="3"
        type="textarea"
        resize="none"
        @keyup.enter="sendMessage"
      />
      <el-button type="primary" @click="sendMessage" :disabled="!newMessage.trim()">
        <el-icon><Position /></el-icon>
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Position, ArrowDown } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const friendId = ref('')
const friendName = ref('')
const friendStatus = ref('')
const friendAvatar = ref('')
const currentUser = ref(null)
const messages = ref([])
const newMessage = ref('')
const messagesContainer = ref(null)
const showActionMenu = ref(false)

// 计算属性：处理当前用户头像URL
const currentUserAvatar = computed(() => {
  if (!currentUser.value || !currentUser.value.avatar) return ''
  
  // 如果是本地预览URL或完整URL，直接返回
  if (currentUser.value.avatar.startsWith('blob:') || 
      currentUser.value.avatar.startsWith('http://') || 
      currentUser.value.avatar.startsWith('https://')) {
    return currentUser.value.avatar
  }
  // 如果是服务器路径，拼接完整URL
  return `http://localhost:3000${currentUser.value.avatar}`
})

// 计算属性：处理好友头像URL
const processedFriendAvatar = computed(() => {
  if (!friendAvatar.value) return ''
  
  // 如果是本地预览URL或完整URL，直接返回
  if (friendAvatar.value.startsWith('blob:') || 
      friendAvatar.value.startsWith('http://') || 
      friendAvatar.value.startsWith('https://')) {
    return friendAvatar.value
  }
  // 如果是服务器路径，拼接完整URL
  return `http://localhost:3000${friendAvatar.value}`
})

// 获取当前时间
const getCurrentTime = () => {
  return new Date().toISOString()
}

// 格式化时间显示
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 滚动到最新消息
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 发送消息
const sendMessage = () => {
  if (!newMessage.value.trim()) return
  
  // 创建新消息对象
  const message = {
    senderId: currentUser.value._id,
    receiverId: friendId.value,
    content: newMessage.value.trim(),
    timestamp: getCurrentTime(),
    isRead: false,
    messageId: Date.now() + Math.random().toString(36).substring(2, 10) // 生成唯一ID
  }
  
  // 添加到本地消息列表
  messages.value.push(message)
  // 保存到本地存储
  saveMessages()
  // 更新接收者的未读消息计数
  // 在接收者的未读消息存储中，键是发送者的ID（当前用户ID）
  // 这样接收者可以知道来自哪个用户的未读消息
  updateUnreadMessageCount(friendId.value, currentUser.value._id, 1)
  // 清空输入框
  newMessage.value = ''
  // 滚动到最新消息
  scrollToBottom()
  // TODO: 如果有实时通信功能，这里可以发送消息到服务器
}

// 处理回车键发送消息
const handleKeyup = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}
// 未读
// 更新未读消息计数 - 新版本
const updateUnreadMessageCount = (receiverId, senderId, increment) => {
  // 获取未读消息计数存储
  // 格式: { "userId": { "senderId1": count1, "senderId2": count2, ... } }
  const allUnreadCountsStr = localStorage.getItem('all_unread_counts') || '{}'
  const allUnreadCounts = JSON.parse(allUnreadCountsStr)
  // 确保接收者的记录存在
  if (!allUnreadCounts[receiverId]) {
    allUnreadCounts[receiverId] = {}
  }
  // 确保发送者的计数存在
  if (!allUnreadCounts[receiverId][senderId]) {
    allUnreadCounts[receiverId][senderId] = 0
  }
  // 更新计数
  allUnreadCounts[receiverId][senderId] += increment
  // 确保计数不为负数
  if (allUnreadCounts[receiverId][senderId] < 0) {
    allUnreadCounts[receiverId][senderId] = 0
  }
  // 保存回本地存储
  localStorage.setItem('all_unread_counts', JSON.stringify(allUnreadCounts))
  console.log(`更新未读消息: 用户${receiverId}收到来自用户${senderId}的未读消息数为${allUnreadCounts[receiverId][senderId]}`)
}

// 已读
// 标记消息为已读 - 新版本
const markMessagesAsRead = () => {
  let hasUnreadMessages = false
  let senderIds = new Set()
  
  // 遍历消息，将接收到的未读消息标记为已读
  messages.value.forEach(msg => {
    if (msg.receiverId === currentUser.value._id && !msg.isRead) {
      msg.isRead = true
      hasUnreadMessages = true
      senderIds.add(msg.senderId)
    }
  })
  // 如果有未读消息被标记为已读，则保存更新
  if (hasUnreadMessages) {
    saveMessages()
    // 重置来自该发送者的未读消息计数
    senderIds.forEach(senderId => {
      updateUnreadMessageCount(currentUser.value._id, senderId, -100) // 使用一个大数字确保清零
    })
    // 触发自定义事件，通知其他组件更新未读消息状态
    window.dispatchEvent(new CustomEvent('unread-messages-updated'))
  }
}
// 保存消息到本地存储
const saveMessages = () => {
  // 创建聊天ID（两个用户ID的组合，按字母顺序排序）
  const chatId = [currentUser.value._id, friendId.value].sort().join('-')

  // 保存到本地存储
  localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages.value))
}

// 加载消息记录
const loadMessages = () => {
  // 创建聊天ID
  const chatId = [currentUser.value._id, friendId.value].sort().join('-')
  
  // 从本地存储加载消息
  const savedMessages = localStorage.getItem(`chat_${chatId}`)
  if (savedMessages) {
    messages.value = JSON.parse(savedMessages)
  }
  
  // 滚动到最新消息
  scrollToBottom()
}

// 获取好友信息
const fetchFriendInfo = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/api/users/${friendId.value}`)
    if (response.data) {
      friendStatus.value = response.data.status || '离线'
      friendAvatar.value = response.data.avatar || ''
    }
  } catch (error) {
    console.error('获取好友信息失败:', error)
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 确认清空聊天记录
const confirmClearChat = () => {
  ElMessageBox.confirm(
    '确定要清空与该好友的所有聊天记录吗？此操作不可恢复。',
    '清空聊天记录',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      clearChatHistory()
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}

// 清空聊天记录
const clearChatHistory = () => {
  // 创建聊天ID
  const chatId = [currentUser.value._id, friendId.value].sort().join('-')
  
  // 清空消息列表
  messages.value = []
  
  // 保存到本地存储
  localStorage.setItem(`chat_${chatId}`, JSON.stringify([]))
  // 关闭操作菜单
  showActionMenu.value = false
  ElMessage.success('聊天记录已清空')
}
// 确认删除好友
const confirmDeleteFriend = () => {
  ElMessageBox.confirm(
    `确定要删除好友 ${friendName.value} 吗？`,
    '删除好友',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      deleteFriend()
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}
// 删除好友
const deleteFriend = async () => {
  try {
    // 发送删除好友请求
    const response = await axios.delete('http://localhost:3000/api/friends/remove', {
      data: {
        userId: currentUser.value._id,
        friendId: friendId.value
      }
    })
    if (response.data.success) {
      // 清空聊天记录
      clearChatHistory()
      // 关闭操作菜单
      showActionMenu.value = false
      ElMessage.success('好友已删除')
      // 返回好友列表页面
      router.push('/friends')
    }
  } catch (error) {
    console.error('删除好友失败:', error)
    ElMessage.error(error.response?.data?.message || '删除好友失败')
  }
}
onMounted(() => {
  // 获取URL参数中的好友ID和名称
  friendId.value = route.query.friendId
  friendName.value = route.query.friendName || '好友'
  // 获取当前登录用户
  const userJson = localStorage.getItem('user')
  if (userJson) {
    currentUser.value = JSON.parse(userJson)
  } else {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 如果没有好友ID，返回上一页
  if (!friendId.value) {
    ElMessage.warning('无效的聊天')
    router.back()
    return
  }
  
  // 获取好友信息
  fetchFriendInfo()
  
  // 加载消息记录
  loadMessages()
  
  // 标记消息为已读
  markMessagesAsRead()
})
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.back-button {
  margin-right: 15px;
  display: flex;
  align-items: center;
}

.friend-info {
  flex: 1;
}

.friend-info h2 {
  margin: 0;
  font-size: 18px;
}

.status {
  font-size: 12px;
  color: #909399;
}

.status.online {
  color: #67c23a;
}

.friend-avatar-container {
  margin-left: 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 5px;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.friend-avatar-container:hover {
  background-color: #f0f0f0;
}

.action-menu {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px 0;
}

.action-menu .el-button {
  width: 100%;
  margin-left: 0;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.empty-messages {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-item {
  display: flex;
  max-width: 70%;
}

.my-message {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message-avatar {
  margin: 0 10px;
}

.message-content {
  display: flex;
  flex-direction: column;
}

.message-text {
  padding: 10px 15px;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  word-break: break-word;
}

.my-message .message-text {
  background-color: #409eff;
  color: #fff;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 5px;
}

.read-status {
  font-size: 10px;
  color: #67c23a;
}

.read-status.unread {
  color: #909399;
}

.my-message .message-time {
  align-self: flex-start;
}

.message-input {
  display: flex;
  gap: 10px;
  padding: 15px;
  background-color: #fff;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
}

.message-input .el-input {
  flex: 1;
}

.message-input .el-button {
  align-self: flex-end;
}

@media (max-width: 768px) {
  .message-item {
    max-width: 85%;
  }
}
</style> 