# B端管理后台 - 技术方案与实施计划

## 项目概述
**目标**: 为餐厅老板(管理员)提供自主管理菜单和生意的后台管理系统

**技术栈**:
- 前端: Vue 3 + Element Plus (桌面端UI组件库)
- 后端: Node.js + Express (复用现有后端)
- 数据库: SQLite (本地测试) / MySQL (生产环境)
- 认证: JWT Token

---

## 核心功能模块

### 1. 用户认证模块
#### 1.1 登录系统
- [x] 管理员登录页面
- [x] JWT Token 认证
- [x] 登录状态保持
- [x] 退出登录

#### 1.2 权限管理
- [ ] 管理员账号管理
- [ ] 角色权限设置 (可选,MVP可跳过)

**数据表**: `admins`
```sql
CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin',
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2. 门店管理模块
#### 2.1 餐厅基本信息
- [x] 餐厅名称、Logo、地址
- [x] 营业时间设置
- [x] 联系方式
- [x] 餐厅简介

**数据表**: `store_settings`
```sql
CREATE TABLE store_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_name VARCHAR(100),
  store_name_my VARCHAR(100),
  store_name_en VARCHAR(100),
  logo VARCHAR(255),
  address VARCHAR(255),
  phone VARCHAR(50),
  business_hours TEXT,  -- JSON格式: {"monday": "09:00-22:00", ...}
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 3. 餐桌管理模块 ⭐ MVP核心
#### 3.1 桌台列表
- [x] 查看所有桌台
- [x] 新增/编辑/删除桌台
- [x] 桌台状态管理

#### 3.2 二维码管理
- [x] 为每个桌台生成二维码
- [x] 批量生成二维码 (按桌数)
- [x] 下载二维码 (单个/批量)
- [x] 二维码包含桌号信息

**数据表**: 复用现有 `tables` 表

**二维码内容**: `https://your-domain.com/menu?table={table_number}`

---

### 4. 菜单管理模块 ⭐⭐ 核心中的核心

#### 4.1 分类管理
- [x] 分类列表
- [x] 新增分类 (中文/缅甸语/英文)
- [x] 编辑分类
- [x] 删除分类 (需检查是否有商品)
- [x] 排序调整

**数据表**: 复用现有 `categories` 表

#### 4.2 商品管理
- [x] 商品列表 (支持分类筛选、搜索)
- [x] 新增商品
  - 基本信息: 名称(三语言)、价格、描述
  - 图片上传
  - 所属分类
- [x] 编辑商品
- [x] 删除商品
- [x] 上架/下架控制
- [x] 库存管理 (可选)

**数据表**: 复用现有 `products` 表,添加字段:
```sql
ALTER TABLE products ADD COLUMN status TINYINT DEFAULT 1;  -- 1:上架 0:下架
ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT -1;  -- -1:不限库存
ALTER TABLE products ADD COLUMN sort_order INTEGER DEFAULT 0;
```

#### 4.3 规格(SKU)管理
- [x] 为商品设置规格选项
- [x] 规格类型: 大小(size)、温度(temperature)、甜度(sweetness)
- [x] 规格选项管理
  - 选项名称(三语言)
  - 加价金额
  - 设置默认选项

**数据表**: 复用现有 `product_options` 表

---

### 5. 订单管理模块 ⭐ MVP必备

#### 5.1 订单列表
- [x] 查看所有订单
- [x] 今日订单
- [x] 历史订单
- [x] 订单状态筛选
- [x] 搜索功能 (订单号、桌号)

#### 5.2 订单详情
- [x] 查看订单完整信息
- [x] 商品明细
- [x] 支付状态
- [x] 订单备注

#### 5.3 订单状态管理
- [x] 更新订单状态
  - 待支付 → 已支付
  - 已支付 → 制作中
  - 制作中 → 待取餐
  - 待取餐 → 已完成
- [x] 取消订单

**数据表**: 复用现有 `orders` 和 `order_items` 表

---

### 6. 支付设置模块 ⭐ MVP必备

#### 6.1 支付配置
- [x] KPAY 配置
  - 商户号
  - API密钥
  - 回调地址
- [x] 测试模式开关

