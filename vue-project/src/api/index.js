import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // 这里替换为您的实际后端API地址
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const user = localStorage.getItem('user')
    if (user) {
      config.headers.Authorization = `Bearer ${JSON.parse(user).token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          router.push('/login')
          break
        case 422:
          // 直接返回验证错误信息
          return Promise.reject({
            response: {
              data: {
                errors: error.response.data.errors || {
                  general: ['验证失败']
                }
              }
            }
          })
        default:
          return Promise.reject(new Error(error.response.data?.message || '请求失败'))
      }
    }
    return Promise.reject(new Error('网络错误，请检查您的网络连接'))
  }
)

// 上传图片
export const uploadImage = async (file) => {
  try {
    console.log('开始上传图片:', file.name)
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        console.log('上传进度:', percentCompleted + '%')
      }
    })
    
    console.log('上传成功:', response)
    return response
  } catch (error) {
    console.error('上传失败:', error)
    if (error.code === 'ERR_NETWORK') {
      throw new Error('无法连接到服务器，请确保后端服务已启动')
    }
    throw new Error(error.response?.data?.message || '图片上传失败，请重试')
  }
}

// 发布商品
export const publishProduct = async (productData) => {
  try {
    console.log('开始发布商品:', productData)
    const response = await api.post('/products', productData)
    console.log('发布成功:', response)
    return response
  } catch (error) {
    console.error('发布商品失败:', error.response || error)
    if (error.response?.data?.errors) {
      throw error
    }
    if (error.code === 'ERR_NETWORK') {
      throw new Error('无法连接到服务器，请确保后端服务已启动')
    }
    throw new Error(error.response?.data?.message || '发布失败，请重试')
  }
}

// 获取商品列表
export const getProducts = () => {
  return api.get('/products')
}

// 获取商品详情
export const getProduct = (id) => {
  return api.get(`/products/${id}`)
}

export default api 