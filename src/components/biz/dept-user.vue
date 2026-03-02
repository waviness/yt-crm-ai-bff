<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

// 权限检查配置接口
interface PermissionCheck {
  /** 菜单名称 */
  menuValue: string;
  /** 权限名称 */
  authorityName: string;
  /** 权限类型 */
  type?: number;
}

interface IProps {
  /** 是否支持多选 */
  isSelect?: boolean;
  /** 是否需要返回名称 */
  needName?: boolean;
  /** 是否显示弹窗 */
  show?: boolean;
  /** 权限检查配置（可选） */
  permissionCheck?: PermissionCheck;
  /** 是否需要自行处理加载 */
  needLoading?: boolean;
  /** 已选用户列表（v-model） */
  checkedUsers?: any[];
  /** 是否有部门权限（v-model） */
  hasDept?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  isSelect: true,
  needName: false,
  show: false,
  needLoading: true,
  checkedUsers: () => [],
  hasDept: false,
});

const emit = defineEmits<{
  confirm: [list: any[]] | [id: string, name: string] | [{ list: any[]; name: string }];
  cancel: [];
  'update:show': [show: boolean];
  'update:checkedUsers': [users: any[]];
  'update:hasDept': [hasDept: boolean];
}>();

const userStore = useUserStore();
const departmentStore = useDepartmentStore();

// 状态
const hasDeptInternal = ref(false); // 是否有查看部门权限
const authorizedFlag = ref(true); // 是否引入权限
const leaderFlag = ref(false); // 周报
const userDataList = ref<any[]>([]); // 人员信息（用于搜索时的结果）
const searchList = ref<any[]>([]); // 搜索关键词结果列表
const checkedUsersInternal = ref<any[]>([]);
const changeTypeShow = ref(false); // 本人本部门切换是否显示
const checkDetailList = ref<any[]>([]); // 获取人员详情
const getUserListLoading = ref(false);
const searchLoading = ref(false); // 搜索加载状态
const timeout = ref<any>(null);

// 使用 store 中的部门树数据
const depTreeList = computed(() => departmentStore.depTreeList);
const deptUserData = computed(() => departmentStore.deptUserData);

// 使用 store 中的方法
const {
  mapTreeList: storeMapTreeList,
  getDepTree: storeGetDepTree,
  getUserByParams: storeGetUserByParams,
} = departmentStore;

// 获取组织架构tree信息（使用 store）
const getDepTree = async (params: any = { treeType: 1, authorizedFlag: authorizedFlag.value }) => {
  const res = await storeGetDepTree(params);
  if (res.data.length === 0) {
    hasDeptInternal.value = false;
  } else {
    hasDeptInternal.value = true;
    // 如果弹窗打开，则获取用户列表
    if (props.show) {
      await getUserByParams({
        depIdList: storeMapTreeList(depTreeList.value, [], authorizedFlag.value),
        leaderFlag: leaderFlag.value,
        authorizedFlag: authorizedFlag.value,
      });
    }
  }
  return res;
};

// 根据部门id获取人员基本信息（使用 store）
// 注意：这个方法用于获取部门用户列表，不用于搜索
const getUserByParams = async (params: any, id?: any) => {
  getUserListLoading.value = true;
  const { userList } = await storeGetUserByParams(params, id);
  // userDataList 保留用于其他用途，部门用户数据存储在 store 的 deptUserData 中
  userDataList.value = userList;
  getUserListLoading.value = false;
};

// 根据关键词刷新用户
const refreshUserByKeywords = (keyword: string) => {
  if (timeout.value) {
    clearTimeout(timeout.value);
  }
  timeout.value = setTimeout(async () => {
    if (keyword) {
      // 搜索时，更新搜索列表
      searchLoading.value = true;
      try {
        const { userList } = await storeGetUserByParams({
          keyword,
          leaderFlag: leaderFlag.value,
          authorizedFlag: authorizedFlag.value,
        });
        searchList.value = userList;
      } finally {
        searchLoading.value = false;
      }
    } else {
      // 清空搜索时，清空搜索列表
      searchList.value = [];
      searchLoading.value = false;
    }
  }, 800);
};

// 根据部门刷新用户
const refreshUserByDepts = async (item: any) => {
  await getUserByParams(
    {
      depIdList: storeMapTreeList([item], [], authorizedFlag.value),
      leaderFlag: leaderFlag.value,
      authorizedFlag: authorizedFlag.value,
    },
    item.depId
  );
};

