<script setup lang="ts">
import { getUploadToken } from "~/http/apis/match";
import * as imageConversion from "image-conversion";
import * as qiniu from "qiniu-js";
import { Upload } from "ant-design-vue";
import { Cropper, ResizeEvent, MoveEvent } from "vue-advanced-cropper";
import VerticalButtons from "./Components/VerticalButtons.vue";
import SquareButton from "./Components/SquareButton.vue";
import cardZM from "~/assets/image/zm.jpg";
import cardBM from "~/assets/image/bm.jpg";

import type { Cropper as CropperType } from "vue-advanced-cropper";
import type {
  UploadFile,
  UploadProps,
  UploadChangeParam,
} from "ant-design-vue";

const props = defineProps({
  cutImg: { type: Boolean, default: false }, // 是否要裁剪图片
  width: { type: Number, default: 100 }, //显示的宽
  height: { type: Number, default: 100 }, //显示的高
  accept: { type: Array, default: () => ["image/*"] }, //处理的类型
  isFile: { type: Boolean, default: false }, // 是否为文件
  cutWidth: { type: Number, default: 200 }, // 裁剪宽
  cutHeight: { type: Number, default: 200 }, // 裁剪高
  maxCount: { type: Number, default: 1 }, // 最大数量
  uploadType: { type: Number, default: 1 }, //1.默认上传 2.上传身份证
  image: { type: [String, Array], default: "" }, // 允许传入字符串或数组,兼容单个图片和数组
  cardType: { type: Number, default: 1 }, // 身份证背面还是正面
});
let cutMaxWidth = ref(630);
let cutMaxHeight = ref(630);
const fileList = ref<UploadFile[]>([]);
// 裁剪
const cropper = ref<InstanceType<typeof CropperType> | null>(null);
const previewVisible = ref(false); //预览弹窗
const cutModal = ref(false); //裁剪弹窗
const previewImage = ref(""); //预览图片
const imageSrc = ref<string | null>(null); //裁剪图片
const emit = defineEmits(["imageSuccess", "imageRemove"]);
const showCutModal = () => {
  getQiNiuToken();
  if (props.cutImg && !props.isFile) {
    imageSrc.value = "";
    cutModal.value = true;
  }
};
const closeCutModal = () => {
  imageSrc.value = "";
  cutModal.value = false;
};

