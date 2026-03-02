import { describe, it, expect } from 'vitest';
import { resolveMessageUrl } from '@/utils/resolve-message-url';

describe('resolveMessageUrl', () => {
  // ============ 空值/无效值 ============
  describe('无效输入', () => {
    it('空字符串 -> 返回空', () => {
      expect(resolveMessageUrl('')).toBe('');
    });

    it('普通外链 -> 返回空（无法映射为内部路由）', () => {
      expect(resolveMessageUrl('https://www.baidu.com')).toBe('');
    });

    it('不在映射表里的旧路由 -> 返回空', () => {
      expect(resolveMessageUrl('http://host/#/unknownPage?id=1')).toBe('');
    });
  });

  // ============ 旧版 Hash 路由映射 ============
  describe('旧版路由映射（Hash 模式）', () => {
    it('旧版询证函详情 -> 新路由', () => {
      const url = 'http://host/app/#/financeInquiryDetail?id=123&type=1';
      expect(resolveMessageUrl(url)).toBe(
        '/subpackages/business/confirmation-letter/detail?id=123&type=1'
      );
    });

    it('旧版回款认领 -> 新路由（无 query）', () => {
      const url = 'http://host/app/#/collectionClaim';
      expect(resolveMessageUrl(url)).toBe('/subpackages/business/collection-claim/index');
    });

    it('旧版项目管理 -> 新路由', () => {
      const url = 'http://host/app/#/projectManage?tab=1';
      expect(resolveMessageUrl(url)).toBe('/subpackages/project/entry?tab=1');
    });

    it('旧版项目排名 -> 新路由', () => {
      const url = 'http://host/app/#/projectManageRank';
      expect(resolveMessageUrl(url)).toBe('/subpackages/project/rank');
    });

    it('旧版锁定详情 -> 新路由', () => {
      const url = 'http://host/app/#/lock/detail?lockId=99';
      expect(resolveMessageUrl(url)).toBe('/subpackages/lock/detail?lockId=99');
    });

    it('旧版锁定列表 -> 新路由', () => {
      const url = 'http://host/app/#/lockList';
      expect(resolveMessageUrl(url)).toBe('/subpackages/lock/index');
    });

    it('旧版询证函异常详情 -> 新路由', () => {
      const url = 'http://host/app/#/inquiryAbnormalDeal/detail?id=5';
      expect(resolveMessageUrl(url)).toBe(
        '/subpackages/business/confirmation-letter/abnormal-detail?id=5'
      );
    });

    it('旧版品种跟踪 -> 新路由', () => {
      const url = 'http://host/app/#/varietyFollow';
      expect(resolveMessageUrl(url)).toBe('/subpackages/daily/variety-follow/index');
    });

    it('旧版客户订单审批详情 -> 新路由', () => {
      const url = 'http://host/app/#/customerOrderApproveDetail?id=10';
      expect(resolveMessageUrl(url)).toBe(
        '/subpackages/order/customer-order-approve/detail?id=10'
      );
    });

    it('旧版退款审批详情 -> 新路由', () => {
      const url = 'http://host/app/#/refundApproveDetail?id=7';
      expect(resolveMessageUrl(url)).toBe('/subpackages/business/refund-approve/detail?id=7');
    });

    it('旧版结算详情 -> 新路由', () => {
      const url = 'http://host/app/#/finalKnotDetail?id=3';
      expect(resolveMessageUrl(url)).toBe('/subpackages/business/final-knot/detail?id=3');
    });

    it('旧版高值管理 -> 新路由', () => {
      const url = 'http://host/app/#/hightValue';
      expect(resolveMessageUrl(url)).toBe('/subpackages/business/high-value/goods/index');
    });

    it('旧版两票提醒 -> 新路由', () => {
      const url = 'http://host/app/#/twoVoteReminder';
      expect(resolveMessageUrl(url)).toBe('/subpackages/daily/two-vote-reminder/index');
    });

    it('旧版退货单 -> 新路由', () => {
      const url = 'http://host/app/#/salesReturnOrder';
      expect(resolveMessageUrl(url)).toBe('/subpackages/business/sales-return-order/index');
    });

    it('旧版话题详情 -> 新路由', () => {
      const url = 'http://host/app/#/topic/detail?id=1';
      expect(resolveMessageUrl(url)).toBe('/subpackages/daily/topic/detail?id=1');
    });

    it('旧版客户分析报告 -> 新路由', () => {
      const url = 'http://host/app/#/customerRecommer';
      expect(resolveMessageUrl(url)).toBe('/subpackages/customer/analysis-report/index');
    });

    it('旧版询证函超期 -> 新路由', () => {
      const url = 'http://host/app/#/exceedTimeReason?id=1';
      expect(resolveMessageUrl(url)).toBe(
        '/subpackages/business/confirmation-letter/overdue?id=1'
      );
    });

    it('旧版冲差管理 -> 新路由', () => {
      const url = 'http://host/app/#/impulseDifferenceManage';
      expect(resolveMessageUrl(url)).toBe('/subpackages/order/impulse-difference-manage/index');
    });

    it('旧版问卷详情 -> 新路由', () => {
      const url = 'http://host/app/#/questionnaireDetail?id=2';
      expect(resolveMessageUrl(url)).toBe('/subpackages/user/quest-detail?id=2');
    });

    it('旧版客户拜访详情 -> 新路由', () => {
      const url = 'http://host/app/#/customerFollow/detail?id=8';
      expect(resolveMessageUrl(url)).toBe('/subpackages/customer/follow/detail?id=8');
    });
  });

  // ============ 新版 Hash 路由（直接通过） ============
  describe('新版路由（Hash 模式）', () => {
    it('/subpackages 开头的 Hash 路由直通', () => {
      const url = 'http://host/app/#/subpackages/business/funding/detail?id=1';
      expect(resolveMessageUrl(url)).toBe('/subpackages/business/funding/detail?id=1');
    });

    it('/pages 开头的 Hash 路由直通', () => {
      const url = 'http://host/app/#/pages/auth/login';
      expect(resolveMessageUrl(url)).toBe('/pages/auth/login');
    });

    it('/subpackages Hash 路由无 query', () => {
      const url = 'http://host/app/#/subpackages/daily/task/send';
      expect(resolveMessageUrl(url)).toBe('/subpackages/daily/task/send');
    });
  });

  // ============ 非 Hash 模式的 URL ============
  describe('非 Hash 模式', () => {
    it('直接的相对路径', () => {
      const url = '/subpackages/daily/task/detail?csoId=100';
      expect(resolveMessageUrl(url)).toBe('/subpackages/daily/task/detail?csoId=100');
    });

    it('带域名的非 Hash 路径', () => {
      const url = 'http://host/app/subpackages/business/receivable/detail?id=1';
      expect(resolveMessageUrl(url)).toBe('/subpackages/business/receivable/detail?id=1');
    });

    it('/pages 开头的非 Hash 路径', () => {
      const url = 'http://host/pages/download/index';
      expect(resolveMessageUrl(url)).toBe('/pages/download/index');
    });

    it('非 Hash 相对路径无 query', () => {
      const url = '/subpackages/lock/index';
      expect(resolveMessageUrl(url)).toBe('/subpackages/lock/index');
    });
  });
});

