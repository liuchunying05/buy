<!-- 个人资料页面 -->
<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-sidebar">
        <div class="user-profile-card">
          <div class="avatar-container">
            <el-avatar :size="120" :src="userAvatar" @error="handleAvatarError">
              {{ userInitial }}
            </el-avatar>
            <div class="avatar-upload">
              <el-upload
                class="avatar-uploader"
                action="http://localhost:3000/api/upload"
                :headers="uploadHeaders"
                name="image"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :on-error="handleAvatarError"
                :before-upload="beforeAvatarUpload"
                accept="image/jpeg,image/png,image/gif">
                <el-button size="small" type="primary" class="upload-button">更换头像</el-button>
              </el-upload>
            </div>
          </div>
          <h2 class="username">{{ userForm.username }}</h2>
          <div class="user-status">
            <span class="status-dot" :class="{'online': userForm.status === '在线', 'offline': userForm.status === '离线', 'busy': userForm.status === '忙碌'}"></span>
            <span>{{ userForm.status }}</span>
          </div>
        </div>
        
        <div class="sidebar-menu">
          <div class="menu-item" :class="{ active: activeTab === 'profile' }" @click="activeTab = 'profile'">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </div>
          <div class="menu-item" :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">
            <el-icon><Document /></el-icon>
            <span>我的订单</span>
          </div>
          <div class="menu-item" :class="{ active: activeTab === 'circle' }" @click="activeTab = 'circle'">
            <el-icon><Connection /></el-icon>
            <span>我的圈子</span>
          </div>
          <div class="menu-item" :class="{ active: activeTab === 'cart' }" @click="activeTab = 'cart'">
            <el-icon><ShoppingCart /></el-icon>
            <span>我的购物车</span>
          </div>
        </div>
      </div>
      
      <div class="profile-content">
        <!-- 个人资料内容 -->
        <div v-if="activeTab === 'profile'">
          <el-card class="profile-card">
            <template #header>
              <div class="card-header">
                <h3>个人信息</h3>
                <el-button type="primary" @click="updateProfile" size="small">保存修改</el-button>
              </div>
            </template>
            
            <el-form :model="userForm" label-position="top">
              <el-form-item label="用户名">
                <el-input v-model="userForm.username" disabled>
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              
              <el-form-item label="状态">
                <el-select v-model="userForm.status" placeholder="请选择状态" class="status-select">
                  <el-option label="在线" value="在线">
                    <div class="status-option">
                      <span class="status-dot online"></span>
                      <span>在线</span>
                    </div>
                  </el-option>
                  <el-option label="离线" value="离线">
                    <div class="status-option">
                      <span class="status-dot offline"></span>
                      <span>离线</span>
                    </div>
                  </el-option>
                  <el-option label="忙碌" value="忙碌">
                    <div class="status-option">
                      <span class="status-dot busy"></span>
                      <span>忙碌</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </el-card>
          
          <el-card class="profile-card security-card">
            <template #header>
              <div class="card-header">
                <h3>账号安全</h3>
              </div>
            </template>
            
            <div class="security-options">
              <div class="security-item">
                <div class="security-info">
                  <el-icon><Lock /></el-icon>
                  <div>
                    <h4>密码</h4>
                    <p>上次修改: 未知</p>
                  </div>
                </div>
                <el-button @click="showChangePasswordDialog = true">修改密码</el-button>
              </div>
              
              <div class="security-item">
                <div class="security-info">
                  <el-icon><SwitchButton /></el-icon>
                  <div>
                    <h4>账号切换</h4>
                    <p>登录其他账号</p>
                  </div>
                </div>
                <el-button type="primary" @click="showSwitchAccountDialog = true">切换账号</el-button>
              </div>
              
              <div class="security-item">
                <div class="security-info">
                  <el-icon><Close /></el-icon>
                  <div>
                    <h4>退出登录</h4>
                    <p>安全退出当前账号</p>
                  </div>
                </div>
                <el-button type="danger" @click="logout">退出登录</el-button>
              </div>
            </div>
          </el-card>
        </div>
        
        <!-- 订单管理内容 -->
        <div v-if="activeTab === 'orders'">
          <el-card class="orders-card">
            <template #header>
              <div class="card-header">
                <h3>我的订单</h3>
              </div>
            </template>
            
            <el-tabs v-model="orderTabActive">
              <el-tab-pane label="全部商品" name="all">
                <div v-if="orders.length === 0" class="empty-orders">
                  <el-empty description="暂无订单"></el-empty>
                </div>
                <div v-else class="order-list">
                  <div v-for="order in orders" :key="order.id" class="order-item">
                    <div class="order-header">
                      <span class="order-id">订单号: {{ order.id }}</span>
                      <span class="order-date">{{ order.date }}</span>
                      <span class="order-status" :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</span>
                    </div>
                    <div class="order-content">
                      <div class="order-product">
                        <img :src="order.product.image" :alt="order.product.name" class="product-image">
                        <div class="product-info">
                          <h4>{{ order.product.name }}</h4>
                          <p class="product-price">¥{{ order.product.price }}</p>
                        </div>
                      </div>
                      <div class="order-delivery" v-if="order.status === 'shipped'">
                        <p>预计送达时间: {{ order.deliveryTime }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="待发货" name="pending">
                <div v-if="pendingOrders.length === 0" class="empty-orders">
                  <el-empty description="暂无待发货订单"></el-empty>
                </div>
                <div v-else class="order-list">
                  <div v-for="order in pendingOrders" :key="order.id" class="order-item">
                    <div class="order-header">
                      <span class="order-id">订单号: {{ order.id }}</span>
                      <span class="order-date">{{ order.date }}</span>
                      <span class="order-status pending">待发货</span>
                    </div>
                    <div class="order-content">
                      <div class="order-product">
                        <img :src="order.product.image" :alt="order.product.name" class="product-image">
                        <div class="product-info">
                          <h4>{{ order.product.name }}</h4>
                          <p class="product-price">¥{{ order.product.price }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="已发货" name="shipped">
                <div v-if="shippedOrders.length === 0" class="empty-orders">
                  <el-empty description="暂无已发货订单"></el-empty>
                </div>
                <div v-else class="order-list">
                  <div v-for="order in shippedOrders" :key="order.id" class="order-item">
                    <div class="order-header">
                      <span class="order-id">订单号: {{ order.id }}</span>
                      <span class="order-date">{{ order.date }}</span>
                      <span class="order-status shipped">已发货</span>
                    </div>
                    <div class="order-content">
                      <div class="order-product">
                        <img :src="order.product.image" :alt="order.product.name" class="product-image">
                        <div class="product-info">
                          <h4>{{ order.product.name }}</h4>
                          <p class="product-price">¥{{ order.product.price }}</p>
                        </div>
                      </div>
                      <div class="order-delivery">
                        <p>预计送达时间: {{ order.deliveryTime }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>
          
          <!-- 卖家订单管理 -->
          <el-card class="seller-orders-card">
            <template #header>
              <div class="card-header">
                <h3>我的销售订单</h3>
              </div>
            </template>
            
            <div v-if="sellerOrders.length === 0" class="empty-orders">
              <el-empty description="暂无销售订单"></el-empty>
            </div>
            <div v-else class="order-list">
              <div v-for="order in sellerOrders" :key="order.id" class="order-item">
                <div class="order-header">
                  <span class="order-id">订单号: {{ order.id }}</span>
                  <span class="order-date">{{ order.date }}</span>
                  <span class="order-status" :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</span>
                </div>
                <div class="order-content">
                  <div class="order-product">
                    <img :src="order.product.image" :alt="order.product.name" class="product-image">
                    <div class="product-info">
                      <h4>{{ order.product.name }}</h4>
                      <p class="product-price">¥{{ order.product.price }}</p>
                    </div>
                  </div>
                  <div class="buyer-info">
                    <h4>买家信息</h4>
                    <p>买家: {{ order.buyerInfo?.name || '匿名用户' }}</p>
                    <p>联系电话: {{ order.buyerInfo?.phone || '未提供' }}</p>
                    <p>收货地址: {{ order.buyerInfo?.address || '未提供' }}</p>
                  </div>
                  <div class="order-actions">
                    <el-button 
                      v-if="order.status === 'pending'" 
                      type="primary" 
                      size="small" 
                      @click="acceptOrder(order.id)"
                    >接单</el-button>
                    <div v-if="order.status === 'shipped'" class="delivery-info">
                      <p>预计送达时间: {{ order.deliveryTime }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 我的圈子内容（同页渲染） -->
        <div v-if="activeTab === 'circle'" class="tab-content">
          <div class="circle-content">
            <!-- 搜索区域 -->
            <div class="page-header">
              <h1 class="page-title">我的圈子</h1>
              <div class="page-search">
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索商品"
                  clearable
                  @keyup.enter="searchProducts"
                >
                  <template #append>
                    <el-button @click="searchProducts">
                      <el-icon><Search /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </div>
            </div>

            <!-- 我的发布 -->
            <div class="circle-section">
              <h2 class="section-title">我的发布</h2>
              <div v-if="myProducts.length === 0" class="empty-tip">
                你还没有发布过商品，去<router-link to="/publish">发布</router-link>一个吧！
              </div>
              <el-row :gutter="20" v-else>
                <el-col :span="6" v-for="item in myProducts" :key="item._id">
                  <el-card class="product-card">
                    <div class="product-actions">
                      <el-button type="primary" size="small" circle @click="editProduct(item)">
                        <el-icon><Edit /></el-icon>
                      </el-button>
                      <el-button type="danger" size="small" circle @click="confirmDelete(item)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                    <div class="product-content" @click="showDetail(item)">
                      <img :src="getImagePath(item.image)" class="product-image">
                      <div class="product-info">
                        <h3>{{ item.name }}</h3>
                        <p class="price">¥{{ item.price }}</p>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>

            <!-- 好友发布 -->
            <div class="circle-section">
              <h2 class="section-title">好友发布</h2>
              <div v-if="friendProducts.length === 0" class="empty-tip">
                暂无好友发布的商品，去<router-link to="/friends">添加好友</router-link>吧！
              </div>
              <el-row :gutter="20" v-else>
                <el-col :span="6" v-for="item in friendProducts" :key="item._id">
                  <el-card class="product-card" @click="showDetail(item)">
                    <img :src="getImagePath(item.image)" class="product-image">
                    <div class="product-info">
                      <h3>{{ item.name }}</h3>
                      <p class="price">¥{{ item.price }}</p>
                      <p class="publisher">发布者: {{ item.publisherName }}</p>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>

        <!-- 我的购物车内容（同页渲染） -->
        <div v-if="activeTab === 'cart'" class="tab-content">
          <div class="cart-content">
            <el-card class="profile-card">
              <template #header>
                <div class="card-header">
                  <h3>我的购物车</h3>
                  <el-button @click="goToCartPage">查看完整购物车</el-button>
                </div>
              </template>
              
              <div v-if="cartItems.length === 0" class="empty-cart">
                <el-empty description="购物车是空的"></el-empty>
              </div>
              
              <div v-else>
                <el-table :data="cartItems" style="width: 100%">
                  <el-table-column prop="image" label="商品图片" width="120">
                    <template #default="scope">
                      <img :src="getImagePath(scope.row.image)" :alt="scope.row.name" class="cart-product-image">
                    </template>
                  </el-table-column>
                  
                  <el-table-column prop="name" label="商品名称"></el-table-column>
                  
                  <el-table-column prop="price" label="价格" width="120">
                    <template #default="scope">
                      <span class="price">¥{{ scope.row.price }}</span>
                    </template>
                  </el-table-column>
                  
                  <el-table-column label="操作" width="100">
                    <template #default="scope">
                      <el-button type="danger" size="small" @click="removeFromCart(scope.$index)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                
                <div class="cart-footer">
                  <div class="total">
                    总计: <span class="price">¥{{ cartTotal }}</span>
                  </div>
                  <el-button type="primary" size="large" @click="goToCheckout">结算</el-button>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 修改密码对话框 -->
    <el-dialog
      title="修改密码"
      v-model="showChangePasswordDialog"
      width="400px">
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="当前密码">
          <el-input v-model="passwordForm.oldPassword" type="password"></el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input v-model="passwordForm.confirmPassword" type="password"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showChangePasswordDialog = false">取消</el-button>
          <el-button type="primary" @click="changePassword">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 切换账号对话框 -->
    <el-dialog
      title="切换账号"
      v-model="showSwitchAccountDialog"
      width="400px">
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSwitchAccountDialog = false">取消</el-button>
          <el-button type="primary" @click="switchAccount">登录</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { User, Connection, ShoppingCart, Lock, SwitchButton, Close, Document, Search, Edit, Delete } from '@element-plus/icons-vue'

const router = useRouter()
const activeTab = ref('profile') // 默认显示个人资料页
const orderTabActive = ref('all') // 默认显示全部订单

const userForm = reactive({
  username: '',
  status: '在线',
  avatar: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loginForm = reactive({
  username: '',
  password: ''
})

const showChangePasswordDialog = ref(false)
const showSwitchAccountDialog = ref(false)
const avatarFile = ref(null)

// 订单相关数据
const orders = ref([])
const sellerOrders = ref([])

// 圈子相关数据
const myProducts = ref([])
const friendProducts = ref([])
const searchKeyword = ref('')
const loading = ref(false)
const updating = ref(false)
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  _id: '',
  name: '',
  price: 0,
  image: '',
  description: '',
  imageFile: null
})

// 购物车相关数据
const cartItems = ref([])
const cartKey = ref('')

// 计算属性：待发货订单
const pendingOrders = computed(() => {
  return orders.value.filter(order => order.status === 'pending')
})

// 计算属性：已发货订单
const shippedOrders = computed(() => {
  return orders.value.filter(order => order.status === 'shipped')
})

// 计算属性：购物车总价
const cartTotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price, 0)
})

// 上传头像所需的headers
const uploadHeaders = ref({})

// 计算属性：用户头像
const userAvatar = computed(() => {
  if (userForm.avatar) {
    // 如果是本地预览URL或完整URL，直接返回
    if (userForm.avatar.startsWith('blob:') || userForm.avatar.startsWith('http://') || userForm.avatar.startsWith('https://')) {
      return userForm.avatar
    }
    // 如果是服务器路径，拼接完整URL
    return `http://localhost:3000${userForm.avatar}`
  }
  return ''
})

// 计算属性：用户名首字母（用于头像占位符）
const userInitial = computed(() => {
  return userForm.username ? userForm.username.charAt(0).toUpperCase() : 'U'
})

// 处理头像加载错误
const handleAvatarError = (err) => {
  console.error('头像加载错误:', err)
  // 使用默认头像
  userForm.avatar = ''
}

// 上传前验证
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('头像必须是图片格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 上传成功回调
const handleAvatarSuccess = async (response, file) => {
  if (response && response.url) {
    userForm.avatar = response.url
    
    // 更新用户资料
    try {
      const userData = JSON.parse(localStorage.getItem('user'))
      if (userData && userData._id) {
        const updateResponse = await axios.put(`http://localhost:3000/api/users/${userData._id}`, {
          avatar: userForm.avatar
        })
        
        if (updateResponse.data.success) {
          // 更新本地存储
          userData.avatar = userForm.avatar
          localStorage.setItem('user', JSON.stringify(userData))
          
          ElMessage.success('头像更新成功')
        } else {
          // 即使API返回失败，也不跳转，只显示错误信息
          ElMessage.error('头像更新失败，但已上传到服务器')
        }
      } else {
        // 用户数据不完整，但不跳转
        ElMessage.error('用户信息不完整，头像已上传但未保存到个人资料')
        // 不要在这里调用 router.push('/login')
      }
    } catch (error) {
      console.error('更新用户资料失败:', error)
      ElMessage.error('头像已上传但未能更新到个人资料')
      // 不要在这里跳转到登录页面
    }
  } else {
    ElMessage.error('服务器返回数据格式错误')
  }
}

// 更新个人资料
const updateProfile = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem('user'))
    if (!userData || !userData._id) {
      ElMessage.error('用户信息不完整，请重新登录')
      router.push('/login')
      return
    }
    
    // 更新用户资料
    const response = await axios.put(`http://localhost:3000/api/users/${userData._id}`, {
      status: userForm.status,
      avatar: userForm.avatar
    })
    
    if (response.data.success) {
      // 更新本地存储的用户信息
      const updatedUserData = {
        ...userData,
        status: userForm.status,
        avatar: userForm.avatar
      }
      localStorage.setItem('user', JSON.stringify(updatedUserData))
      
      ElMessage.success('个人资料更新成功')
    }
  } catch (error) {
    console.error('更新个人资料失败:', error)
    ElMessage.error('更新个人资料失败')
  }
}

