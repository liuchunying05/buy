<!-- 顶部导航栏 -->
<template>
  <div class="top-nav-bar">
    <div class="nav-container">
      <div class="logo">
        <router-link to="/">二手交易平台</router-link>
      </div>
      
      <div class="search-container">
        <GlobalSearch />
      </div>
      
      <div class="user-info">
        <el-button type="primary" @click="goToCart" size="small">
          <el-badge :value="cartCount" class="cart-badge">
            购物车
          </el-badge>
        </el-button>
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            {{ username }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="circle">我的圈子</el-dropdown-item>
              <el-dropdown-item command="publish">发布商品</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import GlobalSearch from './GlobalSearch.vue'

const router = useRouter()
const username = ref('')
const cartCount = ref(0)

// 更新购物车数量
const updateCartCount = () => {
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  if (userData._id) {
    const cartKey = `cart_${userData._id}`
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]')
    cartCount.value = cart.length
  } else {
    cartCount.value = 0
  }
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'circle':
      router.push('/circle')
      break
    case 'publish':
      router.push('/publish')
      break
    case 'logout':
      localStorage.removeItem('user')
      router.push('/login')
      break
  }
}

// 跳转到购物车
const goToCart = () => {
  router.push('/cart')
}

onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    username.value = JSON.parse(user).username
  }
  updateCartCount()
  
  // 监听storage事件，更新购物车数量
  window.addEventListener('storage', (e) => {
    // 检查是否是当前用户的购物车变更
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    if (userData._id && e.key === `cart_${userData._id}`) {
      updateCartCount()
    }
  })
})
</script>

<style scoped>
.top-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
}

.logo a {
  color: #409EFF;
  text-decoration: none;
}

.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
  display: flex;
  align-items: center;
}

.cart-badge :deep(.el-badge__content) {
  background-color: #f56c6c;
}
</style> 