/**
 * 客户订单审核相关接口
 */

/**
 * 获取客户订单审核列表
 */
export const getOrderDocSaler = (params: any) => {
  return http.wechat.post('/api/orderNew/getOrderDocSaler', params);
};

/**
 * 获取客户订单审核详情
 */
export const getOrderDtlSaler = (params: any) => {
  return http.wechat.formDataPost('/api/orderNew/getOrderDtlSaler', params);
};

/**
 * 更新订单审核状态
 */
export const updateInvoiceByInvoiceid = (params: any) => {
  return http.wechat.post('/saler/order/updateInvoiceByInvoiceid', params);
};
