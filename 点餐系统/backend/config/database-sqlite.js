const Database = require('better-sqlite3');
const path = require('path');

// 创建 SQLite 数据库
const dbPath = path.join(__dirname, '..', 'coffee_ordering.db');
const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

console.log('✅ SQLite 数据库连接成功');

// 包装查询方法以模拟 MySQL2 的 Promise API
const promiseDb = {
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      try {
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          const stmt = db.prepare(sql);
          const rows = params.length > 0 ? stmt.all(...params) : stmt.all();
          resolve([rows]);
        } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
          const stmt = db.prepare(sql);
          const info = params.length > 0 ? stmt.run(...params) : stmt.run();
          resolve([{ insertId: info.lastInsertRowid, affectedRows: info.changes }]);
        } else if (sql.trim().toUpperCase().startsWith('UPDATE') || sql.trim().toUpperCase().startsWith('DELETE')) {
          const stmt = db.prepare(sql);
          const info = params.length > 0 ? stmt.run(...params) : stmt.run();
          resolve([{ affectedRows: info.changes }]);
        } else {
          // 其他 SQL 语句（如 CREATE TABLE）
          db.exec(sql);
          resolve([{ affectedRows: 0 }]);
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  
  getConnection: async () => {
    const transaction = {
      beginTransaction: () => Promise.resolve(db.prepare('BEGIN').run()),
      commit: () => Promise.resolve(db.prepare('COMMIT').run()),
      rollback: () => Promise.resolve(db.prepare('ROLLBACK').run()),
      release: () => Promise.resolve(),
      query: promiseDb.query
    };
    return transaction;
  }
};

module.exports = promiseDb;
