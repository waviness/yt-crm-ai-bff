/**
 * 重点项目主页composable
 */
import type {
  KeyProjectCustomer,
  DeptItem,
  IncreaseTableRow,
  TopicItem,
  WarmthData,
  VisitData,
  GradeData,
} from '../types';

export const useKeyProjects = () => {
  const curCustom = ref<KeyProjectCustomer>({} as KeyProjectCustomer);
  const dataSource = ref<any>({
    increaseData: {},
    increaseTableData: [],
  });
  const active = ref<string>('');
  const infoLoading = ref(false);
  const topicList = ref<TopicItem[]>([]);
  const showFullTitle = ref(false);
  const titleOverflow = ref(false);
  const nopermit = ref(false);

  // 格式化增速数据为表格行
  const formatIncreaseData = () => {
    const {
      saleMonth,
      saleYear,
      saleMonthRate,
      saleYearRate,
      unionMonth,
      unionYear,
      unionMonthRate,
      unionYearRate,
    } = dataSource.value.increaseData;

    dataSource.value.increaseTableData = [
      {
        type: 'target',
        name: '单月目标增速',
        saleValue: saleMonth,
        unionValue: unionMonth,
      },
      {
        name: '本月实际增速',
        targetSaleValue: saleMonth,
        targetUnionValue: unionMonth,
        saleValue: saleMonthRate,
        unionValue: unionMonthRate,
      },
      {
        type: 'target',
        name: '本年目标增速',
        saleValue: saleYear,
        unionValue: unionYear,
      },
      {
        name: '本年实际增速',
        targetSaleValue: saleYear,
        targetUnionValue: unionYear,
        saleValue: saleYearRate,
        unionValue: unionYearRate,
      },
    ];
  };

  // 获取客户信息
  const getData = async (custId: string) => {
    try {
      const { data, success } = await KeyProjectsService.queryByLeader({ custId });
      if (success) {
        nopermit.value = false;
        const { communtyId, communtyName, child, father } = data.communityVO || {
          communtyId: '',
          communtyName: '',
          child: [],
          father: {},
        };

        const params: any = { custId };
        // 只有当 communtyId 存在且不是 '0'/'undefined' 等无效值时才传
        if (communtyId && communtyId !== '0' && communtyId !== 'undefined') {
          params.communtyId = communtyId;
        }

        try {
          const increaseData = await KeyProjectsService.queryIncrease(params);
          dataSource.value.increaseData = increaseData.data || {
            saleMonth: '',
            saleYear: '',
            saleMonthRate: '',
            saleYearRate: '',
            saleLastMonthRate: '',
            unionMonth: '',
            unionYear: '',
            unionMonthRate: '',
            unionYearRate: '',
            unionLastMonthRate: '',
          };
        } catch (error) {
          console.error('获取增速信息失败:', error);
          // 失败时也给个默认值，防止后续报错
          dataSource.value.increaseData = {
            saleMonth: '',
            saleYear: '',
            saleMonthRate: '',
            saleYearRate: '',
            saleLastMonthRate: '',
            unionMonth: '',
            unionYear: '',
            unionMonthRate: '',
            unionYearRate: '',
            unionLastMonthRate: '',
          };
        }

        const {
          custName,
          gridGradeId,
          gridGrade,
          typeList,
          pilotName,
          leaderVisitTarget,
          personVisitTarget,
          ccuId,
        } = data.gridListVO;

        dataSource.value = {
          ...dataSource.value, // 保留 increaseData
          communtyId,
          communtyName,
          father,
          child: child || [],
          custId: data.gridListVO.custId,
          custName,
          gridGradeId,
          gridGrade,
          typeList,
          pilotName,
          leaderVisitTarget,
          personVisitTarget,
          ccuId,
          deptList: data.sale,
        };

        // 确保 deptList 存在且不为空时才设置 active
        if (dataSource.value.deptList && dataSource.value.deptList.length > 0) {
          active.value = dataSource.value.deptList[0].deptId;
          await getSaleInfo();
        } else {
          // 如果没有销售部门信息，可能需要处理空状态或默认显示
          console.warn('No department list found for customer:', custId);
          // 这里也要关掉 loading，因为 getSaleInfo 不会被调用
          infoLoading.value = false;
        }

        formatIncreaseData();

        return true;
      } else {
        nopermit.value = true;
        // 接口失败也要关 loading
        infoLoading.value = false;
        return false;
      }
    } catch (error) {
      console.error('获取客户信息失败:', error);
      // 异常也要关 loading
      infoLoading.value = false;
      return false;
    }
  };

  // 获取销售信息
  const getSaleInfo = async () => {
    infoLoading.value = true;
    try {
      const saleId = dataSource.value.deptList.find(
        (item: DeptItem) => item.deptId === active.value
      )?.userId;

      if (!saleId) return;

      const infoRes = await KeyProjectsService.queryBusiness({
        custId: curCustom.value.custId,
        saleId,
      });

      const {
        agrade,
        bgrade,
        cgrade,
        dgrade,
        lack,
        never,
        normal,
        neverUp,
        lackUp,
        normalUp,
        userName,
        leaderVisit,
        personVisit,
      } = infoRes.data;

      dataSource.value = {
        ...dataSource.value,
        gradeData: [
          { value: agrade, name: 'A' },
          { value: bgrade, name: 'B' },
          { value: cgrade, name: 'C' },
          { value: dgrade, name: 'D' },
        ],
        lack,
        never,
        normal,
        neverUp,
        lackUp,
        normalUp,
        saler: userName,
        leaderVisit,
        personVisit,
        leaderVisitTimes: leaderVisit ? leaderVisit.length : 0,
        personVisitTimes: personVisit ? personVisit.length : 0,
      };
    } catch (error) {
      console.error('获取销售信息失败:', error);
    } finally {
      infoLoading.value = false;
    }
  };

  // 切换部门
  const handleDeptChange = async () => {
    await getSaleInfo();
  };

  // 发送通知
  const onContact = async (custId: string) => {
    try {
      const saleId = dataSource.value.deptList.find(
        (item: DeptItem) => item.deptId === active.value
      )?.userId;

      if (!saleId) return;

      const res = await KeyProjectsService.pushGridMsg({ custId, saleId });
      if (res.success) {
        showSuccess('通知成功');
      }
    } catch (error) {
      console.error('发送通知失败:', error);
    }
  };

  return {
    curCustom,
    dataSource,
    active,
    infoLoading,
    topicList,
    showFullTitle,
    titleOverflow,
    nopermit,
    getData,
    getSaleInfo,
    handleDeptChange,
    onContact,
  };
};
