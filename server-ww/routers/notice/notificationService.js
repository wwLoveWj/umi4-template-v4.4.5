/**
 * 通知服务模块
 * 负责WebSocket连接管理、Redis缓存、实时通知推送
 */

const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const client = require("../../utils/redis");
const db = require("../../utils/mysql");
const dayjs = require("dayjs");

class NotificationService {
  constructor() {
    this.wss = null;
    this.redisClient = null;
    this.db = null;
  }

  /**
   * 初始化通知服务
   * @param {Object} server - HTTP服务器实例
   * @param {Object} dbConfig - 数据库配置
   * @param {Object} redisConfig - Redis配置
   */
  async initialize(server, dbConfig, redisConfig) {
    // 初始化WebSocket服务器
    this.wss = new WebSocket.Server({ server });

    // 初始化Redis客户端（已在utils/redis.js中连接，无需重复连接）
    this.redisClient = client;

    // 初始化数据库连接
    this.db = db;

    // 设置WebSocket事件监听
    this.setupWebSocketHandlers();

    console.log("通知服务初始化完成");
  }

  /**
   * 使用已存在的WebSocket服务器初始化通知服务
   * @param {Object} wss - 已存在的WebSocket服务器实例
   */
  async initializeWithWss(wss) {
    // 使用已存在的WebSocket服务器实例
    this.wss = wss;

    // 初始化Redis客户端（已在utils/redis.js中连接，无需重复连接）
    this.redisClient = client;

    // 初始化数据库连接
    this.db = db;

    console.log("通知服务初始化完成（使用现有WebSocket服务器）");
  }

  /**
   * 发送通知给指定用户
   * @param {number} userId - 用户ID
   * @param {Object} notification - 通知对象
   */
  async sendNotification(userId, notification) {
    try {
      // 保存通知到数据库
      const result = await this.db.query(
        "INSERT INTO notifications (user_id, type, title, content, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)",
        [
          userId,
          notification.type,
          notification.title,
          notification.content,
          notification.relatedId,
          notification.relatedType,
        ]
      );

      // 缓存通知到Redis
      const notificationId = result.insertId;
      await this.redisClient.setEx(
        `notification:${notificationId}`,
        86400, // 24小时过期
        JSON.stringify({ ...notification, id: notificationId })
      );

      // 通过WebSocket服务器发送实时通知
      if (this.wss && this.wss.clients) {
        // 查找用户的WebSocket连接
        for (const [connectionId, clientInfo] of this.wss.clients) {
          if (
            clientInfo.notificationUserId === userId &&
            clientInfo.ws.readyState === WebSocket.OPEN
          ) {
            clientInfo.ws.send(
              JSON.stringify({
                type: "notification",
                data: { ...notification, id: notificationId },
              })
            );
            break;
          }
        }
      }

      // 更新未读数量
      await this.updateUnreadCount(userId);

      console.log(`通知已发送给用户 ${userId}:`, notification.title);
    } catch (error) {
      console.error("发送通知错误:", error);
    }
  }

  /**
   * 批量发送通知
   * @param {Array} userIds - 用户ID数组
   * @param {Object} notification - 通知对象
   */
  async sendBatchNotifications(userIds, notification) {
    const promises = userIds.map((userId) =>
      this.sendNotification(userId, notification)
    );
    await Promise.all(promises);
  }

  /**
   * 发送系统通知
   * @param {string} title - 通知标题
   * @param {string} content - 通知内容
   * @param {Array} userIds - 目标用户ID数组（可选，为空则发送给所有用户）
   */
  async sendSystemNotification(title, content, userIds = null) {
    try {
      let targetUsers = userIds;

      if (!targetUsers) {
        // 获取所有启用了系统通知的用户
        const rows = await this.db.query(`
          SELECT user_id FROM subscription_settings 
          WHERE system_notification = TRUE
        `);
        targetUsers = rows.map((row) => row.user_id);
      }

      const notification = {
        type: "system",
        title,
        content,
        relatedId: null,
        relatedType: null,
      };

      await this.sendBatchNotifications(targetUsers, notification);
    } catch (error) {
      console.error("发送系统通知错误:", error);
    }
  }

