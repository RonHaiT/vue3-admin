<script lang="ts" setup>
import { getUploadToken } from "~/http/apis/match";
import * as qiniu from "qiniu-js";
import { PlusOutlined } from "@ant-design/icons-vue";
import type { UploadProps, UploadChangeParam } from "ant-design-vue";
import { Upload } from "ant-design-vue";
import cardZM from "~/assets/image/zm.jpg";
import cardBM from "~/assets/image/bm.jpg";
import CutImageModal from "./CutImageModal.vue";
import type { UploadFile } from "ant-design-vue";
const props = defineProps({
  maxCount: { type: Number, default: 1 }, //上传数量 默认1
  disabled: { type: Boolean, default: false }, //是否禁止上传
  width: { type: Number, default: 100 }, //显示的宽
  height: { type: Number, default: 100 }, //显示的高
  cutWidth: { type: Number, default: 500 }, //裁剪区域宽
  cutHeight: { type: Number, default: 500 }, //裁剪区域高
  cardType: { type: Number, default: 1 }, //1.身份证正面  2.身份证背面
  uploadType: { type: String, default: "image" }, //上传类型 image图片 file文件 card身份证
  cutImg: { type: Boolean, default: true }, // 是否要裁剪图片
  accept: { type: Array, default: () => ["image/*"] }, //处理的类型
  action: { type: String, default: "" }, //处理的类型
  listFile: { type: Array as () => UploadFile[], default: () => [] },
});
const emit = defineEmits(["imageSuccess", "imageRemove"]);
const acceptJoin = computed(() => {
  return props.accept.join(", .");
});
const previewVisible = ref(false);
const loading = ref(false);
const previewImage = ref("");
const previewTitle = ref("");
const imageCropperRef = ref<InstanceType<typeof CutImageModal> | null>(null);
const fileList = ref<UploadProps["fileList"]>([]);

// 处理图片预览
const handlePreview = async (fileObj) => {
  previewImage.value = fileObj.url;
  previewVisible.value = true;
  previewTitle.value = fileObj.name;
};
// 处理取消预览
const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = "";
};

//处理裁剪图片
const uploadQiNiu = async (upFile: File) => {
  postQiNius(
    upFile,
    () => {
      console.log("成功回调");
    },
    (error: any) => {
      console.error("上传失败", error);
    }
  );
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
    complete(res) {
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
      emit("imageSuccess", uploadedUrl);
      if (imageCropperRef.value) {
        imageCropperRef.value.closeModal(); // 调用子组件的 openModal 方法
        imageCropperRef.value.clearimageSrc(); // 调用子组件的 openModal 方法
      }
    },
  });
};
// 处理身份证点击
const handleClick = () => {
  if (imageCropperRef.value) {
    imageCropperRef.value.openModal(); // 调用裁剪组件的 openModal 方法
  }
};

// 删除文件
const handleRemove = (fileObj, index: number) => {
  fileList.value = fileList.value?.filter((_, i) => i !== index);
  emit("imageRemove");
};

// 上传文件
const uploadImage = (file) => {
  try {
    uploadQiNiu(file.file as File);
  } catch (error) {
    message.error("上传失败");
  }
};

// 上传前检测图片文件的大小
const beforeUpload: UploadProps["beforeUpload"] = (file) => {
  if (file.type.startsWith("image/") && file.size > 2 * 1024 * 1024) {
    message.error("上传失败，请检查文件大小，文件大小请控制在2M以内");
    return Upload.LIST_IGNORE;
  }
};

