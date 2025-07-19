const WebSocket = require("ws");
const url = require("../utils/webUrl");
const wss = new WebSocket(url);

wss.on("error", (err) => {
  console.log(err, "错误");
});

wss.on("open", function open(e) {
  console.log("连接成功了", e);
  wss.send(
    JSON.stringify({
      header: {
        app_id: "your app_id",
        uid: "TEST",
      },
      parameter: {
        chat: {
          domain: "general",
          temperature: 0.5,
          max_tokens: 4096,
        },
      },
      payload: {
        message: {
          text: [
            {
              role: "user",
              content: "长白山适合什么时候去游玩，且有那可以景点推荐呢？",
            },
          ],
        },
      },
    })
  );
});

wss.on("message", function message(data) {
  const obj = JSON.parse(data);
  const texts = obj.payload.choices.text;
  texts.forEach((item) => {
    console.log(item.content);
  });
});

console.log(`WebSocket server is running on ${url}`);
