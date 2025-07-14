/**
 * 通知服务模块
 * 负责WebSocket连接管理、Redis缓存、实时通知推送
 */

const WebSocket = require('ws');
const Redis = require('redis');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

class NotificationService {
  constructor() {
    this.wss = null;
    this.redisClient = null;
    this.db = null;
    this.clients = new Map(); // 存储用户连接: userId -> WebSocket
    this.connectionIds = new Map(); // 存储连接ID: connectionId -> userId
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
    
    // 初始化Redis客户端
    this.redisClient = Redis.createClient(redisConfig);
    await this.redisClient.connect();
    
    // 初始化数据库连接
    this.db = await mysql.createConnection(dbConfig);
    
    // 设置WebSocket事件监听
    this.setupWebSocketHandlers();
    
    console.log('通知服务初始化完成');
  }

  /**
   * 设置WebSocket事件处理器
   */
  setupWebSocketHandlers() {
    this.wss.on('connection', (ws, req) => {
      const connectionId = uuidv4();
      console.log(`新的WebSocket连接: ${connectionId}`);

      // 发送连接确认
      ws.send(JSON.stringify({
        type: 'connection_established',
        connectionId,
        timestamp: Date.now()
      }));

      // 处理消息
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
          await this.handleMessage(ws, message, connectionId);
        } catch (error) {
          console.error('处理WebSocket消息错误:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: '消息格式错误'
          }));
        }
      });

      // 处理连接关闭
      ws.on('close', () => {
        this.handleDisconnect(connectionId);
      });

      // 处理错误
      ws.on('error', (error) => {
        console.error('WebSocket错误:', error);
        this.handleDisconnect(connectionId);
      });
    });
  }

  /**
   * 处理WebSocket消息
   * @param {WebSocket} ws - WebSocket实例
   * @param {Object} message - 消息对象
   * @param {string} connectionId - 连接ID
   */
  async handleMessage(ws, message, connectionId) {
    switch (message.type) {
      case 'authenticate':
        await this.authenticateUser(ws, message.userId, connectionId);
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: '未知消息类型'
        }));
    }
  }

  /**
   * 用户认证
   * @param {WebSocket} ws - WebSocket实例
   * @param {string} userId - 用户ID
   * @param {string} connectionId - 连接ID
   */
  async authenticateUser(ws, userId, connectionId) {
    try {
      // 验证用户是否存在
      const [rows] = await this.db.execute(
        'SELECT id FROM user_info WHERE id = ?',
        [userId]
      );

      if (rows.length === 0) {
        ws.send(JSON.stringify({
          type: 'auth_error',
          message: '用户不存在'
        }));
        return;
      }

      // 存储连接信息
      this.clients.set(userId, ws);
      this.connectionIds.set(connectionId, userId);

      // 发送认证成功消息
      ws.send(JSON.stringify({
        type: 'authenticated',
        userId,
        timestamp: Date.now()
      }));

      // 发送未读通知数量
      await this.sendUnreadCount(userId);

      console.log(`用户 ${userId} 认证成功`);
    } catch (error) {
      console.error('用户认证错误:', error);
      ws.send(JSON.stringify({
        type: 'auth_error',
        message: '认证失败'
      }));
    }
  }

  /**
   * 处理连接断开
   * @param {string} connectionId - 连接ID
   */
  handleDisconnect(connectionId) {
    const userId = this.connectionIds.get(connectionId);
    if (userId) {
      this.clients.delete(userId);
      this.connectionIds.delete(connectionId);
      console.log(`用户 ${userId} 断开连接`);
    }
  }

  /**
   * 发送通知给指定用户
   * @param {number} userId - 用户ID
   * @param {Object} notification - 通知对象
   */
  async sendNotification(userId, notification) {
    try {
      // 保存通知到数据库
      const [result] = await this.db.execute(
        'INSERT INTO notifications (user_id, type, title, content, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, notification.type, notification.title, notification.content, notification.relatedId, notification.relatedType]
      );

      // 缓存通知到Redis
      const notificationId = result.insertId;
      await this.redisClient.setEx(
        `notification:${notificationId}`,
        86400, // 24小时过期
        JSON.stringify({ ...notification, id: notificationId })
      );

      // 发送实时通知
      const ws = this.clients.get(userId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'notification',
          data: { ...notification, id: notificationId }
        }));
      }

      // 更新未读数量
      await this.updateUnreadCount(userId);

      console.log(`通知已发送给用户 ${userId}:`, notification.title);
    } catch (error) {
      console.error('发送通知错误:', error);
    }
  }

  /**
   * 批量发送通知
   * @param {Array} userIds - 用户ID数组
   * @param {Object} notification - 通知对象
   */
  async sendBatchNotifications(userIds, notification) {
    const promises = userIds.map(userId => this.sendNotification(userId, notification));
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
        const [rows] = await this.db.execute(`
          SELECT user_id FROM subscription_settings 
          WHERE system_notification = TRUE
        `);
        targetUsers = rows.map(row => row.user_id);
      }

      const notification = {
        type: 'system',
        title,
        content,
        relatedId: null,
        relatedType: null
      };

      await this.sendBatchNotifications(targetUsers, notification);
    } catch (error) {
      console.error('发送系统通知错误:', error);
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
      const [followers] = await this.db.execute(`
        SELECT uf.follower_id, ss.article_update 
        FROM user_follow uf
        LEFT JOIN subscription_settings ss ON uf.follower_id = ss.user_id
        WHERE uf.following_id = ? AND (ss.article_update IS NULL OR ss.article_update = TRUE)
      `, [authorId]);

      const followerIds = followers.map(row => row.follower_id);

      if (followerIds.length > 0) {
        const notification = {
          type: 'article_update',
          title: '关注的人发布了新文章',
          content: `您关注的用户发布了新文章《${article.title}》`,
          relatedId: article.id,
          relatedType: 'article'
        };

        await this.sendBatchNotifications(followerIds, notification);
      }
    } catch (error) {
      console.error('发送文章更新通知错误:', error);
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
      const [settings] = await this.db.execute(
        'SELECT like_notification FROM subscription_settings WHERE user_id = ?',
        [targetUserId]
      );

      if (settings.length === 0 || settings[0].like_notification) {
        const [user] = await this.db.execute(
          'SELECT username FROM user_info WHERE id = ?',
          [fromUserId]
        );

        const notification = {
          type: 'like',
          title: '收到新的点赞',
          content: `用户 ${user[0].username} 点赞了您的文章《${article.title}》`,
          relatedId: article.id,
          relatedType: 'article'
        };

        await this.sendNotification(targetUserId, notification);
      }
    } catch (error) {
      console.error('发送点赞通知错误:', error);
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
      const [settings] = await this.db.execute(
        'SELECT collect_notification FROM subscription_settings WHERE user_id = ?',
        [targetUserId]
      );

      if (settings.length === 0 || settings[0].collect_notification) {
        const [user] = await this.db.execute(
          'SELECT username FROM user_info WHERE id = ?',
          [fromUserId]
        );

        const notification = {
          type: 'collect',
          title: '文章被收藏',
          content: `用户 ${user[0].username} 收藏了您的文章《${article.title}》`,
          relatedId: article.id,
          relatedType: 'article'
        };

        await this.sendNotification(targetUserId, notification);
      }
    } catch (error) {
      console.error('发送收藏通知错误:', error);
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
      const [settings] = await this.db.execute(
        'SELECT follow_notification FROM subscription_settings WHERE user_id = ?',
        [targetUserId]
      );

      if (settings.length === 0 || settings[0].follow_notification) {
        const [user] = await this.db.execute(
          'SELECT username FROM user_info WHERE id = ?',
          [fromUserId]
        );

        const notification = {
          type: 'follow',
          title: '新的关注者',
          content: `用户 ${user[0].username} 关注了您`,
          relatedId: fromUserId,
          relatedType: 'user'
        };

        await this.sendNotification(targetUserId, notification);
      }
    } catch (error) {
      console.error('发送关注通知错误:', error);
    }
  }

  /**
   * 更新未读通知数量
   * @param {number} userId - 用户ID
   */
  async updateUnreadCount(userId) {
    try {
      const [rows] = await this.db.execute(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
        [userId]
      );

      const count = rows[0].count;
      await this.redisClient.setEx(`unread:${userId}`, 3600, count.toString());

      // 发送未读数量更新
      const ws = this.clients.get(userId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'unread_count_update',
          count
        }));
      }
    } catch (error) {
      console.error('更新未读数量错误:', error);
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
        const [rows] = await this.db.execute(
          'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
          [userId]
        );
        count = rows[0].count;
        await this.redisClient.setEx(`unread:${userId}`, 3600, count.toString());
      }

      const ws = this.clients.get(userId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'unread_count',
          count: parseInt(count)
        }));
      }
    } catch (error) {
      console.error('发送未读数量错误:', error);
    }
  }

  /**
   * 标记通知为已读
   * @param {number} userId - 用户ID
   * @param {number} notificationId - 通知ID
   */
  async markNotificationAsRead(userId, notificationId) {
    try {
      await this.db.execute(
        'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
        [notificationId, userId]
      );

      // 更新未读数量
      await this.updateUnreadCount(userId);

      console.log(`通知 ${notificationId} 已标记为已读`);
    } catch (error) {
      console.error('标记通知已读错误:', error);
    }
  }

  /**
   * 标记所有通知为已读
   * @param {number} userId - 用户ID
   */
  async markAllNotificationsAsRead(userId) {
    try {
      await this.db.execute(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
        [userId]
      );

      // 更新未读数量
      await this.updateUnreadCount(userId);

      console.log(`用户 ${userId} 的所有通知已标记为已读`);
    } catch (error) {
      console.error('标记所有通知已读错误:', error);
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
      
      const [rows] = await this.db.execute(`
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `, [userId, pageSize, offset]);

      return rows;
    } catch (error) {
      console.error('获取用户通知错误:', error);
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
    console.log('通知服务已关闭');
  }
}

module.exports = new NotificationService(); 