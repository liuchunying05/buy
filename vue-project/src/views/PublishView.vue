<!-- 发布商品页面 -->
<template>
  <div class="publish-page" v-loading.fullscreen.lock="loading" element-loading-text="正在提交...">
    <div class="publish-header">
      <div class="header-content">
        <el-page-header @back="goBack">
          <template #icon>
            <el-icon><ArrowLeft /></el-icon>
          </template>
          <template #title>
            <span class="header-title">返回</span>
          </template>
          <template #content>
            <span class="header-content-text">发布商品</span>
          </template>
        </el-page-header>
      </div>
    </div>

    <div class="publish-container">
      <div class="form-container">
        <h2 class="form-title">发布您的商品</h2>
        <div class="form-description">请填写以下信息，带 <span class="required-field">*</span> 的为必填项</div>
        
        <el-form :model="form" :rules="rules" ref="formRef" label-position="top" class="publish-form">
          <el-row :gutter="20">
            <el-col :md="14" :sm="24">
              <el-form-item label="商品名称" prop="name">
                <template #label>
                  <div class="custom-label">
                    <span class="required-field">*</span> 商品名称
                  </div>
                </template>
                <el-input 
                  v-model="form.name" 
                  placeholder="请输入商品名称"
                  maxlength="50"
                  show-word-limit
                ></el-input>
              </el-form-item>

              <el-form-item label="商品价格" prop="price">
                <template #label>
                  <div class="custom-label">
                    <span class="required-field">*</span> 商品价格
                  </div>
                </template>
                <el-input-number 
                  v-model="form.price" 
                  :min="0" 
                  :precision="2" 
                  :step="100"
                  class="price-input"
                  placeholder="请输入商品价格">
                </el-input-number>
                <span class="price-currency">元</span>
              </el-form-item>

              <el-form-item label="商品描述" prop="description">
                <template #label>
                  <div class="custom-label">
                    商品描述 <span class="optional-tag">(选填)</span>
                  </div>
                </template>
                <el-input
                  v-model="form.description"
                  type="textarea"
                  :rows="6"
                  maxlength="500"
                  show-word-limit
                  placeholder="请详细描述您的商品情况，如新旧程度、使用感受、出售原因等">
                </el-input>
                <div class="field-tip">如填写，请不少于10个字符</div>
              </el-form-item>
            </el-col>
            
            <el-col :md="10" :sm="24">
              <el-form-item label="商品图片" prop="image" class="image-upload-item">
                <template #label>
                  <div class="custom-label">
                    <span class="required-field">*</span> 商品图片
                  </div>
                </template>
                <div class="upload-container">
                  <el-upload
                    class="image-uploader"
                    action="#"
                    :auto-upload="false"
                    :on-change="handleImageChange"
                    :before-upload="beforeImageUpload"
                    :on-remove="handleImageRemove"
                    :limit="1"
                    list-type="picture-card">
                    <template #default>
                      <div class="upload-placeholder">
                        <el-icon class="upload-icon"><Plus /></el-icon>
                        <div class="upload-text">点击上传</div>
                      </div>
                    </template>
                    <template #file="{ file }">
                      <div class="upload-preview">
                        <img :src="file.url" class="preview-image" />
                        <div class="preview-actions">
                          <el-icon class="preview-delete" @click.stop="handleImageRemove"><Delete /></el-icon>
                        </div>
                      </div>
                    </template>
                  </el-upload>
                  <div class="upload-tips">
                    <el-icon><InfoFilled /></el-icon>
                    <span>只能上传jpg/png/gif文件，且不超过2MB</span>
                  </div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider></el-divider>

          <div class="form-actions">
            <el-button type="primary" size="large" @click="submitForm(formRef)" :loading="loading">
              <el-icon><Check /></el-icon> 发布商品
            </el-button>
            <el-button size="large" @click="resetForm(formRef)">
              <el-icon><Refresh /></el-icon> 重置
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Check, Refresh, Delete, InfoFilled, ArrowLeft } from '@element-plus/icons-vue'
import { uploadImage, publishProduct } from '../api'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

