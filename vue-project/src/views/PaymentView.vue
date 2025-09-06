<!-- 支付页面 -->
<template>
  <div class="payment">
    <el-card v-if="!showQrCode">
      <template #header>
        <div class="payment-header">
          <h2>订单支付</h2>
          <el-button @click="goBack">返回订单</el-button>
        </div>
      </template>
      
      <div class="payment-info">
        <div class="order-summary">
          <h3>订单信息</h3>
          <p>订单号：{{ orderId }}</p>
          <p>收货人：{{ orderInfo.name }}</p>
          <p>联系电话：{{ orderInfo.phone }}</p>
          <p>收货地址：{{ orderInfo.address }}</p>
          <p class="total-amount">订单金额：<span class="price">¥{{ orderInfo.total }}</span></p>
        </div>
        
        <div class="payment-method">
          <h3>选择支付方式</h3>
          <el-radio-group v-model="paymentMethod">
            <div class="payment-option">
              <el-radio label="wechat">
                <div class="payment-logo">
                  <img src="/images/vx.jpg" alt="微信支付" onerror="this.src='https://via.placeholder.com/40x40?text=WeChat'">
                  <span>微信支付</span>
                </div>
              </el-radio>
            </div>
            <div class="payment-option">
              <el-radio label="alipay">
                <div class="payment-logo">
                  <img src="/images/zfb.jpg" alt="支付宝支付" onerror="this.src='https://via.placeholder.com/40x40?text=Alipay'">
                  <span>支付宝支付</span>
                </div>
              </el-radio>
            </div>
          </el-radio-group>
        </div>
      </div>
      
      <div class="payment-footer">
        <el-button 
          type="primary" 
          size="large" 
          @click="proceedToPayment" 
          :disabled="!paymentMethod"
        >立即支付</el-button>
      </div>
    </el-card>

    <!-- 统一支付页面 -->
    <div class="qrcode-payment-page" v-if="showQrCode">
      <div class="qrcode-header">
        <h2>{{ paymentMethod === 'wechat' ? '微信扫码支付' : '支付宝支付' }}</h2>
        <el-button plain class="cancel-btn" @click="cancelPayment">取消支付</el-button>
      </div>
      
      <div class="qrcode-wrapper">
        <div class="qrcode-container">
          <img :src="qrCodeImage" alt="支付二维码" class="qrcode">
        </div>
      </div>
      
      <p class="payment-hint">请使用{{ paymentMethod === 'wechat' ? '微信' : '支付宝' }}扫描二维码完成支付</p>
      
      <div class="action-buttons">
        <el-button 
          type="success" 
          size="large" 
          @click="completePayment" 
          class="mock-payment-btn"
        >模拟支付完成</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const paymentMethod = ref('')
const showQrCode = ref(false)
const qrCodeImage = ref('')
const orderId = ref(generateOrderId()) // 生成随机订单号
const orderInfo = ref({
  name: '',
  phone: '',
  address: '',
  total: 0
})

// 生成随机订单号
function generateOrderId() {
  const now = new Date()
  const timestamp = now.getTime().toString()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `ORDER${timestamp}${random}`
}

onMounted(() => {
  // 获取订单信息
  const orderData = localStorage.getItem('current_order')
  if (!orderData) {
    ElMessage.warning('订单信息不存在')
    router.push('/')
    return
  }
  
  orderInfo.value = JSON.parse(orderData)
})

// 选择支付方式后，显示对应的支付二维码
const proceedToPayment = () => {
  if (!paymentMethod.value) {
    ElMessage.warning('请选择支付方式')
    return
  }
  
  // 根据支付方式显示对应的二维码
  if (paymentMethod.value === 'wechat') {
    // 使用本地微信支付图片
    qrCodeImage.value = '/images/vx.jpg'
  } else {
    // 使用本地支付宝图片
    qrCodeImage.value = '/images/zfb.jpg'
  }
  
  showQrCode.value = true
}

// 取消支付
const cancelPayment = () => {
  showQrCode.value = false
  paymentMethod.value = ''
}

