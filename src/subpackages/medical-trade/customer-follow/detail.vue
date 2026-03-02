<script setup lang="ts">
import { SzymUserVisitService } from '@/api/medical-trade';
import { uploadSingleFile } from '@/utils/upload';
import EditClock from './components/edit-clock.vue';
import CustomLabel from './components/custom-label.vue';

const appStore = useAppStore();

// 页面参数
const userId = ref('');

// 详情数据
const detailVal = ref<any>({});
const imageList = ref<any[]>([]);

// 弹窗状态
const clockShow = ref(false);
const customerLabelShow = ref(false);

// 打卡信息
const clockObj = ref<any>({});

// 客情事件相关
const staffMemberCheckDetail = ref<any[]>([]);
const labelTreeList = ref<any[]>([]);

/**
 * 获取详情数据
 */
const getDetail = async () => {
  try {
    const params = {
      suvId: appStore.detailObj?.suvId,
    };
    const res = await SzymUserVisitService.getSzymUserVisitBySuvId(params);
    if (res) {
      console.log('获取详情成功:', res.data);
      detailVal.value = res.data || {};
      // 处理图片列表
      imageList.value = [];
      if (res.data?.fileVOList && res.data.fileVOList.length) {
        imageList.value = res.data.fileVOList.map((file: any) => ({
          ...file,
          url: file.fileUrl,
        }));
      }
    }
  } catch (error) {
    console.error('获取详情失败', error);
    showToast('获取详情失败');
  }
};

/**
 * 编辑打卡信息
 */
const editClockClick = () => {
  clockShow.value = true;
  clockObj.value = {
    clickInValue: detailVal.value.signinCciId,
    clickOutValue: detailVal.value.signoutCciId,
    addressInDeatilValue: detailVal.value.signinCciAddress,
    addressOutDeatilValue: detailVal.value.signoutCciAddress,
  };
};

/**
 * 保存打卡信息
 */
const clockSure = async (val: any) => {
  try {
    const params = {
      suvId: detailVal.value.suvId,
      signinCciId: val.clickInValue,
      signoutCciId: val.clickOutValue,
    };
    const res = await SzymUserVisitService.optSzymUserVisitClockIn(params);
    if (res.success) {
      clockShow.value = false;
      showToast('保存成功');
      await getDetail();
    } else {
      showToast(res.msg || '保存失败');
    }
  } catch (error) {
    console.error('保存打卡信息失败', error);
    showToast('保存失败');
  }
};

/**
 * 编辑客情事件
 */
const editLabelClick = () => {
  const remarkValueList: any[] = [];
  const szymLabelRemarkDOResList = detailVal.value.szymLabelRemarkDOResList || [];

  for (let i = 0; i < szymLabelRemarkDOResList.length; i++) {
    const element = szymLabelRemarkDOResList[i];
    let keyStr = '';
    const keyList: any[] = [];

    for (let j = 0; j < (element.szymProjectResList || []).length; j++) {
      const project = element.szymProjectResList[j];
      keyStr += project.projectName;
      keyList.push(project.projectId);
    }

    remarkValueList.push({
      slrId: element.slrId,
      suvId: element.suvId,
      keyString: keyStr,
      keyList: keyList,
      keyCheckDetail: element.szymProjectResList || [],
      remarkChangeIdValue: element.labelId,
      remarkChangeNameValue: element.labelName,
      fileList: element.fileVOList || [],
    });
  }

  staffMemberCheckDetail.value = [
    {
      remarkValueList,
    },
  ];
  customerLabelShow.value = true;
};

/**
 * 保存客情事件
 */
const addCustomSure = async (val: any) => {
  try {
    staffMemberCheckDetail.value[0].remarkValueList = val;
    const params = val;
    const res = await SzymUserVisitService.optSzymUserVisitLabelRemark(params);
    if (res.success) {
      customerLabelShow.value = false;
      showToast('保存成功');
      await getDetail();
    } else {
      showToast(res.msg || '保存失败');
    }
  } catch (error) {
    console.error('保存客情事件失败', error);
    showToast('保存失败');
  }
};

/**
 * 上传图片
 */
