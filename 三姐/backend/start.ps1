# 启动后端服务器
Set-Location $PSScriptRoot
$env:USE_SQLITE = "true"
node server.js
