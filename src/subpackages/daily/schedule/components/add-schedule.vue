<script setup lang="ts">
import { useScheduleOperations } from '../composables/use-schedule-operations';
import CustomInfo from './custom-info.vue';

defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  dateTitle: string;
  fatherDetail: any;
  nowDetailList: any[];
}

const props = withDefaults(defineProps<IProps>(), {
  dateTitle: '',
  fatherDetail: () => ({}),
  nowDetailList: () => [],
});

const emit = defineEmits<{
  insertScheduleSuccess: [];
}>();

const { insertSchedule } = useScheduleOperations();

// 状态
const showAdd = ref(false);
const showStatus = ref(false);
const isAuto = ref(false);
const iskq = ref(false);

const statusMap = {
  '0': '在岗办公',
  '1': '本地出差',
  '2': '外地出差',
  '3': '请假/调休',
};

const nowDetail = ref<any>({
  morRemark: '',
  aftRemark: '',
  mor: '',
  aft: '',
});

const morStatus = ref('');
const aftStatus = ref('');
const nowKey = ref('mor');
const nowStatus = ref('');

const customInfoRef = ref();

/**
 * 初始化
 */
const init = (key?: string, day?: string) => {
  showAdd.value = true;

  if (key && key === 'auto') {
    // AUTO 模式
    nowDetail.value = {
      morRemark: '',
      aftRemark: '',
      mor: '',
      aft: '',
    };
    morStatus.value = '';
    aftStatus.value = '';
    isAuto.value = true;
    iskq.value = false;
  } else if (key && key === 'kq') {
    // 客情模式
    nowDetail.value = JSON.parse(JSON.stringify(props.fatherDetail));
    morStatus.value = props.fatherDetail.mor ? props.fatherDetail.mor.scheduleType : '';
    aftStatus.value = props.fatherDetail.aft ? props.fatherDetail.aft.scheduleType : '';
    isAuto.value = false;
    iskq.value = true;

    nextTick(() => {
      customInfoRef.value?._getUserVisit(day);
    });
  } else {
    // 普通编辑模式
    nowDetail.value = JSON.parse(JSON.stringify(props.fatherDetail));
    morStatus.value = props.fatherDetail.mor ? props.fatherDetail.mor.scheduleType : '';
    aftStatus.value = props.fatherDetail.aft ? props.fatherDetail.aft.scheduleType : '';
    isAuto.value = false;
    iskq.value = false;
  }
};

/**
 * 编辑状态
 */
const editStatus = (key: string) => {
  if (iskq.value) {
    return;
  }
  nowKey.value = key;
  if (key === 'mor') {
    nowStatus.value = morStatus.value;
  } else {
    nowStatus.value = aftStatus.value;
  }
  showStatus.value = true;
};

/**
 * 选择状态
 */
const chooseStatus = (status: string) => {
  if (nowStatus.value !== status) {
    nowStatus.value = status;
  }
  backAdd();
};

/**
 * 返回
 */
const backAdd = () => {
  if (nowKey.value === 'mor') {
    morStatus.value = nowStatus.value;
  } else {
    aftStatus.value = nowStatus.value;
  }
  showStatus.value = false;
};

/**
 * 同步一天
 */
const tbSubmit = () => {
  aftStatus.value = morStatus.value;
  nowDetail.value.aftRemark = nowDetail.value.morRemark;
  handleInsert();
};

/**
 * 提交
 */
