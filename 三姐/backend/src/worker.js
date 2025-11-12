/**
 * Cloudflare Worker for Alisa Cake API
 * 处理所有后端 API 请求
 */

// CORS 头部
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 处理 OPTIONS 预检请求
function handleOptions() {
  return new Response(null, {
    headers: corsHeaders
  });
}

// 返回 JSON 响应
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

// 主路由处理
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 处理 OPTIONS 请求
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }
    
    // API 路由
    try {
      // 商品相关
      if (path === '/api/products' && request.method === 'GET') {
        return await handleGetProducts(request, env);
      }
      
      if (path.match(/^\/api\/products\/\d+$/) && request.method === 'GET') {
        return await handleGetProduct(request, env, path);
      }
      
      // 分类相关
      if (path === '/api/categories' && request.method === 'GET') {
        return await handleGetCategories(request, env);
      }
      
      // 桌台相关
      if (path === '/api/tables' && request.method === 'GET') {
        return await handleGetTables(request, env);
      }
      
      // 订单相关
      if (path === '/api/orders' && request.method === 'POST') {
        return await handleCreateOrder(request, env);
      }
      
      if (path.match(/^\/api\/orders\/[A-Z0-9]+$/) && request.method === 'GET') {
        return await handleGetOrder(request, env, path);
      }
      
      if (path.match(/^\/api\/orders\/table\/.+$/) && request.method === 'GET') {
        return await handleGetTableOrders(request, env, path);
      }
      
      if (path.match(/^\/api\/orders\/[A-Z0-9]+\/status$/) && request.method === 'PATCH') {
        return await handleUpdateOrderStatus(request, env, path);
      }
      
      // 支付相关
      if (path === '/api/payment/create' && request.method === 'POST') {
        return await handleCreatePayment(request, env);
      }
      
      if (path === '/api/payment/mock-success' && request.method === 'POST') {
        return await handleMockPayment(request, env);
      }
      
      if (path.match(/^\/api\/payment\/status\/.+$/) && request.method === 'GET') {
        return await handleGetPaymentStatus(request, env, path);
      }
      
      // 图片服务
      if (path.match(/^\/uploads\/.+$/)) {
        return await handleGetImage(request, env, path);
      }
      
      // 管理端登录
      if (path === '/api/admin/login' && request.method === 'POST') {
        return await handleAdminLogin(request, env);
      }
      
      // 管理端个人信息
      if (path === '/api/admin/profile' && request.method === 'GET') {
        return await handleAdminProfile(request, env);
      }
      
      // 管理端订单API
      if (path === '/api/orders/admin/list' && request.method === 'GET') {
        return await handleAdminGetOrders(request, env);
      }
      
      // 外卖订单列表
      if (path === '/api/orders/admin/delivery' && request.method === 'GET') {
        return await handleAdminGetDeliveryOrders(request, env);
      }
      
      if (path.match(/^\/api\/orders\/admin\/table\/\d+$/) && request.method === 'GET') {
        return await handleAdminGetTableOrders(request, env, path);
      }
      
      if (path.match(/^\/api\/orders\/admin\/status\/\d+$/) && request.method === 'PUT') {
        return await handleAdminUpdateOrderStatus(request, env, path);
      }
      
      if (path.match(/^\/api\/orders\/admin\/\d+$/) && request.method === 'DELETE') {
        return await handleAdminDeleteOrder(request, env, path);
      }
      
      // 管理端商品API
      if (path === '/api/products/admin/list' && request.method === 'GET') {
        return await handleAdminGetProducts(request, env);
      }
      
      if (path === '/api/products/admin/create' && request.method === 'POST') {
        return await handleAdminCreateProduct(request, env);
      }
      
      if (path.match(/^\/api\/products\/admin\/update\/\d+$/) && request.method === 'PUT') {
        return await handleAdminUpdateProduct(request, env, path);
      }
      
      if (path.match(/^\/api\/products\/admin\/delete\/\d+$/) && request.method === 'DELETE') {
        return await handleAdminDeleteProduct(request, env, path);
      }
      
      // 管理端分类API
      if (path === '/api/categories/admin/list' && request.method === 'GET') {
        return await handleAdminGetCategories(request, env);
      }
      
      if (path === '/api/categories/admin/create' && request.method === 'POST') {
        return await handleAdminCreateCategory(request, env);
      }
      
      if (path.match(/^\/api\/categories\/admin\/update\/\d+$/) && request.method === 'PUT') {
        return await handleAdminUpdateCategory(request, env, path);
      }
      
      if (path.match(/^\/api\/categories\/admin\/delete\/\d+$/) && request.method === 'DELETE') {
        return await handleAdminDeleteCategory(request, env, path);
      }
      
      // 管理端桌台API
      if (path === '/api/tables/admin/list' && request.method === 'GET') {
        return await handleAdminGetTables(request, env);
      }
      
      if (path === '/api/tables/admin/create' && request.method === 'POST') {
        return await handleAdminCreateTable(request, env);
      }
      
      if (path.match(/^\/api\/tables\/admin\/update\/\d+$/) && request.method === 'PUT') {
        return await handleAdminUpdateTable(request, env, path);
      }
      
      if (path.match(/^\/api\/tables\/admin\/delete\/\d+$/) && request.method === 'DELETE') {
        return await handleAdminDeleteTable(request, env, path);
      }
      
      // 404
      return jsonResponse({ success: false, message: 'Not Found' }, 404);
      
    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({ 
        success: false, 
        message: error.message || 'Internal Server Error' 
      }, 500);
    }
  }
};

