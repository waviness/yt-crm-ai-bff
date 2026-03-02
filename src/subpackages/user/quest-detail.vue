<script setup lang="ts">
/**
 * 问卷详情页面
 * 展示问卷题目，支持填写和提交问卷
 */
/**
 * 问卷选项
 */
interface QuestionOption {
  value: number;
  label: string;
}

/**
 * 问卷题目
 */
interface Question {
  text: string;
  type: string;
  required: boolean;
  isNumber?: number;
  options: QuestionOption[];
  csDtlId: number;
}

/**
 * 问卷数据
 */
interface Questionnaire {
  title: string;
  questions: Question[];
}

// Store
const userStore = useUserStore();
const appStore = useAppStore();
// 路由参数
const csDocId = ref<string>('');
const routeStatus = ref<string>('');

// 响应式数据
const questionnaire = ref<Questionnaire>({
  title: '',
  questions: [],
});

const selectedAnswers = ref<(string[] | string)[]>([]);
const touchedRequired = ref<boolean[]>([]);
const submissionStatus = ref<boolean | null>(null);

/**
 * 是否已提交（根据路由参数 status 判断）
 */
const isSubmitted = computed((): boolean => {
  if (routeStatus.value !== undefined && routeStatus.value !== '') {
    return routeStatus.value === '2';
  }
  // 如果路由参数不存在，返回存储的状态或默认值 false
  return submissionStatus.value ?? false;
});

/**
 * 获取提交状态（从接口获取）
 */
const getSubmissionStatus = async (): Promise<boolean> => {
  if (!csDocId.value) {
    console.error('缺少问卷ID');
    return false;
  }

  const res = await QuestionnaireService.getDocUser({ csDocId: csDocId.value });
  return res && res.length > 0 && res[0].status === 2;
};

/**
 * 将后端数据转换为前端需要的格式
 */
const formatQuestionnaireData = (data: any): Questionnaire => {
  const questions: Question[] = data.crmSurveyDtlVOList.map((item: any) => {
    const options: QuestionOption[] = item.crmSurveyDtlOptionVOList.map((opt: any) => ({
      value: opt.csdoId,
      label: opt.optionContent,
    }));
    return {
      text: item.questionContent,
      type: item.type,
      required: item.must === 1,
      isNumber: item.isNumber,
      options: options,
      csDtlId: item.csDtlId,
    };
  });

  return {
    title: data.title,
    questions: questions,
  };
};

/**
 * 从响应数据中获取某题的答案（基于 selected 字段）
 */
const getAnswerFromResponse = (csDtlId: number, questions: any[]): string | string[] => {
  const q = questions.find((item: any) => item.csDtlId === csDtlId);
  if (!q) return '';

  // 单选题：找到 selected=1 的选项 value
  if (+q.type === 1) {
    const option = q.crmSurveyDtlOptionVOList.find((opt: any) => opt.selected === 1);
    return option ? String(option.csdoId) : '';
  }

  // 多选题：收集所有 selected=1 的选项 value
  if (+q.type === 2) {
    const selectedOptions = q.crmSurveyDtlOptionVOList.filter((opt: any) => opt.selected === 1);
    return selectedOptions.map((opt: any) => String(opt.csdoId));
  }

  // 文本题：直接取 answerText
  if (+q.type === 3) {
    return q.answerText || '';
  }

  return '';
};

/**
 * 处理答案变化
 */
const handleAnswerChange = (index: number): void => {
  console.log('第', index + 1, '题答案:', selectedAnswers.value[index]);
  touchedRequired.value[index] = false;
};

/**
 * 判断某题是否未填写（仅用于样式判断）
 */
const isUnfilled = (index: number): boolean => {
  const q = questionnaire.value.questions[index];
  const answer = selectedAnswers.value[index];
  if (!q.required) return false;
  return answer === '' || (Array.isArray(answer) && answer.length === 0);
};

/**
 * 校验是否所有必填题都已填写
 */
const hasRequiredUnfilled = (): boolean => {
  for (let i = 0; i < questionnaire.value.questions.length; i++) {
    if (isUnfilled(i)) {
      return true;
    }
  }
  return false;
};

/**
 * 定位到第一个未填的必填题，并标记为 touched
 */
const scrollToFirstUnfilled = (): void => {
  for (let i = 0; i < questionnaire.value.questions.length; i++) {
    if (isUnfilled(i)) {
      touchedRequired.value[i] = true;
      const element = uni.createSelectorQuery().select(`[data-question-index="${i}"]`);
      element
        .boundingClientRect((data: any) => {
          if (data) {
            uni.pageScrollTo({
              scrollTop: data.top - 100,
              duration: 300,
            });
          }
        })
        .exec();
      break;
    }
  }
};

const submit = () => {
  if (hasRequiredUnfilled()) {
    scrollToFirstUnfilled();
    showToast('请填写必填项');
    return;
  }

  showModal({
    content: '是否确认提交该问卷',
    confirmText: '提交',
    success: res => {
      if (res.confirm) {
        confirmSubmit();
      }
    },
  });
};

/**
 * 确认提交
 */
