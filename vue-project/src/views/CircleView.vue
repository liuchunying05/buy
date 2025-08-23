<!-- 圈子页面 -->
<template>
  <div class="circle-view">
    <el-container>
      <el-main v-loading="loading">
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
      </el-main>
    </el-container>

    <!-- 编辑商品对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑商品"
      width="50%"
      :before-close="handleEditDialogClose"
    >
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入商品名称"></el-input>
        </el-form-item>

        <el-form-item label="商品价格" prop="price">
          <el-input-number 
            v-model="editForm.price" 
            :min="0" 
            :precision="2" 
            :step="100"
            placeholder="请输入商品价格">
          </el-input-number>
        </el-form-item>

        <el-form-item label="商品图片">
          <div class="current-image">
            <img :src="getImagePath(editForm.image)" class="edit-image-preview">
          </div>
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleEditImageChange"
            :before-upload="beforeImageUpload"
            :on-remove="handleEditImageRemove"
            :limit="1"
            list-type="picture-card">
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                只能上传jpg/png/gif文件，且不超过2MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品描述（选填）">
          </el-input>
          <span class="optional-tip">选填，如填写请不少于10个字符</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleEditDialogClose">取消</el-button>
          <el-button type="primary" @click="updateProduct" :loading="updating">
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus, Search } from '@element-plus/icons-vue'
import axios from 'axios'
const router = useRouter()
const loading = ref(false)
const updating = ref(false)
const myProducts = ref([])
const friendProducts = ref([])
const searchKeyword = ref('')
const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
// 编辑相关
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
// 验证规则
const rules = reactive({
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value === null || value === undefined || value === '') {
          callback(new Error('请输入商品价格'))
        } else if (value <= 0) {
          callback(new Error('价格必须大于0'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  description: [
    { required: false },
    { min: 10, max: 500, message: '如果填写，长度需在 10 到 500 个字符', trigger: 'blur' }
  ]
})

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
// 获取自己的商品和好友的商品
const fetchCircleProducts = async () => {
  if (!currentUser._id) {
    ElMessage.error('用户未登录')
    router.push('/login')
    return
  }
  loading.value = true
  try {
    // 获取自己发布的商品
    const myProductsRes = await axios.get(`http://localhost:3000/api/products/user/${currentUser._id}`)
    console.log('获取到的个人商品数据:', myProductsRes.data)
    myProducts.value = myProductsRes.data.map(item => {
      // 打印每个商品的图片路径
      console.log(`商品[${item.name}]的图片路径:`, item.image)
      return item
    })

    // 获取好友发布的商品
    const friendProductsRes = await axios.get(`http://localhost:3000/api/products/friends/${currentUser._id}`)
    console.log('获取到的好友商品数据:', friendProductsRes.data)
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

// 关闭编辑对话框
const handleEditDialogClose = () => {
  editDialogVisible.value = false
  if (editForm.imageFile && editForm.imageFile.raw) {
    URL.revokeObjectURL(editForm.tempImageUrl)
  }
}

// 图片上传前的验证
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

// 处理编辑时的图片上传
const handleEditImageChange = (file) => {
  if (file && file.raw) {
    editForm.imageFile = file.raw
    // 创建本地预览URL
    editForm.tempImageUrl = URL.createObjectURL(file.raw)
    editForm.image = editForm.tempImageUrl
  }
}

// 处理编辑时的图片移除
const handleEditImageRemove = () => {
  if (editForm.tempImageUrl) {
    URL.revokeObjectURL(editForm.tempImageUrl)
  }
  editForm.imageFile = null
  editForm.tempImageUrl = null
  // 恢复原来的图片
  const product = myProducts.value.find(p => p._id === editForm._id)
  if (product) {
    editForm.image = product.image
  }
}

// 更新商品信息
const updateProduct = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    
    updating.value = true
    let imageUrl = editForm.image
    
    // 如果有新上传的图片，先上传图片
    if (editForm.imageFile) {
      try {
        const formData = new FormData()
        formData.append('image', editForm.imageFile)
        const uploadResult = await axios.post('http://localhost:3000/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        imageUrl = uploadResult.data.url
      } catch (error) {
        ElMessage.error('图片上传失败，请重试')
        return
      }
    }
    // 更新商品信息
    const productData = {
      name: editForm.name.trim(),
      price: Number(editForm.price),
      image: imageUrl,
      description: editForm.description ? editForm.description.trim() : '暂无描述'
    }
    await axios.put(`http://localhost:3000/api/products/${editForm._id}`, productData)
    ElMessage.success('商品信息更新成功')
    editDialogVisible.value = false
    // 重新获取商品列表
    fetchCircleProducts()
  } catch (error) {
    console.error('更新商品失败:', error)
    ElMessage.error('更新失败，请重试')
  } finally {
    updating.value = false
  }
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

onMounted(() => {
  fetchCircleProducts()
})
</script>

<style scoped>
.circle-view {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.el-main {
  padding: 20px;
  padding-bottom: 80px;
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

.edit-image-preview {
  width: 100%;
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
  margin-bottom: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.optional-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  display: block;
}
</style> 