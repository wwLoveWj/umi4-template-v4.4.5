const express = require("express");
const cors = require("cors");
const path = require("path");
const WS_MODULE = require("ws");
const client = require("./utils/redis"); //redis的配置模块
const http = require("http");
//token解析中间件 一定要在路由之前配置解析 Token 的中间件
const expressJWT = require("express-jwt");
// 导入全局配置文件（里面有token的密钥）
const { jwtConfig } = require("./utils/config");
const { camelCaseKeys } = require("./utils");
const db = require("./utils/mysql");
const notificationService = require("./routers/notice/notificationService");
const WebSocketServer = require("./routers/chat/websocket");

// 将所有的路由接口按不同文件分类，自定义router模块
const scoreRouter = require("./routers/scores");
const userRouter = require("./routers/users/index.js");
const roleRouter = require("./routers/roles");
const menuRouter = require("./routers/menu/index.js");
const articleRouter = require("./routers/article");
const reminderRouter = require("./routers/reminderTasks/index.js");
const tasksRouter = require("./routers/tasks/index.js");
const fileRouter = require("./routers/file.js");
const mailRouter = require("./routers/mails/index.js");
const linkRouter = require("./routers/link.js");
const loginRouter = require("./routers/login/index.js");
const registerRouter = require("./routers/login/register.js");
const excelRouter = require("./routers/excel/index.js");
const feedingRouter = require("./routers/baby/index.js");
const calendarRouter = require("./routers/calendar/index.js");
const eventRouter = require("./routers/event/index.js");
// const scanCodeRouter = require("./routers/login/scanCode.js");
const scanLoginRouter = require("./routers/scan/index.js");
const articleAppRouter = require("./routers/article-app/index.js");
const imgUploadAppRouter = require("./routers/article-app/img.js");
const goalsRouter = require("./routers/goals");
const noticeRouter = require("./routers/notice/notifications.js");
const chatRouter = require("./routers/chat/chat.js");

const app = express();
const port = 3007;
// 创建websocket监听端口
const server = http.createServer(app);
// wss = new WS_MODULE.Server({ server });

app.use(cors());
// 用于解析JSON类型的请求体
app.use(express.json());
// 用于解析URLEncoded的请求体
app.use(express.urlencoded({ extended: true }));

// 挂载静态文件路径，让外部可以直接访问到服务器文件
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.static(path.join(__dirname, "upload")));

// 注册全局中间件  链式调用 unless 方法，接收一个配置对象，path 字段设置一个正则表达式，表示不需要 token 身份认证的路由前缀。
app.use(
  expressJWT
    .expressjwt({
      // 加密时设置的密钥
      secret: jwtConfig.jwtSecretKey,
      // 设置算法
      algorithms: ["HS256"],
      // 无token请求不进行解析，并且抛出异常
      // credentialsRequired: false
    })
    .unless({
      path: [
        {
          url: /^\/login\/.*/,
          methods: ["GET", "POST"],
        },
        {
          url: /^\/scan\/.*/,
          methods: ["GET", "POST"],
        },
        {
          url: /^\/event\/.*/,
          methods: ["GET", "POST"],
        },
        // "/login/index",
        // "/login/register",
        "/scan",
        "/imgOCR",
        "/mail/send",
        "/code/send",
        // "/article/query",
        // "/task/query",
        // "/task/create",
        // "/excel/import",
        // "/excel/export",
        {
          url: /^\/api\/album\/.*/,
          methods: ["GET", "POST"],
        },
        {
          url: /^\/userInfo\/.*/,
          methods: ["GET", "POST"],
        },
        {
          url: /^\/api\/chat\/.*/,
          methods: ["GET", "POST", "PUT", "DELETE"],
        },
      ],
    })
);

