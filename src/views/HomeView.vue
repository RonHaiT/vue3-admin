<script setup lang="ts">
import MyUpload from "@/components/MyUpload.vue";
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
    <MyUpload />
    <a-button type="primary" @click="showMsg">提示信息</a-button>
    <hr />
    <a-button type="primary" @click="info">success</a-button>
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
