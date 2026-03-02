#uniapp水印组件

> 兼容性支持：安卓、苹果、H5、微信小程序（其他平台未测试理论上支持）。不支持nvue！

优势

> 支持vue2 vue3，支持富文本、自动计算所需水印数量不卡顿、自定义旋转角度等
> 遇到问题或有建议可以加入QQ群(<font color=#f9ae3d>455948571</font>)反馈  
> 如果觉得组件不错，<font color=#f00>给五星鼓励鼓励</font>咯！

### 如果有使用问题请加群

注意：如果插件问题，请务必给一个完整的复现demo，谢谢配合；
[点击链接加入群聊前端开发（uniapp插件）】](https://qm.qq.com/q/S1bJzQfJAG)

一、使用示例

```html
<template>
  <view class="content">
    <next-watermark :watermark="watermark"></next-watermark>
  </view>
</template>
```

```js
// vue3
<script setup lang="ts">
import { ref } from 'vue'
import icon from '@/static/images/location.png'

const watermark = ref(`<h3>水印通用组件</h3><p style="color:#f00">我是p标签</p><br><img style="width:30px" src="${icon}" />`)

// const watermark = ref('管理员7434')
</script>
```

```js
// vue2
<script>
import icon from '@/static/images/location.png'
export default {
	data() {
		return {
			watermark: `<h3>水印通用组件</h3><p style="color:#f00">我是p标签</p><br><img style="width:30px" src="${icon}" />`
		}
	}
}
</script>
```

## 参数

可选参数属性列表

| 参数名    | 说明                                                    | 类型    | 是否必填 | 默认值 | 可选值 |
| --------- | ------------------------------------------------------- | ------- | -------- | ------ | ------ |
| watermark | 水印文字                                                | String  | 是       | 空     | -      |
| color     | 水印文字默认颜色                                        | String  | 否       | #000   | -      |
| show      | 是否显示水印                                            | Boolean | 是       | true   | -      |
| opacity   | 水印透明度                                              | Number  | 否       | 0.3    | -      |
| margin    | 水印外边距                                              | Number  | 否       | 50     | -      |
| rotate    | 水印旋转角度                                            | Number  | 否       | -21    | -      |
| maxWidth  | 单条水印最大宽度                                        | Number  | 否       | 180    | -      |
| fontSize  | 水印字体大小配置（单位px）                              | Number  | 否       | -      | -      |
| customTop | 水印自定义top配置（默认会自动取安全栏的高度）（单位px） | Number  | 否       | -      | -      |
