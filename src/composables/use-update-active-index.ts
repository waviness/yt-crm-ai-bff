const getIndexByRoute = () => {
  const currentRoute = router.getCurrentRoute()!;
  const route = '/' + currentRoute.route;
  const tabbarStore = useTabbarStore();
  const homeIdx = tabbarStore.items.findIndex((item: any) => item.path === RouteMap.home);
  const userIdx = tabbarStore.items.findIndex((item: any) => item.path === RouteMap.user);

  switch (route) {
    case RouteMap.home:
      return homeIdx;

    case RouteMap.user:
      return userIdx;

    case RouteMap.dashboard:
    default:
      return 0;
  }
};

const useUpdateActiveIndex = () => {
  const tabbarStore = useTabbarStore();
  const index = getIndexByRoute();
  onShow(() => {
    tabbarStore.updateActiveIndex(index);
  });
};

export default useUpdateActiveIndex;
