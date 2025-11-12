/**
 * 打印API路由
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database-sqlite');
const PrintService = require('../services/printService');

/**
 * 获取订单打印内容 (文本格式)
 * GET /api/print/receipt/:orderId
 */
router.get('/receipt/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { format = 'text' } = req.query; // text, html, kitchen

    // 获取订单详情
    const [orders] = await db.query(
      `SELECT o.*, t.table_number 
       FROM orders o
       LEFT JOIN tables t ON o.table_id = t.id
       WHERE o.id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    const order = orders[0];

    // 获取订单商品
    const [items] = await db.query(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [orderId]
    );

    // 解析商品规格JSON
    items.forEach(item => {
      if (item.options && typeof item.options === 'string') {
        item.options = JSON.parse(item.options);
      }
    });

    order.items = items;

    // 根据格式生成打印内容
    let content;
    let contentType = 'text/plain';

    switch (format) {
      case 'html':
        content = PrintService.generateHTMLReceipt(order);
        contentType = 'text/html';
        break;
      case 'kitchen':
        content = PrintService.generateKitchenReceipt(order);
        break;
      default:
        content = PrintService.generateReceipt(order);
    }

    // 更新打印状态
    if (format !== 'kitchen') {
      await db.query(
        'UPDATE orders SET is_printed = 1 WHERE id = ?',
        [orderId]
      );
    }

    res.setHeader('Content-Type', contentType + '; charset=utf-8');
    res.send(content);

  } catch (error) {
    console.error('打印错误:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 批量打印订单
 * POST /api/print/batch
 * Body: { orderIds: [1, 2, 3] }
 */
router.post('/batch', async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供订单ID数组'
      });
    }

    const receipts = [];

    for (const orderId of orderIds) {
      // 获取订单详情
      const [orders] = await db.query(
        `SELECT o.*, t.table_number 
         FROM orders o
         LEFT JOIN tables t ON o.table_id = t.id
         WHERE o.id = ?`,
        [orderId]
      );

      if (orders.length > 0) {
        const order = orders[0];

        // 获取订单商品
        const [items] = await db.query(
          `SELECT * FROM order_items WHERE order_id = ?`,
          [orderId]
        );

        items.forEach(item => {
          if (item.options && typeof item.options === 'string') {
            item.options = JSON.parse(item.options);
          }
        });

        order.items = items;

        receipts.push({
          orderId,
          orderNo: order.order_no,
          content: PrintService.generateReceipt(order)
        });

        // 更新打印状态和订单状态为已完成
        await db.query(
          'UPDATE orders SET is_printed = 1, status = ? WHERE id = ?',
          ['completed', orderId]
        );
      }
    }

    res.json({
      success: true,
      data: receipts
    });

  } catch (error) {
    console.error('批量打印错误:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
