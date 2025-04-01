import { Toast } from "antd-mobile";
// 解决 关于HBuilder X打包的APP按返回键退出的问题
document.addEventListener("plusready", function () {
  var first = null;
  debugger;
  // console.log('再按一次退出应用');//用自定义toast提示最好
  var webview = window.plus.webview.currentWebview();
  window.plus.key.addEventListener("backbutton", function () {
    webview.canBack(function (e) {
      if (e.canBack) {
        webview.back(); //这里不建议修改自己跳转的路径
      } else {
        //首次按键，提示‘再按一次退出应用’
        if (!first) {
          first = new Date().getTime(); //获取第一次点击的时间戳
          Toast.show("再按一次退出应用"); //用自定义toast提示最好
          // toast('双击返回键退出应用'); //调用自己写的吐丝提示 函数
          window.plus.nativeUI.toast("再按一次退出应用", {
            duration: "short",
          }); //通过H5+ API 调用Android 上的toast 提示框
          setTimeout(function () {
            first = null;
          }, 1000);
        } else {
          if (new Date().getTime() - first < 1000) {
            //获取第二次点击的时间戳, 两次之差 小于 1000ms 说明1s点击了两次
            window.plus.runtime.quit(); //退出应用
          }
        }
      }
    });
  });
});
