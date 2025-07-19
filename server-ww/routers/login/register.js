const express = require("express");
const {
  sendMailFn,
  createCode,
  htmlCode,
  failMsg,
  successTip,
} = require("../../utils");
const { mailInfoFn } = require("../../utils/config");
const client = require("../../utils/redis");

const router = express.Router();
//发送验证码邮件
router.post("/send", function (req, res) {
  let code = createCode(); //随机生成验证码
  const mail = req.body.mail; //请求携带的邮件
  console.log(mail, "mail---------------code", code);
  let mailOptions = {
    // TODO:这里得考虑一下怎么处理
    from: `发送方<${mailInfoFn("blww885@163.com").user}>`, // 发送方
    to: `接收方<${mail}>`, //接收者邮箱，多个邮箱用逗号间隔
    subject: `欢迎登录,你的验证码${code}`, // 标题
    html: htmlCode(code),
  };

  //存入redis
  client.set(mail, code).then((info) => {
    console.log(mail, code, "info-----", info);
    //设置成功发送邮件
    // TODO:第三个参数不能写死，待思考
    sendMailFn(mailOptions, res, "blww885@163.com", "验证码发送成功~");
  });
  client.expire(mail, 60); //设置过期时间 60s 前端六十秒可以重新获取
});

//通过验证码登录
router.post("/code/login", function (req, response) {
  /* 这里 用户名就是 邮件 密码就是code */
  const { mail, code } = req.body;
  client.get(mail).then((res) => {
    //从redis查询数据
    if (code == res) {
      console.log("验证成功");
      successTip("验证成功", res);
    } else {
      console.log("验证失败");
      failMsg("验证失败", res);
    }
  });
});

// 原文链接：https://blog.csdn.net/qq_31754591/article/details/123991487
module.exports = router;
