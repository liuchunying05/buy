<!-- 购物车页面 -->
<template>
  <div class="cart">
    <el-card>
      <template #header>
        <div class="cart-header">
          <h2>购物车</h2>
          <el-button @click="goBack">返回商品列表</el-button>
        </div>
      </template>
      
      <div v-if="cartItems.length === 0" class="empty-cart">
        <el-empty description="购物车是空的"></el-empty>
      </div>
      
      <div v-else>
        <el-table :data="cartItems" style="width: 100%">
          <el-table-column prop="image" label="商品图片" width="180">
            <template #default="scope">
              <img :src="scope.row.image" :alt="scope.row.name" class="product-image">
            </template>
          </el-table-column>
          
          <el-table-column prop="name" label="商品名称"></el-table-column>
          
          <el-table-column prop="price" label="价格" width="180">
            <template #default="scope">
              <span class="price">¥{{ scope.row.price }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button type="danger" @click="removeItem(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="cart-footer">
          <div class="total">
            总计: <span class="price">¥{{ total }}</span>
          </div>
          <el-button type="primary" size="large" @click="checkout">结算</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const cartItems = ref([])
const userId = ref('')
const cartKey = ref('')

onMounted(() => {
  // 获取当前用户信息
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  if (!userData._id) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 设置用户ID和购物车key
  userId.value = userData._id
  cartKey.value = `cart_${userData._id}`
  
  // 加载用户的购物车数据
  cartItems.value = JSON.parse(localStorage.getItem(cartKey.value) || '[]')
})
const total = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price, 0)
})
const removeItem = (index) => {
  cartItems.value.splice(index, 1)
  // 保存到用户特定的购物车
  localStorage.setItem(cartKey.value, JSON.stringify(cartItems.value))
  ElMessage.success('商品已移除')
}
const checkout = () => {
  if (cartItems.value.length === 0) {
    ElMessage.warning('购物车为空，无法结算')
    return
  }
  
  // 保存购物车数据到localStorage，以便结算页面使用
  localStorage.setItem(`checkout_${userId.value}`, JSON.stringify(cartItems.value))
  
  // 跳转到结算页面
  router.push('/checkout')
}
const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.cart {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 70px; /* 为底部导航栏预留空间 */
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.cart-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
}

.total {
  font-size: 18px;
}

.empty-cart {
  padding: 40px;
  text-align: center;
}
</style> 