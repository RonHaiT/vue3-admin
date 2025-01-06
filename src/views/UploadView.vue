<script setup lang="ts">
import MyUpload from "@/components/MyUpload.vue";
</script>
<template>
  <div class="main">
    <MyUpload />
  </div>
</template>

<style scoped lang="less">
.main {
  width: 100%;
  height: 500px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
</style>
