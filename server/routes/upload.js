const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 限制2MB
  },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('只允许上传图片文件！'), false);
    }
    cb(null, true);
  }
});

// 处理单个文件上传
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的图片' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    // 返回完整的成功响应
    res.json({ 
      success: true,
      url: imageUrl,
      message: '图片上传成功'
    });
  } catch (error) {
    console.error('图片上传失败:', error);
    res.status(500).json({ 
      success: false,
      message: '图片上传失败',
      error: error.message 
    });
  }
});

module.exports = router; 