**数据表**: `payment_settings`
```sql
CREATE TABLE payment_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_method VARCHAR(50) NOT NULL,  -- 'kpay', 'wave_money', etc.
  merchant_id VARCHAR(100),
  api_key VARCHAR(255),
  api_secret VARCHAR(255),
  callback_url VARCHAR(255),
  is_enabled TINYINT DEFAULT 1,
  is_test_mode TINYINT DEFAULT 1,
  config TEXT,  -- JSON格式,存储其他配置
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 7. 数据统计模块 (可选,后期添加)
- [ ] 今日营业额
- [ ] 销量统计
- [ ] 热门商品
- [ ] 订单趋势图表

---

## 技术实施方案

### 前端架构
```
admin/
├── public/
├── src/
│   ├── api/                 # API接口
│   │   ├── auth.js
│   │   ├── store.js
│   │   ├── table.js
│   │   ├── category.js
│   │   ├── product.js
│   │   ├── order.js
│   │   └── payment.js
│   ├── assets/              # 静态资源
│   ├── components/          # 公共组件
│   │   ├── UploadImage.vue  # 图片上传
│   │   ├── QRCodeGenerator.vue  # 二维码生成
│   │   └── ...
│   ├── layouts/             # 布局组件
│   │   ├── AdminLayout.vue  # 管理后台布局
│   │   └── AuthLayout.vue   # 登录页布局
│   ├── router/              # 路由配置
│   ├── stores/              # Pinia状态管理
│   │   ├── auth.js
│   │   └── ...
│   ├── utils/               # 工具函数
│   │   ├── request.js       # Axios封装
│   │   └── auth.js
│   ├── views/               # 页面组件
│   │   ├── auth/
│   │   │   └── Login.vue
│   │   ├── dashboard/
│   │   │   └── Index.vue
│   │   ├── store/
│   │   │   └── Settings.vue
│   │   ├── table/
│   │   │   ├── List.vue
│   │   │   └── QRCode.vue
│   │   ├── menu/
│   │   │   ├── CategoryList.vue
│   │   │   ├── ProductList.vue
│   │   │   └── ProductForm.vue
│   │   ├── order/
│   │   │   ├── List.vue
│   │   │   └── Detail.vue
│   │   └── payment/
│   │       └── Settings.vue
│   ├── App.vue
│   └── main.js
├── package.json
└── vite.config.js
```

### 后端API路由规划

#### 认证相关
```
POST   /api/admin/login          # 管理员登录
POST   /api/admin/logout         # 退出登录
GET    /api/admin/profile        # 获取当前用户信息
```

#### 门店管理
```
GET    /api/admin/store          # 获取门店信息
PUT    /api/admin/store          # 更新门店信息
POST   /api/admin/store/logo    # 上传Logo
```

#### 餐桌管理
```
GET    /api/admin/tables         # 获取餐桌列表
POST   /api/admin/tables         # 新增餐桌
PUT    /api/admin/tables/:id     # 更新餐桌
DELETE /api/admin/tables/:id     # 删除餐桌
POST   /api/admin/tables/batch   # 批量创建餐桌
GET    /api/admin/tables/:id/qrcode  # 生成单个二维码
POST   /api/admin/tables/qrcode/batch  # 批量生成二维码
```

#### 分类管理
```
GET    /api/admin/categories           # 获取分类列表
POST   /api/admin/categories           # 新增分类
PUT    /api/admin/categories/:id       # 更新分类
DELETE /api/admin/categories/:id       # 删除分类
PUT    /api/admin/categories/sort      # 调整排序
```

#### 商品管理
```
GET    /api/admin/products              # 获取商品列表
GET    /api/admin/products/:id          # 获取商品详情
POST   /api/admin/products              # 新增商品
PUT    /api/admin/products/:id          # 更新商品
DELETE /api/admin/products/:id          # 删除商品
PUT    /api/admin/products/:id/status   # 上架/下架
POST   /api/admin/products/:id/image    # 上传商品图片
```

#### 规格管理
```
GET    /api/admin/products/:id/options     # 获取商品规格
POST   /api/admin/products/:id/options     # 新增规格
PUT    /api/admin/options/:id              # 更新规格
DELETE /api/admin/options/:id              # 删除规格
```

#### 订单管理
```
GET    /api/admin/orders                # 获取订单列表
GET    /api/admin/orders/:orderNo       # 获取订单详情
PUT    /api/admin/orders/:orderNo/status  # 更新订单状态
PUT    /api/admin/orders/:orderNo/cancel  # 取消订单
GET    /api/admin/orders/stats/today    # 今日统计
```

#### 支付设置
```
GET    /api/admin/payment/settings      # 获取支付配置
PUT    /api/admin/payment/settings      # 更新支付配置
POST   /api/admin/payment/test          # 测试支付配置
```

---

## 开发优先级

### Phase 1: MVP核心功能 (第一周)
1. ✅ 管理员登录/认证
2. ✅ 餐桌管理 (CRUD)
3. ✅ 二维码生成与下载
4. ✅ 分类管理
5. ✅ 商品管理 (基础CRUD)

### Phase 2: 完善功能 (第二周)
6. ✅ 商品规格管理
7. ✅ 图片上传功能
8. ✅ 订单列表与详情
9. ✅ 订单状态管理
10. ✅ 门店基本信息设置

### Phase 3: 支付与优化 (第三周)
11. ✅ 支付配置管理
12. ✅ 界面优化
13. ✅ 数据校验完善
14. 🔄 测试与Bug修复

### Phase 4: 扩展功能 (可选)
- 数据统计报表
- 多语言切换
- 批量操作优化
- 营业数据导出

---

## 安全考虑
1. ✅ JWT Token 认证
2. ✅ 密码加密存储 (bcrypt)
3. ✅ API接口权限验证
4. ✅ 文件上传类型限制
5. ✅ SQL注入防护
6. ✅ XSS攻击防护

---

## 部署方案
- **开发环境**: SQLite + localhost
- **生产环境**: 
  - 前端: Nginx静态托管
  - 后端: Node.js + PM2
  - 数据库: MySQL
  - 文件存储: 本地存储 / 阿里云OSS

---

## 下一步行动
1. [ ] 创建 admin 前端项目目录
2. [ ] 安装 Element Plus 和相关依赖
3. [ ] 创建管理员数据表和初始账号
4. [ ] 实现登录认证功能
5. [ ] 开发餐桌管理和二维码生成功能
