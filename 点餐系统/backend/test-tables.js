/**
 * 测试Tables API
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// 测试用的管理员账号
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

let authToken = '';

// 1. 登录获取token
async function login() {
  try {
    console.log('\n[测试] 1. 管理员登录...');
    const response = await axios.post(`${API_URL}/admin/login`, ADMIN_CREDENTIALS);
    
    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ 登录成功,获取到token');
      return true;
    } else {
      console.error('❌ 登录失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 登录请求错误:', error.message);
    return false;
  }
}

// 2. 获取餐桌列表
async function getTables() {
  try {
    console.log('\n[测试] 2. 获取餐桌列表...');
    
    const response = await axios.get(
      `${API_URL}/tables/admin/list`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    if (response.data.success) {
      console.log('✅ 获取餐桌列表成功!');
      console.log('   餐桌数量:', response.data.data.length);
      console.log('\n   前3个餐桌:');
      response.data.data.slice(0, 3).forEach(table => {
        console.log(`   - ID: ${table.id}, 桌号: ${table.table_number}, 名称: ${table.table_name}, 容量: ${table.capacity}, 状态: ${table.status}`);
      });
      return response.data.data;
    } else {
      console.error('❌ 获取餐桌列表失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ 获取餐桌列表错误:', error.response?.data || error.message);
    return null;
  }
}

// 主测试流程
async function runTests() {
  console.log('\n========================================');
  console.log('  Tables API 测试');
  console.log('========================================');
  
  // 1. 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ 测试失败: 无法登录');
    return;
  }
  
  // 2. 获取餐桌列表
  const tables = await getTables();
  
  console.log('\n========================================');
  console.log('  测试完成');
  console.log('========================================');
}

// 运行测试
runTests().catch(error => {
  console.error('\n❌ 测试出错:', error);
  process.exit(1);
});
