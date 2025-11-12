const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// 测试函数
async function testAPIs() {
  console.log('=== 开始测试API ===\n');

  // 1. 测试登录获取token
  console.log('1. 测试登录...');
  try {
    const loginRes = await axios.post(`${BASE_URL}/api/admin/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (!loginRes.data.success) {
      console.log('   ❌ 登录失败:', loginRes.data.message);
      return;
    }
    
    const token = loginRes.data.data.token;
    console.log('   ✅ 登录成功,token:', token.substring(0, 20) + '...\n');

    // 2. 测试获取餐桌列表
    console.log('2. 测试获取餐桌列表...');
    const tablesRes = await axios.get(`${BASE_URL}/api/tables/admin/list`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ 餐桌列表:', tablesRes.data.data.length, '个餐桌\n');

    // 3. 测试获取分类列表
    console.log('3. 测试获取分类列表...');
    const categoriesRes = await axios.get(`${BASE_URL}/api/categories/admin/list`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ 分类列表:', categoriesRes.data.data.length, '个分类\n');

    // 4. 测试创建分类
    console.log('4. 测试创建分类...');
    const createCatRes = await axios.post(`${BASE_URL}/api/categories/admin/create`, {
      name_zh: '测试分类',
      name_my: 'Test Category',
      name_en: 'Test Category',
      icon: '🧪',
      sort_order: 99,
      is_active: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ 分类创建:', createCatRes.data.message, '\n');

    // 5. 测试上传路由是否存在
    console.log('5. 测试上传路由...');
    try {
      await axios.post(`${BASE_URL}/api/upload/image`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('   ✅ 上传路由存在(返回400是因为没有文件)\n');
      } else {
        console.log('   ❌ 上传路由错误:', error.message, '\n');
      }
    }

    console.log('=== 测试完成 ===');

  } catch (error) {
    console.error('❌ 测试失败:', error.response ? error.response.data : error.message);
  }
}

testAPIs();
