/**
 * 批量生成餐桌二维码
 * 使用方法: node scripts/generateQRCodes.js
 */

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const db = require('../config/database-sqlite');

// 配置
const BASE_URL = 'http://localhost:5173'; // 生产环境替换为实际域名
const OUTPUT_DIR = path.join(__dirname, '..', 'qrcodes');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateQRCodes() {
  try {
    console.log('🔄 开始生成二维码...\n');

    // 获取所有餐桌
    const [tables] = await db.query('SELECT * FROM tables ORDER BY table_number');

    if (tables.length === 0) {
      console.log('❌ 没有找到餐桌数据,请先初始化数据库');
      return;
    }

    console.log(`📋 找到 ${tables.length} 个餐桌\n`);

    // 生成每个餐桌的二维码
    for (const table of tables) {
      const url = `${BASE_URL}?table=${table.table_number}`;
      const filename = `table-${table.table_number}.png`;
      const filepath = path.join(OUTPUT_DIR, filename);

      // 生成二维码
      await QRCode.toFile(filepath, url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // 更新数据库中的二维码路径
      await db.query(
        'UPDATE tables SET qr_code = ? WHERE id = ?',
        [`/qrcodes/${filename}`, table.id]
      );

      console.log(`✅ 生成二维码: ${table.table_number} -> ${filename}`);
    }

    // 生成HTML预览页面
    generatePreviewHTML(tables);

    console.log('\n🎉 所有二维码生成完成!');
    console.log(`📁 保存位置: ${OUTPUT_DIR}`);
    console.log(`📄 预览页面: ${path.join(OUTPUT_DIR, 'preview.html')}`);
    
  } catch (error) {
    console.error('❌ 生成二维码失败:', error);
  }
}

// 生成HTML预览页面
function generatePreviewHTML(tables) {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>餐桌二维码预览</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    h1 {
      color: #333;
      margin-bottom: 10px;
    }
    
    .subtitle {
      color: #666;
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    .card h2 {
      color: #4CAF50;
      margin-bottom: 15px;
      font-size: 24px;
    }
    
    .card img {
      width: 100%;
      max-width: 200px;
      height: auto;
      border: 2px solid #4CAF50;
      border-radius: 5px;
      margin-bottom: 15px;
    }
    
    .card p {
      color: #666;
      font-size: 14px;
      margin-top: 10px;
    }
    
    .print-btn {
      display: block;
      width: 200px;
      margin: 30px auto;
      padding: 15px 30px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
    }
    
    .print-btn:hover {
      background: #45a049;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .header, .print-btn {
        display: none;
      }
      
      .grid {
        display: block;
      }
      
      .card {
        page-break-inside: avoid;
        margin-bottom: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🍽️ 餐桌二维码</h1>
    <p class="subtitle">扫描二维码即可点餐</p>
    <button class="print-btn" onclick="window.print()">🖨️ 打印所有二维码</button>
  </div>
  
  <div class="grid">
    ${tables.map(table => `
      <div class="card">
        <h2>桌号 ${table.table_number}</h2>
        <img src="table-${table.table_number}.png" alt="Table ${table.table_number}">
        <p>扫描二维码开始点餐</p>
        <p style="font-size: 12px; color: #999;">Table ${table.table_number}</p>
      </div>
    `).join('\n    ')}
  </div>
  
  <button class="print-btn" onclick="window.print()">🖨️ 打印所有二维码</button>
</body>
</html>
  `;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'preview.html'), html);
}

// 运行脚本
generateQRCodes();
