<script setup lang="ts">
import { PlusOutlined, CloseOutlined } from "@ant-design/icons-vue";
import { useMenuStore } from "@/stores/menu";
import { type MenuObj } from "@/http/module/menu/types";
import { type FormState } from "@/http/module/menu/types";
import { iconsData, type Icon } from "@/utils/iconsData";
import { message } from "ant-design-vue";
import { toReactive } from "@vueuse/core";
interface Tab {
  id: number;
  type: number;
  name: string;
}
const formState = reactive<FormState>({
  id: null,
  parent: null,
  name: "",
  icon: "",
  url: "",
  type: null,
  enable: null,
});
let addType = ref(1);
const tabs = ref<Tab[]>([
  {
    id: 1,
    type: 0,
    name: "全部图标",
  },
  {
    id: 2,
    type: 1,
    name: "线框图标",
  },
  {
    id: 3,
    type: 2,
    name: "实体图标",
  },
  {
    id: 4,
    type: 3,
    name: "Logo图标",
  },
]);
let currentRecord = reactive<MenuObj>({
  id: null,
  name: "",
  icon: "",
  parent: null,
  sort: 1,
  url: "",
  path: "",
  enable: 1,
  type: 0,
  btn_permission: null,
  children: null,
});

const formRef = ref<any>(null);
const cancle = () => {
  open.value = false;
  formRef.value?.resetFields?.();
};
const handleCancel = () => {
  formRef.value?.resetFields?.();
};
const menuStore = useMenuStore();
onMounted(async () => {
  await menuStore.getMenu();
});
const open = ref<boolean>(false);
const activeKey = ref(1);

const columns = [
  {
    title: "菜单名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "类型",
    key: "type",
    dataIndex: "type",
  },
  {
    title: "显示/隐藏",
    dataIndex: "enable",
    key: "enable",
  },
  {
    title: "路由地址",
    key: "url",
    dataIndex: "url",
  },
  {
    title: "权限标识",
    key: "role",
    dataIndex: "role",
  },
  {
    title: "操作",
    key: "action",
  },
];
const resetState = () => {
  formState.id = null;
  formState.parent = null;
  formState.name = "";
  formState.icon = "";
  formState.url = "";
  formState.enable = null;
  formState.type = null;
};

//保存提交
const handleOk = async () => {
  if (addType.value == 1) {
    //新增
    let res = await menuStore.addMenu(formState);
    if (res) {
      open.value = false;
      message.success("添加成功,请重新登录获取最新菜单");
      await menuStore.getMenu();
    }
  } else {
    //编辑
    let res = await menuStore.updateMenu(formState);
    if (res) {
      open.value = false;
      message.success("修改成功");
      await menuStore.getMenu();
    }
  }
};
//添加一级菜单
const handleAdd = () => {
  resetState();
  addType.value = 1;
  open.value = true;
  menuStore.title = "添加一级菜单";
};

