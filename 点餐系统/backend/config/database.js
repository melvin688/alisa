// 根据环境变量选择数据库
if (process.env.USE_SQLITE === 'true') {
  // 使用 SQLite（本地测试）
  console.log('📦 使用 SQLite 数据库');
  module.exports = require('./database-sqlite');
} else {
  // 使用 MySQL（生产环境）
  const mysql = require('mysql2');

  // 创建连接池
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'coffee_ordering',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });

  // Promise 包装
  const promisePool = pool.promise();

  // 测试连接
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('❌ 数据库连接失败:', err.message);
      return;
    }
    console.log('✅ 数据库连接成功');
    connection.release();
  });

  module.exports = promisePool;
}
