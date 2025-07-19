const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

// 模拟内存中的扫码会话
const scanSessions = {};

// 模拟扫码时创建会话
router.post("/login", (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.json({ success: false, msg: "缺少sessionId" });
  }
  // 假设扫码时创建会话
  scanSessions[sessionId] = {
    status: "scanned",
    userInfo: {
      username: "扫码用户",
      loginName: sessionId,
      email: "",
      avatar: "",
    },
  };
  res.json({
    code: 1,
    msg: "",
    data: {
      status: "scanned",
      userInfo: scanSessions[sessionId].userInfo,
      needConfirm: true,
    },
    // success: true,
    // data: {
    //   status: "scanned",
    //   userInfo: scanSessions[sessionId].userInfo,
    //   needConfirm: true,
    // },
  });
});

// 确认登录接口
router.get("/login/confirm", (req, res) => {
  const { sessionId, action } = req.query;
  if (!sessionId || action !== "confirm") {
    return res.json({ success: false, msg: "参数错误" });
  }
  // 检查会话
  const session = scanSessions[sessionId];
  if (!session) {
    return res.json({ success: false, msg: "无效的sessionId" });
  }
  // 生成token
  const token = "token-" + sessionId + "-" + Date.now();
  // 更新会话状态
  scanSessions[sessionId].status = "confirmed";
  scanSessions[sessionId].token = token;
  res.json({
    success: true,
    data: {
      token,
      userInfo: session.userInfo,
    },
  });
});

// 获取用户信息（可选）
router.get("/user/info", (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId || !scanSessions[sessionId]) {
    return res.json({ success: false, msg: "无效的sessionId" });
  }
  res.json({
    success: true,
    data: scanSessions[sessionId].userInfo,
  });
});

router.get("/user/scanInfo", (req, res) => {
  if (Object.keys(scanSessions)?.length <= 0) {
    return res.json({ success: false, msg: "无效的sessionId" });
  }
  res.json({
    success: true,
    data: {
      status: "scanned",
      userInfo: scanSessions[sessionId].userInfo,
      needConfirm: true,
    },
  });
});
module.exports = router;
