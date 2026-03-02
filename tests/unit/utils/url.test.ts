import { describe, it, expect } from 'vitest';
import { buildUrlWithParams, parseUrlSearch, getUrlParam, decodeObjectValues } from '@/utils/url';

// ============ buildUrlWithParams ============
describe('buildUrlWithParams', () => {
  it('正常拼接参数', () => {
    expect(buildUrlWithParams('/api/list', { page: 1, size: 10 })).toBe(
      '/api/list?page=1&size=10'
    );
  });

  it('URL 已包含查询参数时用 & 连接', () => {
    expect(buildUrlWithParams('/api/list?type=1', { page: 1 })).toBe('/api/list?type=1&page=1');
  });

  it('参数值包含中文时编码', () => {
    expect(buildUrlWithParams('/api', { name: '张三' })).toBe('/api?name=%E5%BC%A0%E4%B8%89');
  });

  it('空 url 返回空字符串', () => {
    expect(buildUrlWithParams('')).toBe('');
  });

  it('null / undefined url 返回空字符串', () => {
    expect(buildUrlWithParams(null as any)).toBe('');
    expect(buildUrlWithParams(undefined as any)).toBe('');
  });

  it('无 params 时直接返回 url', () => {
    expect(buildUrlWithParams('/api/list')).toBe('/api/list');
  });

  it('空 params 对象时直接返回 url', () => {
    expect(buildUrlWithParams('/api/list', {})).toBe('/api/list');
  });

  it('参数值为数字 0 时正常拼接', () => {
    expect(buildUrlWithParams('/api', { page: 0 })).toBe('/api?page=0');
  });

  it('参数值为 boolean 时正常拼接', () => {
    expect(buildUrlWithParams('/api', { active: true })).toBe('/api?active=true');
  });

  it('多个参数按顺序拼接', () => {
    expect(buildUrlWithParams('/api', { a: 1, b: 2, c: 3 })).toBe('/api?a=1&b=2&c=3');
  });
});

// ============ parseUrlSearch ============
describe('parseUrlSearch', () => {
  it('解析完整 URL 的查询参数', () => {
    expect(parseUrlSearch('http://example.com/api?page=1&size=10')).toEqual({
      page: '1',
      size: '10',
    });
  });

  it('解析纯查询字符串（无 ?）', () => {
    expect(parseUrlSearch('page=1&size=10')).toEqual({ page: '1', size: '10' });
  });

  it('解码 URL 编码的参数值', () => {
    expect(parseUrlSearch('name=%E5%BC%A0%E4%B8%89')).toEqual({ name: '张三' });
  });

  it('空字符串返回空对象', () => {
    expect(parseUrlSearch('')).toEqual({});
  });

  it('无查询参数的 URL 返回空对象', () => {
    expect(parseUrlSearch('http://example.com/api')).toEqual({});
  });

  it('忽略不含 = 的片段', () => {
    expect(parseUrlSearch('page=1&invalidpair&size=10')).toEqual({ page: '1', size: '10' });
  });

  it('null / undefined 返回空对象', () => {
    expect(parseUrlSearch(null as any)).toEqual({});
    expect(parseUrlSearch(undefined as any)).toEqual({});
  });

  it('? 后无内容返回空对象', () => {
    expect(parseUrlSearch('http://example.com?')).toEqual({});
  });
});

// ============ getUrlParam ============
describe('getUrlParam', () => {
  it('获取指定参数值', () => {
    expect(getUrlParam('http://example.com?page=1&size=10', 'page')).toBe('1');
  });

  it('参数不存在时返回空字符串', () => {
    expect(getUrlParam('http://example.com?page=1', 'size')).toBe('');
  });

  it('url 为空返回空字符串', () => {
    expect(getUrlParam('', 'page')).toBe('');
  });

  it('name 为空返回空字符串', () => {
    expect(getUrlParam('http://example.com?page=1', '')).toBe('');
  });

  it('null url 返回空字符串', () => {
    expect(getUrlParam(null as any, 'page')).toBe('');
  });

  it('null name 返回空字符串', () => {
    expect(getUrlParam('http://example.com?page=1', null as any)).toBe('');
  });
});

// ============ decodeObjectValues ============
describe('decodeObjectValues', () => {
  it('解码字符串值', () => {
    expect(decodeObjectValues({ name: '%E5%BC%A0%E4%B8%89' })).toEqual({ name: '张三' });
  });

  it('非字符串值保持不变', () => {
    expect(decodeObjectValues({ count: 42, active: true })).toEqual({ count: 42, active: true });
  });

  it('递归解码嵌套对象', () => {
    expect(decodeObjectValues({ user: { name: '%E5%BC%A0%E4%B8%89' } })).toEqual({
      user: { name: '张三' },
    });
  });

  it('无效编码保留原值', () => {
    expect(decodeObjectValues({ value: '%' })).toEqual({ value: '%' });
  });

  it('null 输入返回 null', () => {
    expect(decodeObjectValues(null as any)).toBeNull();
  });

  it('非对象输入原样返回', () => {
    expect(decodeObjectValues(123 as any)).toBe(123);
  });

  it('空对象返回空对象', () => {
    expect(decodeObjectValues({})).toEqual({});
  });

  it('混合类型的值', () => {
    expect(
      decodeObjectValues({
        name: '%E5%BC%A0%E4%B8%89',
        age: 30,
        active: true,
        address: null,
      })
    ).toEqual({
      name: '张三',
      age: 30,
      active: true,
      address: null,
    });
  });
});

