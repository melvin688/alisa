# 缅甸餐厅扫码点餐系统

**专为缅甸市场设计的轻量级餐厅点餐系统**

## ✨ 系统特点

- 🌏 **多语言支持**: 中文/缅甸语/英语三语言切换
- 📱 **扫码点餐**: 顾客扫描桌号二维码即可点餐
- 💰 **现金结账**: 无需在线支付,支持现场收款
- 🖨️ **小票打印**: USB打印机支持,自动打印订单
- 📡 **离线模式**: 弱网环境优化,支持离线浏览菜单
- 📊 **订单管理**: 实时订单显示,状态更新
- ☁️ **云端部署**: Cloudflare Pages免费托管

**适用场景**: 日均50-100人客流量的小型餐厅

---

## 🏗️ 项目结构

```
缅甸餐厅点餐系统/
├── frontend/          # C端 - 客户点餐界面 (Vue 3 + Vant)
├── admin/             # B端 - 商户管理后台 (Vue 3 + Element Plus)
├── backend/           # 后端API服务 (Node.js + Express + SQLite)
├── database/          # 数据库脚本
│   ├── schema.sql          # MySQL版本
│   └── schema-sqlite.sql   # SQLite版本 (推荐)
├── DEPLOYMENT.md      # 📘 详细部署指南
├── start-all.bat      # 一键启动脚本 (Windows)
└── start.ps1          # 启动脚本 (PowerShell)
```

---

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn

### 本地开发

#### 1. 安装依赖
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

#### 2. 初始化数据库
```bash
cd backend
node scripts/initDatabase.js
```

#### 3. 启动项目
```bash
# 方式1: 一键启动 (推荐)
双击运行: start-all.bat

# 方式2: 分别启动
# 终端1 - 后端
cd backend
npm run dev

# 终端2 - C端
cd frontend
npm run dev

# 终端3 - B端
cd admin
npm run dev
```

#### 4. 访问地址
- C端点餐: http://localhost:5173
- B端管理: http://localhost:5174
- 后端API: http://localhost:3000

**默认管理员账号**:
- 用户名: `admin`
- 密码: `admin123`

---

## 📱 功能模块

### C端 - 顾客点餐

- ✅ 扫描桌号二维码进入
- ✅ 三语言切换 (中文/缅甸语/English)
- ✅ 商品分类浏览
- ✅ 商品规格选择 (大小/温度/甜度)
- ✅ 购物车管理
- ✅ 提交订单
- ✅ 订单状态查看
- ✅ 离线缓存菜单

### B端 - 管理后台

- ✅ 管理员登录认证
- ✅ 实时订单显示 (自动刷新)
- ✅ 订单状态管理 (待处理/制作中/已完成)
- ✅ 打印小票功能
- ✅ 商品管理 (增删改查)
- ✅ 分类管理
- ✅ 餐桌管理
- ✅ 三语言界面
- ✅ 营业数据统计

---

## 🖨️ 打印机支持

### 兼容打印机品牌
- 芯烨 (XPrinter)
- 佳博 (Gprinter)
- 飞鹅 (Feie)
- 其他支持ESC/POS协议的58mm/80mm小票打印机

### 打印功能
- 顾客订单小票
- 后厨订单单据
- 批量打印
- 浏览器直接打印 (无需额外驱动)

**详细配置**: 见 [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🌐 部署方案

### 推荐: Cloudflare Pages (免费)

**优势**:
- ✅ 完全免费 (包含D1数据库)
- ✅ 无限请求和带宽
- ✅ 全球CDN加速
- ✅ 自动HTTPS
- ✅ 更快的缅甸访问速度

**部署步骤**: 见 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 备选: 本地服务器

**适合场景**: 餐厅有固定电脑/平板

**硬件需求**:
- Windows 10+ 或 Android平板
- USB小票打印机
- WiFi路由器

**部署步骤**: 见 [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📊 数据库结构

### 核心数据表
- `tables` - 餐桌信息
- `categories` - 商品分类 (支持三语言)
- `products` - 商品信息 (支持三语言)
- `product_options` - 商品规格 (大小/温度/甜度)
- `orders` - 订单主表 (简化版,无在线支付)
- `order_items` - 订单明细
- `admins` - 管理员账号

**数据库文件**:
- MySQL版: `database/schema.sql`
- SQLite版: `database/schema-sqlite.sql` (推荐本地开发)

---

## 🛠️ 技术栈

### 前端
- **C端**: Vue 3 + Vite + Vant 4 + Pinia + Vue I18n
- **B端**: Vue 3 + Element Plus + Vue Router + Pinia

### 后端
- Node.js + Express
- SQLite (开发) / MySQL (生产)
- JWT认证
- Multer (文件上传)

### 部署
- Cloudflare Pages + D1数据库
- Service Worker (离线缓存)

---

## 📚 文档

- [部署指南](./DEPLOYMENT.md) - 详细部署步骤和配置
- [开发指南](./清理总结与开发指南.md) - 代码结构和开发规范
- [B端规划](./ADMIN_PLAN.md) - 管理后台功能规划

---

## 🔒 安全特性

- JWT Token 认证
- 密码bcrypt加密
- SQL注入防护
- XSS攻击防护
- CORS跨域配置
- 文件上传限制

---

## 🌍 多语言支持

系统支持三种语言:
- 🇨🇳 中文 (简体)
- 🇲🇲 缅甸语 (မြန်မာ)
- 🇬🇧 英语 (English)

所有界面、菜单、商品名称均支持三语言切换。

---

## 📝 常见问题

### Q: 如何生成餐桌二维码?
A: 登录B端管理后台 → 餐桌管理 → 查看二维码 → 下载并打印

### Q: 打印机无法打印怎么办?
A: 
1. 检查USB连接
2. 在系统设置中设为默认打印机
3. 查看浏览器打印设置

### Q: 如何修改菜单?
A: 登录B端管理后台 → 商品管理 → 添加/编辑商品

### Q: 离线模式如何工作?
A: 系统使用Service Worker缓存菜单数据,断网时顾客仍可浏览菜单

### Q: 支持在线支付吗?
A: 当前版本支持现金结账,后续可集成缅甸本地支付(KBZPay/WavePay)

---

## 📞 技术支持

- 详细文档: [DEPLOYMENT.md](./DEPLOYMENT.md)
- API接口: `backend/routes/`
- 前端代码: `frontend/src/` 和 `admin/src/`

---

## 📄 许可证

MIT License

---

## 🎉 更新日志

### v1.0.0 (2025-01-10)
- ✅ 初始版本发布
- ✅ 支持中文/缅甸语/英语三语言
- ✅ C端扫码点餐功能
- ✅ B端订单管理和打印
- ✅ USB打印机支持
- ✅ 离线缓存功能
- ✅ Cloudflare Pages部署支持
- ✅ 简化支付流程(现金结账)

---

祝您生意兴隆! 🎉

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

# Updated: Environment variables configured
