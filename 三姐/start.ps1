# 快速启动脚本

Write-Host "启动咖啡店点餐系统..." -ForegroundColor Green

# 启动后端
Write-Host "正在启动后端服务..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# 等待 2 秒
Start-Sleep -Seconds 2

# 启动前端
Write-Host "正在启动前端服务..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

# 等待 3 秒
Start-Sleep -Seconds 3

# 打开浏览器
Write-Host "正在打开浏览器..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "系统启动完成！" -ForegroundColor Green
Write-Host "前端: http://localhost:5173" -ForegroundColor Cyan
Write-Host "后端: http://localhost:3000" -ForegroundColor Cyan
