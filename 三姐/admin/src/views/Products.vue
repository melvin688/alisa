<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ $t('products.title') }}</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            {{ $t('products.addProduct') }}
          </el-button>
        </div>
      </template>

      <!-- 分类筛选 -->
      <div class="filter-bar">
        <div class="filter-label">
          <el-icon><Filter /></el-icon>
          <span>按分类筛选：</span>
        </div>
        <el-radio-group v-model="selectedCategoryId" @change="handleCategoryChange" class="category-filter">
          <el-radio-button :value="null">
            全部分类
            <el-tag type="info" size="small" style="margin-left: 8px;">{{ totalCount }}</el-tag>
          </el-radio-button>
          <el-radio-button v-for="cat in categoryList" :key="cat.id" :value="cat.id">
            {{ getCategoryLabel(cat) }}
            <el-tag type="primary" size="small" style="margin-left: 8px;">{{ getCategoryProductCount(cat.id) }}</el-tag>
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 商品总数提示 -->
      <el-alert
        v-if="productList.length === 0 && selectedCategoryId === null"
        title="提示"
        type="info"
        description="当前没有商品,请点击右上角'添加商品'按钮创建新商品"
        :closable="false"
        style="margin-bottom: 20px;"
      />
      <el-alert
        v-else-if="productList.length === 0 && selectedCategoryId !== null"
        title="提示"
        type="warning"
        description="该分类下暂无商品"
        :closable="false"
        style="margin-bottom: 20px;"
      />

      <!-- 表格 -->
      <el-table :data="productList" style="width: 100%" v-loading="loading">
        <el-table-column prop="image_url" :label="$t('products.image')" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.image_url"
              :src="getImageUrl(row.image_url)"
              style="width: 60px; height: 60px; border-radius: 4px;"
              fit="cover"
            />
            <div v-else style="width: 60px; height: 60px; background: #f5f5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
              无图片
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name_zh" :label="$t('products.name')" width="200">
          <template #default="{ row }">
            {{ getProductName(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="category_name_zh" :label="$t('products.category')" width="150">
          <template #default="{ row }">
            {{ getCategoryName(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="price" width="180">
          <template #header>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span>{{ $t('products.price') }}</span>
              <el-tooltip content="双击价格可快速编辑" placement="top">
                <el-icon style="color: #8D6E63; cursor: help;">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div v-if="editingPriceId === row.id" style="display: flex; align-items: center; gap: 6px;">
              <span style="color: #6B4423; font-weight: 600;">K</span>
              <el-input-number
                v-model="editingPrice"
                :min="0"
                :precision="0"
                size="small"
                style="width: 85px;"
                @keyup.enter="savePrice(row)"
              />
              <el-button
                type="primary"
                size="small"
                :icon="Check"
                circle
                @click="savePrice(row)"
              />
              <el-button
                size="small"
                :icon="Close"
                circle
                @click="cancelEditPrice"
              />
            </div>
            <div v-else 
                 @dblclick="startEditPrice(row)" 
                 style="cursor: pointer; padding: 4px 8px; border-radius: 8px; transition: all 0.3s;"
                 @mouseenter="$event.target.style.background = '#FFF8F0'"
                 @mouseleave="$event.target.style.background = 'transparent'"
                 title="双击编辑价格">
              <span style="font-weight: 600; color: #6B4423;">K {{ row.price }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" :label="$t('products.sort_order')" width="100" />
        <el-table-column prop="is_available" :label="$t('products.is_available')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_available ? 'success' : 'info'">
              {{ row.is_available ? $t('common.available') : $t('common.unavailable') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.actions')" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">
              {{ $t('common.edit') }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              {{ $t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item :label="$t('products.category')" prop="category_id">
          <el-select v-model="formData.category_id" style="width: 100%">
            <el-option
              v-for="cat in categoryList"
              :key="cat.id"
              :label="getCategoryLabel(cat)"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="$t('products.name_zh')">
          <el-input v-model="formData.name_zh" :placeholder="$t('products.nameZhPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('products.name_en')">
          <el-input v-model="formData.name_en" :placeholder="$t('products.nameEnPlaceholder')" />
        </el-form-item>
        
        <el-form-item :label="$t('products.description')">
          <el-input v-model="formData.description" type="textarea" :rows="3" :placeholder="$t('products.descriptionPlaceholder')" />
        </el-form-item>
        
        <el-form-item :label="$t('products.price')" prop="price">
          <el-input-number 
            v-model="formData.price" 
            :min="0" 
            :precision="0"
            :step="100"
            :controls="true"
            style="width: 200px;"
          />
          <span style="margin-left: 10px; color: #6B4423; font-weight: 600;">K</span>
          <div style="margin-top: 8px; font-size: 12px; color: #999;">
            提示：可以直接点击数字输入价格
          </div>
        </el-form-item>
        
        <el-form-item :label="$t('products.image')">
          <div class="image-upload-container">
            <!-- 图片预览 -->
            <div v-if="formData.image_url" class="image-preview">
              <el-image
                :src="getImageUrl(formData.image_url)"
                style="width: 150px; height: 150px; border-radius: 8px;"
                fit="cover"
              />
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                circle
                class="delete-image-btn"
                @click="handleRemoveImage"
              />
            </div>
            
            <!-- 上传按钮 -->
            <el-upload
              v-else
              class="image-uploader"
              name="image"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeUpload"
              accept="image/*"
            >
              <div class="upload-placeholder">
                <el-icon :size="40"><Plus /></el-icon>
                <div class="upload-text">{{ $t('products.uploadImage') }}</div>
              </div>
            </el-upload>
          </div>
        </el-form-item>
        
        <el-form-item :label="$t('products.sort_order')">
          <el-input-number v-model="formData.sort_order" :min="0" :max="999" />
        </el-form-item>
        
        <el-form-item :label="$t('products.is_available')">
          <el-switch v-model="formData.is_available" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Check, Close, QuestionFilled, Filter } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products'
import { getCategories } from '../api/categories'
import { useAuthStore } from '../stores/auth'

const { t, locale } = useI18n()
const authStore = useAuthStore()

const loading = ref(false)
const productList = ref([])
const allProducts = ref([]) // 保存所有商品
const categoryList = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const selectedCategoryId = ref(null) // 当前选中的分类ID

// 价格编辑状态
const editingPriceId = ref(null)
const editingPrice = ref(0)

// 上传配置
const uploadUrl = ref('http://localhost:3000/api/upload/image')
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${authStore.token}`
}))

const formData = ref({
  category_id: '',
  name_zh: '',
  name_en: '',
  description: '',
  price: 0,
  image_url: '',
  sort_order: 0,
  is_available: 1
})

const rules = {
  category_id: [
    { required: true, message: t('products.categoryRequired'), trigger: 'change' }
  ],
  price: [
    { required: true, message: t('products.priceRequired'), trigger: 'blur' }
  ]
}

const dialogTitle = computed(() => {
  return isEdit.value ? t('products.editProduct') : t('products.addProduct')
})

// 计算总商品数
const totalCount = computed(() => {
  return allProducts.value.length
})

// 获取每个分类的商品数量
const getCategoryProductCount = (categoryId) => {
  return allProducts.value.filter(p => p.category_id === categoryId).length
}

// 分类变更处理
const handleCategoryChange = () => {
  if (selectedCategoryId.value === null) {
    // 显示所有商品
    productList.value = [...allProducts.value]
  } else {
    // 筛选该分类的商品
    productList.value = allProducts.value.filter(p => p.category_id === selectedCategoryId.value)
  }
}

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await getProducts()
    if (res.success) {
      allProducts.value = res.data // 保存所有商品
      // 根据当前选中的分类筛选
      handleCategoryChange()
    }
  } catch (error) {
    ElMessage.error(t('common.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getCategories()
    if (res.success) {
      categoryList.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

// 添加商品
const handleAdd = () => {
  isEdit.value = false
  formData.value = {
    category_id: '',
    name_zh: '',
    name_en: '',
    description: '',
    price: 0,
    image_url: '',
    sort_order: 0,
    is_available: 1
  }
  dialogVisible.value = true
}

// 编辑商品
const handleEdit = (row) => {
  isEdit.value = true
  formData.value = { ...row }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          const res = await updateProduct(formData.value.id, formData.value)
          if (res.success) {
            ElMessage.success(t('common.updateSuccess'))
            dialogVisible.value = false
            fetchProducts()
          }
        } else {
          const res = await createProduct(formData.value)
          if (res.success) {
            ElMessage.success(t('common.createSuccess'))
            dialogVisible.value = false
            fetchProducts()
          }
        }
      } catch (error) {
        ElMessage.error(error.message || t('common.operationFailed'))
      }
    }
  })
}

// 删除商品
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      t('products.deleteConfirm'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )
    
    const res = await deleteProduct(row.id)
    if (res.success) {
      ElMessage.success(t('common.deleteSuccess'))
      fetchProducts()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || t('common.operationFailed'))
    }
  }
}

// 开始编辑价格
const startEditPrice = (row) => {
  editingPriceId.value = row.id
  editingPrice.value = row.price
}

// 保存价格
const savePrice = async (row) => {
  if (editingPrice.value === row.price) {
    cancelEditPrice()
    return
  }
  
  try {
    const res = await updateProduct(row.id, {
      ...row,
      price: editingPrice.value
    })
    
    if (res.success) {
      ElMessage.success(t('common.updateSuccess'))
      row.price = editingPrice.value
      cancelEditPrice()
    }
  } catch (error) {
    ElMessage.error(error.message || t('common.operationFailed'))
  }
}

// 取消编辑价格
const cancelEditPrice = () => {
  editingPriceId.value = null
  editingPrice.value = 0
}

// 根据当前语言获取商品名称
const getProductName = (row) => {
  if (locale.value === 'en' && row.name_en) {
    return row.name_en
  }
  return row.name_zh || row.name_en || '未命名'
}

// 根据当前语言获取分类名称
const getCategoryName = (row) => {
  if (locale.value === 'en' && row.category_name_en) {
    return row.category_name_en
  }
  return row.category_name_zh || row.category_name_en || '未分类'
}

// 根据当前语言获取分类选择器的标签
const getCategoryLabel = (cat) => {
  if (locale.value === 'en' && cat.name_en) {
    return cat.name_en
  }
  return cat.name_zh || cat.name_en || 'Unnamed'
}

// 获取图片完整URL
const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `http://localhost:3000${url}`
}

// 上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

// 上传成功
const handleUploadSuccess = (response) => {
  if (response.success) {
    formData.value.image_url = response.data.url
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 上传失败
const handleUploadError = (error) => {
  console.error('上传错误:', error)
  ElMessage.error('图片上传失败')
}

// 删除图片
const handleRemoveImage = () => {
  formData.value.image_url = ''
}

onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  background: linear-gradient(180deg, #FFF8F0 0%, #F5F5F5 100%);
  min-height: calc(100vh - 60px);
}

.filter-bar {
  margin-bottom: 20px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(107, 68, 35, 0.08);
  border: 2px solid #FFF8F0;
  transition: all 0.3s;
  
  &:hover {
    border-color: #8D6E63;
    box-shadow: 0 4px 16px rgba(107, 68, 35, 0.12);
  }
  
  :deep(.el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  :deep(.el-radio-button) {
    .el-radio-button__inner {
      border: 2px solid #E0E0E0;
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: 600;
      font-size: 14px;
      color: #6B4423;
      background: white;
      transition: all 0.3s;
      box-shadow: none;
      
      &:hover {
        border-color: #8D6E63;
        background: #FFF8F0;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(107, 68, 35, 0.15);
      }
    }
    
    &.is-active .el-radio-button__inner {
      background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
      border-color: #6B4423;
      color: white;
      box-shadow: 0 4px 12px rgba(107, 68, 35, 0.3);
    }
    
    &:first-child .el-radio-button__inner {
      border-left: 2px solid #E0E0E0;
    }
    
    &.is-active:first-child .el-radio-button__inner {
      border-left-color: #6B4423;
    }
  }
}

:deep(.el-card) {
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    font-size: 24px;
    font-weight: 800;
    background: linear-gradient(135deg, #6B4423 0%, #8D6E63 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  :deep(.el-button--primary) {
    background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(107, 68, 35, 0.3);
    transition: all 0.3s;
    font-weight: 700;
    padding: 12px 24px;
    border-radius: 12px;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(107, 68, 35, 0.4);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
  
  .el-table__header {
    background: linear-gradient(135deg, #FFF8F0 0%, white 100%);
    
    th {
      background: transparent !important;
      color: #6B4423;
      font-weight: 700;
      font-size: 14px;
    }
  }
  
  .el-table__body {
    tr:hover {
      background: #FFF8F0 !important;
    }
  }
  
  .cell {
    padding: 12px 0;
  }
  
  .el-tag {
    border-radius: 8px;
    border: none;
    font-weight: 600;
    padding: 6px 14px;
  }
  
  .el-tag--success {
    background: linear-gradient(135deg, #81C784 0%, #66BB6A 100%);
    color: white;
  }
  
  .el-tag--info {
    background: #E0E0E0;
    color: #616161;
  }
  
  .el-button {
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s;
    border: none;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
  
  .el-button--small {
    padding: 8px 16px;
  }
  
  .el-button--primary {
    background: linear-gradient(135deg, #42A5F5 0%, #1E88E5 100%);
  }
  
  .el-button--danger {
    background: linear-gradient(135deg, #EF5350 0%, #E53935 100%);
  }
}

.image-upload-container {
  width: 100%;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.delete-image-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #EF5350 0%, #E53935 100%);
  border: 2px solid white;
  box-shadow: 0 4px 12px rgba(239, 83, 80, 0.4);
}

.image-uploader {
  display: inline-block;
}

.upload-placeholder {
  width: 160px;
  height: 160px;
  border: 3px dashed #BCAAA4;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%);
}

.upload-placeholder:hover {
  border-color: #8D6E63;
  background: linear-gradient(135deg, #F5E6D3 0%, #EFEBE9 100%);
  transform: scale(1.02);
}

.upload-placeholder .el-icon {
  color: #8D6E63;
}

.upload-text {
  margin-top: 12px;
  font-size: 14px;
  color: #6B4423;
  font-weight: 600;
}

:deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  
  .el-dialog__header {
    background: linear-gradient(135deg, #FFF8F0 0%, white 100%);
    border-bottom: 2px solid #F5E6D3;
    padding: 24px;
    
    .el-dialog__title {
      font-size: 20px;
      font-weight: 800;
      color: #6B4423;
    }
  }
  
  .el-dialog__body {
    padding: 24px;
  }
  
  .el-form-item__label {
    font-weight: 600;
    color: #6B4423;
  }
  
  .el-input__inner,
  .el-textarea__inner {
    border-radius: 10px;
    border-color: #E0E0E0;
    
    &:focus {
      border-color: #8D6E63;
    }
  }
  
  .el-input-number {
    border-radius: 10px;
    
    .el-input__inner {
      border-radius: 10px;
    }
  }
  
  .el-select {
    .el-input__inner {
      border-radius: 10px;
    }
  }
  
  .el-dialog__footer {
    padding: 20px 24px;
    border-top: 2px solid #F5F5F5;
    
    .el-button {
      padding: 10px 24px;
      border-radius: 10px;
      font-weight: 700;
      border: none;
      
      &.el-button--default {
        background: #E0E0E0;
        color: #616161;
      }
      
      &.el-button--primary {
        background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
        box-shadow: 0 4px 12px rgba(107, 68, 35, 0.3);
      }
    }
  }
}
</style>
