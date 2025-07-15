/**
 * 通知相关路由
 */

const express = require("express");
const router = express.Router();
const notificationService = require("../services/notificationService");

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

    const notifications = await notificationService.getUserNotifications(
      parseInt(userId),
      parseInt(page),
      parseInt(pageSize)
    );

    res.json(notifications);
  } catch (error) {
    console.error("获取通知列表失败:", error);
    res.status(500).json({ error: "获取通知列表失败" });
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
    res.json({ success: true });
  } catch (error) {
    console.error("标记通知已读失败:", error);
    res.status(500).json({ error: "标记通知已读失败" });
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
    res.json({ success: true });
  } catch (error) {
    console.error("标记所有通知已读失败:", error);
    res.status(500).json({ error: "标记所有通知已读失败" });
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

    const [rows] = await notificationService.db.execute(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE",
      [parseInt(userId)]
    );

    res.json({ count: rows[0].count });
  } catch (error) {
    console.error("获取未读数量失败:", error);
    res.status(500).json({ error: "获取未读数量失败" });
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
      return res.status(400).json({ error: "用户ID不能为空" });
    }

    const [rows] = await notificationService.db.execute(
      "SELECT * FROM subscription_settings WHERE user_id = ?",
      [parseInt(userId)]
    );

    if (rows.length === 0) {
      // 如果没有设置，创建默认设置
      await notificationService.db.execute(
        "INSERT INTO subscription_settings (user_id) VALUES (?)",
        [parseInt(userId)]
      );

      const [newRows] = await notificationService.db.execute(
        "SELECT * FROM subscription_settings WHERE user_id = ?",
        [parseInt(userId)]
      );

      res.json(newRows[0]);
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    console.error("获取订阅设置失败:", error);
    res.status(500).json({ error: "获取订阅设置失败" });
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
      return res.status(400).json({ error: "用户ID不能为空" });
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
      return res.status(400).json({ error: "没有要更新的字段" });
    }

    updateValues.push(parseInt(userId));

    await notificationService.db.execute(
      `UPDATE subscription_settings SET ${updateFields.join(
        ", "
      )} WHERE user_id = ?`,
      updateValues
    );

    res.json({ success: true });
  } catch (error) {
    console.error("更新订阅设置失败:", error);
    res.status(500).json({ error: "更新订阅设置失败" });
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
      return res.status(400).json({ error: "标题和内容不能为空" });
    }

    await notificationService.sendSystemNotification(title, content, userIds);
    res.json({ success: true });
  } catch (error) {
    console.error("发送系统通知失败:", error);
    res.status(500).json({ error: "发送系统通知失败" });
  }
});

module.exports = router;
