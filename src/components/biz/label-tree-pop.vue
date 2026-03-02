<template>
  <!-- 标签级联选择 -->
  <up-cascader
    @confirm="labelTreeConfirm"
    @close="labelTreeClose"
    v-model:show="labelTreeShowInner"
    v-model="labelIdList"
    value-key="LABEL_ID"
    label-key="LABEL_NAME"
    children-key="CHILD_LIST"
    :data="dashboardStore.labelTreeList"
  ></up-cascader>
</template>

<script lang="ts" setup>
const dashboardStore = useDashboardStore();
interface Props {
  labelTreeShow: boolean;
}

const props = defineProps<Props>();
const labelTreeShowInner = ref(false);
watch(
  () => props.labelTreeShow,
  newVal => {
    console.log(newVal);
    labelTreeShowInner.value = newVal;
  },
  { deep: true }
);
/**
 * 根据ID数组获取LABEL_NAME
 * @param {Array} idArray 包含父级ID和子级ID的数组，如 [2, 20012]
 * @param {Array} labelData 完整的标签数据
 * @returns {string} 对应的LABEL_NAME
 */
const getLabelNameById = (idArray: Array<number>, labelData: Array<any>) => {
  // 验证输入参数
  if (
    !Array.isArray(idArray) ||
    idArray.length !== 2 ||
    !Array.isArray(labelData) ||
    labelData.length === 0
  ) {
    return '';
  }
  const [parentId, childId] = idArray;
  // 查找父级节点
  const parent = labelData.find(item => item.LABEL_ID === parentId);
  if (!parent || !parent.CHILD_LIST) {
    return '';
  }
  // 查找子级节点
  const child = parent.CHILD_LIST.find((item: any) => item.LABEL_ID === childId);
  return child ? child.LABEL_NAME : '';
};

const labelIdList = ref([]);
const emit = defineEmits(['labelTreeConfirm', 'labelTreeClose']);
const labelTreeClose = () => {
  emit('labelTreeClose');
};
const labelTreeConfirm = () => {
  emit('labelTreeConfirm', {
    labelId: labelIdList.value[1],
    labelName: getLabelNameById(labelIdList.value, dashboardStore.labelTreeList),
  });
};
onMounted(() => {
  if (!dashboardStore.labelTreeList?.length) {
    dashboardStore._getLabelTree();
  }
});
</script>

<style lang="scss" scoped></style>
