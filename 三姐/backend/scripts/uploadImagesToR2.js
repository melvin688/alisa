const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const bucketName = 'image';

console.log('🚀 开始上传图片到 R2...\n');

// 检查 uploads 目录
if (!fs.existsSync(uploadsDir)) {
  console.error('❌ uploads 目录不存在!');
  process.exit(1);
}

// 获取所有图片文件
const files = fs.readdirSync(uploadsDir).filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
});

if (files.length === 0) {
  console.log('⚠️  没有找到图片文件');
  process.exit(0);
}

console.log(`📦 找到 ${files.length} 个图片文件\n`);

let successCount = 0;
let failCount = 0;

// 上传每个文件
for (const file of files) {
  const filePath = path.join(uploadsDir, file);
  const r2Path = file; // R2 中的路径,直接使用文件名
  
  try {
    console.log(`📤 上传: ${file}...`);
    
    // 使用 wrangler r2 object put 上传文件
    const command = `wrangler r2 object put ${bucketName}/${r2Path} --file="${filePath}"`;
    execSync(command, { stdio: 'pipe' });
    
    console.log(`   ✅ 成功`);
    successCount++;
  } catch (error) {
    console.log(`   ❌ 失败: ${error.message}`);
    failCount++;
  }
}

console.log('\n' + '='.repeat(60));
console.log(`📊 上传完成!`);
console.log(`   ✅ 成功: ${successCount} 个文件`);
console.log(`   ❌ 失败: ${failCount} 个文件`);
console.log('='.repeat(60));