watch(
  () => props.listFile,
  (newListFile, oldListFile) => {
    // newListFile 和 oldListFile 分别表示新旧的值
    // 你可以在这里根据新的 listFile 执行一些操作
    fileList.value = newListFile;
  },
  { immediate: true } // 立即执行一次，以检查初始值
);
onMounted(() => {
  if (!props.cutImg) {
    getQiNiuToken();
  }
});
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
</script>
<template>
  <div class="clearfix">
    <div class="preview" v-if="fileList && fileList.length > 0">
      <div
        v-if="uploadType == 'card' || uploadType == 'image'"
        class="pre-list"
      >
        <div
          class="pre-img"
          :style="{ width: width + 'px', height: height + 'px' }"
          v-for="(item, index) in fileList"
          :key="index"
        >
          <img
            :src="item.url"
            alt=""
            :style="{
              width: width + 'px',
              height: height + 'px',
              marginBottom: uploadType == 'card' ? '20px' : '',
            }"
          />

          <div class="pre-bg">
            <div class="btns">
              <EyeOutlined @click="handlePreview(item)" /><DeleteOutlined
                @click="handleRemove(item, index)"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="uploadType == 'file'" class="file-list">
        <div class="file-item" v-for="(item, index) in fileList" :key="index">
          <a :href="item.url">{{ item.name }} </a>
          <DeleteOutlined
            @click="handleRemove(item, index)"
            style="color: #333"
          />
        </div>
      </div>
    </div>
    <template v-if="cutImg">
      <a-upload
        v-if="fileList.length < maxCount"
        list-type="picture-card"
        :disabled="disabled"
        :maxCount="maxCount"
        :openFileDialogOnClick="false"
        :accept="acceptJoin"
        :customRequest="uploadImage"
        :style="{
          width: width + 'px !important',
          height: height + 'px !important',
        }"
      >
        <slot name="ant-upload">
          <div
            class="card"
            @click="handleClick"
            v-if="uploadType == 'card'"
            :style="{
              width: width + 'px !important',
              height: height + 'px !important',
            }"
          >
            <img
              :src="cardZM"
              alt=""
              v-if="cardType == 1"
              :style="{ width: width + 'px', height: height + 'px' }"
            />
            <img
              :src="cardBM"
              alt=""
              v-else
              :style="{ width: width + 'px', height: height + 'px' }"
            />
          </div>
          <div
            v-else-if="uploadType == 'file'"
            class="file"
            @click="handleClick"
            :style="{ width: width + 'px', height: height + 'px' }"
          >
            <PlusOutlined />
          </div>
          <div
            v-else-if="uploadType == 'image'"
            @click="handleClick"
            class="image"
            :style="{ width: width + 'px', height: height + 'px' }"
          >
            <PlusOutlined />
          </div>
        </slot>
      </a-upload>
    </template>
    <template v-else>
      <a-upload
        v-if="fileList.length < maxCount"
        list-type="picture-card"
        :customRequest="uploadImage"
        :disabled="disabled"
        :maxCount="maxCount"
        :accept="acceptJoin"
        :beforeUpload="beforeUpload"
        :style="{
          width: width + 'px !important',
          height: height + 'px !important',
        }"
      >
        <slot
          name="ant-upload"
          :style="{ width: width + 'px', height: height + 'px' }"
        >
          <div
            class="image"
            :style="{ width: width + 'px', height: height + 'px' }"
          >
            <PlusOutlined />
          </div>
        </slot>
      </a-upload>
    </template>
    <a-modal
      v-model:open="previewVisible"
      :title="previewTitle"
      :footer="null"
      @cancel="handleCancel"
    >
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
    <CutImageModal
      ref="imageCropperRef"
      @uploadQiNiu="uploadQiNiu"
      :uploadType="uploadType"
      :accept="acceptJoin"
      :cutWidth="cutWidth"
      :cutHeight="cutHeight"
    />
  </div>
</template>

<style scoped lang="less">
.clearfix {
  // width: 100%;
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  .preview {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .pre-list {
      width: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 10px;
    }
    .pre-img {
      position: relative;
      animation: all 1 ease;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 10px;

      .pre-bg {
        width: 100%;
        height: 100%;
        z-index: 999;
        position: absolute;
        z-index: 999;
        top: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0);

        .btns {
          position: absolute;
          display: flex;
          justify-content: center;
          align-items: center;
          column-gap: 10px;
          top: 50%;
          transform: translateX(-50%) translateY(-50%);
          left: 50%;
          color: #fff;
          font-size: 20px;
          span:hover {
            color: @text4;
          }
        }
      }
    }
    .pre-img:hover {
      .pre-bg {
        background-color: rgba(0, 0, 0, 0.2);
      }
    }
  }
}
.card,
.image,
.file {
  border: 1px solid @bg03;
  color: #d7dfe9;
  display: flex;
  justify-content: center;
  align-items: center;
}
.file-list {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  .file-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
  }
}
:deep(.ant-upload-select-picture-card) {
  border: none !important;
  background: none !important;
}
:deep(.ant-upload.ant-upload-select) {
  width: unset !important;
  height: unset !important;
  display: unset !important;
}
</style>
