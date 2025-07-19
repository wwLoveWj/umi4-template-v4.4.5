/**
 * 通知相关路由
 */

const express = require("express");
const router = express.Router();
const notificationService = require("./notificationService");
const { camelCaseKeys } = require("../../utils");
/**
 * 获取用户通知列表
 * GET /notifications?userId=1&page=1&pageSize=20
 */
router.get("/notifications", async (req, res) => {
  try {
    const { userId, page = 1, pageSize = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "用户ID不能为空" });
    }

    let notifications = await notificationService.getUserNotifications(
      parseInt(userId),
      parseInt(page),
      parseInt(pageSize)
    );
    notifications = notifications.map((item) => camelCaseKeys(item));

    res.json({ data: notifications, code: 1 });
  } catch (error) {
    console.error("获取通知列表失败:", error);
    res.status(500).json({ msg: "获取通知列表失败", code: 0 });
  }
});

/**
 * 标记通知为已读
 * PUT /notifications/:id/read
 */
router.put("/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "用户ID不能为空" });
    }

    await notificationService.markNotificationAsRead(
      parseInt(userId),
      parseInt(id)
    );
    res.json({ code: 1 });
  } catch (error) {
    console.error("标记通知已读失败:", error);
    res.status(500).json({ msg: "标记通知已读失败", code: 0 });
  }
});

/**
 * 标记所有通知为已读
 * PUT /notifications/read-all
 */
router.put("/notifications/read-all", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "用户ID不能为空" });
    }

    await notificationService.markAllNotificationsAsRead(parseInt(userId));
    res.json({ code: 1 });
  } catch (error) {
    console.error("标记所有通知已读失败:", error);
    res.status(500).json({ msg: "标记所有通知已读失败", code: 0 });
  }
});

/**
 * 获取未读通知数量
 * GET /notifications/unread-count?userId=1
 */
router.get("/notifications/unread-count", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "用户ID不能为空" });
    }

    const rows = await notificationService.db.query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
      [parseInt(userId)]
    );

    res.json({ data: { count: rows[0].count }, code: 1 });
  } catch (error) {
    console.error("获取未读数量失败:", error);
    res.status(500).json({ msg: "获取未读数量失败", code: 0 });
  }
});

/**
 * 获取用户订阅设置
 * GET /subscription-settings?userId=1
 */
router.get("/subscription-settings", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ msg: "用户ID不能为空", code: 0 });
    }

    const rows = await notificationService.db.query(
      "SELECT * FROM subscription_settings WHERE user_id = ?",
      [parseInt(userId)]
    );

    if (rows.length === 0) {
      // 如果没有设置，创建默认设置
      await notificationService.db.query(
        "INSERT INTO subscription_settings (user_id) VALUES (?)",
        [parseInt(userId)]
      );

      const newRows = await notificationService.db.query(
        "SELECT * FROM subscription_settings WHERE user_id = ?",
        [parseInt(userId)]
      );

      res.json({ data: newRows[0], code: 1 });
    } else {
      res.json({ data: rows[0], code: 1 });
    }
  } catch (error) {
    console.error("获取订阅设置失败:", error);
    res.status(500).json({ msg: "获取订阅设置失败", code: 0 });
  }
});

/**
 * 更新用户订阅设置
 * PUT /subscription-settings
 */
router.put("/subscription-settings", async (req, res) => {
  try {
    const { userId, ...settings } = req.body;

    if (!userId) {
      return res.status(400).json({ msg: "用户ID不能为空", code: 0 });
    }

    const updateFields = [];
    const updateValues = [];

    Object.keys(settings).forEach((key) => {
      if (settings[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(settings[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ msg: "没有要更新的字段", code: 0 });
    }

    updateValues.push(parseInt(userId));

    await notificationService.db.query(
      `UPDATE subscription_settings SET ${updateFields.join(
        ", "
      )} WHERE user_id = ?`,
      updateValues
    );

    res.json({ code: 1 });
  } catch (error) {
    console.error("更新订阅设置失败:", error);
    res.status(500).json({ msg: "更新订阅设置失败", code: 0 });
  }
});

/**
 * 发送系统通知（管理员接口）
 * POST /notifications/system
 */
router.post("/notifications/system", async (req, res) => {
  try {
    const { title, content, userIds } = req.body;

    if (!title || !content) {
      return res.status(400).json({ msg: "标题和内容不能为空", code: 0 });
    }

    await notificationService.sendSystemNotification(title, content, userIds);
    res.json({ code: 1 });
  } catch (error) {
    console.error("发送系统通知失败:", error);
    res.status(500).json({ msg: "发送系统通知失败", code: 0 });
  }
});

/**
 * 发送文章收藏通知
 * POST /notifications/system
 */
router.post("/notifications/collect", async (req, res) => {
  try {
    const { targetUserId, fromUserId, article } = req.body;

    if (!targetUserId || !fromUserId || !article?.id || !article?.title) {
      return res.status(400).json({ msg: "参数不能为空", code: 0 });
    }
    await notificationService.sendCollectNotification(
      targetUserId,
      fromUserId,
      article
    );
    res.json({ code: 1 });
  } catch (error) {
    console.error("发送文章收藏通知失败:", error);
    res.status(500).json({ msg: "发送系文章收藏通知失败", code: 0 });
  }
});

module.exports = router;
