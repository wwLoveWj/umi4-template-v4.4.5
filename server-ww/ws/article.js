// 文章实时编辑
const WebSocket = require("ws");
const client = require("../utils/redis"); //redis的配置模块

const wss = new WebSocket.Server({ port: 8080 });

// 将文章数据实时插入到redis中
const realTimeSyncData = (data, ws) => {
  // editorKey是redis保存的对应key
  const { editorContent, editorKey, action } = data;
  //存入redis
  client.set(editorKey, editorContent).then((info) => {
    console.log("成功存入redis-----", info);
    ws.send(action === "A" ? "文章新增成功~" : "文章更新成功~");
  });
};
wss.on("connection", function connection(ws) {
  //   ws.on("pong", function () {
  //     // 收到客户端响应，心跳检测成功
  //     console.log("Pong received.");
  //   });
  ws.on("message", function incoming(data) {
    if (data.toString() === "heartbeat") {
      console.log(data.toString(), "心跳应答");
      ws.send(data.toString());
      return;
    }
    // 获取编辑器传递的所有数据信息
    const allInfo = JSON.parse(data);
    console.log(allInfo, "----------allInfo------------");
    realTimeSyncData(allInfo, ws);
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
