const { createTransport, createTestAccount } = require("nodemailer");

/**
 * 邮件发送方法
 * @param {*} title       发送主题
 * @param {*} sendToWho  发送给谁
 * @param {*} content       发送的模板格式
 */
const sendMail = async ({ sendToWho, title, content }) => {
  // console.log(testAccount, "测试账户");
  const transporter = createTransport({
    host: "smtp.163.com", //qq的为"smtp.qq.com"
    port: 465,
    secure: true,
    auth: {
      user: "ewew334343@163.com", // 你的邮箱地址
      pass: "rerer5454545", // 你的授权码
    },
  });
  console.log(transporter, "测试账户");
  // 真正发送邮件方法
  await transporter.sendMail(
    {
      from: {
        name: "系统",
        address: "trtr5656565@163.com", // 你的邮箱地址
      },
      to: sendToWho,
      subject: title,
      html: content,
    },
    (error, info) => {
      if (error) {
        debugger;
        return console.log(error);
      }
      console.log("邮件发送成功~", info.response);

      createNotification("邮件发送~~~~", {
        body: "发送成功了红红火火恍恍惚惚~",
      });
    }
  );
};

// sendEmail.js
const EmailSender = require("./emailSender.ts");

// 配置 SMTP 服务器信息
const config = {
  host: "smtp.163.com", // 替换为你的 SMTP 服务器地址
  port: 465, // 替换为你的 SMTP 服务器端口
  secure: true, // 如果使用 TLS，则设置为 true
  auth: {
    user: "xxx@163.com", // 你的邮箱地址
    pass: "4343errerer", // 你的授权码
  },
};

// 定义邮件选项
const mailOptions = {
  from: '"Your Name" <your-email@example.com>', // 发件人
  to: "recipient@example.com", // 收件人
  subject: "Hello ✔", // 主题
  text: "Hello world?", // 纯文本内容
  html: "<b>Hello world?</b>", // HTML 内容
};

// 发送邮件
const sendEmail = ({ sendToWho, title, content }) => {
  // 创建 EmailSender 实例
  const emailSender = new EmailSender(config);
  debugger;
  return emailSender
    .sendEmail({
      from: {
        name: "系统",
        address: "xxxx@163.com", // 你的邮箱地址
      },
      to: sendToWho,
      subject: "问题",
      html: "<h1>Hello world?</h1>",
    })
    .then((response) => {
      if (response.success) {
        console.log(
          `Email sent successfully with message ID: ${response.messageId}`
        );

        // createNotification("邮件发送~~~~", {
        //   body: "发送成功了红红火火恍恍惚惚~",
        // });
      } else {
        console.error("Failed to send email:", response.error);
      }
    });
};
// const net = require("net");

// console.log(net.isIP("127.0.0.1")); // 应该输出 4 (IPv4)
// console.log(net.isIP("::1")); // 应该输出 6 (IPv6)
// console.log(net.isIP("invalid")); // 应该输出 0 (无效的 IP)

module.exports = sendEmail;
