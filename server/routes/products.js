const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/user');
const Friend = require('../models/friend');

// 获取商品列表
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({ message: '获取商品列表失败' });
  }
});

// 创建新商品
router.post('/', async (req, res) => {
  try {
    console.log('接收到的商品数据:', req.body);
    
    // 验证库存数量
    if (req.body.stock !== undefined && req.body.stock < 0) {
      return res.status(422).json({ 
        errors: { stock: '库存数量不能小于0' } 
      });
    }
    
    const product = new Product({
      ...req.body
    });
    
    await product.validate();
    const savedProduct = await product.save();
    console.log('商品保存成功:', savedProduct);
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('创建商品失败:', error);
    if (error.name === 'ValidationError') {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(422).json({ errors });
    }
    res.status(500).json({ message: '创建商品失败: ' + error.message });
  }
});

// 清空所有商品 - 仅限管理员使用
router.delete('/admin/clear-all', async (req, res) => {
  try {
    // 这里可以添加管理员权限验证
    // 例如检查请求中的token或者密码
    
    // 删除所有商品
    const result = await Product.deleteMany({});
    
    console.log('所有商品已清空:', result);
    res.json({ 
      message: '所有商品已清空', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('清空商品失败:', error);
    res.status(500).json({ message: '清空商品失败: ' + error.message });
  }
});

// 获取用户发布的商品
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('获取用户商品，用户ID:', userId);
    
    // 查找该用户发布的所有商品
    const products = await Product.find({ userId }).sort({ createdAt: -1 });
    
    // 获取用户信息以便添加发布者名称
    const user = await User.findById(userId);
    
    // 为每个商品添加发布者名称
    const enrichedProducts = products.map(product => {
      const productObj = product.toObject();
      productObj.publisherName = user ? user.username : '未知用户';
      return productObj;
    });
    
    console.log(`找到${enrichedProducts.length}个商品`);
    res.json(enrichedProducts);
  } catch (error) {
    console.error('获取用户商品失败:', error);
    res.status(500).json({ message: '获取用户商品失败' });
  }
});

// 获取用户好友发布的商品
router.get('/friends/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // 查找用户的所有好友
    const friends = await Friend.find({ user: userId });
    const friendIds = friends.map(friend => friend.friend);
    
    // 如果没有好友，返回空数组
    if (friendIds.length === 0) {
      return res.json([]);
    }
    
    // 查找好友发布的商品
    const products = await Product.find({ userId: { $in: friendIds } }).sort({ createdAt: -1 });
    
    // 获取发布者名称
    const enrichedProducts = await Promise.all(products.map(async (product) => {
      const publisher = await User.findById(product.userId);
      const productObj = product.toObject();
      productObj.publisherName = publisher ? publisher.username : '未知用户';
      return productObj;
    }));
    
    res.json(enrichedProducts);
  } catch (error) {
    console.error('获取好友商品失败:', error);
    res.status(500).json({ message: '获取好友商品失败' });
  }
});

// 获取单个商品
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    res.json(product);
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json({ message: '获取商品详情失败' });
  }
});

// 更新商品
router.put('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    console.log('更新商品，商品ID:', productId);
    console.log('更新内容:', req.body);
    
    // 验证库存数量
    if (req.body.stock !== undefined && req.body.stock < 0) {
      return res.status(422).json({ 
        errors: { stock: '库存数量不能小于0' } 
      });
    }
    
    // 查找并更新商品
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    console.log('商品更新成功:', updatedProduct);
    res.json(updatedProduct);
  } catch (error) {
    console.error('更新商品失败:', error);
    if (error.name === 'ValidationError') {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(422).json({ errors });
    }
    res.status(500).json({ message: '更新商品失败: ' + error.message });
  }
});

// 扣减商品库存
router.patch('/:id/stock', async (req, res) => {
  try {
    const productId = req.params.id;
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(422).json({ message: '扣减数量必须大于0' });
    }
    
    // 查找商品并检查库存
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    if (product.stock < quantity) {
      return res.status(422).json({ message: '库存不足' });
    }
    
    // 扣减库存
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: -quantity } },
      { new: true }
    );
    
    console.log('库存扣减成功:', updatedProduct);
    res.json(updatedProduct);
  } catch (error) {
    console.error('扣减库存失败:', error);
    res.status(500).json({ message: '扣减库存失败: ' + error.message });
  }
});

// 删除商品
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    console.log('删除商品，商品ID:', productId);
    
    // 查找并删除商品
    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    console.log('商品删除成功');
    res.json({ message: '商品删除成功', deletedProduct });
  } catch (error) {
    console.error('删除商品失败:', error);
    res.status(500).json({ message: '删除商品失败: ' + error.message });
  }
});

module.exports = router; 