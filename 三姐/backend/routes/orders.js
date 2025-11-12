const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { getMyanmarTime, formatDateTime, generateOrderNo } = require('../utils/timezone');

// 注意：generateOrderNo 已从 timezone.js 导入，不需要在这里定义

// 创建订单
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { table_number, items, remark, language = 'zh', deviceId, service_type = 'dine-in' } = req.body;
    
    // 验证必填字段
    if (!items || items.length === 0) {
      throw new Error('缺少必要参数');
    }

    // 验证服务类型
    const validServiceTypes = ['dine-in', 'delivery', 'takeaway'];
    if (!validServiceTypes.includes(service_type)) {
      throw new Error('无效的服务类型');
    }

    // 根据服务类型验证必填信息
    if (service_type === 'dine-in' && !table_number) {
      throw new Error('在店堂食需要提供桌号');
    }

    if (service_type === 'delivery' && !remark) {
      throw new Error('外卖配送需要提供配送地址');
    }

    if (service_type === 'takeaway' && !remark) {
      throw new Error('来店自取需要提供取餐时间');
    }
    
    // 获取桌台信息（仅在店堂食需要）
    let table = null;
    if (service_type === 'dine-in') {
      const [tables] = await connection.query(
        'SELECT * FROM tables WHERE table_number = ?',
        [table_number]
      );
      
      if (tables.length === 0) {
        throw new Error('桌台不存在');
      }
      
      table = tables[0];
    }
    
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
    const myanmarTime = formatDateTime(getMyanmarTime());
    
    // 插入订单
    const [orderResult] = await connection.query(
      `INSERT INTO orders (order_no, table_id, table_number, total_amount, remark, language, device_id, service_type, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNo, 
        table ? table.id : null, 
        table_number || service_type, 
        totalAmount, 
        remark || '', 
        language, 
        deviceId || null,
        service_type,
        myanmarTime
      ]
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
    
    // 更新桌台状态为占用（仅堂食订单需要更新桌台状态）
    if (table && table.id) {
      await connection.query(
        'UPDATE tables SET status = ? WHERE id = ?',
        ['occupied', table.id]
      );
    }
    
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
    const { status, payment_status } = req.body;
    
    const allowedStatus = ['pending', 'preparing', 'completed', 'cancelled'];
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ success: false, message: '无效的订单状态' });
    }

    const allowedPaymentStatus = ['unpaid', 'paid'];
    if (payment_status && !allowedPaymentStatus.includes(payment_status)) {
      return res.status(400).json({ success: false, message: '无效的支付状态' });
    }
    
    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);

      // 如果订单完成,记录完成时间
      if (status === 'completed') {
        updates.push('completed_at = ?');
        params.push(formatDateTime(getMyanmarTime()));
      }
    }

    if (payment_status) {
      updates.push('payment_status = ?');
      params.push(payment_status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: '没有要更新的字段' });
    }

    params.push(req.params.orderNo);
    
    const [result] = await db.query(
      `UPDATE orders SET ${updates.join(', ')} WHERE order_no = ?`,
      params
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }
    
    res.json({ success: true, message: '订单更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取待处理订单列表 (B端管理后台使用)
router.get('/admin/pending', async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    
    const [orders] = await db.query(
      `SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o
       WHERE o.status = ?
       ORDER BY o.created_at DESC
       LIMIT 100`,
      [status]
    );
    
    // 获取每个订单的商品详情
    for (let order of orders) {
      const [items] = await db.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
      
      order.items = items.map(item => ({
        ...item,
        options: item.options ? JSON.parse(item.options) : {}
      }));
    }
    
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取所有订单列表 (B端管理后台使用)
router.get('/admin/list', async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    let params = [];
    
    if (status) {
      whereClause = 'WHERE o.status = ?';
      params.push(status);
    }
    
    const [orders] = await db.query(
      `SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    
    // 获取每个订单的商品详情
    for (let order of orders) {
      const [items] = await db.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
      
      order.items = items.map(item => ({
        ...item,
        options: item.options ? JSON.parse(item.options) : {}
      }));
    }
    
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取特定桌台的订单 (B端管理后台使用)
router.get('/admin/table/:tableId', async (req, res) => {
  try {
    // 先获取桌台信息
    const [tables] = await db.query(
      'SELECT * FROM tables WHERE id = ?',
      [req.params.tableId]
    );
    
    if (tables.length === 0) {
      return res.json({ success: true, data: [] });
    }
    
    const table = tables[0];
    
    // 获取该桌台的订单（排除已取消的）
    const [orders] = await db.query(
      `SELECT o.* FROM orders o
       WHERE o.table_id = ? 
       AND o.status != 'cancelled'
       ORDER BY o.created_at DESC`,
      [table.id]
    );
    
    // 获取每个订单的商品详情（包含多语言产品名称）
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, 
                p.name_zh, p.name_en, p.name_my
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      
      order.items = items.map(item => ({
        ...item,
        options: item.options ? JSON.parse(item.options) : {}
      }));
    }
    
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取外卖配送订单 (B端管理后台使用)
router.get('/admin/delivery', async (req, res) => {
  try {
    // 获取外卖配送订单（排除已取消的）
    const [orders] = await db.query(
      `SELECT o.* FROM orders o
       WHERE o.service_type = 'delivery'
       AND o.status != 'cancelled'
       ORDER BY o.created_at DESC`
    );
    
    // 获取每个订单的商品详情（包含多语言产品名称）
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, 
                p.name_zh, p.name_en, p.name_my
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      
      order.items = items.map(item => ({
        ...item,
        options: item.options ? JSON.parse(item.options) : {}
      }));
    }
    
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取来店自取订单 (B端管理后台使用)
router.get('/admin/takeaway', async (req, res) => {
  try {
    // 获取来店自取订单（排除已取消的）
    const [orders] = await db.query(
      `SELECT o.* FROM orders o
       WHERE o.service_type = 'takeaway'
       AND o.status != 'cancelled'
       ORDER BY o.created_at DESC`
    );
    
    // 获取每个订单的商品详情（包含多语言产品名称）
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, 
                p.name_zh, p.name_en, p.name_my
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      
      order.items = items.map(item => ({
        ...item,
        options: item.options ? JSON.parse(item.options) : {}
      }));
    }
    
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新订单状态 (B端管理后台使用)
router.put('/admin/status/:orderId', async (req, res) => {
  try {
    const { status } = req.body;
    
    const allowedStatus = ['pending', 'preparing', 'completed', 'cancelled'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ success: false, message: '无效的订单状态' });
    }
    
    const updates = ['status = ?'];
    const params = [status];

    // 如果订单完成,记录完成时间
    if (status === 'completed') {
      updates.push('completed_at = ?');
      params.push(formatDateTime(getMyanmarTime()));
    }

    params.push(req.params.orderId);
    
    const [result] = await db.query(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }
    
    res.json({ success: true, message: '订单状态更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除订单商品 (B端管理后台使用)
router.delete('/admin/item/:itemId', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 获取商品信息
    const [items] = await connection.query(
      'SELECT * FROM order_items WHERE id = ?',
      [req.params.itemId]
    );
    
    if (items.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: '商品不存在' });
    }
    
    const item = items[0];
    const orderId = item.order_id;
    
    // 删除商品
    await connection.query(
      'DELETE FROM order_items WHERE id = ?',
      [req.params.itemId]
    );
    
    // 重新计算订单总金额
    const [remainingItems] = await connection.query(
      'SELECT SUM(subtotal) as total FROM order_items WHERE order_id = ?',
      [orderId]
    );
    
    const newTotal = remainingItems[0].total || 0;
    
    // 更新订单总金额
    await connection.query(
      'UPDATE orders SET total_amount = ? WHERE id = ?',
      [newTotal, orderId]
    );
    
    // 如果订单没有商品了，取消订单
    if (newTotal === 0) {
      await connection.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['cancelled', orderId]
      );
    }
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: '商品已删除',
      data: {
        new_total: newTotal,
        order_cancelled: newTotal === 0
      }
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

// 删除订单 (B端管理后台使用)
router.delete('/admin/:orderId', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 检查订单是否存在
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.orderId]
    );
    
    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: '订单不存在' });
    }
    
    // 删除订单商品
    await connection.query(
      'DELETE FROM order_items WHERE order_id = ?',
      [req.params.orderId]
    );
    
    // 删除订单
    await connection.query(
      'DELETE FROM orders WHERE id = ?',
      [req.params.orderId]
    );
    
    await connection.commit();
    
    res.json({ success: true, message: '订单已删除' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

// 打印订单 (B端管理后台使用)
router.post('/admin/print/:orderId', async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.orderId]
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
    
    order.items = items;
    
    // 这里可以调用打印服务
    // 暂时只返回成功
    
    res.json({ success: true, message: '打印成功', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取我的订单（C端）
router.get('/my-orders', async (req, res) => {
  try {
    const { deviceId } = req.query;
    
    if (!deviceId) {
      return res.json({
        success: true,
        data: []
      });
    }

    // 查询该设备的所有未完成订单
    const [orders] = await db.query(
      `SELECT o.*, t.table_number 
       FROM orders o
       LEFT JOIN tables t ON o.table_id = t.id
       WHERE o.device_id = ? AND o.status IN ('pending', 'preparing')
       ORDER BY o.created_at DESC`,
      [deviceId]
    );

    // 获取每个订单的商品详情
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name_zh, p.name_en
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      order.items = items.map(item => {
        if (item.options && typeof item.options === 'string') {
          item.options = JSON.parse(item.options);
        }
        return item;
      });
    }

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('获取订单历史失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