// 修改密码
const changePassword = async () => {
  try {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      ElMessage.error('两次输入的新密码不一致')
      return
    }
    
    const userData = JSON.parse(localStorage.getItem('user'))
    if (!userData || !userData._id) {
      ElMessage.error('用户信息不完整，请重新登录')
      router.push('/login')
      return
    }
    
    const response = await axios.post(`http://localhost:3000/api/users/change-password`, {
      userId: userData._id,
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    
    if (response.data.success) {
      ElMessage.success('密码修改成功')
      showChangePasswordDialog.value = false
      // 清空表单
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error(error.response?.data?.message || '修改密码失败')
  }
}

// 退出登录
const logout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}

// 切换账号
const switchAccount = async () => {
  try {
    if (!loginForm.username || !loginForm.password) {
      ElMessage.error('请填写完整的登录信息')
      return
    }
    
    const response = await axios.post('http://localhost:3000/api/users/login', {
      username: loginForm.username,
      password: loginForm.password
    })
    
    if (response.data.success) {
      // 保存新用户信息
      localStorage.setItem('user', JSON.stringify(response.data.user))
      ElMessage.success('账号切换成功')
      showSwitchAccountDialog.value = false
      // 清空表单
      loginForm.username = ''
      loginForm.password = ''
      // 刷新页面数据
      loadUserData()
      // 加载订单数据
      loadOrders()
    }
  } catch (error) {
    console.error('账号切换失败:', error)
    ElMessage.error('账号切换失败，请检查用户名和密码')
  }
}

// 加载用户数据
const loadUserData = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('user'))
    if (!userData) {
      // 只有在个人资料页面首次加载且没有用户数据时才跳转
      if (router.currentRoute.value.path === '/profile') {
        router.push('/login')
      }
      return
    }
    
    userForm.username = userData.username || ''
    userForm.status = userData.status || '在线'
    userForm.avatar = userData.avatar || ''
    
    console.log('加载的用户数据:', userForm)
  } catch (error) {
    console.error('加载用户数据失败:', error)
    ElMessage.error('加载用户数据失败')
    // 只有在解析用户数据出错时才跳转
    if (router.currentRoute.value.path === '/profile') {
      router.push('/login')
    }
  }
}

