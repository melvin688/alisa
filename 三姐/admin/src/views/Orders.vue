<template>
  <div class="orders-management">
    <el-card class="header-card">
      <div class="header-content">
        <h2>{{ $t('orders.title') }}</h2>
        <div class="stats">
          <el-tag type="warning" size="large">
            {{ $t('orders.pending') }}: {{ pendingCount }}
          </el-tag>
          <el-tag type="info" size="large">
            {{ $t('orders.preparing') }}: {{ preparingCount }}
          </el-tag>
        </div>
      </div>
    </el-card>

    <!-- 订单卡片网格 -->
    <div class="orders-grid">
      <el-card
        v-for="order in orders"
        :key="order.id"
        class="order-card"
        :class="`status-${order.status}`"
        shadow="hover"
      >
        <!-- 订单头部 -->
        <template #header>
          <div class="order-header">
            <div class="table-info">
              <el-tag size="large" type="success">
                {{ $t('orders.table') }}: {{ order.table_number }}
              </el-tag>
              <span class="order-time">
                {{ formatTime(order.created_at) }}
              </span>
            </div>
            <el-tag :type="getStatusType(order.status)">
              {{ $t(`orders.status.${order.status}`) }}
            </el-tag>
          </div>
        </template>

        <!-- 订单商品列表 -->
        <div class="order-items">
          <div v-for="(item, index) in order.items" :key="index" class="order-item">
            <div class="item-info">
              <span class="item-name">{{ item.product_name }}</span>
              <span class="item-quantity">x{{ item.quantity }}</span>
            </div>
            <div v-if="item.options" class="item-options">
              <el-tag
                v-for="(opt, key) in parseOptions(item.options)"
                :key="key"
                size="small"
                type="info"
              >
                {{ opt }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 订单备注 -->
        <div v-if="order.remark" class="order-remark">
          <el-alert
            :title="$t('orders.remark')"
            :description="order.remark"
            type="warning"
            :closable="false"
          />
        </div>

        <!-- 订单金额 -->
        <div class="order-total">
          <strong>{{ $t('orders.total') }}:</strong>
          <span class="amount">K {{ order.total_amount.toFixed(0) }}</span>
        </div>

        <!-- 操作按钮 -->
        <div class="order-actions">
          <el-button
            v-if="order.status === 'pending'"
            type="primary"
            @click="updateStatus(order, 'preparing')"
            :loading="loading === order.id"
          >
            {{ $t('orders.actions.start') }}
          </el-button>

          <el-button
            v-if="order.status === 'preparing'"
            type="success"
            @click="updateStatus(order, 'completed')"
            :loading="loading === order.id"
          >
            {{ $t('orders.actions.complete') }}
          </el-button>

          <el-button
            type="default"
            @click="printOrder(order)"
          >
            🖨️ {{ $t('orders.actions.print') }}
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <el-empty
      v-if="orders.length === 0"
      :description="$t('orders.empty')"
      :image-size="200"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import moment from 'moment';

const { t } = useI18n();

const orders = ref([]);
const loading = ref(null);
let refreshTimer = null;

// 统计数据
const pendingCount = computed(() => 
  orders.value.filter(o => o.status === 'pending').length
);

const preparingCount = computed(() => 
  orders.value.filter(o => o.status === 'preparing').length
);

// 获取订单列表
const fetchOrders = async () => {
  try {
    const response = await axios.get('/api/orders/admin/pending', {
      params: { status: 'pending' }
    });
    
    if (response.data.success) {
      orders.value = response.data.data;
    }
  } catch (error) {
    console.error('获取订单失败:', error);
  }
};

// 更新订单状态
const updateStatus = async (order, newStatus) => {
  loading.value = order.id;
  
  try {
    const response = await axios.patch(`/api/orders/${order.order_no}/status`, {
      status: newStatus
    });
    
    if (response.data.success) {
      ElMessage.success(t('orders.messages.statusUpdated'));
      
      // 如果完成,从列表移除
      if (newStatus === 'completed') {
        orders.value = orders.value.filter(o => o.id !== order.id);
      } else {
        // 更新本地状态
        order.status = newStatus;
      }
    }
  } catch (error) {
    ElMessage.error(t('orders.messages.statusFailed'));
  } finally {
    loading.value = null;
  }
};

// 打印订单
const printOrder = async (order) => {
  try {
    // 获取打印内容
    const response = await axios.get(`/api/print/receipt/${order.id}`, {
      params: { format: 'html' },
      responseType: 'text'
    });
    
    // 打开打印窗口
    const printWindow = window.open('', '', 'width=300,height=600');
    printWindow.document.write(response.data);
    printWindow.document.close();
    
    printWindow.onload = function() {
      printWindow.print();
      setTimeout(() => printWindow.close(), 100);
    };
    
    ElMessage.success(t('orders.messages.printed'));
  } catch (error) {
    ElMessage.error(t('orders.messages.printFailed'));
  }
};

// 格式化时间
const formatTime = (time) => {
  return moment(time).format('HH:mm');
};

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    preparing: 'info',
    completed: 'success',
    cancelled: 'danger'
  };
  return types[status] || 'info';
};

