import { defineConfig, loadEnv, type Plugin } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import AutoImport from 'unplugin-auto-import/vite';
import path from 'path';
import visualizer from 'rollup-plugin-visualizer';
// 强制 HMR 刷新
function forceRefresh(): Plugin {
  return {
    name: 'force-refresh',
    handleHotUpdate({ file, server }) {
      // 当任何 .ts 文件更新时，强制刷新页面
      if (file.endsWith('.ts') || file.endsWith('.vue')) {
        server.ws.send({
          type: 'full-reload',
          path: '*',
        });
        return [];
      }
    },
  };
}

interface ProxyConfig {
  target: string;
  changeOrigin?: boolean;
  rewrite?: (path: string) => string;
}

function buildProxies(source: Record<string, string>) {
  return Object.entries(source).reduce(
    (acc, [key, value]) => {
      acc[key] = {
        target: value,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(new RegExp(`^${key}`), ''),
      };
      return acc as Record<string, ProxyConfig>;
    },
    {} as Record<string, ProxyConfig>
  );
}

export default defineConfig(async ({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');

  const UnoCss = await import('unocss/vite').then(i => i.default);

  return {
    base: './',
    plugins: [
      uni(),
      UnoCss(),
      forceRefresh(),
      AutoImport({
        imports: ['vue', 'uni-app', 'pinia'],
        dirs: ['src/api/**/*.ts', 'src/composables', 'src/config', 'src/store', 'src/utils'],
        dts: 'src/auto-imports.d.ts',
        // 解决eslint报错
        eslintrc: {
          enabled: true,
        },
      }),
      visualizer({
        open: false, // 构建后自动打开分析报告
        gzipSize: true, // 显示 gzip 压缩后的体积
        brotliSize: true, // 显示 brotli 压缩后的体积
        filename: './stats.html', // 报告输出路径
        template: 'treemap', // 可视化类型
      }),
    ],
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: buildProxies({
        [env.VITE_AUTHOR_API_PREFIX]: env.VITE_AUTHOR_API_URL,
        [env.VITE_WEB_API_PREFIX]: env.VITE_WEB_API_URL,
        [env.VITE_WECHAT_API_PREFIX]: env.VITE_WECHAT_API_URL,
        [env.VITE_BIGDATA_API_PREFIX]: env.VITE_BIGDATA_API_URL,
        [env.VITE_FONT_PREFIX]: env.VITE_FONT_FAMILY_URL,
      }),
      // 解决微信小程序开发者工具热更新问题
      hmr: {
        overlay: false,
        clientPort: 3000,
      },
      watch: {
        usePolling: true,
        interval: 1000,
        ignored: ['**/dist/**', '**/node_modules/**', '**/.git/**'],
      },
      open: true,
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        // 将 zrender 映射到包根目录，避免导入时被解析为 zrender/lib/zrender.js/... 的错误路径
        // zrender: path.resolve(__dirname, 'node_modules/zrender'),
      },
    },

    css: {
      preprocessorOptions: {
        scss: {
          implementation: require('sass'),
          additionalData: `@import "./src/uni.scss";`,
        },
      },
    },

    esbuild: {
      // 仅在生产环境下去除 console 和 debugger
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  };
});
