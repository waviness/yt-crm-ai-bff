<template>
  <view class="h-full">
    <app-watermark />
    <!-- 筛选条件 -->
    <up-sticky :bgColor="treeShow ? '#ffffff' : '#f5f6f9'" offset-top="0" :custom-nav-height="0">
      <view id="topicFilterBar" class="pa-2">
        <view
          :class="[
            'filter-box',
            treeShow ? 'color-main' : '',
            filterText !== '条件筛选' ? 'filter-box--active' : '',
            treeShow ? 'filter-box--opened' : '',
          ]"
          @click="treeShow = !treeShow"
        >
          <view>{{ filterText }}</view>
          <uni-icons :type="treeShow ? 'up' : 'down'" size="16" />
        </view>
      </view>
    </up-sticky>

    <!-- 内容区域 -->
    <app-empty v-if="!list || !list.length" description="暂无拜访记录" />
    <view v-else class="pa-2">
      <view v-for="(item, idx) in list" :key="idx" class="topic-card mb-2">
        <view class="topic-card__time">{{ item.visitTime }}</view>

        <view class="topic-row">
          <view class="topic-row__label">医院</view>
          <view class="topic-row__value">{{ item.companyName || '-' }}</view>
        </view>

        <view class="topic-row">
          <view class="topic-row__label">业务员</view>
          <view class="topic-row__value">{{ item.userName || '-' }}</view>
        </view>

        <view class="topic-remark-block">
          <view class="topic-row topic-row--remark">
            <view class="topic-row__label">备注</view>
            <view class="topic-row__value topic-row__value--remark">{{ item.remark || '无' }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 筛选弹窗 -->
    <up-popup
      v-model:show="treeShow"
      mode="top"
      :round="10"
      :customStyle="{ marginTop: popupOffsetTop }"
      :overlayStyle="{ top: popupOffsetTop }"
    >
      <view class="filter-panel">
        <view class="filter-body">
          <view class="filter-sidebar">
            <view
              v-for="(item, index) in labelTreeList"
              :key="item.id"
              :class="['filter-sidebar__item', activeIndex === index ? 'active' : '']"
              @click="onSelectParent(index)"
            >
              {{ item.text }}
            </view>
          </view>
          <view class="filter-content">
            <view
              v-for="child in currentChildren"
              :key="child.id"
              :class="['filter-content__item', activeId === child.id ? 'active' : '']"
              @click="activeId = child.id"
            >
              {{ child.text }}
            </view>
          </view>
        </view>
        <view class="filter-footer">
          <up-button shape="circle" text="重置" @click="reset" class="flex-1 mr-2" />
          <up-button shape="circle" text="确认" type="primary" @click="onConfirm" class="flex-1" />
        </view>
      </view>
    </up-popup>

    <!-- 切换按钮 -->
    <app-fix-btn
      :text="active === 1 ? '协访' : '拜访'"
      :icon="`${active === 1 ? 'xingzhuangjiehe1' : 'a-xingzhuangjiehe2'}`"
      @click="handleClick"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { CommonService } from '@/api/common';
import type { TopicItem } from './types';

const treeShow = ref(false);
const activeId = ref<number>(-1);
const activeIndex = ref(0);
const labelTreeList = ref<any[]>([]);
const active = ref(1);
const personVisit = ref<TopicItem[]>([]);
const leaderVisit = ref<TopicItem[]>([]);
const list = ref<TopicItem[]>([]);
const filterText = ref('条件筛选');
const popupOffsetTop = ref('88rpx');

const normalizeTopicItem = (raw: any): TopicItem & { companyName?: string; userName?: string } => {
  return {
    smallTagName: raw?.smallTagName || raw?.labelName || raw?.LABEL_NAME || '',
    visitTime: raw?.visitTime || raw?.VISIT_TIME || raw?.createTime || raw?.CREATE_TIME || '',
    remark: raw?.remark || raw?.REMARK || raw?.content || raw?.CONTENT || '',
    labelId: raw?.labelId ?? raw?.LABEL_ID ?? raw?.label_id,
    companyName:
      raw?.companyName ||
      raw?.company ||
      raw?.company_name ||
      raw?.COMPANY_NAME ||
      raw?.custName ||
      raw?.CUST_NAME ||
      raw?.hospitalName ||
      raw?.HOSPITAL_NAME,
    userName:
      raw?.userName ||
      raw?.visitUserName ||
      raw?.VISIT_USER_NAME ||
      raw?.saleName ||
      raw?.SALE_NAME ||
      raw?.salerName ||
      raw?.SALER_NAME,
  };
};

const syncPopupOffsetTop = () => {
  nextTick(() => {
    const query = uni.createSelectorQuery();
    query
      .select('#topicFilterBar')
      .boundingClientRect((rect: any) => {
        if (!rect) return;
        popupOffsetTop.value = `${rect.bottom}px`;
      })
      .exec();
  });
};

watch(treeShow, val => {
  if (val) {
    syncPopupOffsetTop();
  }
});

const onSelectParent = (index: number) => {
  activeIndex.value = index;
  activeId.value = labelTreeList.value[index]?.children?.[0]?.id ?? -1;
};

// 当前选中的子节点列表
const currentChildren = computed(() => {
  if (activeIndex.value === 0) {
    return [];
  }
  return labelTreeList.value[activeIndex.value]?.children || [];
});

// 筛选结果
const typeResult = computed(() => {
  if (activeIndex.value === 0) {
    return null;
  } else if (activeId.value < 0) {
    const arr = labelTreeList.value[activeIndex.value].children
      .map((item: any) => +item.id)
      .filter((id: number) => id > 0); // 过滤掉"全部"选项
    return arr;
  } else {
    return [+activeId.value];
  }
});

// 获取标签树
const getLabelTree = async () => {
  try {
    const res = await CommonService.getLabelTree({ type: '1' });
    if (Array.isArray(res)) {
      labelTreeList.value = res.map((item: any, idx: number) => {
        let children: any[] = [];
        if (item.CHILD_LIST && item.CHILD_LIST.length) {
          children = item.CHILD_LIST.map((ele: any) => ({
            id: ele.LABEL_ID,
            text: ele.LABEL_NAME,
          }));
        }
        return {
          id: item.LABEL_ID,
          text: item.LABEL_NAME,
          children: [{ id: -idx - 2, text: '全部' }, ...children],
        };
      });
      labelTreeList.value.unshift({ id: -1, text: '全部', children: [] });
      onSelectParent(labelTreeList.value.length > 1 ? 1 : 0);
    }
  } catch (error) {
    console.error('获取标签树失败:', error);
  }
};

// 切换拜访/协访
const handleClick = () => {
  active.value = active.value === 1 ? 2 : 1;
  list.value = active.value === 1 ? personVisit.value : leaderVisit.value;
  reset();
};

// 重置
const reset = () => {
  activeId.value = -1;
  activeIndex.value = 0;
};

// 确认
const onConfirm = () => {
  treeShow.value = false;
  if (activeIndex.value === 0) {
    filterText.value = '条件筛选';
  } else if (activeId.value < 0) {
    filterText.value = `${labelTreeList.value[activeIndex.value].text}/全部`;
  } else {
    const target = labelTreeList.value[activeIndex.value].children.find(
      (item: any) => item.id === activeId.value
    );
    filterText.value = `${labelTreeList.value[activeIndex.value].text}/${target?.text || ''}`;
  }
  filterList();
};

// 筛选列表
const filterList = () => {
  const tempList = active.value === 1 ? personVisit.value : leaderVisit.value;
  if (typeResult.value && typeResult.value.length > 0) {
    list.value = tempList.filter((item: any) => typeResult.value!.includes(item.labelId));
  } else {
    list.value = tempList;
  }
};

onLoad((options: any) => {
  try {
    personVisit.value = options.personVisit
      ? JSON.parse(decodeURIComponent(options.personVisit)).map((it: any) => normalizeTopicItem(it))
      : [];
    leaderVisit.value = options.leaderVisit
      ? JSON.parse(decodeURIComponent(options.leaderVisit)).map((it: any) => normalizeTopicItem(it))
      : [];
    list.value = personVisit.value;
    getLabelTree();
  } catch (error) {
    console.error('解析参数失败:', error);
    list.value = [];
  }
});
</script>

<style lang="scss" scoped>
.topic-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
}

