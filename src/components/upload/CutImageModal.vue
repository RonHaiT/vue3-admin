<script setup lang="ts">
import { getUploadToken } from "~/http/apis/match";
import { Cropper } from "vue-advanced-cropper";
import type { Cropper as CropperType } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import VerticalButtons from "./Components/VerticalButtons.vue";
import SquareButton from "./Components/SquareButton.vue";

const props = defineProps({
  accept: {
    type: String,
    default: "image/*",
  },
  uploadType: {
    type: String,
    default: "image",
  },
  cutWidth: {
    type: Number,
    default: 500,
  },
  cutHeight: {
    type: Number,
    default: 500,
  },
  minHeight: {
    type: Number,
    default: 700,
  },
});
const emit = defineEmits(["update:visible", "uploadQiNiu"]);
let fileName = ref<File | null>();
let width = ref(1200);
let height = ref(700);
// 组件状态
const imageSrc = ref<string | null>(null);
const loading = ref(false);
const cropper = ref<InstanceType<typeof CropperType> | null>(null);
const modelContent = ref<HTMLElement | null>(null);

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
  console.log("handleFileChange", file);

  fileName.value = file.file;
};
// 上传文件
const postUploadFile = () => {
  localVisible.value = false;
  emit("uploadQiNiu", fileName.value);
};

// 处理图片选择
const handleImageChange = (info: any) => {
  // const file = info.file;
  // if (file) {
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     imageSrc.value = e.target?.result as string;
  //   };
  //   reader.readAsDataURL(file);
  // }
  const file = info.file;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        imageSrc.value = img.src;
      };
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
  if (!cropper.value) {
    console.error("Cropper 未初始化");
    return;
  }
  if (!cropper.value) return;

  const result = cropper.value.getResult();
  if (!result || !result.canvas) return;

  console.log("裁剪区域大小：", result.coordinates); // 输出裁剪区域信息
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const maxOutputSize = 1080; // 最大输出 1080p
  const scale =
    Math.max(result.canvas.width, result.canvas.height) > maxOutputSize
      ? Math.min(
          maxOutputSize / result.canvas.width,
          maxOutputSize / result.canvas.height
        )
      : 1;

  canvas.width = result.canvas.width * scale;
  canvas.height = result.canvas.height * scale;

  if (ctx) {
    ctx.drawImage(result.canvas, 0, 0, canvas.width, canvas.height);
  }

  canvas.toBlob(
    (blob) => {
      if (blob) {
        const file = new File([blob], "cropped-image.jpg", {
          type: "image/jpeg",
        });
        emit("uploadQiNiu", file);
        localVisible.value = false;
      }
    },
    "image/jpeg",
    0.9
  );
};
const zoom = () => {
  if (cropper.value) {
    cropper.value.zoom(2);
  }
};
const move = () => {
  if (cropper.value) {
    cropper.value.move(100, 100);
  }
};
const flip = (x, y) => {
  if (cropper.value) {
    const { image } = cropper.value.getResult();
    if (image.transforms.rotate % 180 !== 0) {
      cropper.value.flip(!x, !y);
    } else {
      cropper.value.flip(x, y);
    }
  }
};
const rotate = (angle) => {
  if (cropper.value) {
    cropper.value.rotate(angle);
  }
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
      :style="{ width: 1000 - 48 + 'px', height: height - 40 + 'px' }"
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
            :customRequest="handleFileChange"
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
            :width="width - 48"
            :height="height + 'px'"
            :zoom="zoom"
            :move="move"
            :stencilProps="{
              aspectRatio: cutWidth / cutHeight, // 保持 1:1 比例
              movable: true, // 允许移动
              scalable: true, // 禁止缩放
              resizable: true, // 禁止用户调整大小
              rotatable: true, // 允许旋转
            }"
            :canvas="{
              minWidth: cutWidth,
              minHeight: cutHeight,
              maxWidth: width, // 确保最大尺寸一致
              maxHeight: height,
              preserveAspectRatio: true,
            }"
            :default-size="{
              width: cutWidth,
              height: cutHeight,
            }"
          />
          <vertical-buttons>
            <square-button title="Flip Horizontal" @click="flip(true, false)">
              <svg-flip-horizontal
                class="icon"
                style="color: #fff"
              ></svg-flip-horizontal>
            </square-button>
            <square-button title="Flip Vertical" @click="flip(false, true)">
              <svg-flip-vertical
                class="icon"
                style="color: #fff"
              ></svg-flip-vertical>
            </square-button>
            <square-button title="Rotate Clockwise" @click="rotate(90)">
              <svg-rotate-clockwise
                class="icon"
                style="color: #fff"
              ></svg-rotate-clockwise>
            </square-button>
            <square-button
              title="Rotate Counter-Clockwise"
              @click="rotate(-90)"
            >
              <svg-rotate-counter-clockwise
                class="icon"
                style="color: #fff"
              ></svg-rotate-counter-clockwise>
            </square-button>
          </vertical-buttons>
          <!-- 操作按钮 -->
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
          <a-upload :accept="accept" :customRequest="handleImageChange">
            <div class="select-img">选择图片</div>
          </a-upload>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<style scoped lang="less">
.model-content {
  width: 100%;
  .cut-cont {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    position: relative;
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
