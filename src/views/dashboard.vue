<script lang="ts" setup>
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons-vue";
import { useAuthStore } from "@/stores/auth";
import { type MenuObj } from "@/http/module/menu/types";
import { Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { h } from "vue";
const [modal, contextHolder] = Modal.useModal();

const authStore = useAuthStore();
const router = useRouter();
//退出登录
const showConfirm = () => {
  modal.confirm({
    title: "提示信息",
    icon: h(ExclamationCircleOutlined),
    content: h("div", { style: "color:#333;" }, "真的要注销登录吗?"),
    okText: "确认",
    cancelText: "取消",
    onOk() {
      authStore.logout();
    },
    onCancel() {
      console.log("Cancel");
    },
    class: "logout",
  });
};

const handleMenu = (item: MenuObj, it: MenuObj | undefined, key: string) => {
  if (!it) {
    let name = item.path;
    router.push({ name: name });
    let newItem = { ...item };
    delete newItem.children;
    authStore.breadcrumb = [newItem];
  } else {
    let name = it.path;
    router.push({ name: name });
    let newItem = { ...item };
    let newIt = { ...it };
    delete newItem.children;
    newIt.path = "";
    delete newIt.children;
    authStore.breadcrumb = [];
    authStore.breadcrumb[0] = newItem;
    authStore.breadcrumb[1] = newIt;
  }
  authStore.selectedKeys = [key];
};
const handleSetting = () => {
  router.push({ name: "Setting" });
};
</script>

<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider
      v-model:collapsed="authStore.collapsed"
      :trigger="null"
      collapsible
      width="220px"
      :style="{
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }"
    >
      <div
        class="logo"
        :style="{
          'justify-content': !authStore.collapsed ? 'center' : '',
          marginBottom: '10px',
        }"
      >
        <img
          class="img"
          src="@/assets/images/logo.jpg"
          alt=""
          style="width: 40px; height: 40px; border-radius: 50%"
        />
        <div v-if="!authStore.collapsed" class="title">糖谷管理系统</div>
      </div>
      <!-- 菜单  -->
      <a-menu
        v-model:selectedKeys="authStore.selectedKeys"
        theme="dark"
        mode="inline"
        v-model:openKeys="authStore.openKeys"
      >
        <template v-for="(item, index) in authStore.menuList">
          <template v-if="item.id == -1">
            <a-menu-item
              :key="'main' + item.id"
              @click="handleMenu(item, undefined, 'main' + item.id)"
            >
              <i :class="['bx', item.icon]"></i>
              <span v-if="!authStore.collapsed">
                <span>{{ item.name }}</span>
              </span>
            </a-menu-item>
          </template>
          <a-sub-menu :key="item.id" v-else>
            <template #title>
              <span>
                <i :class="['bx', item.icon]"></i>
                <span v-if="!authStore.collapsed">{{ item.name }}</span>
              </span>
            </template>
            <a-menu-item
              v-for="(it, idx) in item.children"
              :key="'sub' + it.id"
              @click="handleMenu(item, it, 'sub' + it.id)"
            >
              <span>
                <i :class="['bx', it.icon]"></i>
                <span>{{ it.name }}</span>
              </span>
            </a-menu-item>
          </a-sub-menu>
        </template>
      </a-menu>
    </a-layout-sider>
    <!-- 头部 -->
    <a-layout :style="{ marginLeft: authStore.collapsed ? '80px' : '220px' }">
      <a-layout-header style="background: #fff; padding: 0 24px">
        <div class="nav">
          <div class="menu" style="font-size: 20px">
            <MenuUnfoldOutlined
              v-if="authStore.collapsed"
              fill="#515767"
              @click="() => (authStore.collapsed = !authStore.collapsed)"
            />
            <MenuFoldOutlined
              v-else
              @click="() => (authStore.collapsed = !authStore.collapsed)"
            />
            <div>
              <a-breadcrumb
                :routes="authStore.breadcrumb"
                style="margin: 16px 0; padding-left: 24px"
              >
                <template #itemRender="{ route, paths }">
                  <span v-if="route.type == 1">
                    {{ route.name }}
                  </span>
                  <router-link v-else :to="{ name: route.path }">
                    {{ route.name }}
                  </router-link>
                </template>
              </a-breadcrumb>
            </div>
          </div>
          <div class="nav-right">
            <a-dropdown arrow :trigger="['click']">
              <a class="ant-dropdown-link">
                <a-avatar
                  size="large"
                  :style="{
                    backgroundColor: '#cdcdcd',
                  }"
                  :gap="0"
                >
                  <template #icon>
                    <div
                      style="
                        width: 100%;
                        height: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        margin-left: 4px;
                      "
                    >
                      <i class="bx bxs-user"></i>
                    </div>
                  </template>
                </a-avatar>
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="0" @click="handleSetting">
                    <i class="bx bx-group"></i>
                    <span style="margin-left: 5px">个人中心</span>
                  </a-menu-item>

                  <a-menu-divider />
                  <a-menu-item key="3" @click="showConfirm">
                    <i class="bx bx-log-out"></i>
                    <span style="margin-left: 5px">退出登录</span>
                    <contextHolder />
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </a-layout-header>
      <a-layout-content
        :style="{
          margin: '24px 24px 0',
          overflow: 'initial',
          overflowX: 'hidden',
        }"
      >
        <RouterView />
      </a-layout-content>
      <a-layout-footer style="text-align: center">糖谷管理系统</a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<style scoped lang="less">
.logo {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 10px 24px 0;
  box-sizing: border-box;
  .img {
    margin-right: 10px;
  }
  .title {
    color: white;
    font-size: 16px;
    font-weight: bold;
  }
}
.nav {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .menu {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .nav-right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
.bx {
  margin-right: 10px;
}
</style>
