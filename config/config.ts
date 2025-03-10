import { defineConfig } from "umi";
import routes from "../src/routes";
import { PROJECT_CONFIG } from "../src/constant/constant";
import path from "path";
// https证书
// https://blog.csdn.net/weixin_44240581/article/details/115291060
const isPrd = process.env.NODE_ENV === "production";
export default defineConfig({
  title: "React项目模板",
  mountElementId: PROJECT_CONFIG.NAME,
  history: { type: "hash" },
  base: "/",
  // https: {
  //   // ca: "./localhost.pem", // 公钥证书路径
  //   cert: "./localhost.crt", // 公钥证书路径
  //   key: "./localhost-key.pem", // 私钥路径
  //   http2: false,
  // }, // 启用 HTTPS

  publicPath: isPrd ? "./" : "/",
  // TODO:启用initialState、model配置需要安装@umijs/plugins包，
  // 并在下面plugins配置两个插件：@umijs/plugins/dist/initial-state、@umijs/plugins/dist/model
  //   initialState: {},
  //   model: {}, // 使用useModel需要这个配置

  // locale: {},
  // icons: {},
  // mfsu默认开启，需要开启按需加载 extraBabelPlugins，注意！！在本地qiankun下调试的时候需要关闭按需加载
  // mfsu: fasle,
  lessLoader: {
    javascriptEnabled: true,
    modifyVars: {
      // hack: 'true; @import "~@/styles/common.less";',
      "@ant-prefix": PROJECT_CONFIG.NAME + "-ant", // ant前缀 样式隔离
      /* 自定义less变量 */
      "@define-prefix": PROJECT_CONFIG.NAME,
      "@prefix": PROJECT_CONFIG.NAME,
    },
  },
  // qiankun: {
  //   slave: {},
  // },
  routes,
  proxy: {
    "/api": {
      target: "需要代理的地址",
      changeOrigin: true,
      pathRewrite: { "^": "" },
    },
  },
  // 配置别名，对引用路径进行映射。
  alias: {
    "@": path.resolve(__dirname, "src"),
    "@utils": "/src/utils",
    "@assets": "/src/assets",
    "@service": "/src/service",
  },
  // 配置插件
  //   plugins: [
  //     "@umijs/plugins/dist/initial-state",//有 src/app.ts 并且导出 getInitialState 方法时启用。’
  //     "@umijs/plugins/dist/model",
  //     // "@umijs/plugins/dist/locale",
  //     "umi-plugin-keep-alive",
  //   ],
  // TODO:如果编写mobile移动端可以设置rem转换配置，注意exclude: /node_modules|excludeFile\.css$/一定要填写，
  // 不然它会转换三方包antd mobile中的数据，导致二次转换出现错误，三方包组件页面字变得很小
  extraPostCSSPlugins: [
    require("postcss-px-to-viewport")(
      {
        unitToConvert: "px", // 需要转换的单位，默认为"px"
        viewportWidth: 320, // 设计稿的视口宽度
        unitPrecision: 5, // 单位转换后保留的精度
        propList: ["*"], // 能转化为vw的属性列表
        viewportUnit: "vw", // 希望使用的视口单位
        fontViewportUnit: "vw", // 字体使用的视口单位
        selectorBlackList: [], // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
        minPixelValue: 1, // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
        mediaQuery: false, // 媒体查询里的单位是否需要转换单位
        replace: true, //  是否直接更换属性值，而不添加备用属性
        exclude: /node_modules|excludeFile\.css$/, // 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
        include: undefined, // 如果设置了include，那将只有匹配到的文件才会被转换
        landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
        landscapeUnit: "vw", // 横屏时使用的单位
        landscapeWidth: 568, // 1920横屏时使用的视口宽度
      }
      // 原文链接：https://blog.csdn.net/sinat_17775997/article/details/127101590
    ),
  ],
  // 原文链接：https://blog.csdn.net/muge1161105403/article/details/123206562
});
