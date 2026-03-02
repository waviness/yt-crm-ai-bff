<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

const tabbarStore = useTabbarStore();
const { items, activeIndex, settings, showTabbar } = storeToRefs(tabbarStore);

const handleChange = (index: number) => {
  tabbarStore.updateActiveIndex(index);
  router.redirect(items.value[index].path);
};
</script>

<template>
  <up-tabbar
    v-if="showTabbar"
    :custom-style="{
      boxShadow: '0 1px 6px 0.5px #d1cfcf',
      borderRadius: '10px 10px 0 0',
    }"
    :zIndex="600"
    :value="activeIndex"
    :inactive-color="settings.inactiveColor"
    :active-color="settings.activeColor"
    @change="handleChange"
  >
    <template v-for="item of items" :key="item.path">
      <up-tabbar-item :text="item.text">
        <template v-slot:active-icon>
          <app-icon
            :name="item.activeIcon"
            :size="settings.activeSize"
            :color="settings.activeColor"
          >
          </app-icon>
        </template>
        <template v-slot:inactive-icon>
          <app-icon
            :name="item.activeIcon"
            :size="settings.inactiveSize"
            :color="settings.inactiveColor"
          >
          </app-icon>
        </template>
      </up-tabbar-item>
    </template>
  </up-tabbar>
</template>

<style lang="scss" scoped>
:deep(.up-tabbar-item__text) {
  font-size: 20rpx;
}
</style>
