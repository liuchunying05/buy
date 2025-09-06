const mongoose = require('mongoose');
const Product = require('./models/Product');

// 数据库连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name';

async function migrateStock() {
  try {
    // 连接数据库
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('数据库连接成功');

    // 查找所有没有stock字段的商品
    const productsWithoutStock = await Product.find({ stock: { $exists: false } });
    console.log(`找到 ${productsWithoutStock.length} 个没有库存字段的商品`);

    if (productsWithoutStock.length > 0) {
      // 为这些商品添加默认库存
      const updateResult = await Product.updateMany(
        { stock: { $exists: false } },
        { $set: { stock: 10 } } // 设置默认库存为10
      );
      console.log(`已为 ${updateResult.modifiedCount} 个商品添加默认库存`);

      // 验证更新结果
      const updatedProducts = await Product.find({ stock: { $exists: true } });
      console.log(`现在共有 ${updatedProducts.length} 个商品有库存字段`);
    } else {
      console.log('所有商品都已经有库存字段');
    }

    console.log('库存迁移完成');
  } catch (error) {
    console.error('库存迁移失败:', error);
  } finally {
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
  }
}

// 运行迁移
migrateStock();
