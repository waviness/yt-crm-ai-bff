# 组件源码修改记录

本文档记录了对 `uni_modules` 下第三方组件源码的修改，这些修改是项目特定的功能扩展。

## ⚠️ 重要提示

**所有修改的组件文件都需要团队成员同步，不要通过插件市场更新这些组件，否则会覆盖修改！**

---

## 📅 uv-calendars 组件修改

### 修改时间

2025-12-5

### 修改原因

1. 需要支持点击日期后自动选中整周功能（用于周报选择）
2. 需要支持自定义周起始日（支持周一、周六等不同起始日）
3. 修复 `choiceDate` 事件未触发的问题
4. 需要支持程序化设置日期范围

### 修改文件清单

| 文件路径                                                                 | 修改内容                   | 影响范围   |
| ------------------------------------------------------------------------ | -------------------------- | ---------- |
| `src/uni_modules/uv-calendars/components/uv-calendars/uv-calendars.vue`  | 新增 props、方法、事件     | 主组件     |
| `src/uni_modules/uv-calendars/components/uv-calendars/util.js`           | 支持 firstDayOfWeek        | 日历工具类 |
| `src/uni_modules/uv-calendars/components/uv-calendars/calendar-body.vue` | 动态周标题、firstDayOfWeek | 日历主体   |

### 新增功能

#### 1. `autoSelectWeek` 属性

**类型**: `Boolean`  
**默认值**: `false`  
**说明**: 在 `range` 模式下，点击日期后自动选择该日期所在周的整周范围（上周六到这周五）

**使用示例**:

```vue
<app-calendar mode="range" :auto-select-week="true" @confirm="handleConfirm" />
```

**实现逻辑**:

- 点击日期时，自动计算该日期所在周的整周范围
- 自动设置 `range.before` 和 `range.after`
- 无需用户点击两次即可选中整周

#### 2. `firstDayOfWeek` 属性

**类型**: `Number`  
**默认值**: `0`  
**说明**: 设置日历显示的周起始日

**可选值**:

- `0` - 周日（默认）
- `1` - 周一
- `2` - 周二
- `3` - 周三
- `4` - 周四
- `5` - 周五
- `6` - 周六

**使用示例**:

```vue
<app-calendar :first-day-of-week="1" @confirm="handleConfirm" />
```

**实现逻辑**:

- 动态调整周标题显示顺序
- 调整日历日期排列，确保每周第一天正确对齐
- 支持不同地区的周起始日习惯

#### 3. `setDateRange` 方法

**说明**: 程序化设置日期范围（用于 range 模式）

**参数**:

- `startDate: string` - 开始日期（ISO 格式：YYYY-MM-DD）
- `endDate: string` - 结束日期（ISO 格式：YYYY-MM-DD）

**使用示例**:

```vue
<script setup>
const calendarRef = ref();

const setRange = () => {
  calendarRef.value.setDateRange('2024-10-11', '2024-10-17');
};
</script>

<template>
  <app-calendar ref="calendarRef" mode="range" />
</template>
```

#### 4. `choiceDate` 事件修复

**问题**: 原组件 `choiceDate` 事件未向外触发  
**修复**: 在 `choiceDate` 方法中添加 `this.$emit('choiceDate', weeks)`

**使用示例**:

```vue
<app-calendar @choice="handleDateChoice" />
```

### 代码修改详情

#### uv-calendars.vue

**新增 Props**:

```javascript
// 是否自动选择整周
autoSelectWeek: {
  type: Boolean,
  default: false
},
// 周起始日
firstDayOfWeek: {
  type: Number,
  default: 0
}
```

**新增方法**:

```javascript
// 计算整周范围
calcWeekRange(dateStr) {
  // 计算上周六到这周五的范围
}

// 设置日期范围
setDateRange(startDate, endDate) {
  // 程序化设置日期范围
}
```

**修改方法**:

