const express = require('express')
const router = express.Router()
const Friend = require('../models/friend')
const User = require('../models/user')

// 搜索用户
router.get('/users/search', async (req, res) => {
  try {
    const { username } = req.query
    const user = await User.findOne({ username: new RegExp(username, 'i') })
    if (!user) {
      return res.json(null)
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: '搜索用户失败' })
  }
})

// 检查是否是好友关系
router.get('/check/:userId/:friendId', async (req, res) => {
  try {
    const { userId, friendId } = req.params
    
    const existingFriend = await Friend.findOne({
      user: userId,
      friend: friendId
    })
    
    res.json({ isFriend: !!existingFriend })
  } catch (error) {
    console.error('检查好友关系失败:', error)
    res.status(500).json({ message: '检查好友关系失败', isFriend: false })
  }
})

// 获取好友列表
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const friends = await Friend.find({ user: userId })
      .populate('friend', 'username avatar status')
    
    const friendsList = friends.map(f => f.friend)
    res.json(friendsList)
  } catch (error) {
    res.status(500).json({ message: '获取好友列表失败' })
  }
})

// 添加好友
router.post('/add', async (req, res) => {
  try {
    const { userId, friendId } = req.body
    
    console.log('添加好友请求参数:', { userId, friendId });
    
    // 验证参数
    if (!userId || !friendId) {
      return res.status(400).json({ message: '缺少必要参数' });
    }
    
    // 检查是否已经是好友
    const existingFriend = await Friend.findOne({
      $or: [
        { user: userId, friend: friendId },
        { user: friendId, friend: userId }
      ]
    });

    if (existingFriend) {
      return res.status(400).json({ message: '已经是好友关系' });
    }

    // 创建好友关系
    await Friend.create({ user: userId, friend: friendId });
    await Friend.create({ user: friendId, friend: userId });

    res.json({ success: true });
  } catch (error) {
    console.error('添加好友失败:', error);
    res.status(500).json({ message: '添加好友失败: ' + error.message });
  }
});

// 删除好友
router.delete('/remove', async (req, res) => {
  try {
    const { userId, friendId } = req.body
    
    // 删除双向好友关系
    await Friend.deleteMany({
      $or: [
        { user: userId, friend: friendId },
        { user: friendId, friend: userId }
      ]
    })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: '删除好友失败' })
  }
})
module.exports = router 