const handleInsert = () => {
  if (!morStatus.value && !aftStatus.value) {
    showToast('日程未录入');
    return;
  }

  if (isAuto.value) {
    // AUTO 模式：批量填充未来一周
    const params = [];
    for (let i = 0; i < 5; i++) {
      const detail = props.nowDetailList[i];
      const nowDate = new Date().toLocaleDateString();
      const date1 = Date.parse(nowDate);
      const choose = detail.chooseDate.slice(0, 10).replace(/-/g, '/');
      const date2 = Date.parse(choose);

      if (date2 < date1) {
        continue;
      }

      if (
        !(
          date2 < date1 ||
          (detail.mor && (detail.mor.scheduleType || detail.mor.scheduleType === 0))
        )
      ) {
        params.push({
          timeSlot: 1,
          scheduleDate: detail.chooseDate,
          scheduleType: morStatus.value,
          remark: nowDetail.value.morRemark,
        });
      }

      if (
        !(
          date2 < date1 ||
          (detail.aft && (detail.aft.scheduleType || detail.aft.scheduleType === 0))
        )
      ) {
        params.push({
          timeSlot: 2,
          scheduleDate: detail.chooseDate,
          scheduleType: aftStatus.value,
          remark: nowDetail.value.aftRemark,
        });
      }
    }

    if (params.length > 0) {
      _insertSchedule(params);
    } else {
      showToast('本周日程已维护');
      showAdd.value = false;
    }
  } else {
    // 普通模式：单日编辑
    const params = [];
    params.push({
      cusId: nowDetail.value.mor.cusId,
      timeSlot: 1,
      scheduleDate: nowDetail.value.chooseDate,
      scheduleType: morStatus.value,
      remark: nowDetail.value.morRemark,
    });
    params.push({
      cusId: nowDetail.value.aft.cusId,
      timeSlot: 2,
      scheduleDate: nowDetail.value.chooseDate,
      scheduleType: aftStatus.value,
      remark: nowDetail.value.aftRemark,
    });
    _insertSchedule(params);
  }
};

/**
 * 执行插入
 */
const _insertSchedule = (params: any[]) => {
  insertSchedule(params, () => {
    emit('insertScheduleSuccess');
    showAdd.value = false;
  });
};

// 暴露方法
defineExpose({
  init,
});
</script>

<template>
  <up-popup :show="showAdd" mode="right" @close="showAdd = false" style="height: 100%; width: 100%">
    <view class="add-schedule">
      <!-- 客情标题 -->
      <view v-show="iskq" class="kq-title" @click="showAdd = false">
        <up-icon name="arrow-left" class="kq-icon" />
        <text style="margin-left: 10px">{{ dateTitle }}</text>
      </view>

      <!-- 上午 -->
      <view class="time-title">
        <text v-show="!isAuto && !iskq">{{ dateTitle }}</text>
        <text>上午</text>
      </view>

      <view class="add-status" @click="editStatus('mor')">
        <text>状态</text>
        <view :class="'schedule-status status-' + (statusMap[morStatus] ? morStatus : '')">
          <text>{{ statusMap[morStatus] || '未设置状态' }}</text>
          <up-icon v-show="!iskq" name="arrow-right" color="#BABABA" class="status-icon" />
        </view>
      </view>

      <view class="add-remark">
        <text>备注</text>
        <up-textarea
          v-model="nowDetail.morRemark"
          class="textarea-field"
          placeholder="请输入备注"
          :disabled="iskq"
          auto-height
          border="none"
        />
      </view>

      <!-- 下午 -->
      <view class="time-title">
        <text v-show="!isAuto && !iskq">{{ dateTitle }}</text>
        <text>下午</text>
      </view>

      <view class="add-status" @click="editStatus('aft')">
        <text>状态</text>
        <view :class="'schedule-status status-' + (statusMap[aftStatus] ? aftStatus : '')">
          <text>{{ statusMap[aftStatus] || '未设置状态' }}</text>
          <up-icon v-show="!iskq" name="arrow-right" color="#BABABA" class="status-icon" />
        </view>
      </view>

      <view class="add-remark">
        <text>备注</text>
        <up-textarea
          v-model="nowDetail.aftRemark"
          class="textarea-field"
          placeholder="请输入备注"
          :disabled="iskq"
          auto-height
          border="none"
        />
      </view>

      <!-- 客情信息 -->
      <CustomInfo v-show="iskq" ref="customInfoRef" :father-detail="fatherDetail" />

      <!-- 按钮 -->
      <view v-show="!iskq" class="add-buttons">
        <view class="add-button-1" @click="tbSubmit">同步一天</view>
        <view class="add-button-2" @click="showAdd = false">取消</view>
        <view class="add-button-3" @click="handleInsert">确认</view>
      </view>

      <!-- 状态选择弹窗 -->
      <up-popup
        :show="showStatus"
        mode="right"
        @close="showStatus = false"
        style="width: 100%; height: 100%"
      >
        <view class="status-lines">
          <view class="back-lines" @click="backAdd">
            <up-icon name="arrow-left" class="back-icon" />
            <text>新建日程</text>
          </view>

          <view
            v-for="(data, key) in statusMap"
            :key="key"
            :class="'status-line status-' + key"
            @click="chooseStatus(key)"
          >
            {{ data }}
            <up-icon v-show="key === nowStatus" name="checkmark" class="status-choose-icon" />
          </view>

          <view class="status-line status-" @click="chooseStatus('')">
            未设置状态
            <up-icon v-show="!statusMap[nowStatus]" name="checkmark" class="status-choose-icon" />
          </view>
        </view>
      </up-popup>
    </view>
  </up-popup>
