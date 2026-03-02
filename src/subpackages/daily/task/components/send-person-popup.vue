<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  show?: boolean;
  depTreeList?: any[];
  tagDataList?: any[];
  groupTreeList?: any[];
  sendPersons?: any[];
  checkedTree?: any;
}

const props = withDefaults(defineProps<IProps>(), {
  show: false,
  depTreeList: () => [],
  tagDataList: () => [],
  groupTreeList: () => [],
  sendPersons: () => [],
  checkedTree: () => ({
    checkedDep: [],
    checkedTag: [],
    checkedGroup: [],
  }),
});

const emit = defineEmits<{
  confirm: [checkedPersons: any[]];
  cancel: [];
  'update:show': [value: boolean];
}>();

const keywords = ref('');
const active = ref(0);
const checkedShow = ref(false);
const checkedPersons = ref<any[]>([]);
const isContentReady = ref(false); // 控制内容延迟渲染

const tabList = ref([
  { name: '部门/人员', value: 0 },
  { name: '标签', value: 1 },
  { name: '小组', value: 2 },
]);

/**
 * 过滤树形数据（部门树）
 */
const filterDepTree = (data: any[], keyword: string): any[] => {
  if (!keyword.trim()) {
    return data;
  }
  const filtered: any[] = [];
  data.forEach((item: any) => {
    const matchLabel = item.label?.includes(keyword);
    const matchName = item.name?.includes(keyword);
    const matchUserCode = item.userCode?.includes(keyword);

    // 如果当前节点匹配，或者子节点有匹配的
    if (matchLabel || matchName || matchUserCode) {
      filtered.push(item);
    } else if (item.children && item.children.length > 0) {
      const filteredChildren = filterDepTree(item.children, keyword);
      if (filteredChildren.length > 0) {
        filtered.push({
          ...item,
          children: filteredChildren,
        });
      }
    }
  });
  return filtered;
};

/**
 * 过滤树形数据（标签树）
 */
const filterTagTree = (data: any[], keyword: string): any[] => {
  if (!keyword.trim()) {
    return data;
  }
  return data.filter((item: any) => {
    const matchLabel = item.label?.includes(keyword);
    // 如果标签下的用户名称匹配，也显示该标签
    const matchUsers = item.targetUsers?.some(
      (user: any) =>
        user.sendUser?.includes(keyword) || user.sendUserId?.toString().includes(keyword)
    );
    return matchLabel || matchUsers;
  });
};

/**
 * 过滤树形数据（小组树）
 */
const filterGroupTree = (data: any[], keyword: string): any[] => {
  if (!keyword.trim()) {
    return data;
  }
  return data.filter((item: any) => {
    const matchLabel = item.label?.includes(keyword);
    // 如果小组下的用户名称匹配，也显示该小组
    const matchUsers = item.users?.some(
      (user: any) =>
        user.sendUser?.includes(keyword) || user.sendUserId?.toString().includes(keyword)
    );
    return matchLabel || matchUsers;
  });
};

// 计算过滤后的数据
const filteredDepTreeList = computed(() => {
  return filterDepTree(props.depTreeList, keywords.value);
});

const filteredTagDataList = computed(() => {
  return filterTagTree(props.tagDataList, keywords.value);
});

const filteredGroupTreeList = computed(() => {
  return filterGroupTree(props.groupTreeList, keywords.value);
});

const localShow = computed({
  get: () => props.show,
  set: value => emit('update:show', value),
});

const onCheckedChange = (data: any) => {
  // data 是当前点击的节点数据，包含 checked 状态
  const isChecked = data?.checked;

  // 处理部门树选中的节点
  if (active.value === 0) {
    if (data?.isUser) {
      // 用户节点
      const person = {
        distributeId: data.depId,
        distribute: data.depName,
        orderType: 1,
        sendUserId: data.userId,
        sendUser: data.userName,
      };
      console.log('person', person);
      if (isChecked) {
        // 添加用户
        const exists = checkedPersons.value.some(
          (p: any) => p.sendUserId === data.userId && p.orderType === 1
        );
        if (!exists) {
          checkedPersons.value.push(person);
        }
      } else {
        // 移除用户
        checkedPersons.value = checkedPersons.value.filter(
          (p: any) => !(p.sendUserId === data.userId && p.orderType === 1)
        );
      }
    }
  }

  // 处理标签树选中的节点
  if (active.value === 1) {
    if (data?.targetUsers && Array.isArray(data.targetUsers)) {
      if (isChecked) {
        // 添加标签下的所有用户
        data.targetUsers.forEach((user: any) => {
          const exists = checkedPersons.value.some(
            (p: any) => p.sendUserId === user.sendUserId && p.orderType === 2
          );
          if (!exists) {
            checkedPersons.value.push(user);
          }
        });
      } else {
        // 移除标签下的所有用户
        const userIds = data.targetUsers.map((user: any) => user.sendUserId);
        checkedPersons.value = checkedPersons.value.filter(
          (p: any) => !(p.orderType === 2 && userIds.includes(p.sendUserId))
        );
      }
    }
  }

  // 处理小组树选中的节点
  if (active.value === 2) {
    if (data?.users && Array.isArray(data.users)) {
      if (isChecked) {
        // 添加小组下的所有用户
        data.users.forEach((user: any) => {
          const exists = checkedPersons.value.some(
            (p: any) => p.sendUserId === user.sendUserId && p.orderType === 3
          );
          if (!exists) {
            checkedPersons.value.push(user);
          }
        });
      } else {
        // 移除小组下的所有用户
        const userIds = data.users.map((user: any) => user.sendUserId);
        checkedPersons.value = checkedPersons.value.filter(
          (p: any) => !(p.orderType === 3 && userIds.includes(p.sendUserId))
        );
      }
    }
  }
};

