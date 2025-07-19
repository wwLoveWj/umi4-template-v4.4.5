/**
 * WebSocket服务器
 * 处理实时聊天消息和通知
 */

const WebSocket = require("ws");
const ChatService = require("./chatService");
const notificationService = require("../notice/notificationService");

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // 存储连接的客户端
    this.chatService = new ChatService();

    this.init();
  }

  /**
   * 初始化WebSocket服务器
   */
  async init() {
    try {
      // 初始化数据库表
      // await this.chatService.initDatabase();

      this.wss.on("connection", (ws, req) => {
        console.log("新的WebSocket连接建立");

        // 设置连接ID
        const connectionId = this.generateConnectionId();
        ws.connectionId = connectionId;

        // 发送连接建立消息
        ws.send(
          JSON.stringify({
            type: "connection_established",
            connectionId: connectionId,
          })
        );

        // 处理消息
        ws.on("message", async (data) => {
          try {
            const message = JSON.parse(data);
            await this.handleMessage(ws, message);
          } catch (error) {
            console.error("处理WebSocket消息失败:", error);
            ws.send(
              JSON.stringify({
                type: "error",
                message: "消息格式错误",
              })
            );
          }
        });

        // 处理连接关闭
        ws.on("close", () => {
          this.handleClientDisconnect(ws);
        });

        // 处理错误
        ws.on("error", (error) => {
          console.error("WebSocket错误:", error);
          this.handleClientDisconnect(ws);
        });
      });

      console.log("WebSocket服务器已启动");
    } catch (error) {
      console.error("WebSocket服务器初始化失败:", error);
    }
  }

  /**
   * 生成连接ID
   */
  generateConnectionId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 处理接收到的消息
   */
  async handleMessage(ws, message) {
    const { type, data } = message;

    // 添加安全检查
    if (!type) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "消息类型不能为空",
        })
      );
      return;
    }

    switch (type) {
      case "authenticate":
        await this.handleAuthentication(ws, data || {});
        break;

      case "chat_message":
        await this.handleChatMessage(ws, data || {});
        break;

      case "recall_message":
        await this.handleRecallMessage(ws, data || {});
        break;

      case "mark_read":
        await this.handleMarkRead(ws, data || {});
        break;

      case "ping":
        ws.send(JSON.stringify({ type: "pong" }));
        break;

      // 通知相关消息
      case "notification_authenticate":
        await this.handleNotificationAuth(ws, data || {});
        break;
      case "notification_ping":
        ws.send(
          JSON.stringify({ type: "notification_pong", timestamp: Date.now() })
        );
        break;
      case "mark_notification_read":
        await this.handleMarkNotificationRead(ws, data || {});
        break;
      case "mark_all_notifications_read":
        await this.handleMarkAllNotificationsRead(ws, data || {});
        break;
      case "get_notifications":
        await this.handleGetNotifications(ws, data || {});
        break;

      default:
        console.log("未知消息类型:", type);
        ws.send(
          JSON.stringify({
            type: "error",
            message: "未知消息类型",
          })
        );
    }
  }

  /**
   * 处理用户认证
   */
  async handleAuthentication(ws, data) {
    const { userId } = data;

    if (!userId) {
      ws.send(
        JSON.stringify({
          type: "auth_error",
          message: "用户ID不能为空",
        })
      );
      return;
    }

    // 存储客户端信息
    this.clients.set(ws.connectionId, {
      ws,
      userId,
      authenticated: true,
    });

    // 发送认证成功消息
    ws.send(
      JSON.stringify({
        type: "authenticated",
        userId: userId,
      })
    );

    // 发送未读消息数量
    try {
      const unreadCount = await this.chatService.getUnreadCount(userId);
      ws.send(
        JSON.stringify({
          type: "unread_count_update",
          count: unreadCount,
        })
      );
    } catch (error) {
      console.error("获取未读数量失败:", error);
    }

    console.log(`用户 ${userId} 认证成功`);
  }

  /**
   * 处理聊天消息
   */
  async handleChatMessage(ws, data) {
    const client = this.clients.get(ws.connectionId);
    if (!client || !client.authenticated) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "请先进行身份认证",
        })
      );
      return;
    }

    const { toUserId, content, messageType = "text" } = data;

    if (!toUserId || !content) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "消息内容或目标用户不能为空",
        })
      );
      return;
    }

    try {
      // 保存消息到数据库
      const savedMessage = await this.chatService.saveMessage({
        fromUserId: client.userId,
        toUserId,
        content,
        messageType,
      });

      // 构建发送给接收者的消息
      const messageToSend = {
        type: "chat_message",
        data: {
          id: savedMessage.id,
          fromUserId: client.userId,
          toUserId,
          content,
          messageType,
          createdAt: savedMessage.createdAt,
        },
      };

      // 发送给目标用户
      this.sendToUser(toUserId, messageToSend);

      // 发送确认消息给发送者
      ws.send(
        JSON.stringify({
          type: "message_sent",
          data: {
            messageId: savedMessage.id,
            timestamp: new Date().toISOString(),
          },
        })
      );

      console.log(`消息已发送: ${client.userId} -> ${toUserId}`);
    } catch (error) {
      console.error("保存聊天消息失败:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "发送消息失败",
        })
      );
    }
  }

  /**
   * 处理撤回消息
   */
  async handleRecallMessage(ws, data) {
    const client = this.clients.get(ws.connectionId);
    if (!client || !client.authenticated) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "请先进行身份认证",
        })
      );
      return;
    }

    const { messageId, toUserId } = data;

    if (!messageId) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "消息ID不能为空",
        })
      );
      return;
    }

    try {
      // 撤回消息
      const success = await this.chatService.recallMessage(
        messageId,
        client.userId
      );

      if (success) {
        // 通知目标用户消息被撤回
        this.sendToUser(toUserId, {
          type: "message_recalled",
          data: {
            messageId,
            fromUserId: client.userId,
          },
        });

        // 发送确认消息给发送者
        ws.send(
          JSON.stringify({
            type: "message_recalled",
            data: {
              messageId,
              success: true,
            },
          })
        );

        console.log(`消息已撤回: ${messageId}`);
      } else {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "撤回消息失败，消息不存在或无权限",
          })
        );
      }
    } catch (error) {
      console.error("撤回消息失败:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "撤回消息失败",
        })
      );
    }
  }

  /**
   * 处理标记已读
   */
  async handleMarkRead(ws, data) {
    const client = this.clients.get(ws.connectionId);
    if (!client || !client.authenticated) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "请先进行身份认证",
        })
      );
      return;
    }

    const { targetUserId } = data;

    if (!targetUserId) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "目标用户ID不能为空",
        })
      );
      return;
    }

    try {
      // 标记消息为已读
      await this.chatService.markMessagesAsRead(client.userId, targetUserId);

      // 更新未读数量
      const unreadCount = await this.chatService.getUnreadCount(client.userId);
      ws.send(
        JSON.stringify({
          type: "unread_count_update",
          count: unreadCount,
        })
      );

      console.log(`消息已标记为已读: ${client.userId} -> ${targetUserId}`);
    } catch (error) {
      console.error("标记已读失败:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "标记已读失败",
        })
      );
    }
  }

  /**
   * 发送消息给指定用户
   */
  sendToUser(userId, message) {
    let sent = false;

    this.clients.forEach((client, connectionId) => {
      if (client.userId === userId && client.authenticated) {
        try {
          client.ws.send(JSON.stringify(message));
          sent = true;
        } catch (error) {
          console.error(`发送消息给用户 ${userId} 失败:`, error);
          // 移除断开的连接
          this.clients.delete(connectionId);
        }
      }
    });

    if (!sent) {
      console.log(`用户 ${userId} 不在线，消息将存储到数据库`);
    }
  }

  /**
   * 处理客户端断开连接
   */
  handleClientDisconnect(ws) {
    this.clients.delete(ws.connectionId);
    console.log(`客户端断开连接: ${ws.connectionId}`);
  }

  /**
   * 广播消息给所有在线用户
   */
  broadcast(message, excludeUserId = null) {
    this.clients.forEach((client, connectionId) => {
      if (client.authenticated && client.userId !== excludeUserId) {
        try {
          client.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error(`广播消息失败:`, error);
          this.clients.delete(connectionId);
        }
      }
    });
  }

  /**
   * 获取在线用户数量
   */
  getOnlineUserCount() {
    return this.clients.size;
  }

  /**
   * 关闭WebSocket服务器
   */
  close() {
    if (this.wss) {
      this.wss.close();
    }
  }

  // 通知相关消息处理方法

  /**
   * 处理通知认证
   */
  async handleNotificationAuth(ws, data) {
    const { userId } = data;
    if (!userId) {
      ws.send(
        JSON.stringify({
          type: "notification_auth_error",
          message: "用户ID不能为空",
        })
      );
      return;
    }

    try {
      // 验证用户是否存在
      const db = require("../../utils/mysql");
      const rows = await db.query("SELECT id FROM user_info WHERE id = ?", [
        userId,
      ]);

      if (rows.length === 0) {
        ws.send(
          JSON.stringify({
            type: "notification_auth_error",
            message: "用户不存在",
          })
        );
        return;
      }

      // 存储通知客户端信息
      this.clients.set(ws.connectionId, {
        ...this.clients.get(ws.connectionId),
        notificationUserId: userId,
      });

      // 发送认证成功消息
      ws.send(
        JSON.stringify({
          type: "notification_authenticated",
          userId: userId,
        })
      );

      // 发送未读通知数量
      try {
        await notificationService.sendUnreadCount(userId);
      } catch (error) {
        console.error("获取未读通知数量失败:", error);
      }

      console.log(`通知用户 ${userId} 认证成功`);
    } catch (error) {
      console.error("通知用户认证错误:", error);
      ws.send(
        JSON.stringify({
          type: "notification_auth_error",
          message: "认证失败",
        })
      );
    }
  }

  /**
   * 处理标记通知为已读
   */
  async handleMarkNotificationRead(ws, data) {
    const { userId, notificationId } = data;
    if (!userId || !notificationId) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "用户ID和通知ID不能为空",
        })
      );
      return;
    }

    try {
      await notificationService.markNotificationAsRead(userId, notificationId);
      ws.send(
        JSON.stringify({
          type: "notification_marked_read",
          notificationId: notificationId,
        })
      );
    } catch (error) {
      console.error("标记通知已读失败:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "标记通知已读失败",
        })
      );
    }
  }

  /**
   * 处理标记所有通知为已读
   */
  async handleMarkAllNotificationsRead(ws, data) {
    const { userId } = data;
    if (!userId) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "用户ID不能为空",
        })
      );
      return;
    }

    try {
      await notificationService.markAllNotificationsAsRead(userId);
      ws.send(
        JSON.stringify({
          type: "all_notifications_marked_read",
        })
      );
    } catch (error) {
      console.error("标记所有通知已读失败:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "标记所有通知已读失败",
        })
      );
    }
  }

  /**
   * 处理获取通知列表
   */
  async handleGetNotifications(ws, data) {
    const { userId, page = 1, pageSize = 20 } = data;
    if (!userId) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "用户ID不能为空",
        })
      );
      return;
    }

    try {
      const notifications = await notificationService.getUserNotifications(
        userId,
        page,
        pageSize
      );
      ws.send(
        JSON.stringify({
          type: "notifications_list",
          data: notifications,
        })
      );
    } catch (error) {
      console.error("获取通知列表失败:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "获取通知列表失败",
        })
      );
    }
  }
}

module.exports = WebSocketServer;
