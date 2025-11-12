# 咖啡店点餐系统 - 快速启动指南

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  咖啡店点餐系统 - 本地测试环境  " -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "1. 检查 Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "   ✓ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ✗ 请先安装 Node.js 18+" -ForegroundColor Red
    exit 1
}

# 检查 MySQL
Write-Host "2. 检查 MySQL..." -ForegroundColor Yellow
if (Get-Command mysql -ErrorAction SilentlyContinue) {
    Write-Host "   ✓ MySQL 已安装" -ForegroundColor Green
} else {
    Write-Host "   ✗ 请先安装 MySQL 5.7+" -ForegroundColor Red
    exit 1
}

# 安装后端依赖
Write-Host "3. 安装后端依赖..." -ForegroundColor Yellow
Set-Location backend
if (!(Test-Path "node_modules")) {
    npm install
    Write-Host "   ✓ 后端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "   ✓ 后端依赖已存在" -ForegroundColor Green
}

# 检查 .env 文件
if (!(Test-Path ".env")) {
    Write-Host "   创建 .env 文件..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "   ⚠ 请编辑 backend/.env 文件配置数据库密码" -ForegroundColor Yellow
}

Set-Location ..

# 安装前端依赖
Write-Host "4. 安装前端依赖..." -ForegroundColor Yellow
Set-Location frontend
if (!(Test-Path "node_modules")) {
    npm install
    Write-Host "   ✓ 前端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "   ✓ 前端依赖已存在" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  安装完成！请按以下步骤操作：  " -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 导入数据库：" -ForegroundColor Yellow
Write-Host "   mysql -u root -p < database/schema.sql" -ForegroundColor White
Write-Host ""
Write-Host "2. 配置数据库密码：" -ForegroundColor Yellow
Write-Host "   编辑 backend/.env 文件" -ForegroundColor White
Write-Host ""
Write-Host "3. 启动后端（新终端）：" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "4. 启动前端（新终端）：" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "5. 访问系统：" -ForegroundColor Yellow
Write-Host "   http://localhost:5173" -ForegroundColor White
Write-Host ""
