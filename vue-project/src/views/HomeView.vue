<!-- 主页 -->
<template>
  <div class="home" v-loading="loading">
    <el-container>
      <el-main>
        <!-- 轮播图部分 -->
        <div class="carousel-container">
          <el-carousel :interval="4000" type="card" height="400px">
            <el-carousel-item v-for="item in carouselItems" :key="item.id">
              <img :src="item.image" :alt="item.title" class="carousel-image">
              <h3 class="carousel-title">{{ item.title }}</h3>
            </el-carousel-item>
          </el-carousel>
        </div>
        <!-- 商品列表部分 -->
        <div class="products-section">
          <div class="section-header">
            <h2 class="section-title">热门商品</h2>
            <!-- 管理员功能 -->
            <el-button 
              v-if="isAdmin" 
              type="danger" 
              size="small" 
              @click="confirmClearAll"
            >
              清空所有商品
            </el-button>
          </div>
          <el-row :gutter="20">
            <el-col :span="6" v-for="item in products" :key="item.id || item._id">
              <el-card class="product-card" @click="showDetail(item)">
                <!-- 管理员删除按钮 -->
                <div v-if="isAdmin && item._id" class="admin-actions">
                  <el-button 
                    type="danger" 
                    size="small" 
                    circle
                    @click.stop="confirmDeleteProduct(item)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <img :src="item.image" class="product-image">
                <div class="product-info">
                  <h3>{{ item.name }}</h3>
                  <p class="price">¥{{ item.price }}</p>
                  <el-button type="primary" @click.stop="addToCart(item)">加入购物车</el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProducts } from '../api'
import axios from 'axios'
import { Delete } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const username = ref('')
const cartCount = ref(0)
const loading = ref(false)
const isAdmin = ref(false) // 是否是管理员

// 轮播图数据
const carouselItems = ref([
  {
    id: 1,
    title: '品质二手笔记本',
    image: 'public/笔记本电脑.jpg'
  },
  {
    id: 2,
    title: '精选二手手机',
    image: 'public/16pm.jpg'
  },
  {
    id: 3,
    title: '专业相机设备',
    image: 'public/微型单反.jpg'
  }
])

// 默认商品数据
const defaultProducts = [
  {
    id: 1,
    name: '二手笔记本电脑',
    price: 2999,
    image: 'public/笔记本电脑.jpg',
    description: '九成新笔记本电脑，性能良好'
  },
  {
    id: 2,
    name: '二手手机',
    price: 1299,
    image: 'public/16pm.jpg',
    description: '八成新手机，外观完好'
  },
  {
    id: 3,
    name: '二手相机',
    price: 3999,
    image: 'public/微型单反.jpg',
    description: '专业相机，成色很好'
  },
  {
    id: 4,
    name: '二手平板',
    price: 1599,
    image: 'public/华为平板.jpg',
    description: '平板电脑，性能稳定'
  }
]

// 商品数据
const products = ref([...defaultProducts])
// 获取商品列表
const fetchProducts = async () => {
  try {
    loading.value = true
    const data = await getProducts()
    // 合并默认商品和后端返回的商品，使用 id 或 _id 作为唯一标识
    const newProducts = data.map(item => ({
      ...item,
      // 处理不同类型的图片路径
      image: item.image.startsWith('/uploads/') 
        ? `http://localhost:3000${item.image}`  // 处理上传的图片路径
        : item.image.startsWith('http') 
          ? item.image  // 已经是完整URL的情况
          : item.image  // 默认商品的图片路径
    }))
    products.value = [...defaultProducts, ...newProducts]
    console.log('商品列表已更新:', products.value)
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}
// 监听路由参数变化
watch(
  () => route.query.refresh,
  () => {
    console.log('检测到路由参数变化，刷新商品列表')
    fetchProducts()
  }
)

// 确认清空所有商品
const confirmClearAll = () => {
  ElMessageBox.confirm(
    '确定要清空所有已发布的商品吗？此操作不可逆！',
    '警告',
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    clearAllProducts()
  }).catch(() => {
    ElMessage.info('已取消清空操作')
  })
}

// 清空所有商品
const clearAllProducts = async () => {
  try {
    loading.value = true
    const response = await axios.delete('http://localhost:3000/api/products/admin/clear-all')
    
    if (response.data) {
      ElMessage.success(`已成功清空 ${response.data.deletedCount} 个商品`)
      // 重新加载商品列表，只保留默认商品
      products.value = [...defaultProducts]
    }
  } catch (error) {
    console.error('清空商品失败:', error)
    ElMessage.error('清空商品失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const user = localStorage.getItem('user')
  if (!user) {
    router.push('/login')
    return
  }
  
  const userData = JSON.parse(user)
  username.value = userData.username
  
  // 简单的管理员判断，实际应用中应该有更严格的权限控制
  // 这里假设用户名为 admin 的用户为管理员
  isAdmin.value = userData.username === 'admin'
  
  // 从localStorage获取用户特定的购物车数量
  const cartKey = `cart_${userData._id}`
  const cart = JSON.parse(localStorage.getItem(cartKey) || '[]')
  cartCount.value = cart.length

  // 获取商品列表
  await fetchProducts()
})

const showDetail = (item) => {
  router.push({
    name: 'product',
    params: { id: item._id || item.id },
    state: { product: item }
  })
}

const addToCart = (item) => {
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
  cart.push(item)
  localStorage.setItem(cartKey, JSON.stringify(cart))
  cartCount.value = cart.length
  ElMessage.success('已添加到购物车')
}

const goToCart = () => {
  router.push('/cart')
}

const logout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}

// 确认删除单个商品
const confirmDeleteProduct = (product) => {
  // 默认商品不允许删除
  if (!product._id) {
    ElMessage.warning('系统默认商品不可删除')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除商品 "${product.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deleteProduct(product._id)
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 删除单个商品
const deleteProduct = async (productId) => {
  try {
    loading.value = true
    const response = await axios.delete(`http://localhost:3000/api/products/${productId}`)
    
    if (response.data) {
      ElMessage.success('商品已成功删除')
      // 从列表中移除该商品
      products.value = products.value.filter(item => {
        // 注意：有些商品可能用id，有些用_id
        return (item.id !== productId && item._id !== productId)
      })
    }
  } catch (error) {
    console.error('删除商品失败:', error)
    ElMessage.error('删除商品失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  position: relative;
}

.carousel-container {
  margin-bottom: 40px;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-title {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  text-align: center;
  color: #303133;
  font-size: 24px;
  margin: 0;
}

.products-section {
  max-width: 1200px;
  margin: 0 auto;
}

.product-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
  position: relative;
}

.admin-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 10px;
}

.product-info h3 {
  margin: 10px 0;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
}

:deep(.el-carousel__item) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-carousel__item h3) {
  font-size: 18px;
}
</style>