const express = require("express");
const router = express.Router();
const db = require("../utils/mysql");
const nodemailer = require("nodemailer");
const dayjs = require("dayjs");

/**
 * 获取目标列表
 * GET /goals?userId=xxx
 */
router.get("/", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.json({ code: 0, msg: "缺少userId" });
  const rows = await db.query(
    "SELECT * FROM goals WHERE userId = ? ORDER BY completed, deadline",
    [userId]
  );
  res.json({ code: 1, data: rows });
});

/**
 * 新建目标
 * POST /goals
 * body: { userId, title, type, deadline, reward, remindTimes }
 */
router.post("/", async (req, res) => {
  const { userId, title, type, deadline, reward, remindTimes } = req.body;
  if (!userId || !title) return res.json({ code: 0, msg: "缺少参数" });
  const result = await db.query(
    "INSERT INTO goals (userId, title, type, deadline, reward, remindTimes, completed) VALUES (?, ?, ?, ?, ?, ?, 0)",
    [userId, title, type, deadline, reward, JSON.stringify(remindTimes || [])]
  );
  res.json({ code: 1, data: { id: result.insertId } });
});

/**
 * 完成目标
 * POST /goals/:id/complete
 */
router.post("/:id/complete", async (req, res) => {
  const { id } = req.params;
  await db.query("UPDATE goals SET completed = 1 WHERE id = ?", [id]);
  res.json({ code: 1, msg: "目标已完成" });
});

/**
 * 设置/更新邮箱提醒
 * POST /goals/:id/remind
 * body: { remindTimes }
 */
router.post("/:id/remind", async (req, res) => {
  const { id } = req.params;
  const { remindTimes } = req.body;
  await db.query("UPDATE goals SET remindTimes = ? WHERE id = ?", [
    JSON.stringify(remindTimes || []),
    id,
  ]);
  res.json({ code: 1, msg: "提醒时间已更新" });
});

/**
 * 删除目标
 * DELETE /goals/:id
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM goals WHERE id = ?", [id]);
  res.json({ code: 1, msg: "目标已删除" });
});

module.exports = router;
