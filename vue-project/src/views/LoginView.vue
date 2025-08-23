<!-- 注册登录页面 -->
<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>{{ isLogin ? '登录' : '注册' }}</h2>
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item v-if="!isLogin" label="确认密码">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请确认密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">{{ isLogin ? '登录' : '注册' }}</el-button>
          <el-button @click="toggleMode">{{ isLogin ? '注册' : '登录' }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const isLogin = ref(true)
const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const handleSubmit = async () => {
  if (!form.username || !form.password) {
    ElMessage.error('请填写完整信息')
    return
  }

  if (!isLogin.value && form.password !== form.confirmPassword) {
    ElMessage.error('两次密码不一致')
    return
  }

  try {
    // 根据当前模式选择登录或注册接口
    const url = isLogin.value 
      ? 'http://localhost:3000/api/users/login'
      : 'http://localhost:3000/api/users/register'

    console.log('发送请求到:', url) // 调试信息
    console.log('请求数据:', { username: form.username, password: form.password }) // 调试信息

    const response = await axios.post(url, {
      username: form.username,
      password: form.password
    })

    console.log('服务器响应:', response.data) // 调试信息

    if (response.data.success) {
      // 保存完整的用户信息
      const userData = {
        _id: response.data.user._id,
        username: response.data.user.username,
        status: response.data.user.status || '在线',
        avatar: response.data.user.avatar || ''
      }
      localStorage.setItem('user', JSON.stringify(userData))
      ElMessage.success(isLogin.value ? '登录成功' : '注册成功')
      router.push('/')
    } else {
      ElMessage.error(response.data.message || (isLogin.value ? '登录失败' : '注册失败'))
    }
  } catch (error) {
    console.error(isLogin.value ? '登录失败:' : '注册失败:', error)
    if (error.response) {
      console.error('错误响应:', error.response.data) // 调试信息
    }
    ElMessage.error(error.response?.data?.message || (isLogin.value ? '登录失败' : '注册失败'))
  }
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  form.password = ''
  form.confirmPassword = ''
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-card {
  width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style> 