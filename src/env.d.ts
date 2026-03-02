/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_AUTHOR_API_PREFIX: string;
  readonly VITE_WEB_API_PREFIX: string;
  readonly VITE_WECHAT_API_PREFIX: string;
  readonly VITE_BIGDATA_API_PREFIX: string;
  readonly VITE_FONT_FAMILY_URL: string;
}
