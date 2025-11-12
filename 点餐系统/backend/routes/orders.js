const express = require('express');
const router = express.Router();
const db = require('../config/database');
const moment = require('moment');

// 生成订单号
function generateOrderNo() {
  const now = moment();
  const timestamp = now.format('YYYYMMDDHHmmss');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
}

// 创建订单
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { table_number, items, remark, language = 'zh' } = req.body;
    
    // 验证必填字段
    if (!table_number || !items || items.length === 0) {
      throw new Error('缺少必要参数');
    }
    
    // 获取桌台信息
    const [tables] = await connection.query(
      'SELECT * FROM tables WHERE table_number = ?',
      [table_number]
    );
    
    if (tables.length === 0) {
      throw new Error('桌台不存在');
    }
    
    const table = tables[0];
    
    // 计算总金额
    let totalAmount = 0;
    const orderItems = [];
    
    for (let item of items) {
      const [products] = await connection.query(
        'SELECT * FROM products WHERE id = ? AND is_available = 1',
        [item.product_id]
      );
      
      if (products.length === 0) {
        throw new Error(`商品ID ${item.product_id} 不存在或已下架`);
      }
      
      const product = products[0];
      let itemPrice = parseFloat(product.price);
      
      // 计算规格加价
      if (item.options && typeof item.options === 'object') {
        for (let optionId of Object.values(item.options)) {
          if (optionId) {
            const [options] = await connection.query(
              'SELECT extra_price FROM product_options WHERE id = ?',
              [optionId]
            );
            if (options.length > 0) {
              itemPrice += parseFloat(options[0].extra_price);
            }
          }
        }
      }
      
      const quantity = parseInt(item.quantity) || 1;
      const subtotal = itemPrice * quantity;
      totalAmount += subtotal;
      
      // 根据语言选择商品名称
      let productName = product.name_zh;
      if (language === 'my') productName = product.name_my || product.name_zh;
      if (language === 'en') productName = product.name_en || product.name_zh;
      
      orderItems.push({
        product_id: product.id,
        product_name: productName,
        quantity,
        unit_price: itemPrice,
        options: JSON.stringify(item.options || {}),
        subtotal
      });
    }
    
    // 生成订单号
    const orderNo = generateOrderNo();
    
    // 插入订单
    const [orderResult] = await connection.query(
      `INSERT INTO orders (order_no, table_id, table_number, total_amount, remark, language) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderNo, table.id, table_number, totalAmount, remark || '', language]
    );
    
    const orderId = orderResult.insertId;
    
    // 插入订单详情
    for (let item of orderItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, options, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.quantity, item.unit_price, item.options, item.subtotal]
      );
    }
    
    // 更新桌台状态为占用
    await connection.query(
      'UPDATE tables SET status = ? WHERE id = ?',
      ['occupied', table.id]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: '订单创建成功',
      data: {
        order_id: orderId,
        order_no: orderNo,
        total_amount: totalAmount
      }
    });
    
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

// 获取订单详情
router.get('/:orderNo', async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE order_no = ?',
      [req.params.orderNo]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }
    
    const order = orders[0];
    
    // 获取订单详情
    const [items] = await db.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id]
    );
    
    order.items = items.map(item => ({
      ...item,
      options: JSON.parse(item.options)
    }));
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取桌台的所有订单
router.get('/table/:tableNumber', async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT * FROM orders 
       WHERE table_number = ? 
       ORDER BY created_at DESC`,
      [req.params.tableNumber]
    );
    
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新订单状态
router.patch('/:orderNo/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const allowedStatus = ['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ success: false, message: '无效的状态' });
    }
    
    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE order_no = ?',
      [status, req.params.orderNo]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }
    
    res.json({ success: true, message: '订单状态更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