// 加载订单数据
const loadOrders = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem('user'))
    if (!userData || !userData._id) {
      return
    }
    
    // 从localStorage中获取买家订单数据
    const ordersData = JSON.parse(localStorage.getItem(`orders_${userData._id}`) || '[]')
    orders.value = ordersData
    
    // 从localStorage中获取卖家订单数据
    const sellerOrdersData = JSON.parse(localStorage.getItem(`seller_orders_${userData._id}`) || '[]')
    sellerOrders.value = sellerOrdersData
    
    // 如果没有卖家订单数据，尝试使用固定ID加载示例数据（仅用于演示）
    if (sellerOrders.value.length === 0) {
      // 尝试加载示例卖家ID的订单
      const demoSellerId = '123456' // 与PaymentView.vue中使用的固定卖家ID一致
      if (userData._id === demoSellerId || userData.username === '刘室室') {
        const demoSellerOrders = JSON.parse(localStorage.getItem(`seller_orders_${demoSellerId}`) || '[]')
        sellerOrders.value = demoSellerOrders
      }
    }
    
    console.log('加载的订单数据:', orders.value)
    console.log('加载的卖家订单数据:', sellerOrders.value)
  } catch (error) {
    console.error('加载订单数据失败:', error)
    ElMessage.error('加载订单数据失败')
  }
}

