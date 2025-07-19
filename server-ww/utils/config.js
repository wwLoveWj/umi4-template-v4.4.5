// 全局配置文件 config.js
const nodemailer = require("nodemailer");
const yaml = require("js-yaml");
const path = require("path");
const fs = require("node:fs");

// ---------------------------邮件服务---------------------
// 读取邮件相关信息
const mailInfoFn = (currentUser) => {
  const mail = yaml.load(
    fs.readFileSync(path.join(__dirname, "./mail/setting.yaml"), "utf-8")
  );
  const userInfo = mail.find((item) => item.current === currentUser);
  return userInfo;
};

const getTransporter = (user) => {
  const mailInfo = mailInfoFn(user);
  // 首先初始化一下邮件服务
  const transporter = nodemailer.createTransport({
    //node_modules/nodemailer/lib/well-known/services.json  查看相关的配置，如果使用qq邮箱，就查看qq邮箱的相关配置
    // service: "qq", //服务商
    host: "smtp.163.com", //qq的为"smtp.qq.com"
    port: 465,
    secure: true, //是否开启https // true for 465, false for other ports
    //pass 不是邮箱账户的密码而是stmp的授权码（必须是相应邮箱的stmp授权码）
    //邮箱---设置--账户--POP3/SMTP服务---开启---获取stmp授权码
    auth: {
      user: mailInfo.user, //邮箱
      pass: mailInfo.pass, //密码|授权码
    },
  });
  return transporter;
};

// --------------------------jwt的相关配置----------------------------
const jwtConfig = {
  // 加密和解密 token 的密钥
  jwtSecretKey: "itheima No1. ^_^",
  // token 有效期
  expiresIn: "3d",
};

module.exports = {
  mailInfoFn,
  jwtConfig,
  getTransporter,
};
