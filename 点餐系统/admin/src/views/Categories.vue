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
        <el-table-column prop="name_zh" :label="$t('categories.name_zh')" />
        <el-table-column prop="name_my" :label="$t('categories.name_my')" />
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
        <el-form-item :label="$t('categories.name_my')">
          <el-input v-model="formData.name_my" :placeholder="$t('categories.nameMyPlaceholder')" />
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

const { t } = useI18n()

const loading = ref(false)
const categoryList = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)

const formData = ref({
  name_zh: '',
  name_my: '',
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
    name_my: '',
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
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
