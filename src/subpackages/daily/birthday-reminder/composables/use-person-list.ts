/**
 * 人员列表 Composable
 * 按页面轻复用原则，仅用于 person-list.vue
 */
import { ref } from 'vue';
import { BirthdayService } from '@/api/birthday-reminder';

export function usePersonList() {
  // 列表数据
  const personList = ref<any[]>([]);
  const loading = ref(false);
  const finished = ref(false);
  const page = ref(1);

  // 查询参数
  const params = ref({
    user: '',
    pageNum: 1,
    pageSize: 10,
  });

  /**
   * 查询人员列表（按推送数量）
   */
  const queryPersonList = async () => {
    if (loading.value) return;

    loading.value = true;

    try {
      const res = await BirthdayService.queryBirthByUserNum({
        ...params.value,
        pageNum: page.value,
      });

      // 修复：使用 res.data.list 而不是 res.list
      personList.value = [...personList.value, ...(res.data?.list || [])];

      // 判断是否还有更多数据
      if (!res.data?.hasNextPage) {
        finished.value = true;
      } else {
        page.value++;
      }
    } catch (error) {
      console.error('查询人员列表失败:', error);
      finished.value = true;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 加载更多
   */
  const onLoad = () => {
    queryPersonList();
  };

  /**
   * 搜索
   */
  const handleSearch = (keyword: string) => {
    params.value.user = keyword;
    resetList();
  };

  /**
   * 重置列表
   */
  const resetList = () => {
    page.value = 1;
    personList.value = [];
    finished.value = false;
    queryPersonList();
  };

  return {
    personList,
    loading,
    finished,
    queryPersonList,
    onLoad,
    handleSearch,
    resetList,
  };
}
