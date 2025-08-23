<!-- 结算页面 -->
<template>
  <div class="checkout">
    <el-card>
      <template #header>
        <div class="checkout-header">
          <h2>商品结算</h2>
          <el-button @click="goBack">返回购物车</el-button>
        </div>
      </template>
      
      <div v-if="orderItems.length === 0" class="empty-checkout">
        <el-empty description="没有商品需要结算"></el-empty>
      </div>
      
      <div v-else>
        <h3>确认订单信息</h3>
        
        <el-table :data="orderItems" style="width: 100%">
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
        </el-table>
        
        <div class="address-info">
          <h3>收货地址</h3>
          <el-form :model="addressForm" label-width="120px">
            <el-form-item label="收货人姓名">
              <el-input v-model="addressForm.name" placeholder="请输入收货人姓名"></el-input>
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="addressForm.phone" placeholder="请输入联系电话"></el-input>
            </el-form-item>
            <el-form-item label="收货地址">
              <el-input v-model="addressForm.address" placeholder="请输入详细地址"></el-input>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="checkout-footer">
          <div class="total">
            总计: <span class="price">¥{{ total }}</span>
          </div>
          <el-button type="primary" size="large" @click="confirmOrder">确认付款</el-button>
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
const orderItems = ref([])
const userId = ref('')
const cartKey = ref('')

const addressForm = ref({
  name: '',
  phone: '',
  address: ''
})

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
  
  // 从localStorage中获取保存的购物车数据，作为订单数据
  const checkoutItems = localStorage.getItem(`checkout_${userData._id}`)
  if (checkoutItems) {
    orderItems.value = JSON.parse(checkoutItems)
  } else {
    // 如果没有结算数据，则返回购物车页面
    ElMessage.warning('没有需要结算的商品')
    router.push('/cart')
  }
})

const total = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.price, 0)
})

const confirmOrder = () => {
  // 验证表单
  if (!addressForm.value.name || !addressForm.value.phone || !addressForm.value.address) {
    ElMessage.warning('请填写完整的收货信息')
    return
  }
  
  // 保存订单信息到localStorage，以便支付页面使用
  const orderData = {
    name: addressForm.value.name,
    phone: addressForm.value.phone,
    address: addressForm.value.address,
    items: orderItems.value,
    total: total.value
  }
  
  localStorage.setItem('current_order', JSON.stringify(orderData))
  
  // 跳转到支付页面
  router.push('/payment')
}

const goBack = () => {
  router.push('/cart')
}
</script>

<style scoped>
.checkout {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 70px; /* 为底部导航栏预留空间 */
}

.checkout-header {
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

.checkout-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
}

.total {
  font-size: 18px;
}

.empty-checkout {
  padding: 40px;
  text-align: center;
}

.address-info {
  margin-top: 30px;
  margin-bottom: 30px;
}
</style> 