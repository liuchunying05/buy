<!-- 搜索结果页面 -->
<template>
  <div class="search-view">
    <el-container>
      <el-main v-loading="loading">
        <div class="search-result-container">
          <h1 class="page-title">搜索结果</h1>
          <h2 class="result-title" v-if="searchResults.length > 0">
            搜索 "{{ searchKeyword }}" 的结果：共 {{ searchResults.length }} 个商品
          </h2>
          <div v-if="searchResults.length === 0" class="empty-result">
            <el-empty description="没有找到符合条件的商品" />
            <router-link to="/">返回首页</router-link>
          </div>
          <el-row :gutter="20" v-else>
            <el-col :span="6" v-for="item in searchResults" :key="item._id">
              <el-card class="product-card" @click="showDetail(item)">
                <img :src="getImagePath(item.image)" class="product-image">
                <div class="product-info">
                  <h3>{{ item.name }}</h3>
                  <p class="price">¥{{ item.price }}</p>
                  <p class="publisher" v-if="item.publisherName">发布者: {{ item.publisherName }}</p>
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
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const searchKeyword = ref('')
const searchResults = ref([])

// 监听路由查询参数变化
watch(() => route.query.keyword, (newKeyword) => {
  if (newKeyword) {
    searchKeyword.value = newKeyword
    searchProducts()
  }
})

// 搜索商品
const searchProducts = async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }
  
  loading.value = true
  try {
    // 获取所有商品
    const response = await axios.get('http://localhost:3000/api/products')
    const allProducts = response.data
    
    // 在前端进行筛选
    const keyword = searchKeyword.value.trim().toLowerCase()
    searchResults.value = allProducts.filter(product => 
      product.name.toLowerCase().includes(keyword) || 
      (product.description && product.description.toLowerCase().includes(keyword))
    )
    
    // 添加发布者信息
    await Promise.all(searchResults.value.map(async (product) => {
      try {
        if (product.userId) {
          const userResponse = await axios.get(`http://localhost:3000/api/users/${product.userId}`)
          product.publisherName = userResponse.data.username || '未知用户'
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        product.publisherName = '未知用户'
      }
    }))
    
  } catch (error) {
    console.error('搜索商品失败:', error)
    ElMessage.error('搜索失败，请重试')
  } finally {
    loading.value = false
  }
}

// 处理图片路径
const getImagePath = (imagePath) => {
  if (!imagePath) return ''
  
  // 已经是完整URL的情况
  if (imagePath.startsWith('http')) return imagePath
  
  // 静态资源的情况
  if (imagePath.startsWith('public/')) return imagePath
  
  // 服务器上传的图片，确保路径正确
  if (imagePath.startsWith('/uploads/')) {
    return `http://localhost:3000${imagePath}`
  }
  
  // 其他情况，添加基础URL
  return `http://localhost:3000/${imagePath}`
}

// 查看商品详情
const showDetail = (product) => {
  router.push(`/product/${product._id || product.id}`)
}

onMounted(() => {
  if (route.query.keyword) {
    searchKeyword.value = route.query.keyword
    searchProducts()
  }
})
</script>

<style scoped>
.search-view {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.el-main {
  padding: 20px;
  padding-bottom: 80px;
}

.search-result-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 20px;
  text-align: center;
}

.result-title {
  font-size: 18px;
  color: #606266;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.empty-result {
  text-align: center;
  padding: 40px 0;
}

.empty-result a {
  display: inline-block;
  margin-top: 20px;
  color: #409EFF;
  text-decoration: none;
}

.product-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
  height: 320px;
  overflow: hidden;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.product-info {
  padding: 10px;
}

.product-info h3 {
  margin: 0 0 10px;
  font-size: 16px;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin: 5px 0;
}

.publisher {
  font-size: 12px;
  color: #909399;
  margin: 5px 0 0;
}
</style> 