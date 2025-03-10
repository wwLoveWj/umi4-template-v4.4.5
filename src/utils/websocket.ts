let websocket: any;
let timer: any = null;
let timerHeartbeat: any = null;
let timerWait: any = null;
let lockReconnect = false;
// 记录心跳包
let heartbeatStatus = "waiting";

function startHeartbeat() {
  timerHeartbeat = setTimeout(() => {
    // 将状态改为等待应答，并发送心跳包
    heartbeatStatus = "waiting";
    websocket.send("heartbeat");
    // 启动定时任务来检测刚才服务器有没有应答
    waitHeartbeat();
  }, 15000);
}

function waitHeartbeat() {
  timerWait = setTimeout(() => {
    console.log("检测服务器有没有应答过心跳包，当前状态", heartbeatStatus);
    if (heartbeatStatus === "waiting") {
      debugger;
      // 心跳应答超时
      websocket.close();
    } else {
      // 启动下一轮心跳检测
      startHeartbeat();
    }
  }, 1500);
}
// 重连请求
const reconnect = (url: string) => {
  if (lockReconnect) return; //没连接上会一直重连，设置延迟避免请求过多
  lockReconnect = true;
  setTimeout(function () {
    createWebSocket(url);
    lockReconnect = false;
  }, 4000);
};

// 监听心跳机制
const heartCheck = {
  timeout: 60000, //60秒
  timeoutObj: null,
  reset: function () {
    clearInterval(timer);
    return this;
  },
  start: function () {
    timer = setInterval(function () {
      //这里发送一个心跳，后端收到后，返回一个心跳消息，
      //onmessage拿到返回的心跳就说明连接正常
      // 设置心跳间隔和超时时间
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.ping(null, false, 30000); // 30秒心跳间隔，不发送数据
      } else {
        console.error("websocket 心跳机制断开了......");
      }
    }, this.timeout);
  },
};

// 1. 创建websocket连接
const createWebSocket = (url: string) => {
  websocket = new WebSocket(url);
  websocket.onopen = function () {
    // heartCheck.reset().start();
    // 启动成功后开启心跳检测
    startHeartbeat();
  };
  websocket.onerror = function () {};
  websocket.onclose = function (e: any) {
    clearTimeout(timerHeartbeat);
    clearTimeout(timerWait);
    reconnect(url);
    // websocket = null;
    lockReconnect = true;
    debugger;
    console.log(
      "websocket 断开: " + e.code + " " + e.reason + " " + e.wasClean
    );
  };
  // 这里会接收到后端发送的数据
  websocket.onmessage = function (event: any) {
    const { data } = event;
    console.log("心跳应答了，要把状态改为已收到应答", data);
    if (data === "heartbeat") {
      heartbeatStatus = "received";
    }
    lockReconnect = true; //event 为服务端传输的消息，在这里可以处理
  };
};

//关闭连接
const closeWebSocket = () => {
  websocket && websocket.close();
};

/**
 * websocket消息处理函数
 * @param msg websocket消息内容
 */
const websocketMsgHandler = (msg: string) => {
  if (websocket.readyState === WebSocket.OPEN) {
    websocket && websocket?.send(msg);
  } else {
    console.error("websocket 断开了......");
  }
};

export { websocket, createWebSocket, closeWebSocket, websocketMsgHandler };
