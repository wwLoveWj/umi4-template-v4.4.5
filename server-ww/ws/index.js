const WebSocket = require("ws");
// const db = require("../utils/mysql");
// const { camelCaseKeys, handleQueryDb } = require("../utils");

// 创建WebSocket服务器
const wss = new WebSocket.Server({ port: 3007 });

module.exports = wss;
