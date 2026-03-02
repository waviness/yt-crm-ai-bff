<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { SzymProjectService } from '@/api/medical-trade';
import { uploadSingleFile } from '@/utils/upload';

interface IProps {
  activeName?: number;
  customerLabelShow: boolean;
  customerId: string;
  suvId?: string;
  staffMemberCheckDetail: any[];
  labelTreeList: any[];
}

const props = withDefaults(defineProps<IProps>(), {
  activeName: 0,
  suvId: '',
});

const emit = defineEmits(['closeClick', 'addCustomSure']);

// 状态
const innerCustomerLabelShow = ref(false);
const labelShow = ref(false);
const changeLabelIndex = ref(0);
const innerNeedLabelValueList = ref<any[]>([]);

// 项目选择相关
const keyShow = ref(false);
const changekeyIndex = ref(0);
const keyListOptions = ref<any[]>([]);
const keyCheckValue = ref('');
const keyCheckList = ref<string[]>([]);
const keyCheckDetail = ref<any[]>([]);

// 分页相关
const page = ref(1);
const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);

// 表单引用
const formRef = ref();

/**
 * 获取项目列表
 */
const fetchProjectList = async () => {
  if (loading.value) return;
  loading.value = true;

  try {
    const params = {
      dataBelongEntry: 41,
      projectType: '',
      keyword: keyCheckValue.value,
      pageNum: page.value,
      pageSize: 10,
    };

    console.log('fetchProjectList - params:', params);
    const res = await SzymProjectService.getSzymProjectMng(params);
    console.log('fetchProjectList - res:', res);

    if (res.success || res.code === '200') {
      const newList = res.data?.list || res.list || [];
      if (page.value === 1) {
        keyListOptions.value = newList;
      } else {
        keyListOptions.value = [...keyListOptions.value, ...newList];
      }
      const hasNextPage = res.data?.hasNextPage ?? res.hasNextPage ?? false;
      finished.value = !hasNextPage;
    }
  } catch (error) {
    console.error('获取项目列表失败', error);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

/**
 * 下拉刷新
 */
const onRefresh = () => {
  page.value = 1;
  keyListOptions.value = [];
  finished.value = false;
  refreshing.value = true;
  fetchProjectList();
};

/**
 * 上拉加载更多
 */
const onLoadMore = () => {
  if (finished.value || loading.value) return;
  page.value++;
  fetchProjectList();
};

/**
 * 打开项目选择
 */
const keyChooseClick = (item: any, index: number) => {
  console.log('keyChooseClick - item:', item, 'index:', index);
  keyShow.value = true;
  changekeyIndex.value = index;
  keyCheckList.value = [...(item.keyList || [])];
  keyCheckDetail.value = [...(item.keyCheckDetail || [])];

  // 如果列表为空，则加载数据
  if (keyListOptions.value.length === 0) {
    onRefresh();
  }
};

/**
 * 项目复选框切换
 */
const changekeyClick = (item: any) => {
  const idx = keyCheckList.value.indexOf(item.projectId);
  if (idx > -1) {
    keyCheckList.value.splice(idx, 1);
  } else {
    keyCheckList.value.push(item.projectId);
  }
};

/**
 * 项目选择确认
 */
const keySure = () => {
  const selectedProjects = keyListOptions.value.filter((ele: any) =>
    keyCheckList.value.includes(ele.projectId)
  );

  keyCheckDetail.value = selectedProjects;
  keyShow.value = false;
  innerNeedLabelValueList.value[changekeyIndex.value].keyList = [...keyCheckList.value];
  innerNeedLabelValueList.value[changekeyIndex.value].keyCheckDetail = selectedProjects;
};

/**
 * 选择事件分类
 */
const onSelectLabel = (val: any) => {
  console.log('onSelectLabel - val:', val);
  console.log('onSelectLabel - changeLabelIndex:', changeLabelIndex.value);
  console.log('onSelectLabel - innerNeedLabelValueList:', innerNeedLabelValueList.value);

  labelShow.value = false;
  if (innerNeedLabelValueList.value[changeLabelIndex.value].remarkChangeIdValue === val.value) {
    return;
  }
  innerNeedLabelValueList.value[changeLabelIndex.value].remarkChangeIdValue = val.value;
  innerNeedLabelValueList.value[changeLabelIndex.value].remarkChangeNameValue = val.name;
};

/**
 * 删除客情事件
 */
const deleteItemClick = (index: number) => {
  showModal({
    title: '确认',
    content: '确定删除该客情事件?',
  }).then(res => {
    if (res.confirm) {
      innerNeedLabelValueList.value.splice(index, 1);
    }
  });
};

/**
 * 新增客情事件
 */
const addCustomList = () => {
  innerNeedLabelValueList.value.push({
    suvId: props.suvId || '',
    keyList: [],
    keyCheckDetail: [],
    remarkChangeIdValue: '',
    remarkChangeNameValue: '',
    fileList: [],
  });
};

/**
 * 上传文件
 */
const uploadFiles = async () => {
  for (let i = 0; i < innerNeedLabelValueList.value.length; i++) {
    const element = innerNeedLabelValueList.value[i];
    const fileList = element.fileList || [];

    // 过滤出需要上传的文件（新添加的文件）
    const filesToUpload = fileList.filter((file: any) => file.url && !file.fileName);

    if (filesToUpload.length) {
      showLoading('上传中...');
      const promises = filesToUpload.map(async (file: any) => {
        const fileUrl = await uploadSingleFile({ url: file.url });
        const fileName = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
        const fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
        return {
          fileName,
          fileType,
          fileUrl,
        };
      });

      const uploadedFiles = await Promise.all(promises);

      // 合并已有文件和新上传的文件
      const existingFiles = fileList.filter((file: any) => file.fileName);
      innerNeedLabelValueList.value[i].fileUpList = [...existingFiles, ...uploadedFiles];
      hideLoading();
    } else {
      // 如果没有需要上传的文件，直接使用已有文件
      innerNeedLabelValueList.value[i].fileUpList = fileList.filter((file: any) => file.fileName);
    }
  }
};

/**
 * 确认保存
 */
const addCustomSure = async () => {
  try {
    // 验证必填项
    const hasEmpty = innerNeedLabelValueList.value.some(
      (val: any) => !val.remarkChangeIdValue || !val.keyList.length
    );

    if (hasEmpty) {
      showToast('关联项目/事件分类必填!');
      return;
    }

    // 上传文件
    await uploadFiles();

    // 构建数据
    const labelValueList = innerNeedLabelValueList.value.map((element: any) => ({
      slrId: element.slrId,
      suvId: element.suvId,
      labelId: element.remarkChangeIdValue,
      projectIdList: element.keyList,
      remark: '',
      fileVOList: element.fileUpList || [],
      keyList: element.keyList,
      keyCheckDetail: element.keyCheckDetail,
      remarkChangeIdValue: element.remarkChangeIdValue,
      remarkChangeNameValue: element.remarkChangeNameValue,
      fileList: element.fileList,
    }));

    emit('addCustomSure', labelValueList);
  } catch (error) {
    console.error('保存失败', error);
    showToast('保存失败');
  }
};

/**
 * 关闭
 */
const closeClick = () => {
  emit('closeClick');
};

// 监听显示状态
watch(
  () => props.customerLabelShow,
  val => {
    innerCustomerLabelShow.value = val;
  },
  { immediate: true }
);

// 初始化
onMounted(() => {
  console.log('customLabel onMounted');
  console.log('staffMemberCheckDetail:', props.staffMemberCheckDetail);
  console.log('labelTreeList:', props.labelTreeList);

  const remarkValueList = props.staffMemberCheckDetail[props.activeName]?.remarkValueList || [];

  if (remarkValueList.length) {
    innerNeedLabelValueList.value = remarkValueList;
  } else {
    innerNeedLabelValueList.value = [
      {
        suvId: props.suvId || '',
        keyList: [],
        keyCheckDetail: [],
        remarkChangeIdValue: '',
        remarkChangeNameValue: '',
        fileList: [],
      },
    ];
  }
});
</script>

<template>
  <up-popup
    :show="innerCustomerLabelShow"
    mode="bottom"
    round="16"
    closeable
    :customStyle="{ height: '95%' }"
    @close="closeClick"
  >
    <view class="h-full flex flex-col">
      <view class="text-16 font-bold text-center py-4">客情事件新增</view>

      <scroll-view scroll-y class="flex-1 px-2">
        <view
          v-for="(item, index) in innerNeedLabelValueList"
          :key="index"
          class="bg-light-gray-2 rounded-10rpx p-10 mb-3"
        >
          <u-form :model="item" ref="formRef">
            <app-form-item label="关联项目" required>
              <view class="w-full text-right" @click="keyChooseClick(item, index)">
                <text v-if="item.keyCheckDetail && item.keyCheckDetail.length" class="color-main">
                  已选择{{ item.keyCheckDetail.length }}个关联项目
                </text>
                <text v-else class="color-gray-6">点击维护关联项目</text>
              </view>
            </app-form-item>

            <app-form-item label="事件分类" required>
              <view
                :class="`w-full text-right ${item.remarkChangeNameValue ? '' : 'color-gray-6'}`"
                @click="
                  labelShow = true;
                  changeLabelIndex = index;
                "
              >
                {{ item.remarkChangeNameValue || '点击维护事件分类' }}
              </view>
            </app-form-item>

            <app-form-item label="附件上传" :borderBottom="false">
              <up-upload v-model="item.fileList" :maxCount="9" :previewFullImage="true" />
            </app-form-item>
          </u-form>

          <view v-if="!item.slrId" class="text-center mt-2">
            <up-button type="error" size="small" plain @click="deleteItemClick(index)">
              删除
            </up-button>
          </view>
        </view>
      </scroll-view>

      <view class="p-10 flex items-center justify-center">
        <up-button size="large" shape="circle" plain class="flex-1 mr-3" @click="addCustomList">
          新增客情事件
        </up-button>
        <up-button size="large" shape="circle" type="primary" class="flex-1" @click="addCustomSure">
          确定
        </up-button>
      </view>
    </view>
  </up-popup>

  <!-- 项目选择 -->
  <up-popup
    :show="keyShow"
    mode="bottom"
    round="16"
    closeable
    :customStyle="{ height: '90%' }"
    @close="
      keyShow = false;
      keyCheckList = [];
      keyCheckDetail = [];
    "
  >
    <view class="h-full flex flex-col p-10">
      <view class="text-16 font-bold text-center py-4">关联项目选择</view>

      <up-search
        v-model="keyCheckValue"
        placeholder="搜索"
        @search="onRefresh"
        @clear="onRefresh"
      />

      <scroll-view
        scroll-y
        class="flex-1"
        @scrolltolower="onLoadMore"
        refresher-enabled
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <app-empty
          v-if="!loading && !keyListOptions.length"
          description="暂未关联项目，请联系本单位'数据专员'处理!"
        />

        <!-- 使用 up-checkbox-group 包裹 -->
        <up-checkbox-group v-model="keyCheckList">
          <view
            v-for="(item, index) in keyListOptions"
            :key="index"
            class="border-b p-10 flex items-center justify-between"
            @click="changekeyClick(item)"
          >
            <text>{{ item.projectId }}/{{ item.projectName }}</text>
            <up-checkbox :name="item.projectId" />
          </view>
        </up-checkbox-group>

        <up-loadmore
          v-if="loading || keyListOptions.length"
          :status="loading ? 'loading' : finished ? 'nomore' : 'loadmore'"
        />
      </scroll-view>

      <view class="flex items-center justify-center pt-10">
        <up-button
          size="large"
          shape="circle"
          plain
          class="flex-1 mr-3"
          @click="
            keyShow = false;
            keyCheckList = [];
            keyCheckDetail = [];
          "
        >
          取消
        </up-button>
        <up-button size="large" shape="circle" type="primary" class="flex-1" @click="keySure">
          确定
        </up-button>
      </view>
    </view>
  </up-popup>

  <!-- 事件分类选择 -->
  <app-action-sheet
    v-if="labelTreeList.length > 0"
    :show="labelShow"
    :actions="labelTreeList"
    cancel-text="取消"
    close-on-click-action
    @select="onSelectLabel"
    @update:show="labelShow = $event"
  />
</template>

<style lang="scss" scoped></style>
