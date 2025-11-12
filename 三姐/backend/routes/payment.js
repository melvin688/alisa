const express = require('express');
const router = express.Router();
const db = require('../config/database');
const axios = require('axios');
const crypto = require('crypto');

// KPAY 支付服务（模拟）
class KPayService {
  constructor() {
    this.merchantId = process.env.KPAY_MERCHANT_ID || 'TEST_MERCHANT';
    this.apiKey = process.env.KPAY_API_KEY || 'TEST_API_KEY';
    this.apiUrl = process.env.KPAY_API_URL || 'https://api.kbzpay.com';
  }

  generateSignature(params) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return crypto
      .createHmac('sha256', this.apiKey)
      .update(sortedParams)
      .digest('hex');
  }

  async createPayment(orderData) {
    // 测试环境：模拟支付
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        paymentUrl: `${process.env.FRONTEND_URL}/payment/mock?order_no=${orderData.orderNo}`,
        transactionId: `MOCK_${Date.now()}`,
        message: '开发环境：模拟支付'
      };
    }

    // 生产环境：实际调用 KPAY API
    const params = {
      merch_code: this.merchantId,
      merch_order_id: orderData.orderNo,
      total_amount: orderData.totalAmount,
      trans_currency: 'MMK',
      method: '011',
      trade_type: 'APP',
      notify_url: `${process.env.APP_URL}/api/payment/callback`,
      continue_url: `${process.env.FRONTEND_URL}/order/success`,
      timestamp: Date.now()
    };

    params.sign = this.generateSignature(params);

    try {
      const response = await axios.post(`${this.apiUrl}/payment/gateway`, params);
      return response.data;
    } catch (error) {
      console.error('KPAY payment error:', error);
      throw new Error('支付请求失败');
    }
  }

  verifyCallback(callbackData) {
    const { sign, ...params } = callbackData;
    const calculatedSign = this.generateSignature(params);
    return sign === calculatedSign;
  }

  async queryOrder(orderNo) {
    const params = {
      merch_code: this.merchantId,
      merch_order_id: orderNo,
      timestamp: Date.now()
    };

    params.sign = this.generateSignature(params);

    try {
      const response = await axios.post(`${this.apiUrl}/payment/query`, params);
      return response.data;
    } catch (error) {
      console.error('KPAY query error:', error);
      throw new Error('查询订单失败');
    }
  }
}

const kpayService = new KPayService();

// 创建支付请求
router.post('/create', async (req, res) => {
  try {
    const { order_no } = req.body;
    
    if (!order_no) {
      return res.status(400).json({ success: false, message: '缺少订单号' });
    }
    
    // 查询订单
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE order_no = ?',
      [order_no]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }
    
    const order = orders[0];
    
    if (order.payment_status === 'success') {
      return res.status(400).json({ success: false, message: '订单已支付' });
    }
    
    // 创建支付
    const paymentResult = await kpayService.createPayment({
      orderNo: order.order_no,
      totalAmount: order.total_amount
    });
    
    res.json({
      success: true,
      data: paymentResult
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// KPAY 支付回调（生产环境使用）
router.post('/callback', async (req, res) => {
  try {
    const callbackData = req.body;
    
    // 验证签名
    if (!kpayService.verifyCallback(callbackData)) {
      return res.status(400).json({ success: false, message: '签名验证失败' });
    }
    
    const { merch_order_id, transaction_id, status } = callbackData;
    
    // 更新订单支付状态
    if (status === 'success') {
      await db.query(
        `UPDATE orders 
         SET payment_status = 'success', 
             status = 'paid',
             kpay_transaction_id = ?,
             paid_at = NOW()
         WHERE order_no = ?`,
        [transaction_id, merch_order_id]
      );
    } else {
      await db.query(
        `UPDATE orders 
         SET payment_status = 'failed'
         WHERE order_no = ?`,
        [merch_order_id]
      );
    }
    
    res.json({ success: true, message: '回调处理成功' });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 模拟支付成功（仅开发环境）
router.post('/mock-success', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ success: false, message: '仅限开发环境使用' });
  }
  
  try {
    const { order_no, payment_method = 'kpay' } = req.body;
    
    // 根据支付方式设置不同的状态
    let updateData = {
      payment_status: 'success',
      paid_at: new Date()
    };
    
    if (payment_method === 'cash') {
      // 现金支付：订单状态为待处理，但标记为已支付（现场支付）
      updateData.status = 'pending';
      updateData.payment_method = 'cash';
      updateData.kpay_transaction_id = `CASH_${Date.now()}`;
    } else {
      // KPAY支付：订单状态为已支付
      updateData.status = 'paid';
      updateData.payment_method = 'kpay';
      updateData.kpay_transaction_id = `MOCK_${Date.now()}`;
    }
    
    await db.query(
      `UPDATE orders 
       SET payment_status = ?, 
           status = ?,
           payment_method = ?,
           kpay_transaction_id = ?,
           paid_at = ?
       WHERE order_no = ?`,
      [
        updateData.payment_status,
        updateData.status,
        updateData.payment_method,
        updateData.kpay_transaction_id,
        updateData.paid_at,
        order_no
      ]
    );
    
    res.json({ success: true, message: '支付成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 查询支付状态
router.get('/status/:orderNo', async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT payment_status, status, kpay_transaction_id FROM orders WHERE order_no = ?',
      [req.params.orderNo]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }
    
    res.json({ success: true, data: orders[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
