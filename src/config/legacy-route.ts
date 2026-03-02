import { RouteMap } from '@/config/route';

/**
 * 旧版 Vue2 H5 路由到新版 UniApp 路由的映射表
 * Key: 旧版 URL hash 中的 path (例如 /financeInquiryDetail)
 * Value: 新版 UniApp 页面路径 (例如 /subpackages/business/confirmation-letter/detail)
 */
export const PATH_REWRITE_MAP: Record<string, string> = {
  '/financeInquiryDetail': RouteMap.confirmationLetterDetail,
  '/inquiryAbnormalDeal/detail': RouteMap.confirmationLetterAbnormalDetail,
  '/collectionClaim': RouteMap.collectionClaim,
  '/projectManage': RouteMap.projectEntry,
  '/projectManageRank': RouteMap.projectRank,
  '/projectManageExRank': RouteMap.projectExRank,
  '/customerOrderApproveDetail': RouteMap.customerOrderApproveDetail,
  '/refundApproveDetail': RouteMap.refundApproveDetail,
  '/customerRecommer': RouteMap.customerAnalysisReport,
  '/finalKnotDetail': RouteMap.finalKnotDetail,
  '/varietyFollow': RouteMap.varietyFollow,
  '/hightValue': RouteMap.highValueGoods,
  '/twoVoteReminder': RouteMap.twoVoteReminder,
  '/lock/detail': RouteMap.lockDetail,
  '/lockList': RouteMap.lockIndex,
  '/salesReturnOrder': RouteMap.salesReturnOrder,
  '/orderintegrate/detail': RouteMap.subscribeReminder,
  '/qualityRecallManagement/detail': RouteMap.qualityRecallDetail,
  '/qualityReview/detail': RouteMap.qualityReviewDetail,
  '/topic/detail': RouteMap.topicDetail,
  '/message/pushGridMsg': RouteMap.keyProjectsIndex,
  '/wmsTwoPinDic/wmsTwoPinMsgDetail': RouteMap.wmsTwoPinDicDetail,
  '/exceedTimeReason': RouteMap.confirmationLetterOverdue,
  '/message/inquiryLetterDetail': RouteMap.confirmationLetterDetail,
  '/message/licenseDetail': RouteMap.licenseMessage,
  '/message/taskDetail': RouteMap.taskMessage,
  '/impulseDifferenceManage': RouteMap.impulseDifferenceManage,
  '/questionnaireDetail': RouteMap.questDetail,
  '/customerFollow/detail': RouteMap.customerFollowDetail,
};