// 表单数据
const form = reactive({
  name: '',
  price: 0,
  image: '',
  description: '',
  imageFile: null
})

// 表单验证规则
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
  image: [
    { required: true, message: '请上传商品图片', trigger: 'change' }
  ],
  description: [
    { required: false },
    { min: 10, max: 500, message: '如果填写，长度需在 10 到 500 个字符', trigger: 'blur' }
  ]
})

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

// 处理图片上传
const handleImageChange = (file) => {
  if (file && file.raw) {
    form.imageFile = file.raw
    // 创建本地预览URL
    form.image = URL.createObjectURL(file.raw)
  }
}

// 处理图片移除
const handleImageRemove = () => {
  form.imageFile = null
  form.image = ''
}

// 提交表单
const submitForm = async (formEl) => {
  if (!formEl) return
  
  try {
    const valid = await formEl.validate()
    if (!valid) {
      return
    }

    loading.value = true

    // 1. 先上传图片
    let imageUrl = ''
    if (form.imageFile) {
      try {
        const uploadResult = await uploadImage(form.imageFile)
        imageUrl = uploadResult.url
      } catch (error) {
        ElMessage.error('图片上传失败，请重试')
        return
      }
    } else {
      ElMessage.error('请上传商品图片')
      return
    }

    // 获取当前用户信息
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    
    // 2. 提交商品信息
    const productData = {
      name: form.name.trim(),
      price: Number(form.price),
      image: imageUrl,
      description: form.description ? form.description.trim() : '暂无描述',
      userId: currentUser._id // 添加用户ID
    }

    try {
      const result = await publishProduct(productData)
      ElMessage.success('发布成功！')
      // 使用 replace 而不是 push，这样返回时不会有历史记录
      router.push({
        path: '/',
        query: { 
          refresh: Date.now() // 添加时间戳参数强制刷新列表
        }
      })
    } catch (error) {
      console.error('发布商品失败:', error)
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        for (const field in errors) {
          if (Array.isArray(errors[field]) && errors[field].length > 0) {
            ElMessage.error(errors[field][0])
            return
          }
        }
      }
      ElMessage.error('发布失败，请重试')
    }
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('请检查表单填写是否正确')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = (formEl) => {
  if (!formEl) return
  formEl.resetFields()
  form.imageFile = null
  form.image = ''
}

// 返回上一页
const goBack = () => {
  router.push({
    path: '/',
    query: { 
      refresh: Date.now() // 添加时间戳参数强制刷新列表
    }
  })
}
</script>

<style scoped>
.publish-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.publish-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
}

.header-title {
  font-size: 14px;
  color: #606266;
}

.header-content-text {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.publish-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.form-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.form-title {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #303133;
}

.form-description {
  margin-bottom: 30px;
  color: #606266;
  font-size: 14px;
}

.publish-form {
  margin-top: 20px;
}

.custom-label {
  font-weight: 500;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.required-field {
  color: #f56c6c;
  margin-right: 4px;
}

.optional-tag {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
  font-weight: normal;
}

.price-input {
  width: 200px;
}

.price-currency {
  margin-left: 10px;
  color: #606266;
}

.field-tip {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.image-upload-item {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.upload-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  background-color: #f8f9fa;
  padding: 20px;
}

.image-uploader {
  width: 100%;
  text-align: center;
}

:deep(.el-upload--picture-card) {
  width: 200px;
  height: 200px;
  line-height: normal;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

:deep(.el-upload--picture-card:hover) {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
}

.upload-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
}

.upload-tips {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 12px;
  margin-top: 15px;
}

.upload-tips .el-icon {
  margin-right: 5px;
  color: #e6a23c;
}

.upload-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.preview-actions {
  position: absolute;
  top: 0;
  right: 0;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 0 6px 0 6px;
}

.preview-delete {
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .form-container {
    padding: 20px 15px;
  }
  
  .publish-container {
    padding: 20px 10px;
  }
  
  :deep(.el-upload--picture-card) {
    width: 150px;
    height: 150px;
  }
}
</style> 