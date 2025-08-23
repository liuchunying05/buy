const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 调试中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request Body:', req.body);
  next();
});

// 静态文件服务
const uploadPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadPath));
console.log('上传目录路径:', uploadPath);

// 连接数据库
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/second_hand_platform';

    console.log('正在连接到MongoDB...', mongoURI);
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB连接成功');
  } catch (err) {
    console.error('MongoDB连接失败:', err);
    process.exit(1);
  }
};

connectDB();

// 路由
app.use('/api/products', require('./routes/products'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/users', require('./routes/users'));
app.use('/api/friends', require('./routes/friends'));

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误', err);
  res.status(500).json({
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log('环境变量:', {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI,
    PORT: process.env.PORT
  });
}); 