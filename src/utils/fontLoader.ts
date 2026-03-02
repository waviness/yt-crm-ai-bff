// 定义字体配置类型
interface FontConfig {
  family: string;
  source: string;
}

// 定义加载结果类型
export interface FontLoadResult {
  success: string[]; // 成功加载的字体名称
  error: Array<{ family: string; error: any }>; // 加载失败的字体信息
  timeout: string[]; // 超时的字体名称
}

const baseUrl = isMiniProgram()
  ? import.meta.env.VITE_FONT_FAMILY_URL
  : import.meta.env.VITE_FONT_PREFIX;

// 6个字体的配置（请替换为你的实际字体地址）
const fontConfig: FontConfig[] = [
  {
    family: 'HarmonyOS Sans SC Light',
    source: `url("${baseUrl}/static/fonts/HarmonyOS_Sans_Light.cc154965.ttf")`,
  },
  {
    family: 'HarmonyOS Sans SC',
    source: `url("${baseUrl}/static/fonts/HarmonyOS_Sans_Regular.48d656ed.ttf")`,
  },
  {
    family: 'HarmonyOS Sans SC Medium',
    source: `url("${baseUrl}/static/fonts/HarmonyOS_Sans_Medium.1ec44b30.ttf")`,
  },
  {
    family: 'HarmonyOS Sans SC Bold',
    source: `url("${baseUrl}/static/fonts/HarmonyOS_Sans_Bold.06fb3d4b.ttf")`,
  },
  {
    family: 'HarmonyOS Sans SC Thin',
    source: `url("${baseUrl}/static/fonts/HarmonyOS_Sans_Thin.b09cc100.ttf")`,
  },
  {
    family: 'HarmonyOS Sans SC Black',
    source: `url("${baseUrl}/static/fonts/HarmonyOS_Sans_Black.0180516a.ttf")`,
  },
];

/**
 * 批量加载字体
 * @param timeout 超时时间(ms)，默认10000ms
 * @returns 加载结果Promise
 */
export function loadFonts(timeout: number = 10000): Promise<FontLoadResult> {
  return new Promise(resolve => {
    const result: FontLoadResult = {
      success: [],
      error: [],
      timeout: [],
    };
    let completedCount = 0;

    // 超时处理函数
    const timeoutTimer = setTimeout(() => {
      // 收集所有未完成的字体
      fontConfig.forEach(font => {
        if (
          !result.success.includes(font.family) &&
          !result.error.some(item => item.family === font.family)
        ) {
          result.timeout.push(font.family);
        }
      });
      resolve(result);
    }, timeout);

    // 遍历加载所有字体
    fontConfig.forEach(font => {
      uni.loadFontFace({
        family: font.family,
        source: font.source,
        success: () => {
          console.log('✅ 字体可用');
          result.success.push(font.family);
          checkComplete();
        },
        fail: error => {
          console.log('⚠️ 字体加载但不可用');
          result.error.push({ family: font.family, error });
          checkComplete();
        },
      });
    });

    // 检查是否所有字体都已处理完毕
    function checkComplete() {
      completedCount++;
      if (completedCount === fontConfig.length) {
        clearTimeout(timeoutTimer);
        resolve(result);
      }
    }
  });
}
