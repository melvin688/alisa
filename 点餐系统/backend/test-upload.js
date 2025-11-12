/**
 * 测试图片上传API
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

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

// 2. 创建测试图片
function createTestImage() {
  const testImagePath = path.join(__dirname, 'test-image.jpg');
  
  // 如果文件不存在,创建一个1x1的JPEG文件
  if (!fs.existsSync(testImagePath)) {
    // JPEG 最小文件头 (1x1 红色像素)
    const jpegBuffer = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x03, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00,
      0x7F, 0x80, 0xFF, 0xD9
    ]);
    
    fs.writeFileSync(testImagePath, jpegBuffer);
    console.log('✅ 创建测试图片:', testImagePath);
  }
  
  return testImagePath;
}

// 3. 测试图片上传
async function testImageUpload() {
  try {
    console.log('\n[测试] 2. 测试图片上传...');
    
    const testImagePath = createTestImage();
    
    // 创建表单数据
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));
    
    // 发送上传请求
    const response = await axios.post(
      `${API_URL}/upload/image`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    if (response.data.success) {
      console.log('✅ 图片上传成功!');
      console.log('   文件名:', response.data.data.filename);
      console.log('   URL:', response.data.data.url);
      console.log('   大小:', response.data.data.size, 'bytes');
      return response.data.data;
    } else {
      console.error('❌ 图片上传失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ 上传请求错误:', error.response?.data || error.message);
    return null;
  }
}

// 4. 测试创建商品(使用上传的图片)
async function testCreateProduct(imageUrl) {
  try {
    console.log('\n[测试] 3. 测试创建商品(使用单个description字段)...');
    
    const productData = {
      category_id: 1,
      name_zh: '测试商品',
      name_my: '',  // 测试空名称
      name_en: '',  // 测试空名称
      description: '这是一个测试商品的单一描述', // 使用单个description
      price: 25.00,
      image_url: imageUrl,
      is_available: 1,
      sort_order: 0
    };
    
    const response = await axios.post(
      `${API_URL}/products/admin/create`,
      productData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    if (response.data.success) {
      console.log('✅ 商品创建成功!');
      console.log('   商品ID:', response.data.data.id);
      return response.data.data;
    } else {
      console.error('❌ 商品创建失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ 创建商品错误:', error.response?.data || error.message);
    return null;
  }
}

// 5. 测试创建分类(名称非必填)
async function testCreateCategory() {
  try {
    console.log('\n[测试] 4. 测试创建分类(名称非必填)...');
    
    const categoryData = {
      name_zh: '测试分类',
      name_my: '',  // 测试空名称
      name_en: '',  // 测试空名称
      icon: '🧪',
      sort_order: 0,
      is_active: 1
    };
    
    const response = await axios.post(
      `${API_URL}/categories/admin/create`,
      categoryData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    if (response.data.success) {
      console.log('✅ 分类创建成功!');
      console.log('   分类ID:', response.data.data.id);
      return response.data.data;
    } else {
      console.error('❌ 分类创建失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ 创建分类错误:', error.response?.data || error.message);
    return null;
  }
}

// 主测试流程
async function runTests() {
  console.log('\n========================================');
  console.log('  开始API测试');
  console.log('========================================');
  
  // 1. 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ 测试失败: 无法登录');
    return;
  }
  
  // 2. 测试图片上传
  const uploadResult = await testImageUpload();
  if (!uploadResult) {
    console.log('\n❌ 测试失败: 图片上传失败');
    return;
  }
  
  // 3. 测试创建商品
  const productResult = await testCreateProduct(uploadResult.url);
  
  // 4. 测试创建分类
  const categoryResult = await testCreateCategory();
  
  console.log('\n========================================');
  console.log('  测试完成');
  console.log('========================================');
  
  // 清理测试图片
  const testImagePath = path.join(__dirname, 'test-image.jpg');
  if (fs.existsSync(testImagePath)) {
    fs.unlinkSync(testImagePath);
    console.log('\n✅ 清理测试文件');
  }
}

// 运行测试
runTests().catch(error => {
  console.error('\n❌ 测试出错:', error);
  process.exit(1);
});
