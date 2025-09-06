# 商品库存管理功能说明

## 新增功能

### 1. 商品模型更新
- 在 `Product` 模型中新增 `stock` 字段
- 字段类型：Number
- 必填字段，不能为空
- 最小值：0（库存不能为负数）
- 默认值：0

### 2. 新增API接口

#### 库存扣减接口
```
PATCH /api/products/:id/stock
```
**请求体：**
```json
{
  "quantity": 2
}
```
**功能：**
- 按指定数量扣减商品库存
- 自动检查库存是否充足
- 使用原子操作确保并发安全

### 3. 现有接口增强

#### 创建商品 (POST /api/products)
- 新增库存验证：库存不能小于0
- 支持设置初始库存数量

#### 更新商品 (PUT /api/products/:id)
- 新增库存验证：库存不能小于0
- 支持修改库存数量

## 使用方法

### 1. 发布商品时设置库存
```javascript
const productData = {
  name: "商品名称",
  price: 99.99,
  stock: 100,  // 设置初始库存
  image: "图片路径",
  description: "商品描述"
}
```

### 2. 购买时扣减库存
```javascript
// 使用新的库存扣减接口
const response = await fetch(`/api/products/${productId}/stock`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ quantity: 2 })
})
```

### 3. 数据库迁移
如果数据库中有现有商品数据，需要运行迁移脚本：
```bash
cd server
node migrate-stock.js
```

## 注意事项

1. **库存验证**：购买数量不能超过当前库存
2. **并发安全**：使用MongoDB的原子操作确保库存扣减的准确性
3. **数据一致性**：前端和后端都会进行库存验证
4. **向后兼容**：现有商品数据会自动获得默认库存值

## 错误处理

- 库存不足：返回422状态码和"库存不足"消息
- 无效数量：返回422状态码和相应错误信息
- 商品不存在：返回404状态码

## 前端集成

前端已更新以下组件：
- `PublishView.vue`：发布时设置库存
- `ProductView.vue`：显示库存信息
- `CartView.vue`：购物车数量限制
- `PaymentView.vue`：支付后扣减库存
- `HomeView.vue`：加入购物车前检查库存