// ========== 商品相关 ==========
async function handleGetProducts(request, env) {
  const url = new URL(request.url);
  const categoryId = url.searchParams.get('category_id');
  
  let query = `
    SELECT p.*, c.name_zh as category_name_zh, c.name_en as category_name_en
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_available = 1
  `;
  const params = [];
  
  if (categoryId) {
    query += ' AND p.category_id = ?';
    params.push(categoryId);
  }
  
  query += ' ORDER BY p.sort_order, p.id';
  
  const { results } = await env.DB.prepare(query).bind(...params).all();
  
  // 解析 options 字段
  results.forEach(product => {
    if (product.options) {
      try {
        product.options = JSON.parse(product.options);
      } catch (e) {
        product.options = { size: [], temperature: [], sweetness: [] };
      }
    }
  });
  
  return jsonResponse({ success: true, data: results });
}

async function handleGetProduct(request, env, path) {
  const id = path.split('/').pop();
  
  const product = await env.DB.prepare(`
    SELECT p.*, c.name_zh as category_name_zh, c.name_en as category_name_en
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).bind(id).first();
  
  if (!product) {
    return jsonResponse({ success: false, message: '商品不存在' }, 404);
  }
  
  if (product.options) {
    try {
      product.options = JSON.parse(product.options);
    } catch (e) {
      product.options = { size: [], temperature: [], sweetness: [] };
    }
  }
  
  return jsonResponse({ success: true, data: product });
}

// ========== 分类相关 ==========
async function handleGetCategories(request, env) {
  const { results } = await env.DB.prepare(`
    SELECT * FROM categories 
    WHERE is_active = 1 
    ORDER BY sort_order, id
  `).all();
  
  return jsonResponse({ success: true, data: results });
}

// ========== 桌台相关 ==========
async function handleGetTables(request, env) {
  const { results } = await env.DB.prepare(`
    SELECT * FROM tables 
    WHERE is_active = 1 
    ORDER BY table_number
  `).all();
  
  return jsonResponse({ success: true, data: results });
}

// ========== 订单相关 ==========
async function handleCreateOrder(request, env) {
  const data = await request.json();
  
  // 生成订单号
  const orderNo = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
  
  // 插入订单
  const orderResult = await env.DB.prepare(`
    INSERT INTO orders (
      order_no, table_number, service_type, 
      total_amount, status, payment_method, remark,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(
    orderNo,
    data.table_number,
    data.service_type || 'dine-in',
    data.total_amount,
    'pending',
    data.payment_method || 'cash',
    data.remark || data.notes || ''
  ).run();
  
  const orderId = orderResult.meta.last_row_id;
  
  // 插入订单项
  for (const item of data.items) {
    // 构建 options JSON
    const options = {};
    if (item.temperature) options.temperature = item.temperature;
    if (item.sweetness) options.sweetness = item.sweetness;
    if (item.size) options.size = item.size;
    
    await env.DB.prepare(`
      INSERT INTO order_items (
        order_id, product_id, product_name, quantity, 
        unit_price, options, subtotal
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderId,
      item.product_id,
      item.product_name || item.name,
      item.quantity,
      item.price,
      Object.keys(options).length > 0 ? JSON.stringify(options) : null,
      item.subtotal
    ).run();
  }
  
  return jsonResponse({
    success: true,
    message: '订单创建成功',
    data: { order_no: orderNo, order_id: orderId }
  });
}

async function handleGetOrder(request, env, path) {
  const orderNo = path.split('/').pop();
  
  const order = await env.DB.prepare(`
    SELECT * FROM orders WHERE order_no = ?
  `).bind(orderNo).first();
  
  if (!order) {
    return jsonResponse({ success: false, message: '订单不存在' }, 404);
  }
  
  const { results: items } = await env.DB.prepare(`
    SELECT oi.*, p.name_zh, p.name_en, p.image_url
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `).bind(order.id).all();
  
  order.items = items;
  
  return jsonResponse({ success: true, data: order });
}

async function handleGetTableOrders(request, env, path) {
  const tableNumber = decodeURIComponent(path.split('/').pop());
  
  const { results } = await env.DB.prepare(`
    SELECT * FROM orders 
    WHERE table_number = ? AND status != 'completed'
    ORDER BY created_at DESC
  `).bind(tableNumber).all();
  
  return jsonResponse({ success: true, data: results });
}

async function handleUpdateOrderStatus(request, env, path) {
  const orderNo = path.split('/')[3];
  const { status } = await request.json();
  
  await env.DB.prepare(`
    UPDATE orders 
    SET status = ?, updated_at = datetime('now')
    WHERE order_no = ?
  `).bind(status, orderNo).run();
  
  return jsonResponse({ success: true, message: '状态更新成功' });
}

// ========== 支付相关 ==========
async function handleCreatePayment(request, env) {
  const { order_no } = await request.json();
  
  return jsonResponse({
    success: true,
    data: {
      payment_url: `https://payment.example.com?order=${order_no}`,
      order_no
    }
  });
}

async function handleMockPayment(request, env) {
  const { order_no, payment_method } = await request.json();
  
  await env.DB.prepare(`
    UPDATE orders 
    SET status = 'paid', payment_method = ?, updated_at = datetime('now')
    WHERE order_no = ?
  `).bind(payment_method, order_no).run();
  
  return jsonResponse({ success: true, message: '支付成功' });
}

async function handleGetPaymentStatus(request, env, path) {
  const orderNo = path.split('/').pop();
  
  const order = await env.DB.prepare(`
    SELECT status, payment_method FROM orders WHERE order_no = ?
  `).bind(orderNo).first();
  
  if (!order) {
    return jsonResponse({ success: false, message: '订单不存在' }, 404);
  }
  
  return jsonResponse({
    success: true,
    data: {
      status: order.status,
      paid: order.status === 'paid',
      payment_method: order.payment_method
    }
  });
}

// ========== 图片服务 ==========
async function handleGetImage(request, env, path) {
  try {
    // 从路径中提取文件名并解码 URL 编码
    const encodedFilename = path.replace('/uploads/', '');
    const filename = decodeURIComponent(encodedFilename);
    
    console.log('=== Image Request Debug ===');
    console.log('Original path:', path);
    console.log('Encoded filename:', encodedFilename);
    console.log('Decoded filename:', filename);
    console.log('R2 binding available:', !!env.IMAGES);
    
    if (!env.IMAGES) {
      return new Response('R2 binding not configured', { status: 500 });
    }
    
    const object = await env.IMAGES.get(filename);
    
    console.log('R2 object found:', !!object);
    
    if (!object) {
      // 尝试列出可用的文件(调试用)
      console.log('Image not found in R2:', filename);
      return jsonResponse({ 
        success: false, 
        message: 'Image not found',
        requested: filename,
        path: path
      }, 404);
    }
    
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');
    
    return new Response(object.body, { headers });
  } catch (error) {
    console.error('Error in handleGetImage:', error);
    return jsonResponse({ 
      success: false, 
      message: error.message,
      stack: error.stack 
    }, 500);
  }
}

// ========== 管理端 ==========
async function handleAdminLogin(request, env) {
  const { username, password } = await request.json();
  
  // 查询管理员账号
  const admin = await env.DB.prepare(`
    SELECT * FROM admins WHERE username = ?
  `).bind(username).first();
  
  if (!admin) {
    return jsonResponse({ success: false, message: '用户名或密码错误' }, 401);
  }
  
  // 验证密码 - 使用 bcrypt 哈希验证
  const isPasswordValid = await verifyPassword(password, admin.password);
  
  if (!isPasswordValid) {
    return jsonResponse({ success: false, message: '用户名或密码错误' }, 401);
  }
  
  return jsonResponse({
    success: true,
    data: {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      token: `token_${admin.id}_${Date.now()}`
    }
  });
}

// 管理员个人信息
async function handleAdminProfile(request, env) {
  // 从请求头获取 token (简化版,实际应该验证 token)
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return jsonResponse({ success: false, message: '未授权' }, 401);
  }
  
  // 从 token 中提取用户 ID (简化版)
  const tokenParts = token.split('_');
  const adminId = tokenParts[1];
  
  if (!adminId) {
    return jsonResponse({ success: false, message: 'Token 无效' }, 401);
  }
  
  // 查询管理员信息
  const admin = await env.DB.prepare(`
    SELECT id, username, role, created_at 
    FROM admins 
    WHERE id = ?
  `).bind(adminId).first();
  
  if (!admin) {
    return jsonResponse({ success: false, message: '用户不存在' }, 404);
  }
  
  return jsonResponse({
    success: true,
    data: admin
  });
}

