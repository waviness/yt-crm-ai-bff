<template>
  <u-popup v-model:show="visible" mode="bottom" :closeable="true" :round="10">
    <view class="dept-select-popup">
      <!-- 搜索框 -->
      <view class="search-box">
        <u-search
          v-model="keyword"
          placeholder="输入部门名称搜索"
          @search="handleSearch"
          @clear="handleSearch"
        />
      </view>

      <!-- 部门列表 -->
      <scroll-view class="dept-list" scroll-y>
        <!-- 上级部门 -->
        <view v-if="filteredParentDepts.length > 0" class="dept-section">
          <view class="section-title">上级部门</view>
          <view
            v-for="dept in filteredParentDepts"
            :key="dept.deptId"
            class="dept-item"
            :class="{ active: currentDeptId === dept.deptId, disabled: !dept.authFlag }"
            @click="handleSelectDept(dept)"
          >
            <text class="dept-name">{{ dept.deptName }}</text>
            <u-icon v-if="dept.authFlag" name="arrow-right" size="16" color="#969799" />
          </view>
        </view>

        <!-- 下级部门 -->
        <view v-if="filteredChildDepts.length > 0" class="dept-section">
          <view class="section-title">下级部门</view>
          <view
            v-for="dept in filteredChildDepts"
            :key="dept.deptId"
            class="dept-item"
            :class="{ active: currentDeptId === dept.deptId, disabled: !dept.authFlag }"
            @click="handleSelectDept(dept)"
          >
            <view class="dept-info">
              <text class="dept-name">{{ dept.deptName }}</text>
              <text v-if="dept.parentDeptName" class="parent-name"
                >({{ dept.parentDeptName }})</text
              >
            </view>
            <u-icon v-if="dept.authFlag" name="arrow-right" size="16" color="#969799" />
          </view>
        </view>

        <!-- 空状态 -->
        <view
          v-if="filteredParentDepts.length === 0 && filteredChildDepts.length === 0"
          class="empty-state"
        >
          <text class="empty-text">暂无匹配的部门</text>
        </view>
      </scroll-view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import type { AuthDeptSales } from '../types/purchase';

interface Props {
  show: boolean;
  authDeptSales: AuthDeptSales[];
  currentDeptId?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  authDeptSales: () => [],
  currentDeptId: '',
});

const emit = defineEmits<{
  'update:show': [value: boolean];
  select: [dept: AuthDeptSales];
}>();

// 响应式数据
const visible = computed({
  get: () => props.show,
  set: val => emit('update:show', val),
});

const keyword = ref('');
const parentDepts = ref<AuthDeptSales[]>([]);
const childDepts = ref<AuthDeptSales[]>([]);

// 初始化部门列表
const initDeptList = () => {
  parentDepts.value = props.authDeptSales;
  childDepts.value = [];

  // 提取所有子部门
  props.authDeptSales.forEach(dept => {
    if (dept.sonDeptSalesDTOList && dept.sonDeptSalesDTOList.length > 0) {
      dept.sonDeptSalesDTOList.forEach(child => {
        childDepts.value.push({
          ...child,
          parentDeptName: dept.deptName,
        } as AuthDeptSales);
      });
    }
  });
};

// 过滤后的上级部门
const filteredParentDepts = computed(() => {
  if (!keyword.value) return parentDepts.value;

  return parentDepts.value.filter(
    dept => dept.deptName.includes(keyword.value) || String(dept.deptId).includes(keyword.value)
  );
});

// 过滤后的下级部门
const filteredChildDepts = computed(() => {
  if (!keyword.value) return childDepts.value;

  return childDepts.value.filter(
    dept => dept.deptName.includes(keyword.value) || String(dept.deptId).includes(keyword.value)
  );
});

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
};

// 选择部门
const handleSelectDept = (dept: AuthDeptSales) => {
  // 如果没有权限或已选中,则不处理
  if (!dept.authFlag || dept.deptId === props.currentDeptId) {
    return;
  }

  emit('select', dept);
  visible.value = false;
};

// 监听弹窗显示状态
watch(
  () => props.show,
  newVal => {
    if (newVal) {
      keyword.value = '';
      initDeptList();
    }
  }
);

// 初始化
onMounted(() => {
  initDeptList();
});
</script>

<style lang="scss" scoped>
.dept-select-popup {
  height: 80vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.search-box {
  padding: 20rpx;
  border-bottom: 2rpx solid #ebedf0;
}

.dept-list {
  flex: 1;
  overflow-y: auto;
}

.dept-section {
  padding: 20rpx 0;

  .section-title {
    padding: 20rpx 32rpx;
    font-size: 28rpx;
    color: #323233;
    font-weight: 500;
    background: #f7f8fa;
  }
}

.dept-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 2rpx solid #ebedf0;
  transition: background 0.3s;

  &:active {
    background: #f2f3f5;
  }

  &.active {
    .dept-name {
      color: #2271f5;
      font-weight: 500;
    }
  }

  &.disabled {
    opacity: 0.4;

    .dept-name {
      color: #c8c9cc;
    }
  }

  .dept-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .dept-name {
    font-size: 30rpx;
    color: #323233;
  }

  .parent-name {
    font-size: 24rpx;
    color: #969799;
  }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  .empty-text {
    font-size: 28rpx;
    color: #969799;
  }
}
</style>
