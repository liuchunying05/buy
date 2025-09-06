[README.md](https://github.com/user-attachments/files/22184695/README.md)
# 二手交易平台

一个基于Vue 3和Node.js的二手商品交易平台，支持用户注册登录、商品发布、好友系统、购物车、支付等功能。

## 技术栈

### 前端技术栈
- **Vue 3** - 渐进式JavaScript框架
- **Vue Router 4** - 官方路由管理器
- **Element Plus** - Vue 3的组件库
- **Axios** - HTTP客户端
- **Vite** - 前端构建工具

### 后端技术栈
- **Node.js** - JavaScript运行时环境
- **Express.js** - Web应用框架
- **MongoDB** - NoSQL数据库
- **Mongoose** - MongoDB对象建模工具
- **CORS** - 跨域资源共享中间件

### 数据库
- **MongoDB** - 文档型数据库
- **数据库名称**: trading-platform
- **连接地址**: mongodb://localhost:27017/trading-platform

## 项目功能

### 用户系统
- 用户注册和登录
- 用户资料管理
- 密码修改
- 在线状态显示

### 商品管理
- 商品发布和编辑
- 商品列表展示
- 商品详情查看
- 商品搜索功能
- 管理员商品管理（删除、清空）

### 好友系统
- 好友添加和删除
- 好友列表管理
- 好友商品推荐

### 购物功能
- 购物车管理
- 商品结算
- 支付流程

### 社交功能
- 用户圈子
- 聊天功能
- 商品分享

## 项目结构

```
vue-project/
├── app.js                 # Express服务器入口文件
├── package.json           # 项目依赖配置
├── vite.config.js        # Vite构建配置
├── models/               # 数据模型
│   ├── user.js           # 用户模型
│   └── friend.js         # 好友关系模型
├── routes/               # API路由
│   ├── users.js          # 用户相关API
│   ├── products.js       # 商品相关API
│   └── friends.js        # 好友相关API
├── public/               # 静态资源
│   └── images/           # 图片资源
└── src/                  # 前端源码
    ├── api/              # API接口
    ├── components/       # Vue组件
    ├── router/           # 路由配置
    ├── views/            # 页面组件
    ├── App.vue           # 根组件
    └── main.js           # 前端入口文件
```

## 安装和部署

### 环境要求
- Node.js >= 14.0.0
- MongoDB >= 4.0.0
- npm >= 6.0.0

### 安装步骤

1. **克隆项目**
```bash
git clone <项目地址>
cd vue-project
```

2. **安装依赖**
```bash
npm install
```

3. **启动MongoDB数据库**
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

4. **启动后端服务器**
```bash
node app.js
```
后端服务器将在 http://localhost:3000 启动

5. **启动前端开发服务器**
```bash
npm run dev
```
前端应用将在 http://localhost:5173 启动

### 生产环境部署

1. **构建前端项目**
```bash
npm run build
```

2. **配置环境变量**
创建 `.env` 文件并配置：
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/trading-platform
```

3. **启动生产服务器**
```bash
node app.js
```

## API接口

### 用户相关
- `POST /api/users/login` - 用户登录
- `POST /api/users/register` - 用户注册
- `GET /api/users/search` - 搜索用户
- `PUT /api/users/:id` - 更新用户资料
- `POST /api/users/change-password` - 修改密码

### 商品相关
- `GET /api/products` - 获取商品列表
- `POST /api/products` - 发布商品
- `GET /api/products/:id` - 获取商品详情
- `PUT /api/products/:id` - 更新商品
- `DELETE /api/products/:id` - 删除商品
- `GET /api/products/user/:userId` - 获取用户发布的商品
- `GET /api/products/friends/:userId` - 获取好友发布的商品

### 好友相关
- `GET /api/friends/:userId` - 获取好友列表
- `POST /api/friends/add` - 添加好友
- `DELETE /api/friends/remove` - 删除好友
- `GET /api/friends/check/:userId/:friendId` - 检查好友关系

## 开发说明

### 前端开发
- 使用Vue 3 Composition API
- 路由守卫实现登录验证
- 响应式设计，支持移动端
- Element Plus组件库提供UI组件

### 后端开发
- RESTful API设计
- 中间件处理跨域和请求解析
- MongoDB数据库操作
- 错误处理和日志记录

### 数据库设计
- **用户表(users)**: 存储用户基本信息
- **好友表(friends)**: 存储好友关系
- **商品表(products)**: 存储商品信息

## 注意事项

1. 确保MongoDB服务已启动
2. 后端API地址配置在 `src/api/index.js` 中
3. 图片上传功能需要配置静态文件服务
4. 生产环境需要配置HTTPS和安全措施
5. 密码存储应该使用加密算法（当前为明文存储，仅用于演示）

## 许可证

MIT License