```javascript
choiceDate(weeks) {
  // 如果 autoSelectWeek=true，自动选择整周
  if (this.autoSelectWeek && this.range) {
    const weekRange = this.calcWeekRange(this.calendar.fullDate)
    this.setDateRange(weekRange.startDate, weekRange.endDate)
  }
  // 修复：向外触发 choiceDate 事件
  this.$emit('choiceDate', weeks)
}
```

#### util.js

**修改构造函数**:

```javascript
constructor({
  // ... 其他参数
  firstDayOfWeek = 0
} = {}) {
  this.firstDayOfWeek = firstDayOfWeek
}
```

**修改 \_getWeek 方法**:

```javascript
_getWeek(dateData) {
  let firstDay = new Date(year, month - 1, 1).getDay()
  // 根据 firstDayOfWeek 调整 firstDay
  if (this.firstDayOfWeek !== 0) {
    firstDay = (firstDay - this.firstDayOfWeek + 7) % 7
  }
  // ... 后续逻辑
}
```

#### calendar-body.vue

**新增 Props**:

```javascript
firstDayOfWeek: {
  type: Number,
  default: 0
}
```

**新增计算属性**:

```javascript
weekDayLabels() {
  // 根据 firstDayOfWeek 动态生成周标题数组
  const labels = [
    { day: 0, text: this.SUNText },
    { day: 1, text: this.monText },
    // ...
  ]
  // 重新排序
  return sortedLabels
}
```

**修改模板**:

```vue
<!-- 使用 v-for 动态渲染周标题 -->
<view class="uv-calendar__weeks uv-calendar__weeks-week">
  <view v-for="(label, index) in weekDayLabels" :key="index">
    <text>{{label.text}}</text>
  </view>
</view>
```

### 使用场景

#### 周报日期选择

```vue
<template>
  <app-calendar
    ref="calendarRef"
    mode="range"
    :first-day-of-week="6"
    :auto-select-week="true"
    :date="dateRange"
    @choice="handleDateChoice"
    @confirm="calendarConfirm"
  />
</template>

<script setup>
// 点击日期后自动选中整周（上周六到这周五）
const handleDateChoice = (e: any) => {
  const clickDate = new Date(e.fullDate || e.fulldate)
  initWeekDate(clickDate)
}

// 确认时直接使用选中的范围
const calendarConfirm = (value: any) => {
  setWeekDateRange(value.range.before, value.range.after, _getReportDtl)
}
</script>
```

### 注意事项

#### ⚠️ 升级警告

1. **不要通过插件市场更新 `uv-calendars` 组件**
   - 更新会覆盖所有修改
   - 如需升级，需要手动合并修改

2. **团队成员同步**
   - 拉取代码后，确保这些文件已同步
   - 如果文件冲突，优先保留项目修改

3. **Git 提交**
   - 提交时添加清晰的说明
   - 在 PR 中标注组件修改

#### 🔧 维护建议

1. **定期检查**
   - 检查组件是否有安全更新
   - 评估是否需要合并官方更新

2. **文档同步**
   - 修改组件时，同步更新本文档
   - 记录修改原因和影响范围

3. **测试验证**
   - 修改后进行全面测试
   - 确保所有功能正常工作

### 回退方案

如果修改出现问题，可以：

1. **使用 Git 回退**

   ```bash
   git checkout HEAD -- src/uni_modules/uv-calendars/
   ```

2. **从备份恢复**
   - 如果有备份，直接恢复文件

3. **重新安装组件**
   - 从插件市场重新安装（会丢失所有修改）

### 未来计划

如果出现以下情况，考虑提取到本地组件：

- [ ] 组件频繁升级，需要频繁合并
- [ ] 修改范围进一步扩大
- [ ] 团队规范要求不修改 uni_modules
- [ ] 项目进入稳定期，需要更好的代码组织

---

## 📝 其他组件修改

### 待添加...

如果未来有其他组件修改，请在此处添加记录。

---

## 🔗 相关链接

- [组件使用指南](./03_components_guide.md)
- [项目主 README](../README.md)
- [uv-calendars 官方文档](https://ext.dcloud.net.cn/plugin?name=uv-calendar)

---

**最后更新**: 2025-12-5  
**维护者**: 开发团队  
**版本**: 1.0.0
