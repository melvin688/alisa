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
}
</style>
