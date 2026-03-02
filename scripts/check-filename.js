/**
 * 检查 git 暂存区中新增/重命名的文件是否符合命名规范
 * 支持 kebab-case（中划线）和 snake_case（下划线）两种命名方式
 * 仅检查指定扩展名的文件
 */

const { execSync } = require('child_process');
const path = require('path');

// ✅ 允许的文件扩展名（按需修改）
const EXTENSIONS = [
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.vue',
  '.html',
  '.css',
  '.scss',
  '.less',
  '.json',
  '.md',
];

// ✅ 排除的文件（自动生成的文件不需要检查命名规范）
const EXCLUDED_FILES = [
  'auto-imports.d.ts', // unplugin-auto-import 自动生成的文件
];

// ✅ 命名规范正则：支持 kebab-case（中划线）和 snake_case（下划线）
// kebab-case: 只允许小写字母、数字，单词间用连字符分隔
// snake_case: 只允许小写字母、数字，单词间用下划线分隔
// 示例：✅ user-profile.vue ✅ user_profile.js ❌ UserProfile.vue ❌ myComponent.ts
// 支持多段扩展名，如 xxx.test.ts / xxx.config.ts / xxx.spec.ts / xxx.d.ts
const FILENAME_REGEX = /^[a-z0-9]+([-_][a-z0-9]+)*(\.[a-zA-Z0-9]+)+$/;

/**
 * 获取 git 暂存区中新增（A）或重命名（R）的文件
 */
function getStagedFiles() {
  try {
    // --diff-filter=ARC：只获取 Added, Renamed, Copied 的文件
    const output = execSync('git diff --cached --name-only --diff-filter=ARC', {
      encoding: 'utf8',
      stdio: 'pipe', // 避免输出干扰
    });
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error('❌ 获取 git 暂存文件失败，请确保在 git 仓库中运行。');
    process.exit(1);
  }
}

/**
 * 检查文件名是否符合命名规范（kebab-case 或 snake_case）
 * @param {string} filename - 文件名（含扩展名）
 * @returns {boolean}
 */
function isValidFilename(filename) {
  // 基本格式检查
  if (!FILENAME_REGEX.test(filename)) {
    return false;
  }

  // 检查是否同时包含中划线和下划线（不允许混合使用）
  const hasHyphen = filename.includes('-');
  const hasUnderscore = filename.includes('_');
  if (hasHyphen && hasUnderscore) {
    return false;
  }

  return true;
}

// 🚀 开始检查
const stagedFiles = getStagedFiles();
const targetFiles = stagedFiles.filter(file => {
  return EXTENSIONS.some(ext => file.endsWith(ext));
});

const invalidFiles = targetFiles.filter(file => {
  const basename = path.basename(file); // 只检查文件名，不检查路径

  // 排除自动生成的文件
  if (EXCLUDED_FILES.includes(basename)) {
    return false;
  }

  // 排除 uni_modules 目录下的文件（第三方模块）
  if (file.includes('uni_modules/')) {
    return false;
  }

  return !isValidFilename(basename);
});

if (invalidFiles.length > 0) {
  console.error('\x1b[31m❌ [文件命名规范错误] 以下文件名不符合命名规范：\x1b[0m');
  invalidFiles.forEach(f => console.error(`  ➤ ${f}`));
  console.error('');
  console.error('\x1b[33m💡 正确格式示例（支持 kebab-case 和 snake_case）：\x1b[0m');
  console.error('   ✅ user-profile.vue  (kebab-case)');
  console.error('   ✅ user_profile.js   (snake_case)');
  console.error('   ✅ api-service.ts    (kebab-case)');
  console.error('   ✅ api_service.ts   (snake_case)');
  console.error('   ✅ utils.js          (单单词)');
  console.error('');
  console.error('\x1b[33m🚫 禁止格式：\x1b[0m');
  console.error('   ❌ UserProfile.vue   (PascalCase)');
  console.error('   ❌ myComponent.ts    (camelCase)');
  console.error('   ❌ user-profile_old.js (混合使用)');
  console.error('');
  console.error('\x1b[36m📌 请重命名文件后重新 git add 并提交。\x1b[0m');
  console.error(
    '\x1b[36m📌 注意：同一文件中只能使用一种分隔符（中划线或下划线），不能混合使用。\x1b[0m'
  );
  process.exit(1); // 阻止 git commit
} else {
  console.log('✅ 所有新增/重命名文件名符合命名规范（kebab-case 或 snake_case）');
}
