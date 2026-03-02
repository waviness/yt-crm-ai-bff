/** @type {import('stylelint').Config} */
export default {
  // 基础配置扩展
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-standard-vue',
  ],

  // 不同文件类型的语法解析器配置
  overrides: [
    {
      files: ['**/*.{vue,html}'],
      customSyntax: 'postcss-html',
    },
    {
      files: ['**/*.{css,scss}'],
      customSyntax: 'postcss-scss',
    },
  ],

  // 具体规则配置
  rules: {
    // 禁止使用ID选择器
    'selector-max-id': 0,
    // 类名必须符合BEM命名规范
    'selector-class-pattern': '^[a-z][a-z0-9-]*(__[a-z0-9-]+)?(--[a-z0-9-]+)?$',
    // 限制复合选择器的数量，提高性能
    'selector-max-compound-selectors': 3,
    // 允许未知的元素选择器（用于uni-app组件）
    'selector-type-no-unknown': [
      true,
      {
        ignoreTypes: ['page', 'view', 'text', 'image', 'button'],
      },
    ],
    // 允许Vue的深度选择器
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'global', 'slotted'],
      },
    ],

    'declaration-property-value-no-unknown': null,

    // 禁止使用未知单位
    'unit-no-unknown': [
      true,
      {
        ignoreUnits: ['rpx', 'px', 'rem', 'em', '%', 's', 'deg', 'vh', 'vw'],
      },
    ],
    // 长度值为0时不需要单位
    'length-zero-no-unit': true,

    // 禁止重复的样式声明
    'declaration-block-no-duplicate-properties': [
      true,
      {
        ignore: ['consecutive-duplicates-with-different-values'],
      },
    ],
    // 允许使用已废弃但需要兼容的属性
    'property-no-deprecated': [
      true,
      {
        ignoreProperties: ['-webkit-box-orient'],
      },
    ],

    // SCSS变量命名规范
    'scss/dollar-variable-pattern': '^[a-z]+(?:-[a-z0-9]+)*$',

    // 允许空的源文件（避免对空文件报错）
    'no-empty-source': null,

    'import-notation': 'string',
    'scss/load-partial-extension': null,
  },
};