// 初始化部门树和用户
const initDepTreeAndUser = async (userInfor: any, forceLoadUsers = false) => {
  if (props.needLoading) {
    // 使用 store 初始化部门树（如果不存在或为空则获取）
    await departmentStore.initDepTree({ treeType: 1, authorizedFlag: authorizedFlag.value });
    // 确保hasDept在初始化完成后立即更新
    if (depTreeList.value && depTreeList.value.length > 0) {
      hasDeptInternal.value = true;
    } else {
      hasDeptInternal.value = false;
    }
  } else {
    // 即使不需要加载，也要检查store中是否已有部门树数据
    if (depTreeList.value && depTreeList.value.length > 0) {
      hasDeptInternal.value = true;
    } else {
      hasDeptInternal.value = false;
    }
  }

  // 权限检查（如果配置了权限检查）
  if (props.permissionCheck) {
    leaderFlag.value = !hasAuthority(
      userInfor?.resListTree || [],
      props.permissionCheck.menuValue,
      props.permissionCheck.authorityName,
      props.permissionCheck.type || 1
    );
  }
  authorizedFlag.value = true;

  // 如果弹窗打开或强制加载用户，获取根部门的用户列表
  if ((props.show || forceLoadUsers) && depTreeList.value && depTreeList.value.length > 0) {
    const rootDept = depTreeList.value[0];
    // 先设置当前部门对象
    curDeptObj.value = rootDept;
    breadList.value = [
      { depId: rootDept.depId, depName: rootDept.depName, childList: rootDept.childList },
    ];
    // 获取根部门的用户列表，传入部门ID以便正确存储
    await getUserByParams(
      {
        depIdList: storeMapTreeList([rootDept], [], authorizedFlag.value),
        leaderFlag: leaderFlag.value,
        authorizedFlag: authorizedFlag.value,
      },
      rootDept.depId
    );
  }
};

// 清理
const cleanup = () => {
  if (!authorizedFlag.value) {
    checkDetailList.value = [];
    // 不清理 store 中的数据，因为可能被其他页面使用
  }
  if (timeout.value) {
    clearTimeout(timeout.value);
    timeout.value = null;
  }
};

// 同步内部 hasDept 到外部
watch(
  hasDeptInternal,
  val => {
    emit('update:hasDept', val);
  },
  { immediate: true }
);

// 同步内部 checkedUsers 到外部
watch(
  checkedUsersInternal,
  val => {
    emit('update:checkedUsers', val);
  },
  { deep: true, immediate: true }
);

// 同步外部 checkedUsers 到内部（如果外部传入）
watch(
  () => props.checkedUsers,
  val => {
    if (val && val.length > 0) {
      const currentStr = JSON.stringify(checkedUsersInternal.value);
      const newStr = JSON.stringify(val);
      if (currentStr !== newStr) {
        checkedUsersInternal.value = [...val];
      }
    } else if (val && val.length === 0 && checkedUsersInternal.value.length > 0) {
      checkedUsersInternal.value = [];
    }
  },
  { deep: true, immediate: true }
);

// 内部状态
const keywords = ref('');
const checkedShow = ref(false);
const checkedIdList = computed({
  get: () => checkedUsersInternal.value,
  set: val => {
    checkedUsersInternal.value = val;
  },
});
const checkedId = ref<string>('');
const checkedName = ref<string>('');
const breadList = ref<any[]>([]);
const curDeptObj = ref<any>({});
const activeNames = ref<any[]>(['1']);

// 当前部门的用户列表
const currentUserDataList = computed(() => {
  const current: any = curDeptObj.value.depId || '';
  return deptUserData.value[current]?.userList || [];
});

// 是否全选
const selectAll = computed(() => {
  const ids = currentUserDataList.value.map((user: any) => user.userId);
  return ids.length ? ids.every((id: any) => checkedIdList.value.includes(id)) : false;
});

// 已选人员列表（从根部门获取，并包含搜索列表中选择的用户）
const allCheckedList = computed(() => {
  const depId = depTreeList.value[0]?.depId;
  const userList = deptUserData.value[depId]?.userList || [];
  const deptUsers = userList.filter((user: any) => checkedIdList.value.includes(user.userId));

  // 从搜索列表中选择的用户（不在根部门用户列表中的）
  const searchUsers = searchList.value.filter(
    (user: any) =>
      checkedIdList.value.includes(user.userId) &&
      !userList.some((deptUser: any) => deptUser.userId === user.userId)
  );

  return [...deptUsers, ...searchUsers];
});

// 搜索输入
const onInput = () => {
  refreshUserByKeywords(keywords.value);
};

// 切换面包屑
const changeBread = async (item: any, index: number) => {
  breadList.value.splice(index + 1);
  curDeptObj.value = item;
  // 如果该部门的用户数据还没有加载，则加载
  if (!Object.keys(deptUserData.value).includes(String(item.depId))) {
    await refreshUserByDepts(item);
  }
};

