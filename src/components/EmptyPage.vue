<template>
  <div class="empty-page-container">
    <div class="content-card">
      <h2>{{ msg }}</h2>
      <a-empty description="暂无数据" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  msg: {
    type: String,
    default: '页面'
  }
})
</script>

<style scoped>
.empty-page-container {
  padding: 20px;
  height: 100%;
}
.content-card {
  background: #fff;
  padding: 40px;
  border-radius: 4px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
h2 {
  margin-bottom: 30px;
  color: #333;
}
</style>
