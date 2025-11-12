const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const db = new Database('coffee_ordering.db');

console.log('=== 检查admins表 ===\n');

// 检查表结构
console.log('1. 表结构:');
const cols = db.prepare('PRAGMA table_info(admins)').all();
if (cols.length === 0) {
  console.log('   ❌ admins表不存在!\n');
  
  console.log('2. 创建admins表...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login_at DATETIME
    )
  `);
  console.log('   ✅ admins表已创建\n');
} else {
  cols.forEach(col => {
    console.log(`   ${col.name}: ${col.type}`);
  });
  console.log();
}

// 检查是否有admin用户
console.log('3. 检查admin用户:');
const admins = db.prepare('SELECT * FROM admins').all();
console.log(`   现有用户数: ${admins.length}`);

if (admins.length > 0) {
  admins.forEach(admin => {
    console.log(`   - ${admin.username} (${admin.name}) - 状态:${admin.status}`);
  });
} else {
  console.log('   ❌ 没有用户!');
}
console.log();

// 创建或更新admin用户
console.log('4. 创建/更新admin用户...');
const hashedPassword = bcrypt.hashSync('admin123', 10);

try {
  const existing = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');
  
  if (existing) {
    db.prepare('UPDATE admins SET password = ?, status = 1 WHERE username = ?')
      .run(hashedPassword, 'admin');
    console.log('   ✅ admin用户密码已更新');
  } else {
    db.prepare('INSERT INTO admins (username, password, name, role, status) VALUES (?, ?, ?, ?, ?)')
      .run('admin', hashedPassword, '系统管理员', 'admin', 1);
    console.log('   ✅ admin用户已创建');
  }
} catch (error) {
  console.error('   ❌ 错误:', error.message);
}

console.log('\n5. 最终用户列表:');
const finalAdmins = db.prepare('SELECT username, name, role, status FROM admins').all();
finalAdmins.forEach(admin => {
  console.log(`   - ${admin.username} (${admin.name}) - 角色:${admin.role} - 状态:${admin.status}`);
});

db.close();
console.log('\n=== 完成 ===');