.topic-card__time {
  font-size: 12px;
  color: #969799;
  text-align: right;
  margin-bottom: 8px;
}

.topic-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}

.topic-row__label {
  width: 120rpx;
  flex-shrink: 0;
  color: #969799;
  font-size: 12px;
}

.topic-row__value {
  flex: 1;
  text-align: right;
  font-size: 12px;
  font-weight: 700;
  color: #323233;
}

.topic-remark-block {
  background: #eef0f3;
  border-radius: 0 0 8px 8px;
  margin: 0 -12px -12px;
  padding: 8px 12px 12px;
}

.topic-row__value--remark {
  font-weight: 400;
  line-height: 1.4;
}

.topic-row:last-child {
  margin-bottom: 0;
}

.filter-box {
  border-radius: 10px;
  background: #fff;
  height: 40px;
  line-height: 40px;
  padding: 0 10px 0 20px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &--active {
    color: #fff;
    background: #2271f5;
  }

  &--opened {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.visit-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  &__content {
    font-size: 14px;
    color: #323233;
    line-height: 1.6;
  }
}

.filter-panel {
  display: flex;
  flex-direction: column;
  height: 60vh;
  background: #fff;
}

.filter-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.filter-sidebar {
  width: 30%;
  background: #f7f8fa;
  height: 100%;
  overflow-y: auto;

  &__item {
    padding: 12px 16px;
    font-size: 14px;
    color: #323233;

    &.active {
      background: #fff;
      color: #2271f5;
      font-weight: bold;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 16px;
        background: #2271f5;
        border-radius: 0 2px 2px 0;
      }
    }
  }
}

.filter-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  height: 100%;

  &__item {
    padding: 10px 16px;
    font-size: 14px;
    color: #323233;
    border-radius: 4px;
    margin-bottom: 4px;

    &.active {
      color: #2271f5;
      font-weight: bold;
      background: #ecf5ff;
    }
  }
}

.filter-footer {
  padding: 12px 16px;
  display: flex;
  border-top: 1px solid #ebedf0;
  background: #fff;
  position: relative;
  z-index: 1;
}
</style>