// 模拟支付完成（会按数量扣减商品库存）
const completePayment = async () => {
  try {
    // 获取当前用户信息
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    if (!userData._id) {
      ElMessage.error('用户信息不完整，请重新登录')
      router.push('/login')
      return
    }
    
    // 获取订单信息
    const currentOrder = JSON.parse(localStorage.getItem('current_order') || '{}')
    if (!currentOrder || !currentOrder.items || currentOrder.items.length === 0) {
      ElMessage.error('订单信息不完整')
      router.push('/')
      return
    }
    
    // 遍历每个商品分别创建订单并扣减库存
    const buyerOrders = JSON.parse(localStorage.getItem(`orders_${userData._id}`) || '[]')
    for (const item of currentOrder.items) {
      const quantity = item.quantity || 1
      const order = {
        id: generateOrderId(),
        date: new Date().toLocaleDateString(),
        status: 'pending',
        buyerId: userData._id,
        product: { ...item, quantity },
        sellerInfo: item.sellerId || 'unknown'
      }
      buyerOrders.push(order)

      if (item.sellerId) {
        const sellerKey = `seller_orders_${item.sellerId}`
        const sellerOrders = JSON.parse(localStorage.getItem(sellerKey) || '[]')
        sellerOrders.push({
          ...order,
          buyerInfo: {
            id: userData._id,
            name: userData.username,
            address: currentOrder.address,
            phone: currentOrder.phone
          }
        })
        localStorage.setItem(sellerKey, JSON.stringify(sellerOrders))
      }

      // 扣减库存：遍历所有商品并按数量扣减
      for (const item of currentOrder.items) {
        const quantity = item.quantity || 1
        try {
          if (item && item._id && (item.stock !== undefined && item.stock !== null)) {
            // 使用新的库存扣减接口
            const response = await fetch(`http://localhost:3000/api/products/${item._id}/stock`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ quantity })
            })
            
            if (!response.ok) {
              const errorData = await response.json()
              console.warn(`商品 ${item.name} 库存扣减失败:`, errorData.message)
            }
          } else if (item && (item._id || item.id)) {
            // 兜底：如果后端没有stock字段，扣减本地存储的库存
            const localStockKey = `stock_${item._id || item.id}`
            const localStock = localStorage.getItem(localStockKey)
            if (localStock !== null) {
              const currentStock = Number(localStock)
              const newStock = Math.max(0, currentStock - quantity)
              localStorage.setItem(localStockKey, String(newStock))
            }
          }
        } catch (e) {
          console.error(`商品 ${item.name} 库存扣减失败(已忽略):`, e)
        }
      }
    }
    localStorage.setItem(`orders_${userData._id}`, JSON.stringify(buyerOrders))

    // 清除订单数据
    localStorage.removeItem('current_order')
    
    // 清空购物车数据
    const cartKey = `cart_${userData._id}`
    localStorage.setItem(cartKey, '[]')
    localStorage.removeItem(`checkout_${userData._id}`)
    
    ElMessage.success('支付成功！订单已创建')
    
    // 跳转到个人中心的订单页面
    router.push('/profile')
  } catch (error) {
    console.error('创建订单失败:', error)
    ElMessage.error('支付成功，但创建订单失败')
    router.push('/')
  }
}

const goBack = () => {
  router.push('/checkout')
}
</script>

<style scoped>
.payment {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 70px; /* 为底部导航栏预留空间 */
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.payment-info {
  margin-bottom: 30px;
}

.order-summary {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.payment-method {
  margin-bottom: 30px;
}

.payment-option {
  padding: 10px 0;
}

.payment-logo {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.payment-logo img {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

/* 统一支付页面样式 */
.qrcode-payment-page {
  padding: 20px;
  background-color: #fff;
  min-height: 80vh;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.qrcode-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.qrcode-wrapper {
  display: flex;
  justify-content: center;
  margin: 40px 0;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.qrcode {
  width: 300px;
  height: 300px;
  border: 1px solid #eee;
  display: block;
  margin: 0 auto;
}

.payment-hint {
  color: #666;
  margin: 30px 0;
  font-size: 16px;
  text-align: center;
}

.payment-footer {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.total-amount {
  font-size: 18px;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.mock-payment-btn {
  width: 180px;
  height: 50px;
  font-size: 16px;
  background-color: #67c23a;
  border-color: #67c23a;
}

.cancel-btn {
  border: 1px solid #dcdfe6;
  color: #606266;
}
</style> 