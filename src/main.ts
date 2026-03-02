import { createSSRApp } from 'vue';
import { createPinia } from 'pinia';
import uView from 'uview-plus';
import App from './App.vue';
import { CachePiniaPlugin } from './store/plugins/cache';
import { initVConsole } from './utils/vconsole';
import 'uno.css';

initVConsole();

export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();

  app.use(uView, () => {
    return {
      options: {
        // props 用于设置组件的默认 props 值
        props: {
          popup: {
            zIndex: 888, // 弹出层 zIndex
          },
          modal: {
            zIndex: 888, // 模态框 zIndex
          },
          toast: {
            zIndex: 888, // 轻提示 zIndex
          },
          actionSheet: {
            zIndex: 888, // 动作面板 zIndex
          },
          sticky: {
            zIndex: 870, // 粘性布局 zIndex
          },
        },
        config: {
          loadFontOnce: true,
        },
      },
    };
  });

  // 注册缓存插件
  pinia.use(CachePiniaPlugin);
  app.use(pinia);

  return {
    app,
    pinia,
  };
}