// 获取订单状态类名
const getStatusClass = (status) => {
  switch(status) {
    case 'pending':
      return 'pending'
    case 'shipped':
      return 'shipped'
    default:
      return ''
  }
}

// 获取订单状态文本
const getStatusText = (status) => {
  switch(status) {
    case 'pending':
      return '待发货'
    case 'shipped':
      return '已发货'
    default:
      return '未知状态'
  }
}

// 接单处理
const acceptOrder = (orderId) => {
  try {
    const userData = JSON.parse(localStorage.getItem('user'))
    if (!userData || !userData._id) {
      ElMessage.error('用户信息不完整，请重新登录')
      return
    }
    
    // 更新卖家订单状态
    const updatedSellerOrders = sellerOrders.value.map(order => {
      if (order.id === orderId) {
        // 设置送达时间为当前时间后1小时
        const deliveryTime = new Date()
        deliveryTime.setHours(deliveryTime.getHours() + 1)
        const formattedTime = `${deliveryTime.getHours()}:${String(deliveryTime.getMinutes()).padStart(2, '0')}`
        
        return {
          ...order,
          status: 'shipped',
          deliveryTime: formattedTime
        }
      }
      return order
    })
    
    sellerOrders.value = updatedSellerOrders
    localStorage.setItem(`seller_orders_${userData._id}`, JSON.stringify(updatedSellerOrders))
    
    // 更新买家的订单状态
    const buyerId = sellerOrders.value.find(order => order.id === orderId)?.buyerId
    if (buyerId) {
      const buyerOrders = JSON.parse(localStorage.getItem(`orders_${buyerId}`) || '[]')
      const updatedBuyerOrders = buyerOrders.map(order => {
        if (order.id === orderId) {
          // 使用相同的送达时间
          const deliveryTime = new Date()
          deliveryTime.setHours(deliveryTime.getHours() + 1)
          const formattedTime = `${deliveryTime.getHours()}:${String(deliveryTime.getMinutes()).padStart(2, '0')}`
          
          return {
            ...order,
            status: 'shipped',
            deliveryTime: formattedTime
          }
        }
        return order
      })
      
      localStorage.setItem(`orders_${buyerId}`, JSON.stringify(updatedBuyerOrders))
    }
    
    ElMessage.success('已成功接单')
  } catch (error) {
    console.error('接单失败:', error)
    ElMessage.error('接单失败')
  }
}

