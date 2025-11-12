# GitHub Pages 部署脚本
# 使用方法：在 PowerShell 中运行此脚本

# 检查 Git 是否已安装
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "错误: Git 未安装。请先安装 Git: https://git-scm.com/download/win" -ForegroundColor Red
    exit
}

# 定义你的 GitHub 用户名和仓库名
$githubUsername = Read-Host -Prompt "请输入你的 GitHub 用户名"
$repoName = Read-Host -Prompt "请输入仓库名 (例如: contact-page)"

# 初始化 Git 仓库
git init
git add .
git commit -m "初始提交"
git branch -M main

# 添加远程仓库
$repoUrl = "https://github.com/$githubUsername/$repoName.git"
git remote add origin $repoUrl

# 推送到 GitHub
Write-Host "正在推送代码到 GitHub..." -ForegroundColor Yellow
git push -u origin main

# 设置 GitHub Pages
Write-Host ""
Write-Host "部署说明:" -ForegroundColor Green
Write-Host "1. 访问 https://github.com/$githubUsername/$repoName/settings/pages" -ForegroundColor Cyan
Write-Host "2. 在 'Source' 部分，选择 'main' 分支和 '/ (root)' 文件夹" -ForegroundColor Cyan
Write-Host "3. 点击 'Save'" -ForegroundColor Cyan
Write-Host ""
Write-Host "几分钟后，你的网站将在以下地址可用:" -ForegroundColor Green
Write-Host "https://$githubUsername.github.io/$repoName" -ForegroundColor Cyan

# 提示用户自定义社交媒体链接
Write-Host ""
Write-Host "别忘了在 index.html 中更新你的社交媒体链接:" -ForegroundColor Yellow
Write-Host "- LINE ID" -ForegroundColor White
Write-Host "- WhatsApp 号码" -ForegroundColor White
Write-Host "- 微信 ID" -ForegroundColor White