// 解析商品选项
const parseOptions = (options) => {
  if (typeof options === 'string') {
    try {
      options = JSON.parse(options);
    } catch (e) {
      return [];
    }
  }
  
  if (!options || typeof options !== 'object') return [];
  
  return Object.values(options).filter(Boolean);
};

// 生命周期
onMounted(() => {
  fetchOrders();
  
  // 每5秒自动刷新
  refreshTimer = setInterval(fetchOrders, 5000);
});

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
});
</script>

<style scoped lang="scss">
.orders-management {
  padding: 20px;
  background: linear-gradient(180deg, #FFF8F0 0%, #F5F5F5 100%);
  min-height: calc(100vh - 60px);
  
  .header-card {
    margin-bottom: 24px;
    border-radius: 16px;
    border: none;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    
    :deep(.el-card__body) {
      padding: 24px;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h2 {
        margin: 0;
        background: linear-gradient(135deg, #6B4423 0%, #8D6E63 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: 28px;
        font-weight: 800;
      }
      
      .stats {
        display: flex;
        gap: 16px;
        
        :deep(.el-tag) {
          padding: 10px 20px;
          font-size: 16px;
          font-weight: 700;
          border-radius: 12px;
          border: none;
        }
      }
    }
  }
  
  .orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 24px;
    
    .order-card {
      border-radius: 20px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 28px rgba(107, 68, 35, 0.15);
      }
      
      &.status-pending {
        border-left: 6px solid #FFA726;
        
        :deep(.el-card__header) {
          background: linear-gradient(135deg, #FFF3E0 0%, white 100%);
        }
      }
      
      &.status-preparing {
        border-left: 6px solid #42A5F5;
        
        :deep(.el-card__header) {
          background: linear-gradient(135deg, #E3F2FD 0%, white 100%);
        }
      }
      
      :deep(.el-card__header) {
        padding: 20px;
        border-bottom: 2px solid #F5F5F5;
      }
      
      :deep(.el-card__body) {
        padding: 20px;
      }
      
      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .table-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          
          :deep(.el-tag) {
            font-size: 18px;
            font-weight: 700;
            padding: 8px 16px;
            border-radius: 12px;
            background: linear-gradient(135deg, #8D6E63 0%, #6B4423 100%);
            border: none;
            color: white;
            box-shadow: 0 4px 12px rgba(107, 68, 35, 0.3);
          }
          
          .order-time {
            font-size: 15px;
            color: #8D6E63;
            font-weight: 600;
          }
        }
        
        > .el-tag {
          font-size: 14px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 8px;
          border: none;
        }
      }
      
      .order-items {
        margin: 20px 0;
        
        .order-item {
          padding: 14px 0;
          border-bottom: 2px solid #FFF8F0;
          
          &:last-child {
            border-bottom: none;
          }
          
          .item-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            
            .item-name {
              font-weight: 600;
              font-size: 16px;
              color: #2C1810;
            }
            
            .item-quantity {
              color: #8D6E63;
              font-weight: 800;
              font-size: 16px;
              background: linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%);
              padding: 4px 12px;
              border-radius: 8px;
            }
          }
          
          .item-options {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            
            :deep(.el-tag) {
              border-radius: 6px;
              font-size: 12px;
              background: #F5F5F5;
              color: #666;
              border: none;
            }
          }
        }
      }
      
      .order-remark {
        margin: 20px 0;
        
        :deep(.el-alert) {
          border-radius: 12px;
          border: none;
          background: #FFF3E0;
        }
      }
      
      .order-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 0;
        border-top: 3px solid #FFF8F0;
        font-size: 18px;
        
        strong {
          color: #6B4423;
          font-weight: 700;
        }
        
        .amount {
          background: linear-gradient(135deg, #D84315 0%, #6B4423 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
          font-size: 26px;
          letter-spacing: -0.5px;
        }
      }
      
      .order-actions {
        display: flex;
        gap: 12px;
        margin-top: 16px;
        
        .el-button {
          flex: 1;
          height: 44px;
          font-size: 15px;
          font-weight: 700;
          border-radius: 12px;
          border: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
          }
          
          &:active {
            transform: translateY(0);
          }
        }
        
        :deep(.el-button--primary) {
          background: linear-gradient(135deg, #42A5F5 0%, #1E88E5 100%);
        }
        
        :deep(.el-button--success) {
          background: linear-gradient(135deg, #66BB6A 0%, #43A047 100%);
        }
        
        :deep(.el-button--default) {
          background: linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%);
          color: #424242;
        }
      }
    }
  }
  
  :deep(.el-empty) {
    padding: 60px 0;
    
    .el-empty__description {
      color: #8D6E63;
      font-size: 16px;
      font-weight: 500;
    }
  }
}
</style>