// 对路由进行分区划分
app.use("/userInfo", userRouter);
app.use("/auth", roleRouter);
app.use("/menu", menuRouter);
app.use("/scoreInfo", scoreRouter);
app.use("/article", articleRouter);
app.use("/reminder", reminderRouter);
app.use("/task", tasksRouter);
app.use("/file", fileRouter);
app.use("/mail", mailRouter);
app.use("/login", loginRouter);
// app.use("/scan", scanCodeRouter);
app.use("/code", registerRouter);
app.use("/link", linkRouter);
app.use("/excel", excelRouter);
app.use("/feeding", feedingRouter);
app.use("/calendar", calendarRouter);
app.use("/event", eventRouter);
app.use("/scan", scanLoginRouter);
app.use("/api/article", articleAppRouter);
app.use("/api/album", imgUploadAppRouter);
app.use("/goals", goalsRouter);
app.use("/notice", noticeRouter);
// 注册聊天路由
app.use("/api/chat", chatRouter);

// 错误中间件 当token失效时 返回信息
app.use((err, req, res, next) => {
  console.log(err.code, "----------------------------------", err);
  console.dir(err.code, "401", err);
  if (err.code === "credentials_required") {
    res.status(401).send({
      code: 0,
      data: null,
      msg: "身份认证失败！",
    });
  } else if (err.code === "invalid_token") {
    res.status(401).send({
      code: 0,
      data: null,
      msg: "登录过期，请重新登录！",
    });
  }
});
// 获取讯飞星火大模型的签名url
app.get("/api/getModelInfo", (req, res) => {
  const sqlStr = "select * from api_info";
  db.query(sqlStr, (err, rows) => {
    if (err) return console.log(err.message);
    rows = rows.map((item) => camelCaseKeys(item));
    const { apiKey, apiSecret, appId } = rows[0];
    res.send({
      code: 1,
      msg: "success",
      data: {
        APIKey: apiKey,
        APISecret: apiSecret,
        APPID: appId,
      },
    });
  });
});

// =====================文章实时编辑=======================
// 将文章数据实时插入到redis中
const realTimeSyncData = (data, ws) => {
  // editorKey是redis保存的对应key
  const { editorContent, editorKey, isEditMode } = data;
  //存入redis
  client.set(editorKey, editorContent).then((info) => {
    console.log("成功存入redis-----", info);
    ws.send(!isEditMode ? "文章新增成功~" : "文章更新成功~");
  });
};
// wss.on("connection", function connection(ws) {
//   //   ws.on("pong", function () {
//   //     // 收到客户端响应，心跳检测成功
//   //     console.log("Pong received.");
//   //   });
//   ws.on("message", function incoming(data) {
//     if (data.toString() === "heartbeat") {
//       console.log(data.toString(), "心跳应答");
//       ws.send(data.toString());
//       return;
//     }
//     // 获取编辑器传递的所有数据信息
//     const allInfo = JSON.parse(data);
//     console.log(allInfo, "----------allInfo------------");
//     realTimeSyncData(allInfo, ws);
//   });
// });

server.listen(port, async () => {
  console.log("服务器已开启，端口号：" + port);
  // 启动WebSocket服务器
  const wss = new WebSocketServer(server);
  console.log("WebSocket服务器已启动", wss);
  try {
    // 初始化通知服务，传入WebSocket服务器实例而不是HTTP服务器
    await notificationService.initializeWithWss(wss);
    console.log("通知服务初始化成功");
  } catch (error) {
    console.error("通知服务初始化失败:", error);
  }
});

// 优雅关闭
process.on("SIGTERM", async () => {
  console.log("收到SIGTERM信号，正在关闭服务器...");
  await notificationService.close();
  server.close(() => {
    console.log("服务器已关闭");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("收到SIGINT信号，正在关闭服务器...");
  await notificationService.close();
  server.close(() => {
    console.log("服务器已关闭");
    process.exit(0);
  });
});
// app.listen(3007, () => {
//   console.log("服务开启在3007端口~");
// });
