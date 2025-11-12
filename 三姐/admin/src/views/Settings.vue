<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>{{ $t('settings.title') }}</span>
      </template>
      <el-empty :description="$t('settings.developing')" />
    </el-card>
  </div>
</template>

<script setup>
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
  
  .el-card__header {
    background: linear-gradient(135deg, #FFF8F0 0%, white 100%);
    border-bottom: 2px solid #F5E6D3;
    
    span {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, #6B4423 0%, #8D6E63 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
}

:deep(.el-empty) {
  padding: 80px 0;
  
  .el-empty__image {
    width: 200px;
  }
  
  .el-empty__description {
    font-size: 16px;
    color: #8D6E63;
    font-weight: 600;
  }
}
</style>