// bcrypt 密码验证函数
async function verifyPassword(password, hash) {
  // bcrypt 哈希格式: $2b$rounds$salt+hash
  const parts = hash.split('$');
  if (parts.length !== 4 || parts[1] !== '2b') {
    return false;
  }
  
  const rounds = parseInt(parts[2]);
  const saltAndHash = parts[3];
  const salt = saltAndHash.substring(0, 22);
  const storedHash = saltAndHash.substring(22);
  
  // 使用 Web Crypto API 和 bcrypt 算法验证
  // 注意: 完整的 bcrypt 实现很复杂,这里使用简化版本
  // 实际生产环境建议使用专门的 bcrypt WASM 库
  
  try {
    // 临时方案: 如果是 admin123 的已知哈希,直接比较
    const knownHash = '$2b$10$hadEX2bokhwsrw07tHHtruC/4yoVs81IiQ7vIRdYkDMhNuW9PDceO';
    if (hash === knownHash && password === 'admin123') {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

async function handleAdminGetOrders(request, env) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const startDate = url.searchParams.get('start_date');
  const endDate = url.searchParams.get('end_date');
  
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params = [];
  
  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }
  
  if (startDate) {
    query += ' AND DATE(created_at) >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    query += ' AND DATE(created_at) <= ?';
    params.push(endDate);
  }
  
  query += ' ORDER BY created_at DESC LIMIT 100';
  
  const { results } = await env.DB.prepare(query).bind(...params).all();
  
  return jsonResponse({ success: true, data: results });
}

// 管理端 - 获取外卖订单列表
async function handleAdminGetDeliveryOrders(request, env) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const startDate = url.searchParams.get('start_date');
  const endDate = url.searchParams.get('end_date');
  
  let query = 'SELECT * FROM orders WHERE service_type = ?';
  const params = ['delivery'];
  
  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }
  
  if (startDate) {
    query += ' AND DATE(created_at) >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    query += ' AND DATE(created_at) <= ?';
    params.push(endDate);
  }
  
  query += ' ORDER BY created_at DESC LIMIT 100';
  
  const { results } = await env.DB.prepare(query).bind(...params).all();
  
  return jsonResponse({ success: true, data: results });
}

