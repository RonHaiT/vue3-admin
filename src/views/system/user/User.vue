<script lang="ts" setup>
import { PlusOutlined } from "@ant-design/icons-vue";
import { useAuthStore } from "@/stores/auth";
import { type UserObj } from "@/http/module/user/types";
import { message } from "ant-design-vue";
const authStore = useAuthStore();
onMounted(() => {
  authStore.getUserList();
});
const formState = reactive<UserObj>({
  id: null,
  username: "",
  nickname: "",
  email: "",
  avatar: "",
  mobile: null,
  qq: null,
  wx: null,
  weibo: null,
  roles: [],
});
const open = ref<boolean>(false);
let addType = ref(1);
const formRef = ref<any>(null);
const columns = [
  {
    title: "用户昵称",
    dataIndex: "nickname",
    key: "nickname",
  },
  {
    title: "账号名",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "邮箱",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "微信",
    dataIndex: "wx",
    key: "wx",
  },
  {
    title: "QQ",
    dataIndex: "qq",
    key: "qq",
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
const resetState = () => {
  formState.id = null;
  formState.username = "";
  formState.nickname = "";
  formState.email = "";
  formState.avatar = "";
  formState.mobile = null;
  formState.wx = "";
  formState.qq = "";
  formState.weibo = "";
  formState.roles = [];
};
const handleCancel = () => {
  formRef.value?.resetFields?.();
};
const cancle = () => {
  open.value = false;
  formRef.value?.resetFields?.();
};
const handleAdd = () => {
  open.value = true;
  authStore.title = "添加用户";
  resetState();
};
//保存提交
const handleOk = async () => {
  if (addType.value == 1) {
    let res = await authStore.addUser(formState);
    if (res) {
      open.value = false;
      authStore.getUserList();
      message.success("添加成功");
    }
  } else {
    let res = await authStore.updateUser(formState);
    if (res) {
      open.value = false;
      authStore.getUserList();
      message.success("修改成功");
    }
  }
};
const deleteData = (record: UserObj) => {
  console.log("删除", record);
};
const editData = (record: UserObj) => {
  console.log("删除", record);
};
const resetPwd = (record: UserObj) => {
  console.log("重置密码", record);
};
import type { SelectProps } from "ant-design-vue";
const options = ref<SelectProps["options"]>([
  {
    value: "a1",
    label: "a1",
  },
]);
const value = ref<string[]>([]);
const handleChange = (value: []) => {
  console.log(`selected ${value}`);
};
watch(value, () => {
  console.log("value", value.value);
});
</script>
<template>
  <a-table :columns="columns" :data-source="authStore.userList">
    <template #title>
      <a-button
        type="primary"
        class="editable-add-btn"
        style="margin-bottom: 8px"
        @click="handleAdd"
      >
        <PlusOutlined />
        <span>添加用户</span>
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
        <a-button size="small" @click="resetPwd(record)">重置密码</a-button>
      </template>
    </template>
  </a-table>
  <a-modal
    v-model:open="open"
    width="600px"
    :title="authStore.title"
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
          label="用户昵称"
          name="parent"
          :rules="[{ required: true, message: '请输入用户昵称' }]"
        >
          <a-input
            v-model:value="formState.nickname"
            size="large"
            placeholder="请输入用户昵称"
          />
        </a-form-item>
        <a-form-item
          label="用户名"
          name="parent"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input
            v-model:value="formState.nickname"
            size="large"
            placeholder="请输入用户名"
          />
        </a-form-item>
        <a-form-item
          label="邮箱"
          name="parent"
          :rules="[{ message: '请输入用户邮箱' }]"
        >
          <a-input
            v-model:value="formState.nickname"
            size="large"
            placeholder="请输入用户邮箱"
          />
        </a-form-item>
        <a-form-item
          label="微信"
          name="parent"
          :rules="[{ message: '请输入微信' }]"
        >
          <a-input
            v-model:value="formState.nickname"
            size="large"
            placeholder="请输入微信"
          />
        </a-form-item>
        <a-form-item
          label="QQ"
          name="parent"
          :rules="[{ message: '请输入QQ' }]"
        >
          <a-input
            v-model:value="formState.nickname"
            size="large"
            placeholder="请输入QQ"
          />
        </a-form-item>
        <a-form-item
          label="用户权限"
          name="parent"
          :rules="[{ message: '请选择权限' }]"
        >
          <a-select
            v-model:value="value"
            mode="tags"
            style="width: 100%"
            :token-separators="[',']"
            placeholder="Automatic tokenization"
            :options="options"
            @change="handleChange"
          ></a-select>
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
