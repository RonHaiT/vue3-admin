<script setup lang="ts">
import { message } from "ant-design-vue";
const showMsg = () => {
  message.warning("提示信息");
};

const info = () => {
  message.success("Hello, success");
};
</script>
<template>
  <div class="main">
    <a-button type="primary" @click="showMsg">提示信息</a-button>

    <a-button type="primary" @click="info">success</a-button>
  </div>
</template>

<style scoped lang="less">
.main {
  width: 100%;
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}
</style>
