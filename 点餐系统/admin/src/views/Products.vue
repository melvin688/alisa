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
        <el-table-column prop="name_zh" :label="$t('products.name')" width="200" />
        <el-table-column prop="category_name_zh" :label="$t('products.category')" width="120" />
        <el-table-column prop="price" :label="$t('products.price')" width="100">
          <template #default="{ row }">
            {{ row.price }} MMK
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
              :label="cat.name_zh"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="$t('products.name_zh')">
          <el-input v-model="formData.name_zh" :placeholder="$t('products.nameZhPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('products.name_my')">
          <el-input v-model="formData.name_my" :placeholder="$t('products.nameMyPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('products.name_en')">
          <el-input v-model="formData.name_en" :placeholder="$t('products.nameEnPlaceholder')" />
        </el-form-item>
        
        <el-form-item :label="$t('products.description')">
          <el-input v-model="formData.description" type="textarea" :rows="3" :placeholder="$t('products.descriptionPlaceholder')" />
        </el-form-item>
        
        <el-form-item :label="$t('products.price')" prop="price">
          <el-input-number v-model="formData.price" :min="0" :precision="0" />
          <span style="margin-left: 10px;">MMK</span>
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
import { Plus, Delete } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products'
import { getCategories } from '../api/categories'
import { useAuthStore } from '../stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(false)
const productList = ref([])
const categoryList = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)

// 上传配置
const uploadUrl = ref('http://localhost:3000/api/upload/image')
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${authStore.token}`
}))

const formData = ref({
  category_id: '',
  name_zh: '',
  name_my: '',
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

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await getProducts()
    if (res.success) {
      productList.value = res.data
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
    name_my: '',
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
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

.image-uploader {
  display: inline-block;
}

.upload-placeholder {
  width: 150px;
  height: 150px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-placeholder:hover {
  border-color: #409EFF;
}

.upload-text {
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
}
</style>
