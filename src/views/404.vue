<script setup lang="ts"></script>
<template>
  <div class="box">
    <img src="@/assets/images/404.png" alt="" />
    <div class="info">您访问的页面不存在</div>
  </div>
</template>

<style scoped lang="less">
.box {
  width: 600px;
  height: 400px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  .info {
    text-align: center;
    color: #999;
    font-size: 20px;
    margin-top: 20px;
  }
}
</style>
