# Cloudflare Pages 部署指南

## ✅ 仓库信息
- GitHub 仓库: https://github.com/melvin688/xiaoan.github.io
- 分支: main

---

## 🚀 部署前端(C端)

### 第一步: 创建 Cloudflare Pages 项目

1. 访问: https://dash.cloudflare.com
2. 进入 **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. 选择仓库: **melvin688/xiaoan.github.io**

### 第二步: 配置构建设置

```
项目名称:          alisa
生产分支:          main
根目录:            frontend
框架预设:          Vue
构建命令:          npm install && npm run build
构建输出目录:      dist
```

### 第三步: 添加环境变量(先留空,后续填写)

```
VITE_API_BASE_URL = (Worker部署后填写)
```

### 第四步: 保存并部署

点击 **"保存并部署"**,等待构建完成。

---

## 🔧 部署管理后台(B端)

重复上述步骤,但配置改为:

```
项目名称:          alisa-admin
生产分支:          main
根目录:            admin
框架预设:          Vue
构建命令:          npm install && npm run build
构建输出目录:      dist
```

---

## 🌐 预期的部署URL

- 前端(C端): https://alisa.pages.dev
- 管理后台: https://alisa-admin.pages.dev
- 后端API: (需要单独部署Worker)

---

## ⚠️ 重要提示

**根目录设置是关键!**
- 前端项目根目录: `frontend`
- 管理后台根目录: `admin`

不要留空或填写 `/`,必须指定子目录!
