import { menuRoutes } from "./menuRoutes";

const routes: API.MenuRoutesType[] = [
  //   {
  //     path: "/exception",
  //     layout: false,
  //     routes: [
  //       {
  //         key: "404",
  //         path: "/exception/404",
  //         component: "./exception/404",
  //       },
  //       {
  //         key: "403",
  //         path: "/exception/403",
  //         component: "./exception/403",
  //       },
  //     ],
  //   },
  {
    path: "/demo",
    component: "@/pages/demo", // 加载login登录页面
    layout: false,
  },
  {
    path: "/login",
    component: "@/pages/login", // 加载login登录页面
    layout: false,
  },
  {
    path: "/qrLogin",
    component: "@/pages/qrLogin", // 扫码登录页面
    layout: false,
  },
  {
    path: "/qrLogin/confirm",
    component: "@/pages/qrLogin/confirm", // 扫码确认页面
    layout: false,
  },
  {
    path: "/qrTest",
    component: "@/pages/qrLogin/test", // 扫码测试页面
    layout: false,
  },
  {
    path: "/qrDebug",
    component: "@/pages/qrLogin/debug", // 扫码调试页面
    layout: false,
  },
  {
    path: "/forgetPwd",
    component: "@/pages/login/components/ResetPwd",
  },
  {
    path: "/",
    component: "@/layouts/SecurityLayout", // 主页加载layout公共组件
    layout: false,
    routes: [
      {
        path: "/",
        exact: true,
        hidden: true,
        redirect: "/qrLogin",
      },
      ...menuRoutes,
    ],
  },
  //   {
  //     path: "*",
  //     component: "./exception/404",
  //     redirect: "/exception/404",
  //     layout: false,
  //   },
];
export default routes;
