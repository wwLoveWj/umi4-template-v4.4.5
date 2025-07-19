const { sendMail } = require("./email");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
// 生成一个长度为 6 的随机字符串
const code = Math.random().toString().slice(2, 8);

const tempList = [
  { value: "../../public/email.html", key: "TASK_TIMING_REMINDER" },
  { value: "../../public/code.html", key: "VERIFICATION_CODE_REMINDER" },
  { value: "../../public/tempMail.html", key: "GOOD_NEWS_REMINDER" },
];
const sendMailTemp = async (address) => {
  // 读取 HTML 模板文件
  // ejs || html
  const htmlPath = path.join(__dirname, "../../public/code.html");
  const emailTemplate = fs.readFileSync(htmlPath, "utf-8");
  // 使用 EJS 替换验证码
  const validity = 5; // 有效期5min
  const emailConfig = {
    code,
    importantReminder: "维生素和铁",
    validity,
    name: "亲爱的老公大人",
    nickname: "尊敬的大人",
    content: "xxx通知",
  };
  const emailHtml = ejs.render(emailTemplate, emailConfig);
  // await this.redisService.set("/login", code, validity * 60);
  await sendMail({
    to: address,
    subject: "健康提醒",
    html: emailHtml,
  });

  // 链接：https://juejin.cn/post/7299621996249366591
};

module.exports = {
  sendMailTemp,
};
