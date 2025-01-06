<script setup lang="ts">
import { message } from "ant-design-vue";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons-vue";
import CutImageModal from "@/components/CutImageModal.vue";
import type { UploadProps } from "ant-design-vue";

// Props
const props = defineProps({
  maxCount: { type: Number, default: 3 }, // 上传数量 默认3
  disabled: { type: Boolean, default: false }, // 是否禁止上传
});

const fileList = ref<UploadProps["fileList"]>([]);
let cutImage = ref(null);
const isModalVisible = ref(false);
const previewVisible = ref(false);
const previewImage = ref("");
const previewTitle = ref("");
let currentFile = ref<UploadProps["fileList"][number] | null>(null);

// 选择图片前的验证
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    message.error("只能上传图片文件！");
  }
  return isImage || Upload.LIST_IGNORE;
};

// 自定义上传逻辑
const customRequest = async (options: any) => {
  const { file, onSuccess, onError, onProgress } = options;
  // 在这里处理上传逻辑，例如上传到七牛云
  // 模拟上传成功
  setTimeout(() => {
    onSuccess("ok");
  }, 1000);
};

// 处理图片预览（裁剪）
const handlePreview = (file: UploadProps["fileList"][number]) => {
  currentFile.value = file;
  isModalVisible.value = true;
};

// 处理裁剪后的图片
const handleCropped = (data: { blob: Blob; base64: string }) => {
  if (currentFile.value) {
    // 更新文件列表中的文件
    const index = fileList.value.findIndex(
      (item) => item.uid === currentFile.value!.uid
    );
    if (index !== -1) {
      fileList.value[index].url = data.base64;
      fileList.value[index].preview = data.base64;
      // 你可以在这里上传 `data.blob` 到服务器
      // 例如调用 `uploadQiNiu(data.blob)`
    }
  }
};

// 移除文件
const remove = (file: UploadProps["fileList"][number]) => {
  const index = fileList.value.findIndex((item) => item.uid === file.uid);
  if (index !== -1) {
    fileList.value.splice(index, 1);
    message.success("文件已删除！");
  }
};

// 取消预览
const handleCancelPreview = () => {
  previewVisible.value = false;
  previewTitle.value = "";
};

// 处理裁剪弹窗取消
const handleCancelCrop = () => {
  isModalVisible.value = false;
  currentFile.value = null;
};
const handleCutImage = () => {
  isModalVisible.value = true;
};
</script>
<template>
  <div class="clearfix">
    <a-upload
      v-model:file-list="fileList"
      list-type="picture-card"
      @preview="handlePreview"
      :maxCount="maxCount"
      :disabled="disabled"
      :before-upload="beforeUpload"
      :showUploadList="false"
      :openFileDialogOnClick="false"
      :custom-request="customRequest"
    >
      <div v-if="fileList.length < maxCount" @click="handleCutImage">
        <PlusOutlined />
      </div>
    </a-upload>

    <!-- 自定义上传列表 -->
    <div class="upload-list">
      <div v-for="file in fileList" :key="file.uid" class="upload-item">
        <img
          :src="file.url || file.preview"
          @click="handlePreview(file)"
          alt="upload"
          class="upload-image"
        />
        <MinusOutlined @click="remove(file)" />
      </div>
    </div>

    <!-- 裁剪弹窗 -->
    <CutImageModal
      :visible="isModalVisible"
      @update:visible="isModalVisible = $event"
      @cropped="handleCropped"
    />

    <!-- 预览弹窗 -->
    <a-modal
      :open="previewVisible"
      :title="previewTitle"
      :footer="null"
      @cancel="handleCancelPreview"
    >
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<style scoped lang="less">
.upload-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 16px;
}

.upload-item {
  position: relative;
  margin-right: 8px;
  margin-bottom: 8px;
}

.upload-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  cursor: pointer;
  border-radius: 4px;
}

.delete-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  color: red;
  cursor: pointer;
}
</style>
