const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')

// 导入路由
const usersRouter = require('./routes/users')
const friendsRouter = require('./routes/friends')
const productsRouter = require('./routes/products')

const app = express()

// 中间件配置
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// 路由配置
app.use('/api/users', usersRouter)
app.use('/api/friends', friendsRouter)
app.use('/api/products', productsRouter)

// 连接数据库
mongoose.connect('mongodb://localhost:27017/trading-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, '数据库连接错误:'))
db.once('open', () => {
  console.log('数据库连接成功')
})

// 启动服务器
const port = 3000
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`)
}) 