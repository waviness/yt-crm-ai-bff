import { PATH_REWRITE_MAP } from '@/config/legacy-route';

/**
 * 解析消息中的 URL，返回 UniApp 内部路由地址
 *
 * 支持以下场景：
 * 1. 旧版 Hash 路由：http://host/app/#/financeInquiryDetail?id=1 → 映射为新路由
 * 2. 新版 Hash 路由：http://host/app/#/subpackages/business/detail?id=1 → 直接提取
 * 3. 非 Hash 相对路径：/subpackages/business/detail?id=1 → 直接提取
 * 4. 非 Hash 绝对路径：http://host/app/subpackages/business/detail?id=1 → 直接提取
 *
 * @param url 原始消息 URL
 * @returns 解析后的内部路由地址，如果无法解析则返回空字符串
 */
export function resolveMessageUrl(url: string): string {
  if (!url) return '';

  let targetUrl = '';

  // 1. 尝试从 Hash 中解析 (#/...)
  const hashMatch = url.match(/#([^?]+)(\?.*)?/);
  if (hashMatch) {
    const path = hashMatch[1];
    const query = hashMatch[2] || '';

    // 情况 A: 命中旧路由映射
    if (PATH_REWRITE_MAP[path]) {
      targetUrl = `${PATH_REWRITE_MAP[path]}${query}`;
    }
    // 情况 B: 已经是新路由地址 (以 /pages 或 /subpackages 开头)
    else if (path.startsWith('/pages/') || path.startsWith('/subpackages/')) {
      targetUrl = `${path}${query}`;
    }
  }

  // 2. 如果 Hash 未匹配到有效内部路由，尝试直接从 URL 中提取路径
  if (!targetUrl) {
    const directMatch = url.match(/(\/(pages|subpackages)\/[^?#]+)(\?.*)?/);
    if (directMatch) {
      targetUrl = `${directMatch[1]}${directMatch[3] || ''}`;
    }
  }

  return targetUrl;
}