</template>

<style scoped>
.add-schedule {
  width: 100%;
  height: 100%;
  padding: 2px 10px 0;
  box-sizing: border-box;
  background: #f5f6f9;
  overflow: hidden scroll;
}

.kq-title {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  margin-top: 10px;
  padding-left: 10px;
  border-radius: 10px;
  background: #fff;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.kq-icon {
  transform: rotate(90deg);
  font-size: 17px;
}

.time-title {
  margin-top: 10px;
  font-size: 14px;
  color: #7f7f7f;
}

.time-title text:first-child {
  margin-right: 16px;
  color: #323233;
}

.add-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 52px;
  margin-top: 10px;
  border-radius: 10px;
  background: #fff;
  padding: 0 16px;
  font-size: 14px;
  box-sizing: border-box;
}

.schedule-status {
  position: relative;
  height: 17.5px;
  line-height: 17.5px;
  padding-left: 26px;
  color: #323233;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.schedule-status::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 17.5px;
  height: 17.5px;
  border-radius: 50%;
  background: #94969b;
}

.status-icon {
  font-size: 10px;
  margin-left: 15px;
}

.add-remark {
  width: 100%;
  min-height: 123px;
  border-radius: 10px;
  margin-top: 8px;
  padding: 16px;
  box-sizing: border-box;
  font-size: 14px;
  background: #fff;
}

.textarea-field {
  padding: 0;
  margin-top: 15px;
  font-size: 14px;
}

.add-buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 50px;
  padding: 0 11.5px;
  box-sizing: border-box;
}

.add-buttons view {
  width: 100px;
  height: 40px;
  border-radius: 41.5px;
  box-shadow: 0 0 6px 2.5px rgb(209 207 207 / 50%);
  line-height: 40px;
  text-align: center;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
}

.add-button-1 {
  background: #fff;
  color: #2271f5;
}

.add-button-2 {
  height: 36px;
  line-height: 36px;
  background: #fff;
  color: #333;
  border: #2271f5 2px solid;
}

.add-button-3 {
  background: #2271f5;
  color: #fff;
}

.status-lines {
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  background: #f5f6f9;
  z-index: 10;
}

.back-lines {
  display: flex;
  align-items: center;
  width: 100%;
  height: 52px;
  font-size: 16px;
  color: #2271f5;
  background: #fff;
  padding-left: 8px;
  border-radius: 10px;
  box-sizing: border-box;
}

.back-icon {
  font-size: 10px;
  margin-right: 8px;
}

.status-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-top: 8px;
  width: 100%;
  height: 52px;
  padding-left: 41.5px;
  padding-right: 17.5px;
  border-radius: 10px;
  color: #323233;
  font-size: 14px;
  background: #fff;
  box-sizing: border-box;
}

.status-line::before {
  content: '';
  position: absolute;
  left: 16px;
  top: 17.5px;
  width: 17px;
  height: 17px;
  border-radius: 50%;
}

.status-choose-icon {
  font-size: 12px;
  font-weight: bold;
  color: #2271f5;
}

.status-0::before {
  background: #00a870 !important;
}

.status-1::before {
  background: #0052d9 !important;
}

.status-2::before {
  background: #ed7b2f !important;
}

.status-3::before {
  background: #e34d59 !important;
}

.status-::before {
  background: #94969b !important;
}
</style>
