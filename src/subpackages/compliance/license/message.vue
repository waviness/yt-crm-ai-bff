<!-- 领导同意 再次解锁 证照延期申请 -->
<script setup lang="ts">
// 路由参数
const detailType = ref<number>(0); // 0证照 1委托书
const msgType = ref<string>(''); // 1过期消息通知 2复签通知
const loading = ref(false);

/**
 * 获取详情并跳转
 */
const getDetail = async () => {
  const params: any = {
    pageNum: 1,
    pageSize: 10,
  };
  if (queryApproveId.value) {
    params.queryApproveId = queryApproveId.value;
  } else if (detailType.value === 0 && licenseId.value) {
    params.licenseId = licenseId.value;
  } else if (detailType.value === 1 && attorneyLetterId.value) {
    params.attorneyLetterId = attorneyLetterId.value;
  }
  loading.value = true;
  const res =
    detailType.value === 0
      ? await LicenseService.queryLicenseList(params)
      : await LicenseService.queryAttorneyLetterList(params);
  const item = res.list[0];
  if (!item) {
    loading.value = false;
    uni.showToast({ title: '未找到对应数据', icon: 'none' });
    router.redirect(RouteMap.licenseIndex);
    return;
  }
  router.redirect(RouteMap.licenseDetail, {
    msgType: msgType.value,
    listType: '1',
    licenseType: String(detailType.value),
    statusType: String(0),
    item: JSON.stringify(item),
  });
  loading.value = false;
};

const queryApproveId = ref<string>('');
const licenseId = ref<string>('');
const attorneyLetterId = ref<string>('');

// 页面加载
onLoad((opts: any) => {
  const decodedOpts = decodeObjectValues(opts);
  detailType.value = +(decodedOpts.type || '0');
  msgType.value = decodedOpts.msgType || '';
  queryApproveId.value = decodedOpts.queryApproveId || '';
  licenseId.value = decodedOpts.licenseId || '';
  attorneyLetterId.value = decodedOpts.attorneyLetterId || '';
  getDetail();
});
</script>

<template>
  <view>
    <up-loading-page :loading="loading" loading-text="加载中..." font-size="24rpx" />
  </view>
</template>
