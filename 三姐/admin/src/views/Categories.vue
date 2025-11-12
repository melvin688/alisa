<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ $t('categories.title') }}</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            {{ $t('categories.addCategory') }}
          </el-button>
        </div>
      </template>

      <!-- 表格 -->
      <el-table :data="categoryList" style="width: 100%" v-loading="loading">
        <el-table-column prop="icon" :label="$t('categories.icon')" width="80">
          <template #default="{ row }">
            <span style="font-size: 24px;">{{ row.icon }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('categories.name_zh')" width="200">
          <template #default="{ row }">
            {{ getCategoryName(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="name_en" :label="$t('categories.name_en')" />
        <el-table-column prop="sort_order" :label="$t('categories.sort_order')" width="100" />
        <el-table-column prop="is_active" :label="$t('categories.is_active')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? $t('common.active') : $t('common.inactive') }}
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
      width="600px"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item :label="$t('categories.name_zh')">
          <el-input v-model="formData.name_zh" :placeholder="$t('categories.nameZhPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('categories.name_en')">
          <el-input v-model="formData.name_en" :placeholder="$t('categories.nameEnPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('categories.icon')" prop="icon">
          <el-input v-model="formData.icon" :placeholder="$t('categories.iconPlaceholder')" />
          <div style="margin-top: 10px; color: #909399; font-size: 12px;">
            {{ $t('categories.iconHint') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('categories.sort_order')" prop="sort_order">
          <el-input-number v-model="formData.sort_order" :min="0" :max="999" />
        </el-form-item>
        <el-form-item :label="$t('categories.is_active')" prop="is_active">
          <el-switch v-model="formData.is_active" :active-value="1" :inactive-value="0" />
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
import { Plus } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories'

const { t, locale } = useI18n()

const loading = ref(false)
const categoryList = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)

const formData = ref({
  name_zh: '',
  name_en: '',
  icon: '🍽️',
  sort_order: 0,
  is_active: 1
})

const rules = {
  // 名称字段改为非必填,只保留icon验证
}

const dialogTitle = computed(() => {
  return isEdit.value ? t('categories.editCategory') : t('categories.addCategory')
})

// 根据当前语言获取分类名称
const getCategoryName = (row) => {
  if (locale.value === 'en' && row.name_en) {
    return row.name_en
  }
  return row.name_zh || row.name_en || '未命名'
}

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await getCategories()
    if (res.success) {
      categoryList.value = res.data
    }
  } catch (error) {
    ElMessage.error(t('common.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 添加分类
const handleAdd = () => {
  isEdit.value = false
  formData.value = {
    name_zh: '',
    name_en: '',
    icon: '🍽️',
    sort_order: 0,
    is_active: 1
  }
  dialogVisible.value = true
}

// 编辑分类
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
          const res = await updateCategory(formData.value.id, formData.value)
          if (res.success) {
            ElMessage.success(t('common.updateSuccess'))
            dialogVisible.value = false
            fetchCategories()
          }
        } else {
          const res = await createCategory(formData.value)
          if (res.success) {
            ElMessage.success(t('common.createSuccess'))
            dialogVisible.value = false
            fetchCategories()
          }
        }
      } catch (error) {
        ElMessage.error(error.message || t('common.operationFailed'))
      }
    }
  })
}

// 删除分类
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      t('categories.deleteConfirm'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )
    
    const res = await deleteCategory(row.id)
    if (res.success) {
      ElMessage.success(t('common.deleteSuccess'))
      fetchCategories()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || t('common.operationFailed'))
    }
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  background: linear-gradient(180deg, #FFF8F0 0%, #F5F5F5 100%);
  min-height: calc(100vh - 60px);
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
  
  .el-button--default {
    background: linear-gradient(135deg, #42A5F5 0%, #1E88E5 100%);
    color: white;
  }
  
  .el-button--danger {
    background: linear-gradient(135deg, #EF5350 0%, #E53935 100%);
  }
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
  
  .el-input__inner {
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
  
  .el-switch.is-checked .el-switch__core {
    background-color: #8D6E63;
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
