<template>
  <view class="add">
    <app-watermark> </app-watermark>
    <up-form>
      <view class="bg-white mb-2">
        <app-form-item
          @click="entryShow = true"
          label="核算单元选择"
          class="mt-1"
          :borderBottom="false"
        >
          <view :class="`w-full text-right ${filterObj.entryname ? '' : 'color-gray-6'}`">
            {{ filterObj.entryname ? `${filterObj.entryname}` : '点击选择核算单元' }}
          </view>
        </app-form-item>
      </view>
      <view class="bg-white mb-2">
        <app-form-item
          @click="filterObj.entryname ? (customShow = true) : ''"
          label="客户信息"
          class="mt-1"
          :borderBottom="false"
        >
          <view :class="`w-full text-right ${filterObj.customname ? '' : 'color-gray-6'}`">
            {{
              filterObj.entryname
                ? filterObj.customname
                  ? `${filterObj.customname}${filterObj.CONTACTMAN ? `（${filterObj.CONTACTMAN}）` : ''}`
                  : '点击选择客户信息'
                : '请先选择核算单元'
            }}
          </view>
        </app-form-item>
      </view>
      <view class="bg-white mb-2">
        <app-form-item label="询证函备注" class="mt-1" :borderBottom="false">
          <up-textarea
            v-model="filterObj.inquiryMessage"
            placeholder="请输入询证函备注"
          ></up-textarea> </app-form-item
      ></view>
      <view class="bg-white mb-2">
        <app-form-item
          label="财务人员"
          @click="changeTypeShow = true"
          class="mt-1"
          :borderBottom="false"
        >
          <view :class="`w-full text-right ${filterObj.userIdList?.length ? '' : 'color-gray-6'}`">
            {{
              filterObj.userIdList?.length
                ? `已选${filterObj.userIdList.length}人`
                : '点击选择财务人员'
            }}
          </view></app-form-item
        ></view
      >
    </up-form>

    <!-- 附件上传 -->
    <view class="bg-white pa-4 mb-2">
      <view class="text-16 font-bold mb-4">附件上传</view>
      <up-upload
        :fileList="fileList"
        @delete="deletePic"
        @afterRead="afterRead"
        :previewFullImage="true"
        multiple
        class="block mt-2"
      />
    </view>

    <!-- 操作按钮 -->
    <app-bottom-actions>
      <view class="w-full flex justify-between">
        <up-button @click="cancelClick" shape="circle" text="取消" class="flex-1 mr-2" />
        <up-button
          @click="sureRead"
          shape="circle"
          type="primary"
          text="确认上传"
          class="flex-1 ml-2"
        />
      </view>
      <!-- <view class="w-full flex justify-center">
        <up-button @click="cancelClick" shape="circle" text="取消" />
        <up-button @click="sureRead" shape="circle" type="primary" class="ml-2" text="确认上传" />
      </view> -->
    </app-bottom-actions>
    <!-- 核算单元选择 -->
    <app-action-sheet
      v-model:show="entryShow"
      :actions="entryList"
      description="核算单元选择"
      @select="onEntrySelect"
    />
    <!-- 客户选择弹窗 -->
    <up-popup
      class="van-popup-bg"
      :customStyle="{ height: '90vh' }"
      v-model:show="customShow"
      shape="circle"
      mode="bottom"
      :safe-area-inset-bottom="true"
    >
      <view class="text-16 py-2 font-bold text-center">单位信息</view>
      <biz-custom-list @cell-click="chooseCustomClick" :entryid="filterObj.entryid" />
    </up-popup>
    <!-- 部门用户选择 -->
    <biz-dept-user
      v-model:show="changeTypeShow"
      v-model:checkedUsers="checkedUsers"
      v-model:hasDept="hasDept"
      @confirm="onTreeConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import { uploadFormdataPic } from '@/utils/upload';
// 类型定义
interface FilterObj {
  customid: string;
  customname: string;
  entryid: string;
  entryname: string;
  CONTACTID?: string;
  CONTACTMAN?: string;
  inquiryMessage?: string;
  userIdList?: (string | number)[]; // @人员
  userIdDetailList?: any[]; // @人员详情
}

interface CheckDetail {
  phoneNum: string;
}

// 响应式数据
const filterObj = ref<FilterObj>({
  customid: '',
  customname: '',
  entryid: '',
  entryname: '',
  CONTACTID: '',
  CONTACTMAN: '',
  inquiryMessage: '',
  userIdList: [], // @人员
  userIdDetailList: [], // @人员详情
});
// 使用文件上传功能
const { fileList, deletePic, afterRead, getFileCount, clearFiles } = useFileUpload();

// 文件上传处理
// const handleFileUpload = async (event: any) => {
//   const { file } = event;
//   const files = Array.isArray(file) ? file : [file];

//   // 文件验证
//   for (const fileItem of files) {
//     if (!validateFileType(fileItem)) {
//       uni.showToast({
//         title: `上传的文件格式不支持，仅支持${['jpg', 'jpeg', 'png', 'heic', 'pdf'].join(',')}格式`,
//         icon: 'error',
//       });
//       return;
//     }