const confirmSubmit = async () => {
  // 构造提交数据
  const submitData = {
    csDocId: Number(csDocId.value),
    crmSurveyResponseDtlReqList: [] as {
      csDtlId: number;
      answerOneId?: number | null;
      answerMoreList: number[];
      answerText: string;
      answerNumberValue?: number;
    }[],
  };

  questionnaire.value.questions.forEach((question: Question, index: number) => {
    const answer = selectedAnswers.value[index];
    const csDtlId = question.csDtlId;
    const item: {
      csDtlId: number;
      answerOneId?: number | null;
      answerMoreList: number[];
      answerText: string;
      answerNumberValue?: number;
    } = {
      csDtlId,
      answerMoreList: [],
      answerText: '',
      answerNumberValue: undefined,
    };

    if (+question.type === 1) {
      if (answer !== '') {
        item.answerOneId = Number(answer);
      }
    } else if (+question.type === 2) {
      if (Array.isArray(answer)) {
        item.answerMoreList = answer.map((v: string) => Number(v));
      }
    } else if (+question.type === 3) {
      if (typeof answer === 'string') {
        item.answerText = answer;
      }
    }

    // 如果该题是打分题（isNumber === 1），则设置 answerNumberValue
    if (question.isNumber === 1 && answer !== '' && +question.type === 1) {
      // 从选项中找到对应选项的optionContent，提取数值部分
      const selectedOption = question.options.find(
        (option: QuestionOption) => String(option.value) === String(answer)
      );
      if (selectedOption) {
        // 从optionContent中提取数值，例如"3分"提取为3
        const numberValue = parseFloat(selectedOption.label);
        if (!isNaN(numberValue)) {
          item.answerNumberValue = numberValue;
        }
      }
    }

    submitData.crmSurveyResponseDtlReqList.push(item);
  });

  await QuestionnaireService.submitSurvey(submitData);
  appStore.setHadDoneOnDetail(true);
  showSuccess('提交成功');
  router.back();
};

/**
 * 初始化问卷数据
 */
const initQuestionnaire = async (): Promise<void> => {
  const userId = userStore.userInfor.userId;

  if (!csDocId.value || !userId) {
    console.error('缺少问卷ID或用户ID');
    return;
  }

  // 获取提交状态
  if (routeStatus.value === undefined || routeStatus.value === '') {
    submissionStatus.value = await getSubmissionStatus();
  }

  const params = {
    completeFlag: isSubmitted.value ? 1 : 0,
    csDocId: Number(csDocId.value),
    userId: Number(userId),
  };

  const res = await QuestionnaireService.getPersonsSurvey(params);
  questionnaire.value = formatQuestionnaireData(res);

  // 初始化 selectedAnswers
  if (isSubmitted.value) {
    // 已提交，从响应中获取答案
    selectedAnswers.value = questionnaire.value.questions.map((q: Question) => {
      return getAnswerFromResponse(q.csDtlId, res.crmSurveyDtlVOList);
    });
  } else {
    // 未提交，初始化为空
    selectedAnswers.value = questionnaire.value.questions.map((q: Question) =>
      +q.type === 2 ? [] : ''
    );
  }
};

/**
 * 页面加载
 */
onLoad((opts: any) => {
  csDocId.value = opts.id || '';
  routeStatus.value = opts.status || '';
  initQuestionnaire();
});
</script>

<template>
  <view class="pb-100 bg-white min-h-screen">
    <!-- 问卷标题 -->
    <view class="text-18 font-semibold color-black-2 py-4 text-center bg-white">
      {{ questionnaire.title }}
    </view>

    <!-- 题目列表 -->
    <view class="bg-white rounded-3 p-5">
      <view
        v-for="(question, index) in questionnaire.questions"
        :data-question-index="index"
        :key="index"
        class="mb-5"
      >
        <!-- 题目描述 -->
        <view
          :class="[
            'text-14 color-black-2 mb-3',
            touchedRequired[index] && isUnfilled(index) ? 'color-danger' : '',
          ]"
        >
          {{ index + 1 }}.{{ question.text }}
          <text v-if="+question.type === 1">（单选）</text>
          <text v-if="+question.type === 2">（多选）</text>
          <text v-if="question.required" class="color-danger font-medium">（必填）</text>
        </view>

        <!-- 单选 -->
        <view v-if="+question.type === 1">
          <up-radio-group
            v-model="selectedAnswers[index]"
            placement="column"
            :disabled="isSubmitted"
            @change="handleAnswerChange(index)"
          >
            <up-radio
              v-for="(option, optIndex) in question.options"
              :key="optIndex"
              :name="String(option.value)"
              :label="option.label"
              labelSize="14"
              class="mb-3"
            />
          </up-radio-group>
        </view>

        <!-- 多选 -->
        <view v-else-if="+question.type === 2">
          <up-checkbox-group
            v-model="selectedAnswers[index]"
            placement="column"
            :disabled="isSubmitted"
            @change="handleAnswerChange(index)"
          >
            <up-checkbox
              v-for="(option, optIndex) in question.options"
              :key="optIndex"
              :name="String(option.value)"
              :label="option.label"
              labelSize="14"
              class="mb-3"
            />
          </up-checkbox-group>
        </view>

        <!-- 文字描述 -->
        <view v-else-if="+question.type === 3">
          <up-textarea
            v-model="selectedAnswers[index]"
            placeholder="请输入您的回答..."
            :disabled="isSubmitted"
            :maxlength="500"
            @input="handleAnswerChange(index)"
          />
        </view>
      </view>
    </view>

    <!-- 提交按钮（仅在未提交时显示） -->
    <app-bottom-actions v-if="!isSubmitted" :count="1">
      <app-action-btn text="提交" type="primary" @click="submit" />
    </app-bottom-actions>
  </view>
</template>
