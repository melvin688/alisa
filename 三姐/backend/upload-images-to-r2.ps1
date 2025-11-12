# 批量上传图片到 Cloudflare R2
$uploadsDir = ".\uploads"
$bucketName = "image"

Write-Host "开始上传图片到 R2 bucket: $bucketName" -ForegroundColor Green

# 获取所有图片文件
$imageFiles = Get-ChildItem -Path $uploadsDir -File -Filter "*.png"
$imageFiles += Get-ChildItem -Path $uploadsDir -File -Filter "*.jpg"
$imageFiles += Get-ChildItem -Path $uploadsDir -File -Filter "*.jpeg"
$imageFiles += Get-ChildItem -Path $uploadsDir -File -Filter "*.gif"
$imageFiles += Get-ChildItem -Path $uploadsDir -File -Filter "*.webp"

$totalFiles = $imageFiles.Count
$currentFile = 0
$successCount = 0
$failCount = 0

foreach ($file in $imageFiles) {
    $currentFile++
    $fileName = $file.Name
    $filePath = $file.FullName
    
    Write-Host "[$currentFile/$totalFiles] 上传: $fileName" -NoNewline
    
    try {
        # 使用 wrangler r2 object put 上传到远程R2
        $output = & wrangler r2 object put "image/$fileName" --file="$filePath" --remote 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✓" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " ✗ 失败" -ForegroundColor Red
            Write-Host "  错误: $output" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host " ✗ 异常" -ForegroundColor Red
        Write-Host "  错误: $_" -ForegroundColor Red
        $failCount++
    }
    
    # 避免请求过快
    Start-Sleep -Milliseconds 200
}

Write-Host "`n上传完成!" -ForegroundColor Green
Write-Host "成功: $successCount 个文件" -ForegroundColor Green
Write-Host "失败: $failCount 个文件" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
Write-Host "总计: $totalFiles 个文件"
