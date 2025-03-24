<script setup lang="ts">
import { theme } from "ant-design-vue";
</script>

<template>
  <a-config-provider
    :theme="{
      token: {
        colorPrimary: '#00b96b',
        algorithm: theme.darkAlgorithm,
      },
    }"
  >
    <RouterView />
  </a-config-provider>
</template>

<style scoped lang="less"></style>
