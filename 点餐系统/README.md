# 咖啡店点餐系统

缅甸市场扫码点餐系统,支持中文/缅甸语/英文三语言,集成KPAY支付。

## 🏗️ 项目结构

```
点餐系统/
├── frontend/          # C端 - 客户点餐界面 (Vue 3 + Vant)
├── admin/             # B端 - 商户管理后台 (Vue 3 + Element Plus) ✅
├── backend/           # 后端API服务 (Node.js + Express)
├── database/          # 数据库脚本
├── start-all.bat      # 一键启动脚本
├── start-admin.bat    # 启动B端管理后台
└── ADMIN_PLAN.md      # B端管理后台规划文档
```

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn

### 安装依赖
```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install

# 安装B端依赖
cd ../admin
npm install
```

### 初始化数据库
```bash
cd backend
# 初始化基础数据
node scripts/initDatabase.js
# 初始化管理员表
node scripts/createAdminTables.js
```

### 启动项目
```bash
# 方式1: 一键启动 (推荐)
双击运行: start-all.bat

# 方式2: 分别启动
# 终端1 - 启动后端
cd backend
npm run dev

# 终端2 - 启动前端
cd frontend
npm run dev
```

访问地址:
- 前端C端: http://localhost:5173
- 管理后台B端: http://localhost:5174
- 后端API: http://localhost:3000

默认管理员账号:
- 用户名: `admin`
- 密码: `admin123`

## 📱 C端功能 (已完成)

### 核心功能
- ✅ 扫码选桌点餐
- ✅ 三语言切换 (中文/缅甸语/英文)
- ✅ 商品分类浏览
- ✅ 商品规格选择 (大小/温度/甜度)
- ✅ 购物车管理 (增删改查)
- ✅ 切换桌号自动清空购物车
- ✅ 订单提交
- ✅ KPAY支付集成 (含模拟支付)
- ✅ 订单详情查看
- ✅ 订单状态跟踪
- ✅ 移动端响应式优化

### 技术栈
- **前端**: Vue 3 + Vite + Vant 4 + Pinia + Vue Router + Vue I18n
- **后端**: Node.js + Express + SQLite/MySQL
- **支付**: KPAY API

## 🔧 B端功能 (开发中)

详细规划见: [ADMIN_PLAN.md](./ADMIN_PLAN.md)

### 已完成功能
- ✅ 管理员登录认证 (JWT)
- ✅ 三语言切换 (中文/English/မြန်မာ)
- ✅ 仪表盘数据展示
- ✅ 响应式布局框架

### 待开发功能
1. **餐桌管理**: 二维码生成与管理 ⭐
2. **菜单管理**: 分类/商品/规格管理 ⭐⭐
3. **订单管理**: 订单列表/详情/状态更新 ⭐
4. **门店管理**: 餐厅基本信息设置
5. **支付设置**: KPAY配置管理

### 技术栈
- **前端**: Vue 3 + Element Plus + Vue Router + Pinia
- **后端**: 复用现有Express后端,新增管理员API
- **认证**: JWT Token

## 📊 数据库结构

### 核心数据表
- `tables` - 餐桌信息
- `categories` - 商品分类
- `products` - 商品信息
- `product_options` - 商品规格
- `orders` - 订单主表
- `order_items` - 订单明细
- `admins` - 管理员账号 [待创建]
- `store_settings` - 门店设置 [待创建]
- `payment_settings` - 支付配置 [待创建]

## 🔐 安全特性
- JWT Token 认证
- 密码加密存储 (bcrypt)
- SQL注入防护
- XSS攻击防护
- CORS跨域配置
- 文件上传限制

## 📝 开发计划

### 当前进度
- ✅ C端点餐系统完成
- ✅ B端管理后台框架完成
- ✅ 管理员认证系统完成
- ✅ 三语言国际化支持
- ⏳ B端业务功能开发中

### 下一步
1. ~~创建admin前端项目~~ ✅
2. ~~开发管理员认证系统~~ ✅
3. 实现餐桌管理与二维码生成
4. 实现菜单管理功能
5. 实现订单管理功能

## 📦 部署

### 开发环境
- 数据库: SQLite
- 前端: Vite Dev Server (5173端口)
- 后端: Nodemon (3000端口)

### 生产环境 (推荐)
- 服务器: Oracle Cloud Free Tier / Vercel
- 数据库: MySQL / PostgreSQL
- 前端: 静态文件部署 (Nginx)
- 后端: Node.js + PM2
- 文件存储: 本地 / 阿里云OSS

## 🛠️ 常用命令

```bash
# 开发环境
npm run dev          # 启动开发服务器

# 生产环境
npm run build        # 构建生产版本
npm start            # 启动生产服务器

# 数据库
node scripts/initDatabase.js   # 初始化数据库
```

## 📄 许可证
MIT

## 👥 联系方式
如有问题或建议,请联系开发团队。