//添加下级菜单
const addSubData = (record: MenuObj) => {
  resetState();
  addType.value = 1;
  formState.parent = record.id;
  currentRecord = toReactive({ ...record });
  open.value = true;
  menuStore.title = "添加下级菜单";
};
//编辑菜单
const editData = (record: MenuObj) => {
  addType.value = 2;
  formState.id = record.id;
  formState.parent = record.parent?.id ?? null;
  formState.name = record.name;
  formState.icon = record.icon;
  formState.url = record.url;
  formState.enable = record.enable;
  formState.type = record.type;
  // 如果有父级菜单
  if (record.parent !== null) {
    // 在菜单列表中查找父级对象
    const parentMenu = menuStore.menuList.find(
      (menu) => menu.id === record.parent?.id ?? null
    );
    if (parentMenu) {
      // 将父级对象设置为响应式数据
      currentRecord = toReactive({ ...parentMenu });
    }
  } else {
    currentRecord = toReactive({ ...record });
  }
  menuStore.title = "编辑菜单";
  open.value = true;
};
//删除菜单
const deleteData = async (record: MenuObj) => {
  let status = await menuStore.deleteMenu(record.id as number);
  if (status) {
    await menuStore.getMenu();
  }
};
//过滤icon
const filteredIcons = computed(() => {
  if (activeKey.value === 1) {
    // 如果选中全部图标，则返回所有图标数据
    return iconsData;
  } else {
    // 根据选中的Tab的type属性过滤图标数据
    return iconsData.filter((icon) => icon.type === activeKey.value - 1);
  }
});
//切换icon
const handleTab = (item: Tab) => {
  activeKey.value = item.id;
  // 根据选定的Tab的id显示相应的iconsData
  if (item.id === 1) {
    // 显示全部图标
  } else {
    // 根据选定的Tab的type属性过滤iconsData
    const filteredIconsData: Icon[] = iconsData.filter(
      (icon) => icon.type === item.type
    );
  }
};
let popoverVisible = ref(false);
const openPopover = () => {
  popoverVisible.value = true;
};
//确认icon
const selectIcon = (icon: Icon) => {
  formState.icon = icon.icon;
  popoverVisible.value = false;
};
</script>
<template>
  <a-table
    :columns="columns"
    :data-source="menuStore.menuList"
    rowKey="id"
    :loading="menuStore.loading"
  >
    <template #title>
      <a-button
        type="primary"
        class="editable-add-btn"
        style="margin-bottom: 8px"
        @click="handleAdd"
      >
        <PlusOutlined />
        <span>添加一级菜单</span>
      </a-button>
    </template>
    <template #headerCell="{ column }">
      <template v-if="column.key === 'action'">
        <span>操作</span>
      </template>
    </template>

    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'name'">
        <i :class="['bx', record.icon]" style="margin-right: 6px"></i>
        <span>{{ record.name }}</span>
      </template>
      <template v-else-if="column.key === 'enable'">
        <span>
          <a-tag :color="record.enable === 1 ? 'green' : 'volcano'">
            {{ record.enable === 1 ? "显示" : "隐藏" }}
          </a-tag>
        </span>
      </template>
      <template v-else-if="column.key === 'type'">
        <span>
          <a-tag
            :color="
              record.type === 1
                ? '#108ee9'
                : record.type === 2
                ? '#00b96b'
                : '#FF8E8F'
            "
          >
            {{ record.type == 1 ? "目录" : record.type == 2 ? "页面" : "按钮" }}
          </a-tag>
        </span>
      </template>
      <template v-else-if="column.key === 'url'">
        <span>
          <a-tag>
            {{ record.url ? record.url : "--" }}
          </a-tag>
        </span>
      </template>
      <template v-if="column.key === 'action'">
        <a-button
          type="primary"
          style="margin-right: 10px"
          size="small"
          @click="addSubData(record)"
        >
          增加下级菜单
        </a-button>
        <a-button
          type="primary"
          size="small"
          @click="editData(record)"
          style="margin-right: 10px"
        >
          修改
        </a-button>
        <a-popconfirm
          title="确认删除吗?"
          ok-text="确认"
          cancel-text="取消"
          @confirm="deleteData(record)"
        >
          <a-button
            type="primary"
            danger
            size="small"
            style="margin-right: 10px"
          >
            删除
          </a-button>
        </a-popconfirm>
      </template>
    </template>
  </a-table>
  <a-modal
    v-model:open="open"
    width="600px"
    :title="menuStore.title"
    :maskClosable="false"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="mask">
      <a-form
        :model="formState"
        name="basic"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 20 }"
        autocomplete="off"
        ref="formRef"
        @finish="handleOk"
      >
        <a-form-item label="父级菜单" name="parent">
          <a-input
            size="large"
            :placeholder="formState.parent ? currentRecord.name : '无'"
            disabled
          />
        </a-form-item>

        <a-form-item
          label="菜单名称"
          name="name"
          :rules="[{ required: true, message: '请输入菜单名称' }]"
        >
          <a-input
            size="large"
            v-model:value="formState.name"
            placeholder="请输入菜单名称"
          />
        </a-form-item>
        <a-form-item
          label="图标"
          name="icon"
          :rules="[{ required: true, message: '请选择菜单图标' }]"
        >
          <div class="row">
            <a-input
              v-model:value="formState.icon"
              placeholder="点击右边按钮选择图标"
              size="large"
            ></a-input>

            <a-popover
              trigger="click"
              placement="topRight"
              arrow-point-at-center
              :open="popoverVisible"
            >
              <div class="select-btn" @click="openPopover">
                <i
                  style="font-size: 22px"
                  :class="['bx', formState.icon ? formState.icon : 'bx-search']"
                ></i>
              </div>

              <template #content>
                <div class="icons">
                  <div class="header">
                    <div>图标</div>
                    <CloseOutlined @click="popoverVisible = false" />
                  </div>
                  <div class="tab">
                    <div
                      class="tab-item"
                      v-for="(item, index) in tabs"
                      :key="index"
                      @click="handleTab(item)"
                      :class="activeKey == item.id ? 'tab-active' : ''"
                    >
                      {{ item.name }}
                    </div>
                  </div>
                  <div class="icon">
                    <div
                      class="icon-item"
                      v-for="(icon, index) in filteredIcons"
                      :key="icon.id"
                    >
                      <i
                        style="font-size: 24px"
                        :class="['bx', icon.icon]"
                        @click="selectIcon(icon)"
                      ></i>
                    </div>
                  </div>
                </div>
              </template>
            </a-popover>
          </div>
        </a-form-item>
        <a-form-item label="路由地址" name="url">
          <a-input
            size="large"
            v-model:value="formState.url"
            placeholder="如果是目录,请输入下级菜单路径"
          />
        </a-form-item>
        <a-form-item
          label="菜单类型"
          name="type"
          :rules="[{ required: true, message: '请选择菜单类型' }]"
        >
          <a-select
            v-model:value="formState.type"
            style="width: 100%"
            size="large"
            placeholder="请选择菜单类型"
          >
            <a-select-option :value="1">目录</a-select-option>
            <a-select-option :value="2">页面</a-select-option>
            <a-select-option :value="3">按钮</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="是否隐藏"
          name="enable"
          :rules="[{ required: true, message: '请选择显示隐藏' }]"
        >
          <a-select
            size="large"
            v-model:value="formState.enable"
            style="width: 100%"
            placeholder="请选择显示隐藏"
          >
            <a-select-option :value="1">显示</a-select-option>
            <a-select-option :value="0">隐藏</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
          <div class="btns">
            <a-button @click="cancle" size="large">取消</a-button>
            <a-button type="primary" html-type="submit" size="large">
              提交
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<style scoped lang="less">
.mask {
  padding: 30px 30px 0;
  box-sizing: border-box;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding-right: 40px;
  .select-btn {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    width: 50px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #00b96b;
    color: white;
    border-radius: 0 8px 8px 0;
    cursor: pointer;
  }
}
.icons {
  width: 500px;
  .header {
    display: flex;
    justify-content: space-between;
    height: 40px;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
    .close {
      font-weight: 500;
    }
  }
  .tab {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-bottom: 10px;
    &-item {
      padding: 10px;
      height: 40px;
      border: 1px solid #d9d9d9;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      margin-right: 10px;
    }
    &-active {
      color: green;
      // border: 1px solid green;
    }
  }
  .icon {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    height: 400px;
    overflow-y: auto;
    &-item {
      cursor: pointer;
      width: 30px;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
    }
    &-item:hover {
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  }
}
.btns {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  column-gap: 20px;
  margin-top: 10px;
}
</style>
