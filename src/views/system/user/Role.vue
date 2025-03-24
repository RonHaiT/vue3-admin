<script lang="ts" setup>
import { PlusOutlined } from "@ant-design/icons-vue";
import { useRoleStore } from "@/stores/role";
import { useMenuStore } from "@/stores/menu";
import { type RoleObj } from "@/http/module/role/types";
import { type MenuObj } from "@/http/module/menu/types";
import { message, type TreeProps } from "ant-design-vue";
const roleStore = useRoleStore();
const menuStore = useMenuStore();
onMounted(() => {
  roleStore.getRoleList();
});
let addType = ref(1);
const columns = [
  {
    title: "角色名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "角色描述",
    dataIndex: "desc",
    key: "desc",
  },

  {
    title: "创建时间",
    dataIndex: "create_time",
    key: "create_time",
  },
  {
    title: "更新时间",
    dataIndex: "update_time",
    key: "update_time",
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
  },
];
const open = ref<boolean>(false);
const formState = reactive<RoleObj>({
  id: null,
  name: "",
  desc: "",
  menus: [],
});
const checkedKeys = ref<string[]>([]);
const formRef = ref<any>(null);
const cancle = () => {
  open.value = false;
  formRef.value?.resetFields?.();
};
const handleCancel = () => {
  formRef.value?.resetFields?.();
};
const fieldNames: TreeProps["fieldNames"] = {
  title: "name",
  key: "id",
  children: "children",
};

const resetState = () => {
  formState.id = null;
  formState.name = "";
  formState.desc = "";
  formState.menus = [];
};
//添加角色
const handleAdd = async () => {
  open.value = true;
  menuStore.getMenu();
  addType.value == 1;
  roleStore.title = "添加角色";
  resetState();
  checkedKeys.value = [];
};
//确认弹窗
const handleOk = async () => {
  if (addType.value == 1) {
    let res = await roleStore.addRole(formState);
    if (res) {
      open.value = false;
      roleStore.getRoleList();
      message.success("添加成功");
    }
  } else {
    let res = await roleStore.updateRole(formState);
    if (res) {
      open.value = false;
      roleStore.getRoleList();
      message.success("修改成功");
    }
  }
};
//删除角色
const deleteData = async (record: RoleObj) => {
  let status = await roleStore.deleteRole(record.id as number);
  if (status) {
    await roleStore.getRoleList();
  }
};
//编辑角色
const editData = async (record: RoleObj) => {
  open.value = true;
  addType.value = 2;
  roleStore.title = "编辑角色";
  formState.id = record.id;
  formState.name = record.name;
  formState.desc = record.desc;
  formState.menus = record.menus;
  checkedKeys.value = record.menus;
};
const treeData: MenuObj[] = menuStore.menuList;

watch(checkedKeys, () => {
  console.log("checkedKeys", checkedKeys);
  formState.menus = checkedKeys.value as string[];
});
</script>
<template>
  <a-table :columns="columns" :data-source="roleStore.roleList">
    <template #title>
      <a-button
        type="primary"
        class="editable-add-btn"
        style="margin-bottom: 8px"
        @click="handleAdd"
      >
        <PlusOutlined />
        <span>添加角色</span>
      </a-button>
    </template>
    <template #headerCell="{ column }">
      <template v-if="column.key === 'action'">
        <span>操作</span>
      </template>
    </template>

    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'action'">
        <a-button
          type="primary"
          style="margin-right: 10px"
          size="small"
          @click="editData(record)"
        >
          编辑
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
    :title="roleStore.title"
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
        <a-form-item
          label="角色名称"
          name="name"
          :rules="[{ required: true, message: '请输入角色名称' }]"
        >
          <a-input
            v-model:value="formState.name"
            size="large"
            placeholder="请输入角色名称"
          />
        </a-form-item>

        <a-form-item
          label="角色描述"
          name="desc"
          :rules="[{ required: true, message: '请输入角色描述' }]"
        >
          <a-textarea
            size="large"
            :auto-size="{ minRows: 2, maxRows: 5 }"
            v-model:value="formState.desc"
            placeholder="请输入角色描述"
          />
        </a-form-item>
        <a-form-item label="选择菜单" name="enable">
          <a-tree
            v-model:checkedKeys="checkedKeys"
            autoExpandParent
            checkable
            :tree-data="treeData"
            :field-names="fieldNames"
          >
            <template #title="{ icon, name }">
              <i
                :class="['bx', icon]"
                style="margin-right: 6px; display: inline-block"
              ></i>
              <span style="display: inline-block">{{ name }}</span>
            </template>
          </a-tree>
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
.btns {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  column-gap: 20px;
  margin-top: 10px;
}
</style>
