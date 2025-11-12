/**
 * 添加服务类型字段到订单表
 * service_type: dine-in(在店堂食), delivery(外卖配送), takeaway(来店自取)
 */

const db = require('../config/database')
const useSqlite = process.env.USE_SQLITE === 'true'

async function addServiceTypeSQLite() {
  try {
    console.log('开始添加service_type字段（SQLite）...')

    // 检查字段是否已存在
    const result = await db.query("PRAGMA table_info(orders)")
    console.log('PRAGMA结果：', result)
    const columns = Array.isArray(result[0]) ? result[0] : result
    console.log('Columns:', columns)

    const hasServiceType = columns.some(col => col.name === 'service_type')

    if (hasServiceType) {
      console.log('✓ service_type字段已存在')
      return
    }

    // SQLite: 添加service_type字段
    await db.query(
      `ALTER TABLE orders ADD COLUMN service_type TEXT DEFAULT 'dine-in'`
    )

    console.log('✓ 成功添加service_type字段')

    // 更新现有订单
    await db.query(
      `UPDATE orders SET service_type = 'dine-in' WHERE service_type IS NULL OR service_type = ''`
    )

    console.log(`✓ 更新了现有订单记录`)

    // 查询示例
    const [sampleOrders] = await db.query(
      "SELECT order_no, table_number, service_type, status FROM orders LIMIT 5"
    )

    console.log('\n示例订单数据：')
    console.table(sampleOrders)

    console.log('\n✓ 数据库更新完成！')
  } catch (error) {
    console.error('✗ 添加字段失败：', error)
    throw error
  }
}

async function addServiceTypeMySQL() {
  let connection = null
  
  try {
    console.log('开始添加service_type字段（MySQL）...')
    
    connection = await db.getConnection()

    // 检查字段是否已存在
    const [columns] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'service_type'"
    )

    if (columns.length > 0) {
      console.log('✓ service_type字段已存在')
      return
    }

    // MySQL: 添加service_type字段
    await connection.query(
      `ALTER TABLE orders ADD COLUMN service_type ENUM('dine-in', 'delivery', 'takeaway') DEFAULT 'dine-in' AFTER remark`
    )

    console.log('✓ 成功添加service_type字段')

    // 更新现有订单
    const [result] = await connection.query(
      `UPDATE orders SET service_type = 'dine-in' WHERE service_type IS NULL`
    )

    console.log(`✓ 更新了 ${result.affectedRows} 条现有订单记录`)

    // 查询示例
    const [sampleOrders] = await connection.query(
      "SELECT order_no, table_number, service_type, status FROM orders LIMIT 5"
    )

    console.log('\n示例订单数据：')
    console.table(sampleOrders)

    console.log('\n✓ 数据库更新完成！')
  } catch (error) {
    console.error('✗ 添加字段失败：', error)
    throw error
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

// 执行脚本
const addServiceType = useSqlite ? addServiceTypeSQLite : addServiceTypeMySQL

addServiceType()
  .then(() => {
    console.log('\n脚本执行成功')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n脚本执行失败：', error)
    process.exit(1)
  })
