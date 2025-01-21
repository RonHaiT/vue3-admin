<script setup lang="ts">
import { ref, reactive } from "vue";
import { DownOutlined } from "@ant-design/icons-vue";
let year = ref(String(new Date().getFullYear()));
let yearsArray = ref<string[]>([]);
const yearList = () => {
  let startYear = 2018;
  // 获取当前年份
  let currentYear = new Date().getFullYear();
  // 计算延后一年的年份
  let endYear = currentYear + 1;
  for (let i = startYear; i <= endYear; i++) {
    yearsArray.value.push(String(i));
  }
};
const handleYear = (val: string) => {
  console.log(222, val);
  year.value = val;
};
onMounted(() => {
  yearList();
});
</script>
<template>
  <div class="dropdown">
    <h1>vue3</h1>
    <a-dropdown>
      <a class="ant-dropdown-link">
        <span>{{ year }}</span>
        <span
          ><DownOutlined
            style="font-size: 12px; font-weight: bold; margin-left: 6px"
        /></span>
      </a>
      <template #overlay>
        <a-menu>
          <a-menu-item
            v-for="(i, y) in yearsArray"
            :key="y"
            @click="handleYear(i)"
          >
            <span>{{ i }}</span>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<style scoped lang="less">
.dropdown {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
</style>
