<!-- 项目管理 - 中心部门人员选择 -->
<script setup lang="ts">
import type { OrgInfo, DeptInfo, UserInfo } from '../types';

interface IProps {
  show?: boolean;
  orgList?: OrgInfo[];
  resList?: [OrgInfo, DeptInfo, UserInfo[]];
  noUser?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  show: false,
  orgList: () => [],
  resList: undefined,
  noUser: false,
});

const emit = defineEmits<{
  search: [keywords: string];
  cancel: [];
  confirm: [res: [OrgInfo, DeptInfo, UserInfo[]]];
}>();

const appStore = useAppStore();

// 常量定义
const DEFAULT_USER: UserInfo = { userId: -1, userName: '不限' };
const DEFAULT_DEPT: DeptInfo = { id: -1, name: '不限', crmUserDtoList: [DEFAULT_USER] };
const DEFAULT_ORG: OrgInfo = { id: -1, name: '不限', children: [] };

// 组件通用属性
const RADIO_CHECKBOX_PROPS = {
  size: '28rpx',
  checkedColor: appStore.theme.color.primary,
  labelSize: '28rpx',
  labelColor: appStore.theme.color.black,
};

// 响应式数据
const breadList = ref<[OrgInfo, DeptInfo, UserInfo[]]>([DEFAULT_ORG, DEFAULT_DEPT, [DEFAULT_USER]]);
const activeNames = ref<number | string>(-1);
const keywords = ref('');
const checkedDeptId = ref<number | string>(-1);
const checkedId = ref([-1]);
const isContentReady = ref(false); // 控制内容延迟渲染

// 计算属性
const selectedUserNames = computed(() => {
  return breadList.value[2]?.length
    ? breadList.value[2].map((item: any) => item.userName).join('、')
    : '';
});

// 搜索防抖定时器
let searchTimer: any = null;

// 事件处理
const handleInputChange = () => {
  // 添加防抖，避免频繁触发搜索
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    emit('search', keywords.value);
  }, 300);
};

const cancel = () => {
  // 清理防抖定时器
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
  emit('cancel');
};

const onDeptClick = async (item: any) => {
  // 选择部门
  checkedDeptId.value = item.id;

  // 深分进度模式下，部门可能没有 crmUserDtoList
  breadList.value[1] = props.noUser ? { id: item.id, name: item.name } : { ...item };

  // 只在准入管理模式下设置用户
  if (!props.noUser) {
    checkedId.value = [-1];
    breadList.value[2] = [DEFAULT_USER];
  }

  breadList.value[0] = props.orgList.find(({ id }) => id === item.parentId) || DEFAULT_ORG;
};

const onUserChange = async (newArray: any, type: number) => {
  await nextTick();
  if (type === 1) {
    // 点击"不限"
    checkedId.value = [-1];
    breadList.value[2] = [DEFAULT_USER];
  } else {
    // 移除"不限"
    const unlimitedIndex = checkedId.value.indexOf(-1);
    if (unlimitedIndex > -1) {
      checkedId.value.splice(unlimitedIndex, 1);
    }
    if (checkedId.value.length === 0) {
      checkedId.value = [-1];
      breadList.value[2] = [DEFAULT_USER];
    } else {
      breadList.value[2] = (breadList.value[1]?.crmUserDtoList || []).filter((user: UserInfo) =>
        checkedId.value.includes(user.userId)
      );
    }
  }
};

const onConfirm = () => {
  emit('confirm', breadList.value);
};

// 初始化数据
const initData = () => {
  // 深分进度模式(noUser=true)时，resList只有2个元素[组织, 部门]
  // 准入管理模式(noUser=false)时，resList有3个元素[组织, 部门, 用户列表]
  const minLength = props.noUser ? 2 : 3;
  if (!props.resList || props.resList.length < minLength) return;

  // 直接使用传入的 resList
  breadList.value = [...props.resList];

  activeNames.value = props.resList[0]?.id ?? -1;
  checkedDeptId.value = props.resList[1]?.id ?? -1;

  if (!props.noUser && props.resList[2]) {
    checkedId.value = props.resList[2].map(({ userId }) => userId);
  }

  // 更新激活菜单
  if (props.orgList?.length) {
    const targetOrg = props.orgList.find(item => item.id === props.resList?.[0]?.id);
    activeNames.value = targetOrg?.id ?? props.orgList[0]?.id ?? -1;
  }
};