// 圈子相关方法
// 获取自己的商品和好友的商品
const fetchCircleProducts = async () => {
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  if (!userData._id) {
    ElMessage.error('用户未登录')
    router.push('/login')
    return
  }
  loading.value = true
  try {
    // 获取自己发布的商品
    const myProductsRes = await axios.get(`http://localhost:3000/api/products/user/${userData._id}`)
    myProducts.value = myProductsRes.data.map(item => {
      return item
    })

    // 获取好友发布的商品
    const friendProductsRes = await axios.get(`http://localhost:3000/api/products/friends/${userData._id}`)
    friendProducts.value = friendProductsRes.data
  } catch (error) {
    console.error('获取圈子商品失败:', error)
    if (error.response) {
      console.error('错误响应数据:', error.response.data)
    }
    ElMessage.error('获取商品数据失败，请重试')
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

// 搜索商品
const searchProducts = () => {
  if (!searchKeyword.value.trim()) {
    fetchCircleProducts() // 如果搜索关键词为空，显示所有商品
    return
  }
  const keyword = searchKeyword.value.trim().toLowerCase()
  // 筛选我的商品
  myProducts.value = myProducts.value.filter(product => 
    product.name.toLowerCase().includes(keyword) || 
    (product.description && product.description.toLowerCase().includes(keyword))
  )
  // 筛选好友商品
  friendProducts.value = friendProducts.value.filter(product => 
    product.name.toLowerCase().includes(keyword) || 
    (product.description && product.description.toLowerCase().includes(keyword)) ||
    (product.publisherName && product.publisherName.toLowerCase().includes(keyword))
  )
}

// 打开编辑对话框
const editProduct = (product) => {
  Object.assign(editForm, {
    _id: product._id,
    name: product.name,
    price: product.price,
    image: product.image,
    description: product.description || '',
    imageFile: null
  })
  editDialogVisible.value = true
}

// 确认删除商品
const confirmDelete = (product) => {
  ElMessageBox.confirm(
    `确定要删除商品 "${product.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deleteProduct(product._id)
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 删除商品
const deleteProduct = async (productId) => {
  try {
    await axios.delete(`http://localhost:3000/api/products/${productId}`)
    ElMessage.success('商品已成功删除')
    
    // 从列表中移除该商品
    myProducts.value = myProducts.value.filter(item => item._id !== productId)
  } catch (error) {
    console.error('删除商品失败:', error)
    ElMessage.error('删除失败，请重试')
  }
}

// 购物车相关方法
// 加载购物车数据
const loadCartData = () => {
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  if (userData._id) {
    cartKey.value = `cart_${userData._id}`
    cartItems.value = JSON.parse(localStorage.getItem(cartKey.value) || '[]')
  }
}

// 从购物车删除商品
const removeFromCart = (index) => {
  cartItems.value.splice(index, 1)
  localStorage.setItem(cartKey.value, JSON.stringify(cartItems.value))
  ElMessage.success('商品已移除')
}

// 跳转到完整购物车页面
const goToCartPage = () => {
  router.push('/cart')
}

// 跳转到结算页面
const goToCheckout = () => {
  if (cartItems.value.length === 0) {
    ElMessage.warning('购物车为空，无法结算')
    return
  }
  
  // 保存购物车数据到localStorage，以便结算页面使用
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  localStorage.setItem(`checkout_${userData._id}`, JSON.stringify(cartItems.value))
  
  // 跳转到结算页面
  router.push('/checkout')
}

onMounted(() => {
  loadUserData()
  loadOrders()
  
  // 设置上传头像所需的headers
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  if (userData && userData._id) {
    uploadHeaders.value = {
      'Authorization': `Bearer ${userData._id}` // 如果后端需要认证
    }
  }
  
  // 加载圈子数据
  fetchCircleProducts()
  
  // 加载购物车数据
  loadCartData()
})
</script>

<style scoped>
.profile-page {
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
  padding: 30px 20px;
}

.profile-container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  gap: 30px;
  padding-bottom: 60px;
}

.profile-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.profile-content {
  flex-grow: 1;
}

.user-profile-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-upload {
  margin-top: 15px;
}

.username {
  margin: 15px 0 5px;
  font-size: 20px;
  color: #303133;
}

.user-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #606266;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.online {
  background-color: #67c23a;
}

