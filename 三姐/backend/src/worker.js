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
      
      // 管理端订单列表
      if (path === '/api/admin/orders' && request.method === 'GET') {
        return await handleAdminGetOrders(request, env);
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
      total_amount, status, payment_method, notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).bind(
    orderNo,
    data.table_number,
    data.service_type || 'dine_in',
    data.total_amount,
    'pending',
    data.payment_method || 'cash',
    data.notes || ''
  ).run();
  
  const orderId = orderResult.meta.last_row_id;
  
  // 插入订单项
  for (const item of data.items) {
    await env.DB.prepare(`
      INSERT INTO order_items (
        order_id, product_id, product_name, quantity, 
        price, temperature, sweetness, size, subtotal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderId,
      item.product_id,
      item.product_name || item.name,
      item.quantity,
      item.price,
      item.temperature || null,
      item.sweetness || null,
      item.size || null,
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
  const filename = path.replace('/uploads/', '');
  
  const object = await env.IMAGES.get(filename);
  
  if (!object) {
    return new Response('Image not found', { status: 404 });
  }
  
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  
  return new Response(object.body, { headers });
}

// ========== 管理端 ==========
async function handleAdminLogin(request, env) {
  const { username, password } = await request.json();
  
  const admin = await env.DB.prepare(`
    SELECT * FROM admins WHERE username = ? AND password = ?
  `).bind(username, password).first();
  
  if (!admin) {
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
