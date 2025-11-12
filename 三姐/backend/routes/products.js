const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// ========== 公开API (C端使用) ==========

// 获取所有商品（包含分类和规格）
router.get('/', async (req, res) => {
  try {
    const { category_id } = req.query;
    
    let query = `
      SELECT p.*, c.name_zh as category_name_zh, c.name_my as category_name_my, c.name_en as category_name_en
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_available = 1
    `;
    
    const params = [];
    if (category_id) {
      query += ' AND p.category_id = ?';
      params.push(category_id);
    }
    
    query += ' ORDER BY p.sort_order, p.id';
    
    const [products] = await db.query(query, params);
    
    // 为每个商品获取规格选项
    for (let product of products) {
      const [options] = await db.query(
        'SELECT * FROM product_options WHERE product_id = ? ORDER BY option_type, sort_order',
        [product.id]
      );
      
      // 按类型分组规格
      product.options = {
        size: options.filter(o => o.option_type === 'size'),
        temperature: options.filter(o => o.option_type === 'temperature'),
        sweetness: options.filter(o => o.option_type === 'sweetness')
      };
    }
    
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取单个商品详情
router.get('/:id', async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT p.*, c.name_zh as category_name_zh, c.name_my as category_name_my, c.name_en as category_name_en
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }
    
    const product = products[0];
    
    // 获取规格选项
    const [options] = await db.query(
      'SELECT * FROM product_options WHERE product_id = ? ORDER BY option_type, sort_order',
      [product.id]
    );
    
    product.options = {
      size: options.filter(o => o.option_type === 'size'),
      temperature: options.filter(o => o.option_type === 'temperature'),
      sweetness: options.filter(o => o.option_type === 'sweetness')
    };
    
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== 管理员API (B端使用, 需要认证) ==========

// 获取所有商品 (管理员,包括未上架的)
router.get('/admin/list', authMiddleware, async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT p.*, c.name_zh as category_name_zh
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.sort_order, p.id`
    );
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 创建商品
router.post('/admin/create', authMiddleware, async (req, res) => {
  try {
    const {
      category_id,
      name_zh,
      name_my,
      name_en,
      description,    // 支持单个description字段
      description_zh, // 向后兼容
      description_my,
      description_en,
      price,
      image_url,
      is_available,
      sort_order
    } = req.body;
    
    // 名称字段改为非必填,只验证category_id和price
    if (!category_id || !price) {
      return res.json({
        success: false,
        message: '分类ID和价格不能为空'
      });
    }

    // 支持单个description字段,自动填充到三个语言字段
    const desc_zh = description_zh || description || '';
    const desc_my = description_my || description || '';
    const desc_en = description_en || description || '';

    const [result] = await db.query(
      `INSERT INTO products 
       (category_id, name_zh, name_my, name_en, description_zh, description_my, description_en, price, image_url, is_available, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name_zh || '',
        name_my || '',
        name_en || '',
        desc_zh,
        desc_my,
        desc_en,
        price,
        image_url || '',
        is_available !== undefined ? is_available : 1,
        sort_order || 0
      ]
    );

    res.json({
      success: true,
      data: {
        id: result.insertId,
        category_id,
        name_zh,
        name_my,
        name_en,
        price,
        is_available: is_available !== undefined ? is_available : 1
      },
      message: '商品创建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 更新商品
router.put('/admin/update/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name_zh,
      name_my,
      name_en,
      description,    // 支持单个description字段
      description_zh, // 向后兼容
      description_my,
      description_en,
      price,
      image_url,
      is_available,
      sort_order
    } = req.body;

    // 支持单个description字段,自动填充到三个语言字段
    const desc_zh = description_zh || description || '';
    const desc_my = description_my || description || '';
    const desc_en = description_en || description || '';

    await db.query(
      `UPDATE products 
       SET category_id = ?, name_zh = ?, name_my = ?, name_en = ?, 
           description_zh = ?, description_my = ?, description_en = ?,
           price = ?, image_url = ?, is_available = ?, sort_order = ?
       WHERE id = ?`,
      [
        category_id,
        name_zh || '',
        name_my || '',
        name_en || '',
        desc_zh,
        desc_my,
        desc_en,
        price,
        image_url || '',
        is_available,
        sort_order || 0,
        id
      ]
    );

    res.json({
      success: true,
      message: '商品更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 删除商品
router.delete('/admin/delete/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 删除商品规格
    await db.query('DELETE FROM product_options WHERE product_id = ?', [id]);
    
    // 删除商品
    await db.query('DELETE FROM products WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '商品删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