.offline {
  background-color: #909399;
}

.busy {
  background-color: #e6a23c;
}

.sidebar-menu {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.menu-item {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
  color: #606266;
}

.menu-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.menu-item.active {
  background-color: #ecf5ff;
  color: #409eff;
  border-left: 3px solid #409eff;
}

.profile-card, .orders-card, .seller-orders-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #303133;
}

.status-select {
  width: 100%;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.security-card {
  margin-bottom: 60px;
}

.security-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.security-item:last-child {
  border-bottom: none;
}

.security-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.security-info h4 {
  margin: 0 0 5px 0;
  color: #303133;
}

.security-info p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

/* 订单相关样式 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.order-id {
  font-weight: bold;
  color: #303133;
}

.order-date {
  color: #909399;
}

.order-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.order-status.pending {
  background-color: #e6a23c;
}

.order-status.shipped {
  background-color: #67c23a;
}

.order-content {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-product {
  display: flex;
  align-items: center;
  gap: 15px;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.product-info h4 {
  margin: 0 0 5px 0;
  color: #303133;
}

.product-price {
  color: #f56c6c;
  font-weight: bold;
  margin: 0;
}

.order-delivery {
  color: #67c23a;
}

.order-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.delivery-info {
  color: #67c23a;
}

.empty-orders {
  padding: 30px 0;
}

.seller-orders-card {
  margin-top: 30px;
}

.buyer-info {
  background-color: #f8f8f8;
  padding: 10px 15px;
  border-radius: 4px;
  margin-right: 15px;
}

.buyer-info h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 14px;
}

.buyer-info p {
  margin: 4px 0;
  color: #606266;
  font-size: 13px;
}

/* 添加悬浮按钮样式 */
.floating-button {
  position: fixed;
  right: 40px;
  bottom: 80px;
  z-index: 1000;
}

/* 标签页内容样式 */
.tab-content {
  min-height: 400px;
  padding: 20px;
}

.loading-placeholder {
  padding: 40px;
  text-align: center;
}

.error-message {
  margin: 20px 0;
}

.coming-soon {
  text-align: center;
  padding: 40px 20px;
}

/* 自定义圆形加号按钮 */

/* 圈子相关样式 */
.circle-content {
  min-height: 400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: #409EFF;
}

.page-search {
  width: 300px;
}

.circle-section {
  margin-bottom: 40px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 20px;
  color: #303133;
  margin-bottom: 20px;
  border-left: 4px solid #409EFF;
  padding-left: 10px;
}

.product-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
  height: 320px;
  overflow: hidden;
  position: relative;
}

.product-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 5;
  display: flex;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

.product-card:hover .product-actions {
  opacity: 1;
}

.product-content {
  cursor: pointer;
  height: 100%;
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

.empty-tip {
  text-align: center;
  color: #909399;
  padding: 30px 0;
}

.empty-tip a {
  color: #409EFF;
  text-decoration: none;
}

/* 购物车相关样式 */
.cart-content {
  min-height: 400px;
}

.cart-product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.cart-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
}

.cart-footer .total {
  font-size: 18px;
}

.empty-cart {
  padding: 40px;
  text-align: center;
}
</style> 