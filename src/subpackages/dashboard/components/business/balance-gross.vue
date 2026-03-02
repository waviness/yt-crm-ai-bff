<template>
  <view v-if="shouldShow" class="balance-gross" @click="navigateToBalanceGross">
    <view class="circle-btn">
      <up-icon type="circle" size="16" class="icon-left" color="#fff" />
      <text class="btn-text">点击进入平衡毛利面板</text>
      <up-icon name="arrow-right" size="16" class="icon-right" color="#fff" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import router from '@/utils/router';
import { useUserStore } from '@/store/user';

interface Department {
  deptId: number;
  deptName: string;
}

// 部门数据
const departments: Department[] = [
  { deptId: 968, deptName: '英特药业' },
  { deptId: 974, deptName: '英特电商' },
  { deptId: 998, deptName: '宁波英特' },
  { deptId: 984, deptName: '温州英特' },
  { deptId: 985, deptName: '台州英特' },
  { deptId: 990, deptName: '嘉兴英特' },
  { deptId: 991, deptName: '嘉信医药' },
  { deptId: 992, deptName: '湖州英特' },
  { deptId: 993, deptName: '绍兴英特' },
  { deptId: 994, deptName: '金华英特' },
  { deptId: 995, deptName: '浦江英特' },
  { deptId: 996, deptName: '丽水英特' },
  { deptId: 997, deptName: '英特海斯' },
  { deptId: 999, deptName: '明州英特' },
  { deptId: 1000, deptName: '舟山卫盛' },
  { deptId: 1001, deptName: '淳安英特' },
  { deptId: 1002, deptName: '英特盛健' },
  { deptId: 1042, deptName: '英特生物' },
];

const defaultDeptId = ref<number | null>(null);
const defaultDeptName = ref<string>('');
const userStore = useUserStore();

// 是否展示组件
const shouldShow = computed(() => {
  // 尝试从本地存储获取数据
  const phmlArray = JSON.parse(uni.getStorageSync('phmlArray') || '[]');

  // 开发环境调试：如果没有数据，设置默认值以便测试
  const debugPhmlArray =
    process.env.NODE_ENV === 'development' && (!Array.isArray(phmlArray) || phmlArray.length === 0)
      ? ['英特药业'] // 设置默认部门用于测试
      : phmlArray;

  if (Array.isArray(debugPhmlArray) && debugPhmlArray.length > 0) {
    calculateDefaultDeptId(debugPhmlArray);
    return true;
  }
  return false;
});

// 获取 defaultDeptId
const calculateDefaultDeptId = (phmlArray: string[]) => {
  // 如果没有匹配到，使用 phmlArray 中第一个部门
  const fallbackDept = departments.find(dept => dept.deptName === phmlArray[0]);
  defaultDeptId.value = fallbackDept ? fallbackDept.deptId : null;
  defaultDeptName.value = phmlArray[0]; // 设置默认部门名称
};

// 跳转页面
const navigateToBalanceGross = () => {
  // 记录用户点击行为
  // userStore.crmUserClick({
  //   catalogType: 605,
  //   catalogTypeName: '查数据',
  //   menuId: 605006, // 写死代表 平衡毛利
  //   menuName: '平衡毛利',
  //   menuOperation: '平衡毛利点击载入',
  //   operationType: 1,
  // });

  const phmlArray = JSON.parse(uni.getStorageSync('phmlArray') || '[]');
  // 获取当前页面参数
  const currentRoute = router.getCurrentRoute();
  const roleParam = currentRoute?.options?.role;

  if (Array.isArray(phmlArray) && phmlArray.length === 1) {
    router.push('/subpackages/dashboard/balance-gross', {
      deptId: defaultDeptId.value,
      deptName: defaultDeptName.value,
      type: '0',
      role: roleParam,
    });
  } else {
    router.push('/subpackages/dashboard/all-balance-gross', {
      role: roleParam,
    });
  }
};
</script>

<style lang="scss" scoped>
.balance-gross {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #3561f2;
  background-image: url('~@/static/images/circle-btn.webp');
  background-repeat: no-repeat;
  background-position: right;
  height: 50px;
  border-radius: 20px;
  margin: 10px;
  cursor: pointer;
}

.circle-btn {
  margin: 4px 16px;
  display: flex;
  align-items: center;
  width: 100%;
}

.icon-left {
  margin-right: 8px;
}

.icon-right {
  flex-shrink: 0;
}

.btn-text {
  font-size: 16px;
  color: #fff;
  flex: 1;
  line-height: 1.5;
}
</style>