const uploadImageClick = async () => {
  try {
    // 选择图片
    const res = await uni.chooseImage({
      count: 9 - imageList.value.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    });

    if (res.tempFilePaths && res.tempFilePaths.length) {
      showLoading('上传中...');

      // 上传文件
      const uploadPromises = res.tempFilePaths.map(async (tempPath: string) => {
        const fileUrl = await uploadSingleFile({ url: tempPath });
        const fileName = tempPath.substring(tempPath.lastIndexOf('/') + 1);
        const fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
        return {
          fileName,
          fileType,
          fileUrl,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      // 保存到服务器
      const params = {
        deleteFlag: false,
        suvId: detailVal.value.suvId,
        list: [...imageList.value.filter(f => f.fileName), ...uploadedFiles],
      };

      const saveRes = await SzymUserVisitService.optSzymUserVisitPic(params);
      hideLoading();

      if (saveRes.success) {
        showToast('上传成功');
        await getDetail();
      } else {
        showToast(saveRes.msg || '上传失败');
      }
    }
  } catch (error) {
    hideLoading();
    console.error('上传图片失败', error);
    showToast('上传失败');
  }
};

/**
 * 删除图片
 */
const deleteImage = async (index: number) => {
  try {
    const result = await showModal({
      title: '确认',
      content: '确定删除当前图片?',
    });

    if (result.confirm) {
      const file = imageList.value[index];
      if (!file.fileName) {
        // 如果是新添加的图片,只从列表中移除
        imageList.value.splice(index, 1);
        return;
      }

      // 从服务器删除
      const params = {
        deleteFlag: true,
        suvId: detailVal.value.suvId,
        list: [file],
      };

      const res = await SzymUserVisitService.optSzymUserVisitPic(params);
      if (res.success) {
        showToast('删除成功');
        await getDetail();
      } else {
        showToast(res.msg || '删除失败');
      }
    }
  } catch (error) {
    console.error('删除图片失败', error);
    showToast('删除失败');
  }
};

/**
 * 预览图片
 */
const previewImage = (index: number) => {
  const urls = imageList.value.map(item => item.url || item.fileUrl);
  uni.previewImage({
    current: index,
    urls: urls,
  });
};

/**
 * 下载文件
 */
const downloadFile = (file: any) => {
  const { fileName, fileType, fileUrl } = file;
  const imgTypes = ['png', 'jpg', 'jpeg', 'svg', 'heic'];

  if (imgTypes.includes(fileType.toLowerCase())) {
    // 图片直接预览
    uni.previewImage({
      current: fileUrl,
      urls: [fileUrl],
    });
  } else {
    // 其他文件跳转下载页
    router.push('/pages/download/index', {
      fileName,
      fileType,
      fileUrl: fileUrl.split('.com/')[1],
    });
  }
};

// 获取字典数据
const initDictData = async () => {
  try {
    const res = await CommonService.getDictionaries({
      full: true,
      pageNum: 1,
      pageSize: 100000,
      usestatus: 1,
      typeId: 73,
    });
    console.log('initDictData - res:', res);

    // 兼容不同的响应格式
    const list = res.data?.list || res.list || [];
    console.log('initDictData - list:', list);

    if (list && list.length) {
      labelTreeList.value = list.map((ele: any) => ({
        value: ele.DIC_SELECT_ID,
        name: ele.DIC_SELECT_NAME,
      }));
      console.log('initDictData - labelTreeList:', labelTreeList.value);
    } else {
      console.warn('initDictData - 未获取到字典数据');
    }
  } catch (error) {
    console.error('获取字典数据失败', error);
  }
};

// 生命周期
onLoad((options: any) => {
  // 接收页面参数
  userId.value = options?.userId || '';
  console.log('onLoad - userId:', userId.value);
});

onMounted(async () => {
  await initDictData();
  await getDetail();
});

onUnload(() => {
  appStore.setDetailObj(null);
});
</script>

<template>
  <view class="pb-100">
    <app-watermark />

    <!-- 基本信息 -->
    <view class="bg-white rounded-10rpx p-10">
      <view class="flex justify-between pt-2 px-2">
        <view>
          <view class="font-bold text-14 pb-1">
            {{ detailVal.customerName?.split('/')[0] || '' }}
          </view>
          <view v-if="detailVal.relCustomerId" class="text-12 color-normal pb-1">
            已关联至{{ detailVal.relCustomerId }}/{{ detailVal.relCustomerName || '--' }}
          </view>
          <view v-else class="color-gray-7 pb-1">暂未关联业务系统内客户</view>
        </view>
        <view class="flex flex-col items-end" style="margin-left: 90px; min-width: fit-content">
          <view class="tag-primary-plain mb-2">
            {{ detailVal.sourceType === 0 ? '拓展客户' : '业务系统内客户' }}
          </view>
          <view v-if="detailVal.customerTypeName" class="tag-primary-plain">
            {{ detailVal.customerTypeName }}
          </view>
        </view>
      </view>
      <view class="px-2">
        <view v-if="detailVal.registerAddress" class="color-gray-4 pb-2">
          {{ detailVal.registerAddress }}
        </view>
        <view v-if="detailVal.contactName" class="color-gray-4 pb-2">
          {{ detailVal.contactName }}
        </view>
      </view>
    </view>

    <!-- 打卡信息 -->
    <view class="bg-white mx-10 mt-10 rounded-10rpx p-10">
      <view class="flex justify-between items-center mb-2">
        <text class="text-14 color-gray-4">打卡签到</text>
        <up-button
          v-if="!userId"
          @click="editClockClick"
          size="mini"
          type="primary"
          plain
          class="align-right-btn"
        >
          编辑打卡信息
        </up-button>
      </view>
      <view v-if="detailVal.signinCciTime" class="pb-1 text-14 color-gray-4">{{
        detailVal.signinCciTime
      }}</view>
      <view v-if="detailVal.signinCciId" class="pb-1">
        {{ detailVal.signinCciId }}/{{ detailVal.signinCciAddress }}
      </view>
      <view v-if="!detailVal.signinCciId" class="color-gray-7 py-1">暂无打卡签到信息</view>

      <view class="mt-3">
        <text class="text-14 color-second pb-1">打卡签退</text>
        <view v-if="detailVal.signoutCciTime" class="text-14 color-gray-4 pb-1 mt-1">{{
          detailVal.signoutCciTime
        }}</view>
        <view v-if="detailVal.signoutCciId" class="pb-1">
          {{ detailVal.signoutCciId }}/{{ detailVal.signoutCciAddress }}
        </view>
        <view v-if="!detailVal.signoutCciId" class="color-gray-7 py-1">暂无打卡签退信息</view>
      </view>
    </view>

    <!-- 客情事件 -->
    <view class="bg-white mx-10 mt-10 rounded-10rpx p-10">
      <view class="flex justify-between items-center mb-2">
        <text class="text-14 color-gray-4">客情事件</text>
        <up-button
          v-if="!userId"
          @click="editLabelClick"
          size="mini"
          type="primary"
          plain
          class="align-right-btn"
        >
          编辑客情事件
        </up-button>
      </view>

      <view class="pb-2 text-14">{{ detailVal.visitUserName }}</view>
      <view v-if="detailVal.positionName" class="pb-2">
        <text class="text-14 color-gray-5 pr-6">人员职务</text>
        <text class="text-14">{{ detailVal.positionName }}</text>
      </view>

      <view
        v-for="(item, index) in detailVal.szymLabelRemarkDOResList || []"
        :key="index"
        class="mb-2"
      >
        <view class="pb-2">
          <text class="text-14 color-gray-5 pr-6">客情事件{{ index + 1 }}</text>
          <text class="text-14 color-main">{{ item.labelName }}</text>
        </view>
        <view class="pb-2">
          <text class="text-14 color-gray-5 pr-6">关联项目</text>
          <text>
            <text
              v-for="(project, pIndex) in item.szymProjectResList || []"
              :key="pIndex"
              class="text-14 pr-2"
            >
              {{ project.projectName }}
            </text>
          </text>
        </view>

        <view class="text-14 color-second pb-2">附件</view>
        <view v-if="!item.fileVOList || !item.fileVOList.length" class="text-14 color-second">
          暂无附件信息
        </view>
        <view v-else>
          <view
            v-for="(file, fIndex) in item.fileVOList"
            :key="fIndex"
            class="flex items-center py-2 border-b"
            @click="downloadFile(file)"
          >
            <app-icon name="file" class="pr-2" />
            <text>{{ file.fileName }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 医院合影 -->
    <view class="bg-white mx-10 mt-10 mb-10 rounded-10rpx p-10">
      <view class="flex justify-between items-center mb-3">
        <text class="color-gray-4">医院合影</text>
      </view>

      <view v-if="!imageList.length && userId" class="color-second">暂无照片</view>
      <view class="flex flex-wrap">
        <view
          v-for="(item, index) in imageList"
          :key="index"
          class="relative mr-2 mb-2"
          style="width: 200rpx; height: 200rpx"
        >
          <image
            :src="item.url || item.fileUrl"
            mode="aspectFill"
            style="width: 100%; height: 100%; border-radius: 8rpx"
            @click="previewImage(index)"
          />
          <view
            v-if="!userId"
            class="absolute top-0 right-0 bg-red color-white rounded-circle"
            style="width: 40rpx; height: 40rpx; line-height: 40rpx; text-align: center"
            @click.stop="deleteImage(index)"
          >
            ×
          </view>
        </view>
        <!-- 添加上传按钮 -->
        <view
          v-if="!userId && imageList.length < 9"
          class="relative mr-2 mb-2 flex items-center justify-center"
          style="width: 200rpx; height: 200rpx; border: 2rpx dashed #ccc; border-radius: 8rpx"
          @click="uploadImageClick"
        >
          <text style="font-size: 60rpx; color: #ccc">+</text>
        </view>
      </view>
    </view>

    <!-- 编辑打卡信息弹窗 -->
    <edit-clock
      v-if="clockShow"
      :visitDate="detailVal.visitTime"
      :clockObj="clockObj"
      :clockShow="clockShow"
      @clockCancel="clockShow = false"
      @clockSure="clockSure"
    />

    <!-- 编辑客情事件弹窗 -->
    <custom-label
      v-if="customerLabelShow"
      :suvId="detailVal.suvId"
      :staffMemberCheckDetail="staffMemberCheckDetail"
      :labelTreeList="labelTreeList"
      :customerLabelShow="customerLabelShow"
      :customerId="detailVal.szymCustomerId"
      @closeClick="customerLabelShow = false"
      @addCustomSure="addCustomSure"
    />
  </view>
</template>

<style lang="scss" scoped>
.tag-primary-plain {
  padding: 4rpx 12rpx;
  border: 1px solid $u-primary;
  color: $u-primary;
  border-radius: 8rpx;
  font-size: 24rpx;
}
.align-right-btn {
  width: 100px;
  margin: 0 !important; /* 清除可能存在的默认间距 */
  margin-left: auto !important;
  display: flex;
}
</style>