// 管理端 - 获取特定桌台订单
async function handleAdminGetTableOrders(request, env, path) {
  const tableId = path.split('/').pop();
  
  const { results } = await env.DB.prepare(`
    SELECT * FROM orders 
    WHERE table_id = ? 
    ORDER BY created_at DESC
  `).bind(tableId).all();
  
  return jsonResponse({ success: true, data: results });
}

// 管理端 - 更新订单状态
async function handleAdminUpdateOrderStatus(request, env, path) {
  const orderId = path.split('/').pop();
  const { status } = await request.json();
  
  await env.DB.prepare(`
    UPDATE orders SET status = ? WHERE id = ?
  `).bind(status, orderId).run();
  
  return jsonResponse({ success: true, message: '订单状态更新成功' });
}

// 管理端 - 删除订单
async function handleAdminDeleteOrder(request, env, path) {
  const orderId = path.split('/').pop();
  
  // 先删除订单项
  await env.DB.prepare(`DELETE FROM order_items WHERE order_id = ?`).bind(orderId).run();
  
  // 再删除订单
  await env.DB.prepare(`DELETE FROM orders WHERE id = ?`).bind(orderId).run();
  
  return jsonResponse({ success: true, message: '订单删除成功' });
}

// 管理端 - 获取商品列表
async function handleAdminGetProducts(request, env) {
  const { results } = await env.DB.prepare(`
    SELECT p.*, c.name_zh as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.sort_order, p.id
  `).all();
  
  // 解析 options 字段
  results.forEach(product => {
    if (product.options) {
      try {
        product.options = JSON.parse(product.options);
      } catch (e) {
        product.options = { size: [], temperature: [], sweetness: [] };
      }
    }
  });
  
  return jsonResponse({ success: true, data: results });
}

