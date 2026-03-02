/**
 * 生日列表 Composable
 * 按页面轻复用原则，仅用于 birth-list.vue
 */
import { ref } from 'vue';
import { BirthdayService } from '@/api/birthday-reminder';
import { useBirthdayOperations } from './use-birthday-operations';

export function useBirthdayList() {
  const { getSurplusDay } = useBirthdayOperations();

  // 列表数据（分为三类：7天内、30天内、30天后）
  const birthList1 = ref<any[]>([]); // 即将过生日（7天内）
  const birthList2 = ref<any[]>([]); // 近期过生日（30天内）
  const birthList3 = ref<any[]>([]); // 一个月后过生日

  // 分页相关
  const loading = ref(false);
  const finished = ref(false);
  const page = ref(1);

  // 查询参数
  const params = ref({
    user: '',
    birthFlag: '', // 1:生日 2:政治生日
    typeFlag: '',
    pageNum: 1,
    pageSize: 10,
  });

  // 批量操作
  const isAll = ref(false);
  const selectedList = ref<any[]>([]); // 存储选中的完整对象
  const selectedIdList = ref<string[]>([]); // 用于 checkbox-group 的 v-model，存储唯一标识

  /**
   * 查询生日列表
   */
  const queryBirth = async () => {
    if (loading.value) return;

    console.log('queryBirth called, params:', params.value);
    loading.value = true;

    try {
      console.log('开始请求生日数据...');
      const res = await BirthdayService.queryBirth({
        ...params.value,
        pageNum: page.value,
      });

      console.log('生日数据返回:', res);

      // 处理数据，按天数分类
      // 修复：使用 res.data.list 而不是 res.list，并添加空值检查
      const list = res.data?.list || [];
      list.forEach((data: any) => {
        // 计算距离生日天数
        if (data.birthFlag === 1) {
          data.count = getSurplusDay(data.birthday);
        } else {
          data.count = getSurplusDay(data.politicsBirthday);
        }

        // 根据天数分类
        if (data.count <= 7) {
          birthList1.value.push(data);
        } else if (data.count <= 30) {
          birthList2.value.push(data);
        } else {
          birthList3.value.push(data);
        }
      });

      console.log('分类后的数据:', {
        birthList1: birthList1.value.length,
        birthList2: birthList2.value.length,
        birthList3: birthList3.value.length,
      });

      // 判断是否还有更多数据
      if (!res.data?.hasNextPage) {
        finished.value = true;
      } else {
        page.value++;
      }
    } catch (error) {
      console.error('查询生日列表失败:', error);
      finished.value = true;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 加载更多
   */
  const onLoad = () => {
    queryBirth();
  };

  /**
   * 搜索
   */
  const handleSearch = (keyword: string) => {
    params.value.user = keyword;
    resetList();
  };

  /**
   * 筛选（生日类型）
   */
  const handleFilter = (birthFlag: string) => {
    params.value.birthFlag = birthFlag;
    resetList();
  };

  /**
   * 重置列表
   */
  const resetList = () => {
    page.value = 1;
    birthList1.value = [];
    birthList2.value = [];
    birthList3.value = [];
    finished.value = false;
    queryBirth();
  };

  /**
   * 切换批量操作模式
   */
  const toggleBatchMode = () => {
    isAll.value = !isAll.value;
    if (!isAll.value) {
      selectedList.value = [];
      selectedIdList.value = [];
    }
  };

  /**
   * 生成项目的唯一标识
   */
  const getItemId = (item: any) => {
    return `${item.userId}_${item.birthFlag}`;
  };

  /**
   * 检查项目是否被选中
   */
  const isItemSelected = (item: any) => {
    return selectedIdList.value.includes(getItemId(item));
  };

  /**
   * checkbox-group 变化事件处理
   */
  const handleCheckboxGroupChange = (selectedIds: string[]) => {
    // 根据选中的 ID 列表，重新构建 selectedList
    const allItems = [...birthList1.value, ...birthList2.value, ...birthList3.value];
    selectedList.value = allItems.filter(item => selectedIds.includes(getItemId(item)));
  };

  /**
   * 选择项变化
   */
  const handleSelectionChange = (list: any[]) => {
    selectedList.value = list;
  };

  /**
   * 切换全选
   */
  const toggleAll = () => {
    isAll.value = !isAll.value;
    const allList = [...birthList1.value, ...birthList2.value, ...birthList3.value];
    selectedList.value = isAll.value ? allList : [];
  };

  /**
   * 切换单选
   */
  const toggleSelect = (item: any) => {
    const index = selectedList.value.findIndex(v => v.userId === item.userId);
    if (index > -1) {
      selectedList.value.splice(index, 1);
      isAll.value = false;
    } else {
      selectedList.value.push(item);
    }
  };

  return {
    birthList1,
    birthList2,
    birthList3,
    loading,
    finished,
    params,
    isAll,
    selectedList,
    selectedIdList,
    queryBirth,
    onLoad,
    handleSearch,
    handleFilter,
    resetList,
    toggleBatchMode,
    handleSelectionChange,
    toggleAll,
    toggleSelect,
    getItemId,
    isItemSelected,
    handleCheckboxGroupChange,
  };
}
