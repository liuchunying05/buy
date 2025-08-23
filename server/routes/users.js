const express = require('express');
const router = express.Router();
const User = require('../models/user');

// 登录接口
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('登录请求:', { username, password });

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: '用户不存在' });
    }

    // 简单的密码验证（实际应用中应该使用加密）
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: '密码错误' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        status: user.status || '在线',
        avatar: user.avatar || ''
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, message: '登录失败' });
  }
});

// 注册接口
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('注册请求:', { username, password });

    // 检查用户是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }

    // 创建新用户
    const user = await User.create({ username, password });
    console.log('创建的新用户:', user);

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ success: false, message: '注册失败' });
  }
});

// 搜索用户接口
router.get('/search', async (req, res) => {
  try {
    const { username } = req.query;
    const user = await User.findOne({
      username: new RegExp(username, 'i')
    }).select('_id username');

    if (!user) {
      return res.json(null);
    }

    res.json(user);
  } catch (error) {
    console.error('搜索用户失败:', error);
    res.status(500).json({ message: '搜索用户失败' });
  }
});

// 更新用户资料
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, avatar } = req.body;
    
    console.log('更新用户资料请求:', { id, status, avatar });
    
    const updateData = {};
    if (status) updateData.status = status;
    if (avatar) updateData.avatar = avatar;
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        status: user.status,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('更新用户资料失败:', error);
    res.status(500).json({ success: false, message: '更新用户资料失败' });
  }
});

// 修改密码
router.post('/change-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    console.log('修改密码请求:', { userId, oldPassword: '***', newPassword: '***' });
    
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: '请提供完整信息' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    // 验证旧密码
    if (user.password !== oldPassword) {
      return res.status(401).json({ success: false, message: '当前密码错误' });
    }
    
    // 更新密码
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ success: false, message: '修改密码失败' });
  }
});

// 获取用户信息
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

module.exports = router; 