const customRequest = async (options: any) => {
  const { file, onSuccess, onError } = options;
  console.log(file);
  // 创建文件对象的图片 URL
  const imageUrl = URL.createObjectURL(file);

  const img = new Image();
  img.src = imageUrl;

  img.onload = () => {
    const maxWidth = cutMaxWidth.value; // 设置最大宽度
    const maxHeight = cutMaxHeight.value; // 设置最大高度
    let width = img.width;
    let height = img.height;
    if (width > height) {
      const aspectRatio = height / width;
      width = maxWidth;
      height = maxHeight * aspectRatio;
      if (height < props.cutHeight) {
        height = props.cutHeight;
      }
    } else {
      const aspectRatio = width / height;
      width = maxWidth * aspectRatio;
      if (width < props.cutWidth) {
        width = props.cutWidth;
      }
      height = maxHeight;
    }

    // 使用 Canvas 进行缩放
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // 导出缩放后的图片为 Blob 对象
      canvas.toBlob((blob) => {
        if (blob) {
          // 将新的 Blob 转换为 URL
          imageSrc.value = URL.createObjectURL(blob);
          onSuccess(imageSrc.value); // 返回处理后的图片 URL
        } else {
          onError(new Error("图片处理失败"));
        }
      }, file.type);
    }
  };

  img.onerror = (error) => {
    onError(error);
  };
};
const customImageRequest = async (options: any) => {
  const { file, onSuccess, onError } = options;
  if (props.isFile) {
    postQiNius(file, onSuccess, onError);
  } else {
    try {
      const compressedBlob = await imageConversion.compressAccurately(
        file,
        200
      );
      const compressedFile = new File([compressedBlob], file.name, {
        type: file.type,
      });

      // 上传压缩后的文件
      await postQiNius(compressedFile, onSuccess, onError);
    } catch (error) {
      onError(error);
    }
  }
};
const saveCroppedImage = async () => {
  if (!cropper.value) {
    console.error("Cropper 未初始化");
    return;
  }
  if (!cropper.value) return;

  const result = cropper.value.getResult();
  if (!result || !result.canvas) return;

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
    async (blob) => {
      if (blob) {
        const file = new File([blob], "cropped-image.jpg", {
          type: "image/jpeg",
        });
        // 先压缩图片
        try {
          // 先压缩图片
          const compressedBlob = await imageConversion.compressAccurately(
            file,
            200
          );
          const compressedFile = new File([compressedBlob], file.name, {
            type: file.type,
          });
          console.log("压缩图片");

          // 上传压缩后的文件
          postQiNius(
            compressedFile,
            () => {},
            () => {}
          );
        } catch (error) {
          console.error("图片压缩失败", error);
        }
      }
    },
    "image/jpeg",
    0.9
  );
};
const handleRemove = (file: any) => {
  fileList.value = fileList.value.filter((item) => item.uid !== file.uid);
  emit("imageRemove");
};
//上传前图片检测
const beforeUpload: UploadProps["beforeUpload"] = (file) => {
  if (file.type.startsWith("image/") && file.size > 2 * 1024 * 1024) {
    message.error("上传失败，请检查文件大小，文件大小请控制在2M以内");
    return Upload.LIST_IGNORE;
  }
};
const handlePreview = (file: any) => {
  if (props.isFile) {
    message.warn("设定的文件类型无预览");
    return; // 文件类型不是图片，直接返回，不弹出预览
  }
  previewImage.value = file.url || file.thumbUrl; // 设置预览图片
  previewVisible.value = true; // 弹出预览窗口
};
// 放大缩小
const zoom = (factor) => {
  if (cropper.value) {
    cropper.value.zoom(factor);
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
//七牛云上传
const postQiNius = async (
  upFile: File,
  onSuccess: (url: string) => void,
  onError: (error: any) => void
) => {
  let upToken = useCookie("upToken");
  let domian = useCookie("domian");
  let fileName = upFile.name;

  let suffix = upFile.name.substring(upFile.name.lastIndexOf(".") + 1);
  let key =
    new Date().getTime() +
    "_" +
    Math.floor(Math.random() * 1000000000000) +
    "." +
    suffix; // 文件资源名
  let config = { useCdnDomain: true };
  let putExtra = {
    fname: upFile.name,
    params: {},
  };

  // 上传文件到七牛云
  const observable = qiniu.upload(
    upFile,
    key,
    upToken.value as string,
    putExtra,
    config
  );
  observable.subscribe({
    next(res) {
      console.log("上传进度：" + Math.floor(res.total.percent) + "%");
    },
    error(err) {
      console.error("上传失败:", err);
    },
    async complete(res) {
      const uploadedUrl = `${domian.value}/${res.key}`;
      console.log("上传后的 URL:", uploadedUrl);
      fileList.value?.push({
        uid: key,
        name: fileName,
        status: "done",
        url: uploadedUrl,
        thumbUrl: uploadedUrl,
      });
      message.success({
        content: "上传成功",
        key: "success",
        duration: 1,
      });

      await onSuccess(uploadedUrl);
      emit("imageSuccess", uploadedUrl, fileList.value);
      imageSrc.value = "";
      cutModal.value = false;
      return uploadedUrl;
    },
  });
};
//文件缩略图
const previewFile: UploadProps["previewFile"] = async (file) => {
  if (file.type.startsWith("image/")) {
    return URL.createObjectURL(file);
  } else {
    return "";
  }
};

const acceptJoin = computed(() => {
  return props.accept.join(", .");
});

// 处理图片格式
const normalizeImageList = (image: string | string[]): string[] => {
  if (typeof image === "string" && image.trim() !== "") {
    return [image];
  } else if (Array.isArray(image)) {
    return image;
  }
  return [];
};

// 将图片地址转换成 Upload 需要的 fileList
const updateFileList = (imageData: string | string[]) => {
  const images = normalizeImageList(imageData);
  fileList.value = images.map((url, index) => ({
    uid: String(index),
    name: `image-${index}`,
    status: "done",
    url,
    thumbUrl: url,
  }));
};

const computedWidth = computed(() => {
  return props.uploadType === 2 ? "240px" : `${props.width}px`; // 例如 uploadType=2 固定宽度 100px
});
const computedHeight = computed(() => {
  return props.uploadType === 2 ? "142px" : `${props.height}px`; // 例如 uploadType=2 固定宽度 100px
});
watch(
  () => props.image,
  (newImage) => {
    updateFileList(newImage as string | string[]);
  },
  { immediate: true } // 组件初始化时执行
);
onMounted(() => {
  updateFileList(props.image as string | string[]);
});
</script>
<template>
  <div>
    <a-upload
      :accept="acceptJoin"
      :customRequest="customImageRequest"
      :fileList="fileList"
      list-type="picture-card"
      :remove="handleRemove"
      @preview="handlePreview"
      :preview-file="previewFile"
      :beforeUpload="beforeUpload"
      imageRestriction="none"
      :openFileDialogOnClick="!cutImg"
      :maxCount="maxCount"
    >
      <template v-if="fileList.length < maxCount">
        <div
          v-if="uploadType == 1"
          class="upload-btn"
          :style="{ width: width + 'px', height: height + 'px' }"
          @click="showCutModal"
        >
          <PlusOutlined />
        </div>
        <div
          v-if="uploadType == 2"
          class="upload-btn"
          :style="{ width: computedWidth, height: computedHeight }"
          @click="showCutModal"
        >
          <img
            :src="cardZM"
            alt=""
            v-if="cardType == 1"
            :style="{ width: computedWidth, height: computedHeight }"
          />
          <img
            :src="cardBM"
            alt=""
            v-else
            :style="{ width: computedWidth, height: computedHeight }"
          />
        </div>
      </template>
    </a-upload>
  </div>
  <!-- 预览图片 -->
  <a-modal v-model:open="previewVisible" :footer="null" :width="900">
    <div class="preview">
      <img alt="预览" :src="previewImage" />
    </div>
  </a-modal>
  <!-- 截取图片 -->
  <a-modal
    v-model:open="cutModal"
    title="裁剪图片"
    @cancel="closeCutModal"
    :footer="false"
    :width="1200"
    :maskClosable="false"
  >
    <div class="content">
      <div v-if="imageSrc" class="cut-image">
        <Cropper
          class="cropper"
          ref="cropper"
          :src="imageSrc"
          :stencilProps="{
            aspectRatio: cutWidth / cutHeight, // 保持 1:1 比例
            movable: true, // 允许移动
            scalable: true, // 允许放大
            resizable: true, // 允许调整大小
            rotatable: true, // 允许旋转
            minWidth: cutWidth, // 设置最小宽度，允许缩小到初始尺寸
            minHeight: cutHeight, // 设置最小高度，允许缩小到初始尺寸
          }"
          :default-size="{
            width: cutWidth,
            height: cutHeight,
          }"
          :zoom="zoom"
          :move="move"
          style="object-fit: contain"
        />
        <vertical-buttons>
          <square-button title="放大" @click="zoom(2)">
            <svg-zoom-in class="icon" style="color: #fff"></svg-zoom-in>
          </square-button>
          <square-button title="缩小" @click="zoom(0.3)">
            <svg-zoom-out class="icon" style="color: #fff"></svg-zoom-out>
          </square-button>
          <square-button title="水平翻转" @click="flip(true, false)">
            <svg-flip-horizontal
              class="icon"
              style="color: #fff"
            ></svg-flip-horizontal>
          </square-button>
          <square-button title="垂直翻转" @click="flip(false, true)">
            <svg-flip-vertical
              class="icon"
              style="color: #fff"
            ></svg-flip-vertical>
          </square-button>
          <square-button title="顺时针旋转" @click="rotate(90)">
            <svg-rotate-clockwise
              class="icon"
              style="color: #fff"
            ></svg-rotate-clockwise>
          </square-button>
          <square-button title="逆时针旋转" @click="rotate(-90)">
            <svg-rotate-counter-clockwise
              class="icon"
              style="color: #fff"
            ></svg-rotate-counter-clockwise>
          </square-button>
        </vertical-buttons>
        <!-- 操作按钮 -->
        <div class="btns">
          <a-button type="dashed" @click="imageSrc = ''"> 重新上传 </a-button>
          <a-button
            type="primary"
            style="margin-left: 10px"
            @click="saveCroppedImage"
          >
            保存
          </a-button>
          <a-button style="margin-left: 10px" @click="closeCutModal">
            取消
          </a-button>
        </div>
      </div>
      <!-- 选择图片 -->
      <div class="cut-select" v-else>
        <a-upload
          :accept="acceptJoin"
          :customRequest="customRequest"
          :beforeUpload="beforeUpload"
        >
          <div class="select-img">选择图片</div>
        </a-upload>
      </div>
    </div>
  </a-modal>
