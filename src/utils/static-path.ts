/**
 * 静态资源路径工具
 * 根据平台自动返回正确的静态资源路径
 * - H5端：使用相对路径 ./static/
 * - 小程序端：使用绝对路径 /static/
 */

/**
 * 获取静态资源基础路径
 * @returns 静态资源基础路径
 */
export const getStaticPath = (): string => {
  // #ifdef H5
  return './static/';
  // #endif
  // #ifdef MP-WEIXIN
  return '/static/';
  // #endif
  // 默认返回小程序路径（兼容其他平台）
  return '/static/';
};

/**
 * 获取静态图片路径
 * @param imageName 图片文件名（包含子目录，如 'images/logo.png' 或 'images/home/bg.webp'）
 * @returns 完整的静态图片路径
 * @example
 * getStaticImage('images/logo.png') // H5: './static/images/logo.png', 小程序: '/static/images/logo.png'
 * getStaticImage('images/home/bg.webp') // H5: './static/images/home/bg.webp', 小程序: '/static/images/home/bg.webp'
 */
export const getStaticImage = (imageName: string): string => {
  const basePath = getStaticPath();
  // 确保 imageName 不以 / 开头
  const cleanImageName = imageName.startsWith('/') ? imageName.slice(1) : imageName;
  return `${basePath}${cleanImageName}`;
};

/**
 * 获取静态图片目录路径（用于拼接文件名）
 * @param subDir 子目录，如 'images' 或 'images/home'
 * @returns 静态图片目录路径（以 / 结尾）
 * @example
 * getStaticImageDir('images') // H5: './static/images/', 小程序: '/static/images/'
 * const path = getStaticImageDir('images') + 'logo.png';
 */
export const getStaticImageDir = (subDir: string = 'images'): string => {
  const basePath = getStaticPath();
  // 确保 subDir 不以 / 开头和结尾
  const cleanSubDir = subDir.replace(/^\/+|\/+$/g, '');
  return `${basePath}${cleanSubDir}/`;
};