// 切换部门
const changeDept = async (item: any) => {
  const { depId, depName, childList } = item;
  breadList.value.push({
    depId,
    depName,
    childList,
  });
  curDeptObj.value = item;
  if (!Object.keys(deptUserData.value).includes(String(item.depId))) {
    await refreshUserByDepts(item);
  }
};

// 全选/取消全选
const onAllCheckClick = () => {
  const ids = currentUserDataList.value.map((item: any) => item.userId);
  checkedIdList.value = selectAll.value
    ? checkedIdList.value.filter((id: any) => !ids.includes(id))
    : [...new Set([...checkedIdList.value, ...ids])];
};

// 删除已选人员
const deletePerson = (target: any) => {
  checkedIdList.value = checkedIdList.value.filter((id: any) => id !== target.userId);
};

// 确认选择
const onTreeConfirm = () => {
  if (props.isSelect) {
    if (props.needName) {
      const name =
        (allCheckedList.value.length > 0 ? allCheckedList.value[0].userName : '') +
        (allCheckedList.value.length > 1 ? ',' + allCheckedList.value[1].userName : '') +
        (allCheckedList.value.length > 2 ? '等' : '');
      emit('confirm', { list: checkedIdList.value, name });
    } else {
      emit('confirm', checkedIdList.value);
    }
  } else {
    // 单选模式：如果有关键词，从搜索列表查找；否则从当前部门用户列表查找
    if (keywords.value) {
      const user = searchList.value.find((item: any) => item.userId === checkedId.value);
      checkedName.value = user?.userName || '';
    } else {
      const user = currentUserDataList.value.find((item: any) => item.userId === checkedId.value);
      checkedName.value = user?.userName || '';
    }
    emit('confirm', checkedId.value, checkedName.value);
  }
  emit('update:show', false);
};

// 取消
const cancel = () => {
  emit('cancel');
  emit('update:show', false);
};

// 监听 show 变化，初始化数据
watch(
  () => props.show,
  async newVal => {
    if (newVal) {
      // 清空搜索关键词和搜索列表
      keywords.value = '';
      searchList.value = [];
      await initDepTreeAndUser(userStore.userInfor);
      await nextTick();
      // initDepTreeAndUser 中已经设置了 breadList 和 curDeptObj，这里不需要重复设置
    }
  },
  { immediate: true }
);

// 初始化：在组件挂载时就初始化并请求用户数据（用于初始化hasDept）
onMounted(async () => {
  // 初始化部门树和用户（即使弹窗没有打开）
  await initDepTreeAndUser(userStore.userInfor, true);

  if (depTreeList.value && depTreeList.value.length > 0) {
    const { depId, depName, childList } = depTreeList.value[0];
    breadList.value = [{ depId, depName, childList }];
    curDeptObj.value = depTreeList.value[0];
  }
});

// 清理
onUnmounted(() => {
  cleanup();
});
</script>

