<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>{{ $t('orders.title') }}</span>
      </template>
      <el-empty :description="$t('orders.developing')" />
    </el-card>
  </div>
</template>

<script setup>
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