  /**
   * 发送文章更新通知
   * @param {number} authorId - 作者ID
   * @param {Object} article - 文章信息
   */
  async sendArticleUpdateNotification(authorId, article) {
    try {
      // 获取作者的粉丝
      const followers = await this.db.query(
        `
        SELECT uf.follower_id, ss.article_update 
        FROM user_follow uf
        LEFT JOIN subscription_settings ss ON uf.follower_id = ss.user_id
        WHERE uf.following_id = ? AND (ss.article_update IS NULL OR ss.article_update = TRUE)
      `,
        [authorId]
      );

      const followerIds = followers.map((row) => row.follower_id);

      if (followerIds.length > 0) {
        const notification = {
          type: "article_update",
          title: "关注的人发布了新文章",
          content: `您关注的用户发布了新文章《${article.title}》`,
          relatedId: article.id,
          relatedType: "article",
        };

        await this.sendBatchNotifications(followerIds, notification);
      }
    } catch (error) {
      console.error("发送文章更新通知错误:", error);
    }
  }

  /**
   * 发送点赞通知
   * @param {number} targetUserId - 被点赞用户ID
   * @param {number} fromUserId - 点赞用户ID
   * @param {Object} article - 文章信息
   */
  async sendLikeNotification(targetUserId, fromUserId, article) {
    try {
      // 检查用户是否启用了点赞通知
      const settings = await this.db.query(
        "SELECT likeNotification FROM subscription_settings WHERE user_id = ?",
        [targetUserId]
      );
      if (settings.length === 0 || settings[0].likeNotification) {
        const user = await this.db.query(
          "SELECT * FROM user_info WHERE id = ?",
          [fromUserId]
        );

        const notification = {
          type: "like",
          title: "收到新的点赞",
          content: `用户 ${user[0].username} 点赞了您的文章《${article.title}》`,
          relatedId: article.id,
          relatedType: "article",
          createdAt: dayjs().valueOf(),
          avatar: user[0].avatar,
        };

        await this.sendNotification(targetUserId, notification);
      }
    } catch (error) {
      console.error("发送点赞通知错误:", error);
    }
  }

  /**
   * 发送收藏通知
   * @param {number} targetUserId - 被收藏用户ID
   * @param {number} fromUserId - 收藏用户ID
   * @param {Object} article - 文章信息
   */
  async sendCollectNotification(targetUserId, fromUserId, article) {
    try {
      // 检查用户是否启用了收藏通知
      const settings = await this.db.query(
        "SELECT collect_notification FROM subscription_settings WHERE user_id = ?",
        [targetUserId]
      );

      if (settings.length === 0 || settings[0].collect_notification) {
        const user = await this.db.query(
          "SELECT * FROM user_info WHERE id = ?",
          [fromUserId]
        );

        const notification = {
          type: "collect",
          title: "文章被收藏",
          content: `用户 ${user[0].username} 收藏了您的文章《${article.title}》`,
          relatedId: article.id,
          relatedType: "article",
          createdAt: dayjs().valueOf(),
          avatar: user[0].avatar,
        };

        await this.sendNotification(targetUserId, notification);
      }
    } catch (error) {
      console.error("发送收藏通知错误:", error);
    }
  }

  /**
   * 发送关注通知
   * @param {number} targetUserId - 被关注用户ID
   * @param {number} fromUserId - 关注用户ID
   */
  async sendFollowNotification(targetUserId, fromUserId) {
    try {
      // 检查用户是否启用了关注通知
      const settings = await this.db.query(
        "SELECT follow_notification FROM subscription_settings WHERE user_id = ?",
        [targetUserId]
      );

      if (settings.length === 0 || settings[0].follow_notification) {
        const user = await this.db.query(
          "SELECT username FROM user_info WHERE id = ?",
          [fromUserId]
        );

        const notification = {
          type: "follow",
          title: "新的关注者",
          content: `用户 ${user[0].username} 关注了您`,
          relatedId: fromUserId,
          relatedType: "user",
        };

        await this.sendNotification(targetUserId, notification);
      }
    } catch (error) {
      console.error("发送关注通知错误:", error);
    }
  }

