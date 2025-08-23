<!-- 商品详情页 -->
<template>
  <div class="product-detail-page">
    <div v-if="product" class="product-detail-container">
      <div class="product-navigation">
        <el-button @click="goBack" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
      </div>

      <div class="product-content">
        <div class="product-gallery">
          <div class="main-image-container">
            <img :src="product.image" :alt="product.name" class="main-image">
          </div>
        </div>

        <div class="product-info">
          <div class="product-header">
            <h1 class="product-title">{{ product.name }}</h1>
            <div class="product-meta">
              <span class="product-id">商品ID: {{ product._id || product.id }}</span>
              <span v-if="product.createdAt" class="product-date">发布时间: {{ formatDate(product.createdAt) }}</span>
            </div>
          </div>

          <div class="product-price-section">
            <span class="price-label">价格</span>
            <span class="price-value">¥{{ product.price }}</span>
          </div>

          <!-- 发布人信息区域 -->
          <el-divider />
          <div v-if="publisher" class="publisher-section">
            <h3 class="section-title">发布人信息</h3>
            <div class="publisher-info">
              <el-avatar :size="50" :src="publisher.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              <div class="publisher-details">
                <div class="publisher-name">{{ publisher.username }}</div>
                <div class="publisher-contact">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="addFriend" 
                    :loading="addingFriend"
                    :disabled="isFriend || isCurrentUser"
                  >
                    <el-icon><Plus /></el-icon>
                    {{ friendButtonText }}
                  </el-button>
                  <el-button 
                    type="success" 
                    size="small" 
                    @click="goToChat"
                    :disabled="!isFriend && !isCurrentUser"
                  >
                    <el-icon><ChatDotRound /></el-icon>
                    私信
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <el-divider />

          <div class="product-description-section">
            <h3 class="section-title">商品描述</h3>
            <p class="description-content">{{ product.description || '暂无描述' }}</p>
          </div>

          <el-divider />

          <div class="product-actions">
            <el-button type="primary" size="large" @click="addToCart" class="cart-button">
              <el-icon><ShoppingCart /></el-icon>
              加入购物车
            </el-button>
            <el-button type="success" size="large" class="buy-button">
              <el-icon><Sell /></el-icon>
              立即购买
            </el-button>
          </div>

          <div class="product-tips">
            <div class="tip-item">
              <el-icon><Warning /></el-icon>
              <span>交易提醒：请确认商品状况后再进行交易，谨防上当受骗</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { ArrowLeft, ShoppingCart, Sell, Warning, Plus, ChatDotRound } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const product = ref(null)
const publisher = ref(null)
const currentUser = ref(null)
const isFriend = ref(false)
const addingFriend = ref(false)

// 计算属性：是否为当前用户
const isCurrentUser = computed(() => {
  if (!currentUser.value || !publisher.value) return false
  return currentUser.value._id === publisher.value._id
})

// 计算属性：添加好友按钮文本
const friendButtonText = computed(() => {
  if (isCurrentUser.value) return '自己'
  if (isFriend.value) return '已是好友'
  return '添加好友'
})

// 默认商品数据库
const defaultProducts = {
  1: {
    id: 1,
    name: '二手笔记本电脑',
    price: 2999,
    image: '/笔记本电脑.jpg',
    description: '九成新笔记本电脑，性能良好'
  },
  2: {
    id: 2,
    name: '二手手机',
    price: 1299,
    image: '/16pm.jpg',
    description: '八成新手机，外观完好'
  },
  3: {
    id: 3,
    name: '二手相机',
    price: 3999,
    image: '/微型单反.jpg',
    description: '专业相机，成色很好'
  },
  4: {
    id: 4,
    name: '二手平板',
    price: 1599,
    image: '/华为平板.jpg',
    description: '平板电脑，性能稳定'
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 从服务器获取商品详情
const fetchProductById = async (id) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/products/${id}`)
    if (response.data) {
      // 处理图片路径
      const productData = {
        ...response.data,
        image: response.data.image.startsWith('/uploads/') 
          ? `http://localhost:3000${response.data.image}`
          : response.data.image
      }
      return productData
    }
    return null
  } catch (error) {
    console.error('获取商品详情失败:', error)
    return null
  }
}

// 获取发布人信息
const fetchPublisherInfo = async (userId) => {
  if (!userId) return null
  
  try {
    const response = await axios.get(`http://localhost:3000/api/users/${userId}`)
    return response.data
  } catch (error) {
    console.error('获取发布人信息失败:', error)
    return null
  }
}

// 检查是否已经是好友
const checkIsFriend = async (userId) => {
  if (!currentUser.value || !userId) return false
  
  try {
    const response = await axios.get(`http://localhost:3000/api/friends/check/${currentUser.value._id}/${userId}`)
    return response.data.isFriend
  } catch (error) {
    console.error('检查好友关系失败:', error)
    return false
  }
}

