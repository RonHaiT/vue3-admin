<template>
  <a-modal
    v-model:open="localVisible"
    title="裁剪图片"
    @cancel="handleCancel"
    :footer="false"
    :width="width + 'px'"
    :maskClosable="false"
  >
    <div
      class="model-content"
      ref="modelContent"
      :style="{ width: width - 48 + 'px', height: height - 40 + 'px' }"
    >
      <!-- 截取图片 -->
      <div
        class="cut-cont"
        :style="{ width: width - 48 + 'px', height: height - 60 + 'px' }"
      >
        <div v-if="imageSrc" class="cut-image">
          <Cropper
            ref="cropper"
            :src="imageSrc"
            @change="onCrop"
            :stencil-props="stencilProps"
            :width="width - 48"
          />
          <div class="btns">
            <a-button
              type="primary"
              @click="saveCroppedImage"
              :loading="loading"
            >
              保存
            </a-button>
            <a-button style="margin-left: 10px" @click="handleCancel">
              取消
            </a-button>
          </div>
        </div>
        <!-- 选择图片 -->
        <div class="cut-select" v-else>
          <a-upload
            :before-upload="beforeUpload"
            :showUploadList="false"
            accept="image/*"
            @change="handleImageChange"
          >
            选择图片
          </a-upload>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, defineEmits, watch, onMounted } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { Cropper } from "vue-advanced-cropper";
import type { Cropper as CropperType } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  width: {
    type: Number,
    default: 1000,
  },
  height: {
    type: Number,
    default: 700,
  },
  aspectRatio: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["update:visible", "cropped"]);

// 组件状态
const imageSrc = ref<string | null>(null);
const loading = ref(false);
const cropper = ref<CropperType | null>(null);
const modelContent = ref<HTMLElement | null>(null);

// 裁剪区域的属性（可根据需求调整）
const stencilProps = {
  aspectRatio: 1, // 比例
  movable: true,
  scalable: true,
  rotatable: true,
};
const localVisible = ref(false);

// 选择图片前的验证
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    message.error("只能上传图片文件！");
  }
  return isImage || Upload.LIST_IGNORE;
};

// 处理图片选择
const handleImageChange = (info: any) => {
  const file = info.file.originFileObj;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageSrc.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// 取消裁剪
const handleCancel = () => {
  localVisible.value = false;
  emit("update:visible", false);
  imageSrc.value = null;
};

// 处理裁剪变化（可选）
const onCrop = (data: any) => {
  // 你可以在这里获取裁剪的坐标或其他信息
  // console.log(data);
};
watch(
  () => props.visible,
  (newValue: boolean) => {
    localVisible.value = newValue;
  },
  { immediate: true }
);
// 获取 model-content 宽高
onMounted(() => {});
// 保存裁剪后的图片
const saveCroppedImage = () => {
  if (cropper.value) {
    loading.value = true;
    cropper.value
      .getResultBlob()
      .then((blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          emit("cropped", { blob, base64 });
          loading.value = false;
          emit("update:visible", false);
          imageSrc.value = null;
          message.success("图片裁剪成功！");
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        loading.value = false;
        message.error("裁剪失败！");
      });
  }
};
</script>

<style scoped lang="less">
.model-content {
  width: 100%;
  .cut-cont {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    .cut-image {
      width: 100%;
      height: 100%;
      .btns {
        width: 100%;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
    .cut-select {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: pink;
      cursor: pointer;
    }
  }
}
</style>
