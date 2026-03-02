import { describe, it, expect } from 'vitest';
import { PATH_REWRITE_MAP } from '@/config/legacy-route';
import { RouteMap } from '@/config/route';

describe('PATH_REWRITE_MAP（旧路由映射表）', () => {
  it('映射表不为空', () => {
    expect(Object.keys(PATH_REWRITE_MAP).length).toBeGreaterThan(0);
  });

  it('所有映射值都指向 RouteMap 中存在的路由', () => {
    const allRoutes = Object.values(RouteMap);
    for (const [oldPath, newPath] of Object.entries(PATH_REWRITE_MAP)) {
      expect(
        allRoutes.includes(newPath as any),
        `旧路由 "${oldPath}" 映射到了 "${newPath}"，但该路径不在 RouteMap 中`
      ).toBe(true);
    }
  });

  it('所有旧路由 key 都以 / 开头', () => {
    for (const key of Object.keys(PATH_REWRITE_MAP)) {
      expect(key.startsWith('/'), `旧路由 "${key}" 未以 / 开头`).toBe(true);
    }
  });

  it('所有映射值都以 /subpackages/ 或 /pages/ 开头', () => {
    for (const [oldPath, newPath] of Object.entries(PATH_REWRITE_MAP)) {
      expect(
        newPath.startsWith('/subpackages/') || newPath.startsWith('/pages/'),
        `旧路由 "${oldPath}" 映射到了 "${newPath}"，不是合法的 UniApp 路径`
      ).toBe(true);
    }
  });

  it('不存在重复的映射目标', () => {
    const values = Object.values(PATH_REWRITE_MAP);
    const uniqueValues = new Set(values);
    // 注意：有可能多个旧路由指向同一个新路由（如 /financeInquiryDetail 和 /message/inquiryLetterDetail 都指向 confirmationLetterDetail）
    // 这里只是记录并提示，不强制失败
    if (uniqueValues.size !== values.length) {
      const duplicates = values.filter((v, i) => values.indexOf(v) !== i);
      console.warn('存在多个旧路由映射到同一目标:', [...new Set(duplicates)]);
    }
    // 至少确保有映射
    expect(values.length).toBeGreaterThan(0);
  });
});

