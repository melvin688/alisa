<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ $t('tables.title') }}</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            {{ $t('tables.addTable') }}
          </el-button>
        </div>
      </template>

      <!-- 表格 -->
      <el-table :data="tableList" style="width: 100%" v-loading="loading">
        <el-table-column prop="table_number" :label="$t('tables.tableNumber')" width="120" />
        <el-table-column prop="table_name" :label="$t('tables.tableName')" />
        <el-table-column prop="capacity" :label="$t('tables.capacity')" width="100" />
        <el-table-column prop="status" :label="$t('tables.status')" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'available' ? 'success' : 'warning'">
              {{ $t(`tables.statusOptions.${row.status}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="qr_code" :label="$t('tables.qrCode')" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewQR(row)">
              {{ $t('tables.viewQRCode') }}
            </el-button>
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
      width="500px"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item :label="$t('tables.tableNumber')" prop="table_number">
          <el-input v-model="formData.table_number" :placeholder="$t('tables.tableNumberPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('tables.tableName')" prop="table_name">
          <el-input v-model="formData.table_name" :placeholder="$t('tables.tableNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('tables.capacity')" prop="capacity">
          <el-input-number v-model="formData.capacity" :min="1" :max="20" />
        </el-form-item>
        <el-form-item :label="$t('tables.status')" prop="status">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option value="available" :label="$t('tables.statusOptions.available')" />
            <el-option value="occupied" :label="$t('tables.statusOptions.occupied')" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 二维码对话框 -->
    <el-dialog
      v-model="qrDialogVisible"
      :title="$t('tables.qrCode')"
      width="400px"
    >
      <div style="text-align: center;">
        <div style="font-size: 18px; margin-bottom: 20px;">
          {{ currentTable?.table_name }} ({{ currentTable?.table_number }})
        </div>
        <div id="qrcode" style="display: flex; justify-content: center;"></div>
        <div style="margin-top: 20px; color: #666;">
          {{ currentTable?.qr_code }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { getTables, createTable, updateTable, deleteTable } from '../api/tables'
import QRCode from 'qrcodejs2'

const { t } = useI18n()

const loading = ref(false)
const tableList = ref([])
const dialogVisible = ref(false)
const qrDialogVisible = ref(false)
const formRef = ref(null)
const currentTable = ref(null)
const isEdit = ref(false)

const formData = ref({
  table_number: '',
  table_name: '',
  capacity: 4,
  status: 'available'
})

const rules = {
  table_number: [
    { required: true, message: t('tables.tableNumberRequired'), trigger: 'blur' }
  ],
  table_name: [
    { required: true, message: t('tables.tableNameRequired'), trigger: 'blur' }
  ]
}

const dialogTitle = computed(() => {
  return isEdit.value ? t('tables.editTable') : t('tables.addTable')
})

// 获取餐桌列表
const fetchTables = async () => {
  loading.value = true
  try {
    const res = await getTables()
    if (res.success) {
      tableList.value = res.data
    }
  } catch (error) {
    ElMessage.error(t('common.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 添加餐桌
const handleAdd = () => {
  isEdit.value = false
  formData.value = {
    table_number: '',
    table_name: '',
    capacity: 4,
    status: 'available'
  }
  dialogVisible.value = true
}

// 编辑餐桌
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
          const res = await updateTable(formData.value.id, formData.value)
          if (res.success) {
            ElMessage.success(t('common.updateSuccess'))
            dialogVisible.value = false
            fetchTables()
          }
        } else {
          const res = await createTable(formData.value)
          if (res.success) {
            ElMessage.success(t('common.createSuccess'))
            dialogVisible.value = false
            fetchTables()
          }
        }
      } catch (error) {
        ElMessage.error(error.message || t('common.operationFailed'))
      }
    }
  })
}

// 删除餐桌
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      t('tables.deleteConfirm'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )
    
    const res = await deleteTable(row.id)
    if (res.success) {
      ElMessage.success(t('common.deleteSuccess'))
      fetchTables()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || t('common.operationFailed'))
    }
  }
}

// 查看二维码
const handleViewQR = (row) => {
  currentTable.value = row
  qrDialogVisible.value = true
  
  nextTick(() => {
    // 清空之前的二维码
    const qrcodeEl = document.getElementById('qrcode')
    qrcodeEl.innerHTML = ''
    
    // 生成新的二维码
    new QRCode(qrcodeEl, {
      text: row.qr_code,
      width: 256,
      height: 256,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    })
  })
}

onMounted(() => {
  fetchTables()
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
