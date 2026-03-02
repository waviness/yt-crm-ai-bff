<script setup lang="ts">
const userStore = useUserStore();
const { permissions } = storeToRefs(userStore);

interface Props {
  value: string | string[];
}

const props = defineProps<Props>();

const show = ref(false);

const checkPermission = () => {
  if (typeChecker.isString(props.value)) {
    show.value = permissions.value.includes(props.value);
  } else if (typeChecker.isArray(props.value)) {
    show.value = props.value.some(item => permissions.value.includes(item));
  }
};

onMounted(() => {
  checkPermission();
});
</script>

<template>
  <view v-if="show">
    <slot> </slot>
  </view>
</template>
