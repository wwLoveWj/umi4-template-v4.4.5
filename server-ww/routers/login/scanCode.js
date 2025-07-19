const { message } = require("antd");
const express = require("express");
const qrcode = require("qrcode");
const OAuth = require("wechat-oauth");
const http = require("http");
const WebSocket = require("ws");

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello World\n");
});

// 监听端口
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`HTTP Server is running on port ${port}`);
});
// 创建WebSocket服务器，使用HTTP服务器实例
const wss = new WebSocket.Server({ server });

const appId = "wx6bc8afb5d3b1477f";
const appSecret = "8f00cadb95c2a925b336f50094f5d0b5";
const redirectURI = encodeURIComponent(
  "http://7d8cdd4d.r16.vip.cpolar.cn/scan/auth/wechat/callback"
);
const oauth = new OAuth(appId, appSecret, redirectURI);
const router = express.Router();
router.get("/login", async (req, res) => {
  //   const authUrl = oauth.getAuthorizeURL(
  //     redirectURI,
  //     "STATE",
  //     "snsapi_userinfo"
  //   );
  //   console.log(authUrl, "authUrl--------------999", oauth);
  const qrCodeDataUrl =
    //   await qrcode.toDataURL(authUrl);
    await qrcode.toDataURL(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6bc8afb5d3b1477f&redirect_uri=${redirectURI}&response_type=code&scope=snsapi_userinfo&forcePopup=true&state=STATE#wech
    at_redirect`);
  res.send({ code: 1, msg: "扫码成功", data: qrCodeDataUrl });
});

router.get("/auth/wechat/callback", (req, res) => {
  const code = req.query.code;
  console.log("进来了吗");
  oauth.getAccessToken(code, (err, access_token, expires_in, refresh_token) => {
    console.log(access_token, "access_token-------------999");
    if (err) {
      console.error(err, "667-------------");
      return res.status(500).send("Error");
    }
    // https://api.weixin.qq.com/cgi-bin/user/info?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN
    // oauth.getUserProfile(access_token, (err, data) => {
    //   if (err) {
    //     console.error(err);
    //     return res.status(500).send("Error");
    //   }

    //   // 此处你可以存储用户信息到数据库
    //   console.log("User Info:", data);
    //   //   res.json(data);
    //   res.send({
    //     code: "1",
    //     message: "登陆陈宫",
    //     data: data,
    //   });
    res.send(
      "\
        <h1>" +
        "王维" +
        " 的个人信息</h1>\
        <p><img src='" +
        888 +
        "' /></p>\
        <p>" +
        "重庆" +
        "，" +
        "四川" +
        "，" +
        "中国" +
        "</p>" +
        "<h2>恭喜你登陆成功</h2>\
    "
    );
    // 监听连接建立事件
    // wss.on("connection", function (socket) {
    //   console.log("WebSocket连接已建立");

    //   // 监听接收到客户端发送的消息
    //   socket.on("message", function (message) {
    //     console.log("接收到户端发送的消息：" + message);
    //     // const sqlStr = "select * from task_info";
    //     // db.query(sqlStr, (err, rows) => {
    //     //   if (err) {
    //     //     return console.log(err.message);
    //     //   }
    //     //   // 查询数据成功
    //     //   rows = rows.map((item) => camelCaseKeys(item));
    //     //   socket.send("任务信息查询成功！");
    //     //   return;
    //     // });
    //     // // 向客户端发送消息
    //     // socket.send("Hello Client!");
    //   });
    //   socket.send("/home");
    //   // 监听连接关闭事件
    //   socket.on("close", function () {
    //     console.log("WebSocket连接已关闭");
    //   });
    // });

    // window.location.href = "http://localhost:8000/home";
    // 这里可以是任何你想要重定向到的URL
    // res.redirect("http://localhost:8000/home");
    // });
  });
});

module.exports = router;
