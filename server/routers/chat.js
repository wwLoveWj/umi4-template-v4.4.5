/**
 * 聊天路由
 * 提供聊天相关的API接口
 */

const express = require("express");
const router = express.Router();
const ChatService = require("../services/chatService");

const chatService = new ChatService();

/**
 * 获取聊天历史记录
 * GET /api/chat/history/:targetUserId
 */
router.get("/history/:targetUserId", async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { userId } = req.query;
    const { limit = 50, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "缺少用户ID" });
    }

    const messages = await chatService.getChatHistory(
      userId,
      targetUserId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: {
        messages,
        hasMore: messages.length === parseInt(limit),
      },
    });
  } catch (error) {
    console.error("获取聊天历史失败:", error);
    res.status(500).json({ error: "获取聊天历史失败" });
  }
});

/**
 * 获取聊天会话列表
 * GET /api/chat/sessions
 */
router.get("/sessions", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "缺少用户ID" });
    }

    const sessions = await chatService.getChatSessions(userId);

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("获取聊天会话失败:", error);
    res.status(500).json({ error: "获取聊天会话失败" });
  }
});

/**
 * 标记消息为已读
 * POST /api/chat/read/:targetUserId
 */
router.post("/read/:targetUserId", async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "缺少用户ID" });
    }

    await chatService.markMessagesAsRead(userId, targetUserId);

    res.json({
      success: true,
      message: "标记已读成功",
    });
  } catch (error) {
    console.error("标记已读失败:", error);
    res.status(500).json({ error: "标记已读失败" });
  }
});

/**
 * 撤回消息
 * POST /api/chat/recall/:messageId
 */
router.post("/recall/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "缺少用户ID" });
    }

    const success = await chatService.recallMessage(messageId, userId);

    if (success) {
      res.json({
        success: true,
        message: "消息撤回成功",
      });
    } else {
      res.status(404).json({ error: "消息不存在或无权限撤回" });
    }
  } catch (error) {
    console.error("撤回消息失败:", error);
    res.status(500).json({ error: "撤回消息失败" });
  }
});

/**
 * 获取未读消息数量
 * GET /api/chat/unread-count
 */
router.get("/unread-count", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "缺少用户ID" });
    }

    const count = await chatService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("获取未读数量失败:", error);
    res.status(500).json({ error: "获取未读数量失败" });
  }
});

/**
 * 删除聊天记录
 * DELETE /api/chat/history/:targetUserId
 */
router.delete("/history/:targetUserId", async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "缺少用户ID" });
    }

    await chatService.deleteChatHistory(userId, targetUserId);

    res.json({
      success: true,
      message: "删除聊天记录成功",
    });
  } catch (error) {
    console.error("删除聊天记录失败:", error);
    res.status(500).json({ error: "删除聊天记录失败" });
  }
});

module.exports = router;