//     // HEIC格式转换
//     if (fileItem.name.toLowerCase().endsWith('.heic') && typeof uni.$heic2anyFun === 'function') {
//       try {
//         const convertedFile = await uni.$heic2anyFun(fileItem.file || fileItem, fileItem.name);
//         if (convertedFile) {
//           // 添加到文件列表
//           addfileList.value.push({
//             file: convertedFile,
//             status: 'uploading',
//             message: '转换中...',
//           });
//         }
//       } catch (error) {
//         uni.showToast({
//           title: 'HEIC文件转换失败',
//           icon: 'error',
//         });
//       }
//     } else {
//       // 普通文件直接添加
//       addfileList.value.push({
//         file: fileItem.file || fileItem,
//         status: 'uploading',
//         message: '准备上传...',
//       });
//     }
//   }
// };

// 查询核算单元
// 核算单元列表
const entryList = ref<any[]>([]);
const entryShow = ref(false);
const queryEntryid = async () => {
  try {
    // 这里可以添加查询核算单元的API调用
    const res = await CommonService.queryEntryid();
    console.log(res);
    entryList.value = res.map((item: any, index: number) => ({
      id: index,
      name: item.entryid ? `${item.entryid}/${item.entryname}` : item.entryname,
    }));
  } catch (error) {
    uni.showToast({
      title: '查询核算单元失败',
      icon: 'error',
    });
  }
};

// 确认上传
const sureRead = async () => {
  // 表单验证
  if (!filterObj.value.customid) {
    showToast('请选择客户');
    return;
  }
  if (fileList.value.length === 0) {
    showToast('请选择要上传的图片');
    return;
  }
  const formData = new FormData();
  const fileUseList: any[] = [];
  try {
    //   // 处理文件上传
    //   for (const elementFile of addfileList.value) {
    //     if (elementFile.file) {
    //       // 处理HEIC文件转换
    //       if (
    //         elementFile.file.name.toLowerCase().endsWith('.heic') &&
    //         typeof uni.$heic2anyFun === 'function'
    //       ) {
    //         const fileUse = await uni.$heic2anyFun(elementFile.file, elementFile.file.name);
    //         if (fileUse) {
    //           fileUseList.push(fileUse);
    //           formData.append('imageList', fileUse);
    //         }
    //       } else {
    //         formData.append('imageList', elementFile.file);
    //       }
    //     }
    //   }
    // 处理文件
    for (const item of fileList.value) {
      if (item?.file) {
        formData.append('imageList', item.file, item.file.name);
      }
    }
    // 添加表单数据
    formData.append('customerId', filterObj.value.customid);
    formData.append('customerName', filterObj.value.customname);
    formData.append('entryId', filterObj.value.entryid);
    formData.append('entryName', filterObj.value.entryname);
    formData.append('contactId', filterObj.value.CONTACTID || '');
    formData.append('contactName', filterObj.value.CONTACTMAN || '');
    formData.append('confirmationRequestContent', filterObj.value.inquiryMessage || '');
    formData.append('confirmationRequestContent', filterObj.value.inquiryMessage || '');
    // 添加电话列表
    formData.append('userPhoneNumberList', 'undefined');
    // 调用API
    const response = await uploadFormdataPic(
      formData,
      FORMDATA_UPLOAD_ENDPOINTS.ACTIVE_INITIATE_CONFIRMATION_LITTER
    );
    if (response.length === 0) {
      throw new Error('上传失败');
    } else {
      uni.showToast({
        title: '上传成功',
        icon: 'success',
      });
      // 清空文件列表
      clearFiles();
      setTimeout(() => {
        uni.navigateBack();
      }, 300);
    }
    // if (response.code === '200') {
    //   // 更新文件状态
    //   uni.showToast({
    //     title: '上传成功',
    //     icon: 'success',
    //   });
    // } else {
    //   // 处理失败状态
    //   uni.showToast({
    //     title: response.message || '上传失败',
    //     icon: 'error',
    //   });
    // }
  } catch (error) {
    uni.showToast({
      title: '上传失败',
      icon: 'error',
    });
  }
};
// 核算单元选择
const onEntrySelect = (item: any) => {
  const selectedEntry = item.name.split('/');
  if (selectedEntry) {
    filterObj.value.entryid = selectedEntry[0];
    filterObj.value.entryname = selectedEntry[1];
  }
};
const customShow = ref(false);
const chooseCustomClick = (val: any) => {
  filterObj.value.customid = val.customid;
  filterObj.value.customname = val.customname;
  filterObj.value.CONTACTID = val.CONTACTID;
  filterObj.value.CONTACTMAN = val.CONTACTMAN;
  customShow.value = false;
};
// 取消操作
const cancelClick = () => {
  uni.navigateBack();
};
const hasDept = ref(false);
const checkedUsers = ref<any[]>([]);
const changeTypeShow = ref(false);
/**
 * 部门用户选择确认
 */
const onTreeConfirm = (userList: any[]) => {
  changeTypeShow.value = false;
  filterObj.value.userIdList = userList;
  // resetAndFetchData(fetchDataList);
};
// 页面加载
onLoad(() => {
  queryEntryid();
});
</script>

<style lang="scss" scoped>
:deep(.u-radio-group) {
  flex: 2 !important;
}
</style>