const onTreeConfirm = () => {
  emit('confirm', checkedPersons.value);
};

const cancel = () => {
  emit('cancel');
};

// 删除已选人员
const deletePerson = (item: any) => {
  const index = checkedPersons.value.findIndex(
    (p: any) => (p.userId || p.sendUserId) === (item.userId || item.sendUserId)
  );
  if (index > -1) {
    checkedPersons.value.splice(index, 1);
  }
};

watch(
  () => props.sendPersons,
  newVal => {
    if (newVal && newVal.length) {
      checkedPersons.value = [...newVal];
    }
  },
  { immediate: true }
);

// 监听弹窗显示状态，实现延迟渲染
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
          isContentReady.value = true;
        }, 50);
      });
    } else {
      // 关闭时重置状态
      isContentReady.value = false;
      keywords.value = '';
    }
  },
  { immediate: true }
);
</script>

<template>
  <up-popup :show="localShow" mode="top">
    <view class="flex flex-col h-100vh">
      <app-tabs
        :current="active"
        :list="tabList"
        @change="({ index }: { index: number }) => (active = index)"
      />
      <app-search v-model="keywords" placeholder="搜索" />
      <scroll-view
        v-if="isContentReady"
        class="flex-1 h-[calc(100%-304rpx)] overflow-x-auto"
        scroll-y
      >
        <view v-if="active === 0">
          <up-tree
            :data="filteredDepTreeList"
            :showCheckbox="true"
            :checkStrictly="false"
            :defaultExpandAll="true"
            :checkedKeys="checkedTree.checkedDep"
            @check-change="onCheckedChange"
          />
          <app-empty
            v-if="!filteredDepTreeList.length"
            class="mt-7"
            :description="keywords ? '未找到匹配的部门/人员' : '暂无部门/人员'"
          />
        </view>
        <view v-else-if="active === 1">
          <up-tree
            :data="filteredTagDataList"
            :showCheckbox="true"
            :checkStrictly="false"
            :defaultExpandAll="true"
            :checkedKeys="checkedTree.checkedTag"
            @check-change="onCheckedChange"
          />
          <app-empty
            v-if="!filteredTagDataList.length"
            class="mt-7"
            :description="keywords ? '未找到匹配的标签' : '暂无标签'"
          />
        </view>
        <view v-else-if="active === 2">
          <up-tree
            :data="filteredGroupTreeList"
            :showCheckbox="true"
            :checkStrictly="false"
            :defaultExpandAll="true"
            :checkedKeys="checkedTree.checkedGroup"
            @check-change="onCheckedChange"
          />
          <app-empty
            v-if="!filteredGroupTreeList.length"
            class="mt-7"
            :description="keywords ? '未找到匹配的小组' : '暂无小组'"
          />
        </view>
      </scroll-view>
      <!-- 内容未准备好时显示加载状态 -->
      <view v-else class="flex-1 flex items-center justify-center">
        <up-loading-icon mode="circle" text="加载中..." textSize="14" />
      </view>
      <view class="flex items-center px-4 py-10 flex-shrink-0 bg-gray-12">
        <view class="flex-1 color-main text-14px flex items-center" @click="checkedShow = true">
          <text>已选{{ checkedPersons.length }}人</text>
          <up-icon
            :name="checkedShow ? 'arrow-up' : 'arrow-down'"
            color="main"
            size="32rpx"
            class="ml-3"
          />
        </view>
        <up-button class="mx-0 w-auto! h-64!" shape="circle" @click="cancel">取消</up-button>
        <up-button
          class="mx-0 ml-4 w-auto! h-64!"
          shape="circle"
          type="primary"
          @click="onTreeConfirm"
        >
          确认
        </up-button>
      </view>
    </view>
    <up-popup :show="checkedShow" mode="bottom" round="16" closeable @close="checkedShow = false">
      <view class="text-16px font-bold text-center my-3">已选{{ checkedPersons.length }}人</view>
      <scroll-view :style="{ height: '50vh' }" scroll-y>
        <app-cell
          v-for="item in checkedPersons"
          :key="item.userId || item.sendUserId"
          :title="`${item.sendUserId}/${item.sendUser}`"
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
      <app-bottom-actions :fixed="false" class="p-4">
        <up-button shape="circle" @click="checkedShow = false"> 取消 </up-button>
        <up-button shape="circle" type="primary" @click="checkedShow = false"> 确认 </up-button>
      </app-bottom-actions>
    </up-popup>
  </up-popup>
</template>

<style lang="scss" scoped>
:deep(.u-tree-node) {
  padding-left: 0 !important;
}

:deep(.u-tree-node-children) {
  padding-left: 20px !important;
}
</style>