  /**
   * 更新未读通知数量
   * @param {number} userId - 用户ID
   */
  async updateUnreadCount(userId) {
    try {
      const rows = await this.db.query(
        "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
        [userId]
      );

      const count = rows[0].count;
      await this.redisClient.setEx(`unread:${userId}`, 3600, count.toString());

      // 通过WebSocket服务器发送未读数量更新
      if (this.wss && this.wss.clients) {
        for (const [connectionId, clientInfo] of this.wss.clients) {
          if (
            clientInfo.notificationUserId === userId &&
            clientInfo.ws.readyState === WebSocket.OPEN
          ) {
            clientInfo.ws.send(
              JSON.stringify({
                type: "notification_unread_count_update",
                count,
              })
            );
            break;
          }
        }
      }
    } catch (error) {
      console.error("更新未读数量错误:", error);
    }
  }

  /**
   * 发送未读通知数量
   * @param {number} userId - 用户ID
   */
  async sendUnreadCount(userId) {
    try {
      let count = await this.redisClient.get(`unread:${userId}`);

      if (!count) {
        const rows = await this.db.query(
          "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
          [userId]
        );
        count = rows[0].count;
        await this.redisClient.setEx(
          `unread:${userId}`,
          3600,
          count.toString()
        );
      }

      // 通过WebSocket服务器发送未读数量
      if (this.wss && this.wss.clients) {
        for (const [connectionId, clientInfo] of this.wss.clients) {
          if (
            clientInfo.notificationUserId === userId &&
            clientInfo.ws.readyState === WebSocket.OPEN
          ) {
            clientInfo.ws.send(
              JSON.stringify({
                type: "notification_unread_count",
                count: parseInt(count),
              })
            );
            break;
          }
        }
      }
    } catch (error) {
      console.error("发送未读数量错误:", error);
    }
  }

  /**
   * 标记通知为已读
   * @param {number} userId - 用户ID
   * @param {number} notificationId - 通知ID
   */
  async markNotificationAsRead(userId, notificationId) {
    try {
      await this.db.query(
        "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
        [notificationId, userId]
      );

      // 更新未读数量
      await this.updateUnreadCount(userId);

      console.log(`通知 ${notificationId} 已标记为已读`);
    } catch (error) {
      console.error("标记通知已读错误:", error);
    }
  }

  /**
   * 标记所有通知为已读
   * @param {number} userId - 用户ID
   */
  async markAllNotificationsAsRead(userId) {
    try {
      await this.db.query(
        "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
        [userId]
      );

      // 更新未读数量
      await this.updateUnreadCount(userId);

      console.log(`用户 ${userId} 的所有通知已标记为已读`);
    } catch (error) {
      console.error("标记所有通知已读错误:", error);
    }
  }

  /**
   * 获取用户通知列表
   * @param {number} userId - 用户ID
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   */
  async getUserNotifications(userId, page = 1, pageSize = 20) {
    try {
      const offset = (page - 1) * pageSize;

      const rows = await this.db.query(
        `
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `,
        [userId, pageSize, offset]
      );

      return rows;
    } catch (error) {
      console.error("获取用户通知错误:", error);
      return [];
    }
  }

  /**
   * 关闭服务
   */
  async close() {
    if (this.wss) {
      this.wss.close();
    }
    if (this.redisClient) {
      await this.redisClient.quit();
    }
    if (this.db) {
      await this.db.end();
    }
    console.log("通知服务已关闭");
  }
}

module.exports = new NotificationService();