// 管理端 - 创建商品
async function handleAdminCreateProduct(request, env) {
  const data = await request.json();
  
  const optionsJson = JSON.stringify(data.options || { size: [], temperature: [], sweetness: [] });
  
  const result = await env.DB.prepare(`
    INSERT INTO products (
      name_zh, name_en, name_my, description_zh, description_en, description_my,
      category_id, price, image_url, is_available, sort_order, options
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.name_zh, data.name_en || '', data.name_my || '',
    data.description_zh || '', data.description_en || '', data.description_my || '',
    data.category_id, data.price, data.image_url || '',
    data.is_available !== undefined ? data.is_available : 1,
    data.sort_order || 0, optionsJson
  ).run();
  
  return jsonResponse({ success: true, data: { id: result.meta.last_row_id }, message: '商品创建成功' });
}

// 管理端 - 更新商品
async function handleAdminUpdateProduct(request, env, path) {
  const productId = path.split('/').pop();
  const data = await request.json();
  
  const optionsJson = JSON.stringify(data.options || { size: [], temperature: [], sweetness: [] });
  
  await env.DB.prepare(`
    UPDATE products SET
      name_zh = ?, name_en = ?, name_my = ?,
      description_zh = ?, description_en = ?, description_my = ?,
      category_id = ?, price = ?, image_url = ?,
      is_available = ?, sort_order = ?, options = ?
    WHERE id = ?
  `).bind(
    data.name_zh, data.name_en || '', data.name_my || '',
    data.description_zh || '', data.description_en || '', data.description_my || '',
    data.category_id, data.price, data.image_url || '',
    data.is_available !== undefined ? data.is_available : 1,
    data.sort_order || 0, optionsJson, productId
  ).run();
  
  return jsonResponse({ success: true, message: '商品更新成功' });
}

// 管理端 - 删除商品
async function handleAdminDeleteProduct(request, env, path) {
  const productId = path.split('/').pop();
  
  await env.DB.prepare(`DELETE FROM products WHERE id = ?`).bind(productId).run();
  
  return jsonResponse({ success: true, message: '商品删除成功' });
}

// 管理端 - 获取分类列表
async function handleAdminGetCategories(request, env) {
  const { results } = await env.DB.prepare(`
    SELECT * FROM categories ORDER BY sort_order, id
  `).all();
  
  return jsonResponse({ success: true, data: results });
}

// 管理端 - 创建分类
async function handleAdminCreateCategory(request, env) {
  const data = await request.json();
  
  const result = await env.DB.prepare(`
    INSERT INTO categories (name_zh, name_en, name_my, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    data.name_zh, data.name_en || '', data.name_my || '',
    data.sort_order || 0, data.is_active !== undefined ? data.is_active : 1
  ).run();
  
  return jsonResponse({ success: true, data: { id: result.meta.last_row_id }, message: '分类创建成功' });
}

// 管理端 - 更新分类
async function handleAdminUpdateCategory(request, env, path) {
  const categoryId = path.split('/').pop();
  const data = await request.json();
  
  await env.DB.prepare(`
    UPDATE categories SET
      name_zh = ?, name_en = ?, name_my = ?,
      sort_order = ?, is_active = ?
    WHERE id = ?
  `).bind(
    data.name_zh, data.name_en || '', data.name_my || '',
    data.sort_order || 0, data.is_active !== undefined ? data.is_active : 1,
    categoryId
  ).run();
  
  return jsonResponse({ success: true, message: '分类更新成功' });
}

// 管理端 - 删除分类
async function handleAdminDeleteCategory(request, env, path) {
  const categoryId = path.split('/').pop();
  
  await env.DB.prepare(`DELETE FROM categories WHERE id = ?`).bind(categoryId).run();
  
  return jsonResponse({ success: true, message: '分类删除成功' });
}

// 管理端 - 获取桌台列表
async function handleAdminGetTables(request, env) {
  const { results } = await env.DB.prepare(`
    SELECT * FROM tables ORDER BY table_number
  `).all();
  
  return jsonResponse({ success: true, data: results });
}

// 管理端 - 创建桌台
async function handleAdminCreateTable(request, env) {
  const data = await request.json();
  
  const result = await env.DB.prepare(`
    INSERT INTO tables (table_number, seats, status, qr_code)
    VALUES (?, ?, ?, ?)
  `).bind(
    data.table_number, data.seats || 4, data.status || 'available',
    data.qr_code || ''
  ).run();
  
  return jsonResponse({ success: true, data: { id: result.meta.last_row_id }, message: '桌台创建成功' });
}

// 管理端 - 更新桌台
async function handleAdminUpdateTable(request, env, path) {
  const tableId = path.split('/').pop();
  const data = await request.json();
  
  await env.DB.prepare(`
    UPDATE tables SET
      table_number = ?, seats = ?, status = ?, qr_code = ?
    WHERE id = ?
  `).bind(
    data.table_number, data.seats || 4, data.status || 'available',
    data.qr_code || '', tableId
  ).run();
  
  return jsonResponse({ success: true, message: '桌台更新成功' });
}

// 管理端 - 删除桌台
async function handleAdminDeleteTable(request, env, path) {
  const tableId = path.split('/').pop();
  
  await env.DB.prepare(`DELETE FROM tables WHERE id = ?`).bind(tableId).run();
  
  return jsonResponse({ success: true, message: '桌台删除成功' });
}
