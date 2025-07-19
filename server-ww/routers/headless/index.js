const puppeteer = require("puppeteer");

/** 获取无头浏览器打开页面的 某dom 高度 */
// export const calHeight = async (page: any, dom: string) => {
//   const scrollHeight = await page.$eval(dom, el => el.scrollHeight);
//   return scrollHeight;
// };

(async () => {
  // 启动无头浏览器
  const browser = await puppeteer.launch({ headless: true });

  // 创建一个新页面
  const page = await browser.newPage();

  // 执行测试操作
  await page.goto("https://www.baidu.com");
  // 打开目标网页
  //   await page.screenshot({ path: "pics/demo1.png", fullPage: true }); //截图
  //获取页面Dom对象form
  let form = await page.$("#form");
  //调用页面内Dom对象的screenshot 方法进行截图
  form.screenshot({
    path: "form.png",
  });
  // 设置视口高度
  // await page.setViewport({ width, height: height + y + 20 });
  // // 设置截图位置
  // await page.screenshot({ path: shotPath, clip: { x, y, height: height, width: width }, });

  // 原文链接：https://blog.csdn.net/qq_34539486/article/details/125561752
  const title = await page.title(); // 获取网页标题
  console.log("网页标题：", title);

  // 进行更多测试操作...

  await page.close();
  // 关闭浏览器
  await browser.close();
})();
