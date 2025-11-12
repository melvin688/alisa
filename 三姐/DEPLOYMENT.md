# 缅甸餐厅扫码点餐系统 - 部署指南

## 系统概述

本系统专为缅甸市场设计,支持:
- ✅ 顾客扫码点餐 (中文/缅甸语/英语)
- ✅ B端订单管理和打印
- ✅ 离线缓存(弱网环境优化)
- ✅ 现金结账(无需在线支付)
- ✅ USB小票打印机支持

**适用场景**: 日均50-100人客流量的小型餐厅

---

## 部署方案

### 方案A: Cloudflare Pages (推荐)

**优势**:
- 完全免费 (包含数据库)
- 无限请求和带宽
- 全球CDN加速
- 更快的缅甸访问速度

#### 1. 前期准备

```bash
# 安装Wrangler CLI
npm install -g wrangler

# 登录Cloudflare
wrangler login
```

#### 2. 创建D1数据库

```bash
# 创建数据库
wrangler d1 create restaurant-db

# 会返回数据库ID,复制保存
# Database ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

#### 3. 初始化数据库

```bash
# 执行SQLite版schema
wrangler d1 execute restaurant-db --file=./database/schema-sqlite.sql
```

#### 4. 配置wrangler.toml

在项目根目录创建 `wrangler.toml`:

```toml
name = "myanmar-restaurant"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "restaurant-db"
database_id = "你的数据库ID"  # 替换为步骤2获取的ID
```

#### 5. 构建前端

```bash
# C端
cd frontend
npm run build

# B端
cd ../admin
npm run build
```

#### 6. 部署

```bash
# 部署前端
cd frontend
wrangler pages deploy ./dist --project-name=myanmar-restaurant-customer

# 部署后台
cd ../admin
wrangler pages deploy ./dist --project-name=myanmar-restaurant-admin
```

#### 7. 配置自定义域名(可选)

在Cloudflare Pages控制台:
- C端: `order.yourdomain.com`
- B端: `admin.yourdomain.com`

---

### 方案B: 本地服务器 + 打印机

**适合场景**: 餐厅有固定电脑/平板

#### 硬件需求

| 设备 | 规格 | 价格(估算) |
|------|------|----------|
| 平板/电脑 | Windows 10+ 或 Android | $150-500 |
| USB打印机 | 58mm/80mm小票打印机 | $30-80 |
| WiFi路由器 | 支持多设备连接 | $20-50 |

#### 软件部署

1. **安装Node.js**
   - 下载: https://nodejs.org/ (LTS版本)
   - 安装后验证: `node --version`

2. **安装依赖**
```bash
# 后端
cd backend
npm install

# 前端C端
cd ../frontend
npm install

# B端管理后台
cd ../admin
npm install
```

3. **初始化数据库**
```bash
cd backend
node scripts/initDatabase.js
```

4. **启动服务**
```bash
# 方式1: 一键启动 (Windows)
双击运行: start-all.bat

# 方式2: 手动启动
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

5. **访问地址**
- C端点餐: `http://localhost:5173`
- B端管理: `http://localhost:5174`
- 后端API: `http://localhost:3000`

---

## USB打印机配置

### 支持的打印机品牌

| 品牌 | 型号 | 连接方式 | 价格 |
|------|------|---------|------|
| 芯烨 (XPrinter) | XP-58IIH | USB/蓝牙/WiFi | $30-50 |
| 佳博 (Gprinter) | GP-58130IVC | USB/蓝牙 | $35-60 |
| 飞鹅 (Feie) | FP-58IV | USB/WiFi/云打印 | $50-80 |

### 打印机安装步骤

#### Windows系统

1. **连接打印机**
   - 通过USB线连接打印机到电脑
   - Windows会自动识别并安装驱动

2. **设置默认打印机**
   - 打开 `设置` > `设备` > `打印机和扫描仪`
   - 找到小票打印机,点击 `管理`
   - 设置为默认打印机

3. **测试打印**
   - 在B端管理后台的订单页面
   - 点击"打印小票"按钮
   - 查看是否正常打印

#### Linux/树莓派系统

```bash
# 安装CUPS打印服务
sudo apt-get install cups

# 安装USB打印机驱动
sudo apt-get install escpos-utils

# 查找打印机
lpinfo -v

# 添加打印机
lpadmin -p receipt-printer -v usb://[打印机地址] -E
```

### 浏览器打印API配置

现代浏览器支持直接打印,无需额外驱动:

1. 在B端订单页面点击"打印小票"
2. 浏览器会弹出打印预览窗口
3. 选择小票打印机
4. 设置纸张大小 (58mm 或 80mm)
5. 点击打印

**首次打印设置**:
- 纸张: 自定义 58mm 或 80mm宽
- 页边距: 最小
- 比例: 100%
- 背景图形: 关闭

---

## 生成餐桌二维码

### 方法1: 在线生成

访问B端管理后台:
1. 登录: `http://localhost:5174` (用户名: admin, 密码: admin123)
2. 点击 `餐桌管理`
3. 点击每个桌号的"查看二维码"按钮
4. 下载二维码图片
5. 打印并贴在餐桌上

### 方法2: 批量生成脚本

```bash
cd backend
node scripts/generateQRCodes.js
```

二维码会保存在 `backend/qrcodes/` 目录

### 二维码URL格式

```
C端点餐页面: https://order.yourdomain.com?table=A01
```

替换为你的实际域名和桌号

---

## 常见问题

### Q1: 打印机无法打印?

**解决方案**:
1. 检查USB线是否连接
2. 检查打印机是否有纸
3. 在系统设置中设为默认打印机
4. 重启浏览器和打印机

### Q2: 离线模式如何工作?

系统使用Service Worker缓存:
- 菜单数据会缓存到本地
- 断网时顾客仍可浏览菜单
- 订单会在网络恢复后自动提交

### Q3: 如何修改菜单?

登录B端管理后台:
1. `商品管理` - 添加/编辑/删除商品
2. `分类管理` - 管理商品分类
3. 修改会实时同步到C端

### Q4: 如何查看营业数据?

在B端 `仪表盘` 页面可以看到:
- 今日订单数
- 今日营业额
- 热销商品

### Q5: 支持移动端访问吗?

完全支持!
- C端: 手机扫码点餐
- B端: 平板查看订单

---

## 安全建议

1. **修改默认密码**
   ```sql
   UPDATE admins SET password = '新密码hash' WHERE username = 'admin';
   ```

2. **启用HTTPS**
   - Cloudflare自动提供SSL证书
   - 本地部署可使用Let's Encrypt

3. **定期备份数据**
   ```bash
   # SQLite备份
   cp backend/coffee_ordering.db backup/coffee_ordering_$(date +%Y%m%d).db
   ```

4. **限制管理后台访问**
   - 只允许餐厅内网访问
   - 或使用VPN

---

## 技术支持

- 项目文档: `README.md`
- API文档: `backend/routes/`
- 前端代码: `frontend/src/` 和 `admin/src/`

如有问题请参考项目文档或联系开发者。

---

## 更新日志

### v1.0.0 (2025-01-10)
- ✅ 初始版本发布
- ✅ 支持中文/缅甸语/英语
- ✅ C端点餐功能
- ✅ B端订单管理
- ✅ USB打印机支持
- ✅ 离线缓存功能
- ✅ Cloudflare Pages部署支持

---

祝您生意兴隆! 🎉
