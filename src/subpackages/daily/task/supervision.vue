<script setup lang="ts">
import TaskSupervisionList from './components/supervision-list.vue';
import TaskSupervisionDetail from './components/supervision-detail.vue';

const taskSupervisionDetailShow = ref(false);
const taskListObj = ref<any>({});

const taskListClick = (val: any) => {
  console.log(val);
  taskListObj.value = val;
  taskSupervisionDetailShow.value = true;
};

onUnload(() => {
  taskSupervisionDetailShow.value = false;
});
</script>

<template>
  <view class="h-full">
    <app-watermark> </app-watermark>
    <task-supervision-list @taskListClick="taskListClick"></task-supervision-list>
    <up-popup
      :show="taskSupervisionDetailShow"
      mode="right"
      :zIndex="998"
      :customStyle="{ width: '100vw', height: '100vh' }"
    >
      <task-supervision-detail
        v-if="taskSupervisionDetailShow"
        :item="taskListObj"
        @cancelClick="taskSupervisionDetailShow = false"
      ></task-supervision-detail>
    </up-popup>
  </view>
</template>
