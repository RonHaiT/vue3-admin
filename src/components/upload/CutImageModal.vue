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
      <!-- 选择文件 -->
      <div
        v-if="uploadType == 'file'"
        class="cut-cont"
        :style="{ width: width - 48 + 'px', height: height - 60 + 'px' }"
      >
        <div class="file-select">
          <div class="file-name" v-if="fileName">
            <div class="file-show">
              <span>文件名：</span>
              <span>{{ fileName.name }}</span>
            </div>
            <div class="btns">
              <a-button
                type="primary"
                @click="postUploadFile"
                :loading="loading"
              >
                保存
              </a-button>
              <a-button style="margin-left: 10px" @click="handleCancel">
                取消
              </a-button>
            </div>
          </div>
          <a-upload
            :showUploadList="false"
            :accept="accept"
            @change="handleFileChange"
            v-else
          >
            <div class="select-img">选择文件</div>
          </a-upload>
        </div>
      </div>
      <!-- 截取图片 -->
      <div
        v-else
        class="cut-cont"
        :style="{ width: width - 48 + 'px', height: height - 60 + 'px' }"
      >
        <div v-if="imageSrc" class="cut-image">
          <Cropper
            class="cropper"
            ref="cropper"
            :src="imageSrc"
            :stencil-props="aspectRatio ? stencilProps : {}"
            :width="width - 48"
            height="700px"
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
          <a-upload :accept="accept" @change="handleImageChange">
            <div class="select-img">选择图片</div>
          </a-upload>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { getUploadToken } from "~/http/apis/match";
import { Cropper } from "vue-advanced-cropper";
import type { Cropper as CropperType } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";

const props = defineProps({
  accept: {
    type: String,
    default: "image/*",
  },
  uploadType: {
    type: String,
    default: "image",
  },
  width: {
    type: Number,
    default: 1200,
  },
  height: {
    type: Number,
    default: 700,
  },
  minHeight: {
    type: Number,
    default: 700,
  },
  aspectRatio: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:visible", "uploadQiNiu"]);
let fileName = ref<File | null>();
// 组件状态
const imageSrc = ref<string | null>(null);
const loading = ref(false);
const cropper = ref<InstanceType<typeof CropperType> | null>(null);
const modelContent = ref<HTMLElement | null>(null);

// 裁剪区域的属性（可根据需求调整）
const stencilProps = {
  aspectRatio: 1, // 比例
  movable: true,
  scalable: true,
  rotatable: true,
};
const localVisible = ref(false);
//获取七牛token
const getQiNiuToken = async () => {
  try {
    let res = await getUploadToken();
    let upToken = useCookie("upToken"); // 设置 upToken
    let domian = useCookie("domian"); // 设置 domain
    upToken.value = JSON.stringify(res.data.upToken);
    domian.value = JSON.stringify(res.data.domian);
  } catch (error) {
    message.error("获取失败");
  }
};
// 处理文件
const handleFileChange = (file) => {
  fileName.value = file.file.originFileObj;
};
// 上传文件
const postUploadFile = () => {
  localVisible.value = false;
  emit("uploadQiNiu", fileName.value);
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

// 保存裁剪后的图片
const saveCroppedImage = async () => {
  if (cropper.value) {
    await uploadToParent(cropper.value.src);
  }
};
// 将 Base64 转为 Blob
const base64ToBlob = (base64) => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};
// 将 Blob 转为 File
const base64ToFile = (base64, fileName = "cropped-image.jpg") => {
  const blob = base64ToBlob(base64);
  return new File([blob], fileName, { type: blob.type });
};
// 触发父组件上传
const uploadToParent = (cropperSrc) => {
  console.log("createApp", cropperSrc);

  if (!cropperSrc) {
    console.error("Cropper source not found");
    return;
  }
  // 将 Base64 转为 File 对象
  const file = base64ToFile(cropperSrc, "cropped-image.jpg");

  // 向父组件发送 File 对象
  emit("uploadQiNiu", file);
};

// 暴露方法给父组件控制
defineExpose({
  openModal: () => {
    localVisible.value = true;
    fileName.value = null;
    getQiNiuToken();
  },
  closeModal: () => {
    localVisible.value = false;
    loading.value = false;
  },
  clearimageSrc: () => {
    imageSrc.value = null;
  },
});
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
    .select-img {
      width: 120px;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: @dbMain;
      color: #fff;
      cursor: pointer;
      border-radius: 4px;
    }
    .cut-select {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-image: url("~/assets/image/up-bg.png");
      background-repeat: repeat;
      background-size: 24px 24px;
      cursor: pointer;
    }
    .file-select {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #fff;
      cursor: pointer;
      .file-show {
        margin-bottom: 20px;
      }
      .btns {
        width: 100%;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}
.cropper {
  height: 620px;
}
</style>
