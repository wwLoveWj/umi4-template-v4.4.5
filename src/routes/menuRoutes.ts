export const menuRoutes: API.MenuRoutesType[] = [
  /**
   * 菜单的配置项，用于动态渲染：
   *  key: 唯一标志
   *  title: 菜单项值（国际化已开启）
   *  path：用于路由跳转
   *  component：组件所在路径，从pages路径下开始
   *  icon：菜单图标
   *  hidden: 是否隐藏该菜单项
   *  routes：子级菜单项
   */
  {
    key: "detail",
    title: "Detail",
    path: "/detail",
    component: "./detail/index",
    hideTabBar: true, // 需要隐藏 TabBar 的页面
    showBack: true,
  },
  {
    key: "home",
    title: "首页",
    path: "/home",
    component: "./home/index",
  },
  {
    key: "event",
    title: "大事件",
    path: "/event",
    component: "./personalCenter/components/EventList",
    hideTabBar: true,
    showBack: true,
  },
  {
    key: "event",
    title: "事件记录",
    path: "/event/add",
    component: "./home/components/majorTabs/components/Add",
    hideTabBar: true, // 需要隐藏 TabBar 的页面
    showBack: true,
  },
  {
    key: "baby",
    title: "育儿",
    path: "/baby",
    component: "./baby/index",
  },
  {
    key: "baby/add",
    title: "喂养记录",
    path: "/baby/add",
    hideTabBar: true,
    component: "./baby/feeding/components/Add",
    showBack: true,
  },
  {
    key: "scan",
    title: "扫码",
    path: "/scan",
    component: "./scan/index",
  },
  {
    key: "notice",
    title: "通知",
    path: "/notice",
    component: "./notice/index",
  },
  {
    key: "notice/add",
    title: "创建通知",
    path: "/notice/add",
    component: "./notice/components/Add",
  },
  {
    key: "msg",
    title: "消息",
    path: "/msg",
    component: "./msg/index",
  },
  {
    key: "mail",
    title: "邮件信息",
    path: "/msg/sendMail",
    component: "./msg/components/SendMail",
    hideTabBar: true,
    showBack: true,
  },
  {
    key: "person",
    title: "个人中心",
    path: "/person",
    component: "./personalCenter/index",
  },
  {
    key: "goal",
    title: "我的目标",
    path: "/goal",
    component: "./personalCenter/components/WwGoal",
  },
  {
    key: "todo",
    title: "我的待办",
    path: "/todo",
    component: "./personalCenter/components/WwTodo",
    hideTabBar: true,
    showBack: true,
  },
  {
    key: "vaccination",
    title: "接种记录",
    path: "/vaccination",
    component: "./personalCenter/components/WwVaccination",
    hideTabBar: true,
    showBack: true,
  },
  {
    key: "article",
    title: "文章",
    path: "/article",
    component: "./article/index",
  },
  {
    key: "article-detail",
    title: "文章详情",
    path: "/article/detail/:id",
    component: "./article/detail",
    hideTabBar: true,
    showBack: true,
  },
  {
    key: "article-collections",
    title: "我的收藏",
    path: "/article/collections",
    component: "./article/collections",
    hideTabBar: true,
    showBack: true,
  },
  {
    key: "collect",
    title: "收藏",
    path: "/collect",
    component: "./personalCenter/components/WwCollect",
    hideTabBar: true,
    showBack: true,
  },
  {
    key: "tag",
    title: "标签",
    path: "/collect/tag",
    component: "./personalCenter/components/WwCollect/WwTag",
    hideTabBar: true,
  },
];