// 添加好友
const addFriend = async () => {
  if (!currentUser.value || !publisher.value) {
    ElMessage.warning('请先登录')
    return
  }
  
  if (isCurrentUser.value) {
    ElMessage.warning('不能添加自己为好友')
    return
  }
  
  if (isFriend.value) {
    ElMessage.info('已经是好友了')
    return
  }
  
  addingFriend.value = true
  
  try {
    await axios.post('http://localhost:3000/api/friends/add', {
      userId: currentUser.value._id,
      friendId: publisher.value._id
    })
    
    isFriend.value = true
    ElMessage.success('添加好友成功')
  } catch (error) {
    console.error('添加好友失败:', error)
    ElMessage.error('添加好友失败，请稍后再试')
  } finally {
    addingFriend.value = false
  }
}

// 跳转到聊天页面
const goToChat = () => {
  if (!publisher.value) return
  
  router.push({
    path: '/chat',
    query: { 
      friendId: publisher.value._id,
      friendName: publisher.value.username
    }
  })
}

onMounted(async () => {
  // 获取当前登录用户信息
  const userJson = localStorage.getItem('user')
  if (userJson) {
    currentUser.value = JSON.parse(userJson)
  }
  
  // 首先尝试从路由状态获取商品信息
  if (router.currentRoute.value.state?.product) {
    product.value = router.currentRoute.value.state.product
  } else {
    // 如果没有状态，尝试从服务器获取
    const productId = route.params.id
    
    // 检查是否是MongoDB ID格式（用于用户上传的商品）
    if (productId.length === 24) {
      const fetchedProduct = await fetchProductById(productId)
      if (fetchedProduct) {
        product.value = fetchedProduct
      } else {
        ElMessage.error('商品不存在或已被删除')
        router.push('/')
      }
    } else {
      // 如果是数字ID，则是默认商品
      const numericId = parseInt(productId)
      if (defaultProducts[numericId]) {
        product.value = defaultProducts[numericId]
      } else {
        ElMessage.error('商品不存在')
        router.push('/')
      }
    }
  }
  
  // 获取发布人信息
  if (product.value && product.value.userId) {
    publisher.value = await fetchPublisherInfo(product.value.userId)
    
    // 如果当前用户已登录，检查是否已经是好友
    if (currentUser.value && publisher.value) {
      isFriend.value = await checkIsFriend(publisher.value._id)
    }
  }
})

const addToCart = () => {
  // 获取当前用户信息
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  if (!userData._id) {
    ElMessage.warning('请先登录后再添加商品到购物车')
    return
  }
  
  // 获取用户的购物车，使用用户ID作为key
  const cartKey = `cart_${userData._id}`
  const cart = JSON.parse(localStorage.getItem(cartKey) || '[]')
  
  // 添加商品到购物车
  cart.push(product.value)
  localStorage.setItem(cartKey, JSON.stringify(cart))
  ElMessage.success('已添加到购物车')
}

const goBack = () => {
  // 返回主页，添加刷新参数以确保商品列表刷新
  router.push({
    path: '/',
    query: { refresh: Date.now() }
  })
}
</script>

<style scoped>
.product-detail-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 20px;
}

.product-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.product-navigation {
  margin-bottom: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.product-content {
  display: flex;
  gap: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.product-gallery {
  flex: 1;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
}

.main-image-container {
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s;
}

.main-image:hover {
  transform: scale(1.05);
}

.product-info {
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
}

.product-header {
  margin-bottom: 20px;
}

.product-title {
  margin: 0 0 10px 0;
  font-size: 28px;
  color: #303133;
  line-height: 1.4;
}

.product-meta {
  display: flex;
  gap: 20px;
  color: #909399;
  font-size: 14px;
}

.product-price-section {
  margin: 20px 0;
  display: flex;
  align-items: baseline;
}

.price-label {
  font-size: 16px;
  color: #606266;
  margin-right: 10px;
}

.price-value {
  font-size: 36px;
  color: #f56c6c;
  font-weight: bold;
}

/* 发布人信息样式 */
.publisher-section {
  margin: 20px 0;
}

.publisher-info {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.publisher-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.publisher-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.publisher-contact {
  display: flex;
  gap: 10px;
}

.section-title {
  font-size: 18px;
  color: #303133;
  margin-bottom: 15px;
}

.description-content {
  font-size: 16px;
  color: #606266;
  line-height: 1.8;
  white-space: pre-line;
}

.product-actions {
  display: flex;
  gap: 20px;
  margin: 20px 0;
}

.cart-button, .buy-button {
  flex: 1;
  height: 50px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-button .el-icon,
.buy-button .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

.product-tips {
  margin-top: 20px;
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 15px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e6a23c;
  font-size: 14px;
}

.loading-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 992px) {
  .product-content {
    flex-direction: column;
  }
  
  .main-image-container {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .product-actions {
    flex-direction: column;
  }
  
  .main-image-container {
    height: 250px;
  }
}
</style>