</template>

<style scoped lang="less">
.upload-btn {
  width: 100px;
  height: 100px;
  background-color: @bg01;
  color: @text4;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid @bg03;
  cursor: pointer;
}
.preview {
  width: 100%;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  text-align: center;
  overflow: hidden;
  img {
    width: 800px;
    height: auto;
    max-height: 600px;
    overflow: hidden;
  }
}
.content {
  width: 100%;
  height: 700px;
  position: relative;

  .cut-image {
    width: 100%;
    height: 90%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: url("~/assets/image/up-bg.png");
    background-repeat: repeat;
    background-size: 24px 24px;

    .btns {
      width: 100%;
      position: absolute;
      bottom: 0;
      left: 0;
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
    background-image: url("~/assets/image/up-bg.png");
    background-repeat: repeat;
    background-size: 24px 24px;
    cursor: pointer;
    background-color: @dbMain;
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
  }
}
/* 设置上传按钮的宽高 */
:deep(.ant-upload) {
  width: v-bind(computedWidth) !important;
  height: v-bind(computedHeight) !important;
  padding: 0 !important;
}
:deep(.ant-upload-list-item-container) {
  width: v-bind(computedWidth) !important;
  height: v-bind(computedHeight) !important;
  padding: 0 !important;
}

// /* 设置上传后的图片缩略图大小 */
:deep(.ant-upload-list-item-thumbnail) {
  width: v-bind(computedWidth) !important;
  height: v-bind(computedHeight) !important;
  object-fit: cover; /* 确保图片不失真 */
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  overflow: hidden !important;
}

// /* 设置上传列表项的宽高 */
:deep(.ant-upload-list-item) {
  width: v-bind(computedWidth) !important;
  height: v-bind(computedHeight) !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  margin: 0 !important;
  padding: 0 !important;
}
:deep(.ant-upload-list-item.ant-upload-list-item::before) {
  width: v-bind(computedWidth) !important;
  height: v-bind(computedHeight) !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>