// 只在弹窗显示时初始化，提升性能
watch(
  () => props.show,
  newVal => {
    if (newVal) {
      // 先标记内容未准备好，显示空白弹窗
      isContentReady.value = false;
      // 使用 nextTick 确保弹窗动画先执行
      nextTick(() => {
        // 延迟一小段时间再渲染内容，提升打开速度
        setTimeout(() => {
          initData();
          isContentReady.value = true;
        }, 50);
      });
    } else {
      // 关闭时重置状态
      isContentReady.value = false;
      keywords.value = '';
      // 清理防抖定时器
      if (searchTimer) {
        clearTimeout(searchTimer);
        searchTimer = null;
      }
    }
  },
  { immediate: true }
);

// 组件卸载时清理定时器
onUnmounted(() => {
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
});
</script>

<template>
  <up-popup
    :show="show"
    :round="0"
    :duration="150"
    :safeAreaInsetBottom="true"
    customStyle="height: 100vh"
  >
    <view class="h-full w-screen flex flex-col text-14">
      <app-search v-model="keywords" placeholder="搜索" @input="handleInputChange" />
      <view class="flex-1 flex flex-col slh">
        <view v-if="isContentReady" class="color-main-3 px-4 py-1 shadow-sm slh flex">
          <view>
            {{ breadList[0]?.name || '不限' }}
          </view>
          <up-icon name="arrow-right" :color="appStore.theme.color.primary" />
          <view>
            {{ breadList[1]?.name || '不限' }}
          </view>
          <up-icon name="arrow-right" :color="appStore.theme.color.primary" />
          <view v-if="!noUser && breadList[2]" class="slh">
            {{ selectedUserNames }}
          </view>
          <up-icon
            v-if="!noUser && breadList[2]"
            name="arrow-right"
            :color="appStore.theme.color.primary"
          />
        </view>
        <view v-if="!isContentReady" class="flex-1 flex items-center justify-center">
          <up-loading-icon mode="circle" />
        </view>
        <view v-else-if="props.orgList.length" class="flex-1 flex py-3 overflow-hidden">
          <scroll-view class="flex-2 h-full" scroll-y>
            <up-collapse :value="activeNames" :border="false" accordion>
              <up-collapse-item
                v-for="item in props.orgList"
                :key="item.id"
                :title="item.name"
                :name="item.id"
              >
                <up-radio-group
                  v-if="item.children?.length"
                  v-model="checkedDeptId"
                  placement="column"
                >
                  <up-radio
                    v-for="deptItem in item.children"
                    :key="deptItem.id"
                    :label="deptItem.name"
                    :name="deptItem.id"
                    v-bind="RADIO_CHECKBOX_PROPS"
                    class="py-2 font-bold"
                    @change="onDeptClick(deptItem)"
                  />
                </up-radio-group>
              </up-collapse-item>
            </up-collapse>
          </scroll-view>
          <view v-if="!noUser" class="w-px mb-8.75 bg-gray-200 scale-x-50"></view>
          <scroll-view v-if="!noUser" class="flex-1 h-full pl-4" scroll-y>
            <up-checkbox-group v-model="checkedId" placement="column" shape="circle">
              <up-checkbox
                label="不限"
                :name="-1"
                v-bind="RADIO_CHECKBOX_PROPS"
                class="py-2 font-bold"
                @change="() => onUserChange([], 1)"
              />
              <up-checkbox
                v-for="item in breadList[1]?.crmUserDtoList"
                :key="item.userId"
                :label="item.userName"
                :name="item.userId"
                v-bind="RADIO_CHECKBOX_PROPS"
                class="py-2 font-bold"
                @change="(newArray: any) => onUserChange(newArray, 2)"
              />
            </up-checkbox-group>
          </scroll-view>
        </view>
        <view
          v-else-if="!props.orgList.length"
          class="flex-1 flex py-3 overflow-hidden h-full justify-center"
        >
          <app-empty class="mt-7" description="暂无相关部门或人员" size="100px" />
        </view>
      </view>
      <view class="flex items-center justify-end px-4 py-10" style="background: #f7f8fa">
        <view class="flex-1"></view>
        <view class="flex-1"></view>
        <up-button size="small" shape="circle" style="width: 72px" @click="cancel">取消</up-button>
        <up-button
          type="info"
          size="small"
          shape="circle"
          class="ml-4"
          style="width: 72px"
          color="#3561F2"
          @click="onConfirm"
          >确认</up-button
        >
      </view>
    </view>
  </up-popup>
</template>

<style lang="scss" scoped>
/* stylelint-disable-next-line selector-class-pattern */
:deep(.u-collapse-item__content__text) {
  padding-top: 0;
  padding-bottom: 0;
}

:deep(.u-cell__body) {
  font-size: 28rpx;
}

/* stylelint-disable selector-type-no-unknown */
// 解决移动端滚动警告
scroll-view {
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}
</style>
