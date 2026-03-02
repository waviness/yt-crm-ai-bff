import { defineConfig } from 'unocss';
import presetWeapp from 'unocss-preset-weapp';
import { extractorAttributify, transformerClass } from 'unocss-preset-weapp/transformer';
import transformerDirectives from '@unocss/transformer-directives';
import type { Rule } from 'unocss'; // 导入Rule类型
// 提取属性化模式相关工具（按需启用）
const { presetWeappAttributify, transformerAttributify } = extractorAttributify();

const customColors = {
  'gray-3': '#777777',
  'gray-4': '#969799',
  'gray-5': '#646566',
  'gray-6': '#c0c4cc',
  'gray-7': '#c8c9cc',
  'gray-8': '#e7e7e7',
  'gray-9': '#7b7b7b',
  'gray-10': '#f7f7f7',
  'gray-11': '#f6f6f6',
  'gray-12': '#f2f3f5',
  'gray-13': '#d8d8d8',
  'light-gray': '#f5f6f9',
  'light-gray-2': '#f9f9f9',
  'black-2': '#323233',
  'blue-1': '#0052d9',
  'blue-2': '#1989fa',
  main: '#2271f5',
  'main-3': '#3561f2',
  success: '#00a870',
  danger: '#ea394b',
  warning: '#ed7b2f',
  default: '#dcdee0',
  'main-100': '#e9f0fd',
  'success-100': '#cceee2',
  'danger-100': '#fbd7db',
  'warning-100': '#fbe5d5',
};
// 明确指定返回类型为Rule，确保数组长度为2
const createSizeRules = (className: string, cssProperty: string | string[]): Rule => {
  // 必须返回 [RegExp, 处理函数] 的固定结构
  return [
    new RegExp(`^${className}$`), // 第一个元素：正则表达式
    () => {
      // 第二个元素：处理函数
      const value = '20rpx';
      if (Array.isArray(cssProperty)) {
        return cssProperty.reduce(
          (acc, prop) => {
            acc[prop] = value;
            return acc;
          },
          {} as Record<string, string>
        );
      }
      return { [cssProperty]: value };
    },
  ];
};

export default defineConfig({
  presets: [
    // 核心：微信小程序 + H5 适配预设（替代 preset-uno，更贴合小程序环境）
    // https://github.com/MellowCo/unocss-preset-weapp
    presetWeapp(),
    // 可选：启用属性化模式（如 <view bg="red-500">）
    presetWeappAttributify(),
  ],

  theme: {
    colors: customColors,
  },

  // 自定义规则：聚焦小程序常用需求
  rules: [
    // 补充 rpx 单位快捷写法（针对非尺寸类样式，如字体大小）
    [/^text-(\d+)$/, ([, num]) => ({ 'font-size': `${Number(num) * 2}rpx` })],
    createSizeRules('p-10', 'padding'),
    createSizeRules('px-10', ['padding-left', 'padding-right']),
    createSizeRules('py-10', ['padding-top', 'padding-bottom']),
    createSizeRules('pt-10', 'padding-top'),
    createSizeRules('pb-10', 'padding-bottom'),
    createSizeRules('pl-10', 'padding-left'),
    createSizeRules('pr-10', 'padding-right'),
    createSizeRules('m-10', 'margin'),
    createSizeRules('mx-10', ['margin-left', 'margin-right']),
    createSizeRules('my-10', ['margin-top', 'margin-bottom']),
    createSizeRules('mt-10', 'margin-top'),
    createSizeRules('mb-10', 'margin-bottom'),
    createSizeRules('ml-10', 'margin-left'),
    createSizeRules('mr-10', 'margin-right'),
    [
      /^pb-100$/,
      () => ({
        'padding-bottom': '200rpx',
      }),
    ],
    [
      /^pt-100$/,
      () => ({
        'padding-top': '200rpx',
      }),
    ],
    [/^b-(\d+)-$([^$]+)$$/, ([, size, color]) => ({ border: `${size}px solid ${color}` })],
    [/^flex-(\d+)$/, ([, d]) => ({ flex: d })],
    // 多行文本截断：line-clamp-{行数}
    [
      /^line-clamp-(\d+)$/,
      ([, lines]) => ({
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': `${lines}`,
        overflow: 'hidden',
      }),
    ],
  ],

  // 自定义快捷方式（复用样式组合）
  shortcuts: {
    center: 'flex items-center justify-center', // 居中布局
    slh: 'whitespace-nowrap overflow-hidden text-ellipsis',
    'filter-border': 'border-[2rpx] border-solid border-[#bababa] rounded-20rpx',
    'circle-view': 'w-12 h-12 rounded-50%',
    'shadow-view': 'shadow-[0_2rpx_12rpx_1rpx_rgba(209,207,207,.5)]',
    'shadow-btn': 'rounded-10 shadow-[0_0_24rpx_10rpx_rgba(209,207,207,.5)]',
    'title-before': 'border-l-10 border-main border-solid border-t-0 border-b-0 border-r-0',
  },

  // 转换器：处理小程序样式兼容问题
  transformers: [
    transformerDirectives({
      enforce: 'pre',
    }),
    transformerAttributify(), // 配合属性化模式解析
    transformerClass({
      exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /marked\.esm\.js$/],
    }), // 修复小程序类名转换问题
  ],

  // 新增：指定需要处理的文件（未匹配的文件自动被排除）
  content: {
    filesystem: [
      'src/**/*.vue', // 处理src目录下的所有vue文件
      'src/**/*.ts', // 处理ts文件（若有动态生成的类名）
    ],
  },
});