<template>
  <up-popup :show="show" mode="top" @close="emit('update:show', false)">
    <view class="h-100vh flex flex-col">
      <app-search v-model="keywords" placeholder="搜索" input-align="center" @input="onInput" />
      <view v-if="!keywords" class="flex-1 flex flex-col overflow-hidden">
        <view class="text-14px color-main px-4 py-1 flex-shrink-0 tree-shadow flex flex-wrap">
          <view
            v-for="(item, index) in breadList"
            :key="item.depId"
            class="flex items-baseline"
            @click="changeBread(item, index)"
          >
            {{ item.depName }}
            <up-icon
              v-if="index < breadList.length - 1"
              name="arrow-right"
              color="main"
              size="14"
            />
          </view>
        </view>
        <view class="flex-1 flex flex-row px-4 py-3 overflow-hidden">
          <view class="flex-2 h-full">
            <up-collapse v-model="activeNames" :border="false" class="dep-collapse h-full">
              <up-collapse-item :title="curDeptObj.depName" name="1" :border="false">
                <view
                  v-for="item in curDeptObj.childList"
                  :key="item.depId"
                  class="flex items-center justify-between mt-3 mb-6"
                  @click="changeDept(item)"
                >
                  <text class="color-black-2">{{ item.depName }}</text>
                  <up-icon name="arrow-down" size="32rpx" />
                </view>
              </up-collapse-item>
            </up-collapse>
          </view>
          <view class="w-1px mb-35px bg-gray-12 transform scale-x-50"></view>
          <scroll-view class="flex-1 pl-4 h-full" scroll-y>
            <view class="py-2">
              <view v-if="isSelect" class="color-main text-14" @click="onAllCheckClick">
                {{ selectAll ? '取消全选' : '全选' }}
              </view>
              <up-checkbox-group
                v-if="isSelect && currentUserDataList.length"
                v-model="checkedIdList"
                shape="circle"
                placement="column"
                :iconSize="16"
                :size="16"
              >
                <up-checkbox
                  v-for="item in currentUserDataList"
                  :key="item.userId"
                  :name="item.userId"
                  :label="item.userName"
                  :labelSize="14"
                  labelColor="#333"
                  class="font-bold mt-6! mb-0"
                />
              </up-checkbox-group>
              <up-radio-group
                v-if="!isSelect && currentUserDataList.length"
                v-model="checkedId"
                placement="column"
                :iconSize="16"
                :size="16"
              >
                <up-radio
                  v-for="item in currentUserDataList"
                  :key="item.userId"
                  :name="item.userId"
                  :label="item.userName"
                  shape="circle"
                  :labelSize="14"
                  labelColor="#333"
                  class="font-bold mt-6! mb-0"
                />
              </up-radio-group>
              <app-empty
                v-if="!currentUserDataList.length && !getUserListLoading"
                class="mt-7"
                description="暂无人员"
                size="200rpx"
              />
              <up-loading-icon v-if="getUserListLoading" mode="spinner" color="main" />
            </view>
          </scroll-view>
        </view>
      </view>
      <scroll-view v-else class="flex-1 overflow-hidden" scroll-y>
        <view class="px-4 pb-3">
          <up-checkbox-group
            v-if="isSelect && searchList.length"
            v-model="checkedIdList"
            shape="circle"
            placement="column"
            :iconSize="16"
            :size="16"
          >
            <up-checkbox
              v-for="(item, index) in searchList"
              :key="index"
              :name="item.userId"
              :label="item.userName"
              :labelSize="14"
              labelColor="#333"
              class="font-bold mt-6! mb-0"
            />
          </up-checkbox-group>
          <up-radio-group
            v-if="!isSelect && searchList.length"
            v-model="checkedId"
            placement="column"
            :iconSize="16"
            :size="16"
          >
            <up-radio
              v-for="item in searchList"
              :key="item.userId"
              :name="item.userId"
              :label="item.userName"
              shape="circle"
              :labelSize="14"
              labelColor="#333"
              class="font-bold mt-6! mb-0"
            />
          </up-radio-group>
          <app-empty
            v-if="!searchList.length && !searchLoading"
            class="mt-7"
            description="暂无人员"
          />
          <up-loading-icon v-if="searchLoading" mode="spinner" color="main" />
        </view>
      </scroll-view>
      <view class="flex items-center px-4 py-10 flex-shrink-0 bg-gray-12">
        <view
          v-if="isSelect"
          class="flex-1 color-main text-14px flex items-center"
          @click="checkedShow = true"
        >
          <text>已选{{ allCheckedList.length }}人</text>
          <up-icon
            :name="checkedShow ? 'arrow-up' : 'arrow-down'"
            color="main"
            size="32rpx"
            class="ml-3"
          />
        </view>
        <view v-else class="flex-1"></view>
        <up-button class="mx-0 px-10 w-auto! h-64!" shape="circle" @click="cancel">取消</up-button>
        <up-button
          class="mx-0 ml-4 px-10 w-auto! h-64!"
          shape="circle"
          type="primary"
          @click="onTreeConfirm"
        >
          确认
        </up-button>
      </view>
    </view>
    <up-popup :show="checkedShow" mode="bottom" round="16" closeable @close="checkedShow = false">
      <view class="text-16px font-bold text-center my-3">已选{{ allCheckedList.length }}人</view>
      <scroll-view :style="{ height: '50vh' }" scroll-y>
        <app-cell
          v-for="item in allCheckedList"
          :key="item.userId"
          :title="`${item.userId}/${item.userName}`"
          titleClass="color-black-2"
          clickable
        >
          <template #right-icon>
            <view @click.stop="deletePerson(item)">
              <up-icon name="close" size="40rpx" />
            </view>
          </template>
        </app-cell>
      </scroll-view>
      <app-bottom-actions :fixed="false" class="block p-4">
        <up-button shape="circle" @click="checkedShow = false"> 取消 </up-button>
        <up-button shape="circle" type="primary" @click="checkedShow = false"> 确认 </up-button>
      </app-bottom-actions>
    </up-popup>
  </up-popup>
</template>

<style lang="scss" scoped>
.tree-shadow {
  box-shadow: 0 2px 12px 0 rgb(125 126 128 / 12%);
}

// 优化：使用更具体的选择器，避免影响其他 collapse 组件
:deep(.dep-collapse .u-cell__body) {
  font-size: 28rpx;
  padding: 0 28rpx 0 0;
}
</style>
