/**
 * WebSocket工具类
 * 负责与后端通知服务建立连接、认证、消息处理
 */

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface NotificationData {
  id: number;
  type: "system" | "article_update" | "like" | "collect" | "follow" | "comment";
  title: string;
  content: string;
  relatedId?: number;
  relatedType?: string;
  isRead: boolean;
  createdAt: string;
}

export interface WebSocketConfig {
  url: string;
  userId: string | number;
  onNotification?: (notification: NotificationData) => void;
  onUnreadCountUpdate?: (count: number) => void;
  onConnectionEstablished?: (connectionId: string) => void;
  onAuthenticated?: (userId: string | number) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionId: string | null = null;
  private isAuthenticated = false;

  /**
   * 连接WebSocket
   * @param config WebSocket配置
   */
  connect(config: WebSocketConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.config = config;
        this.ws = new WebSocket(config.url);

        this.ws.onopen = () => {
          console.log("WebSocket连接已建立");
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket错误:", error);
          this.config?.onError?.("连接错误");
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("WebSocket连接已关闭");
          this.stopHeartbeat();
          this.isAuthenticated = false;
          this.config?.onClose?.();

          // 自动重连
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnectAttempts++;
              console.log(
                `尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
              );
              this.connect(config);
            }, this.reconnectInterval);
          }
        };
      } catch (error) {
        console.error("WebSocket连接失败:", error);
        reject(error);
      }
    });
  }

  /**
   * 处理接收到的消息
   * @param data 消息数据
   */
  private handleMessage(data: string) {
    try {
      const message: WebSocketMessage = JSON.parse(data);

      switch (message.type) {
        case "connection_established":
          this.connectionId = message.connectionId;
          this.config?.onConnectionEstablished?.(message.connectionId);
          console.log("连接已建立，ID:", message.connectionId);
          break;

        case "authenticated":
          this.isAuthenticated = true;
          this.config?.onAuthenticated?.(message.userId);
          console.log("用户认证成功:", message.userId);
          break;

        case "auth_error":
          console.error("认证失败:", message.message);
          this.config?.onError?.(message.message);
          break;

        case "notification":
          const notification = message.data as NotificationData;
          this.config?.onNotification?.(notification);
          console.log("收到新通知:", notification);
          break;

        case "unread_count":
        case "unread_count_update":
          this.config?.onUnreadCountUpdate?.(message.count);
          console.log("未读数量更新:", message.count);
          break;

        case "pong":
          console.log("收到心跳响应");
          break;

        case "error":
          console.error("服务器错误:", message.message);
          this.config?.onError?.(message.message);
          break;

        default:
          console.log("未知消息类型:", message.type);
      }
    } catch (error) {
      console.error("解析消息失败:", error);
    }
  }

  /**
   * 发送消息
   * @param message 消息对象
   */
  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket未连接，无法发送消息");
    }
  }

  /**
   * 用户认证
   * @param userId 用户ID
   */
  authenticate(userId: string | number): void {
    this.send({
      type: "authenticate",
      data: { userId },
    });
  }

  /**
   * 发送心跳
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: "ping" });
    }, 30000); // 30秒发送一次心跳
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * 关闭连接
   */
  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isAuthenticated = false;
    this.connectionId = null;
  }

  /**
   * 获取连接状态
   */
  getConnectionState(): number {
    return this.ws?.readyState || WebSocket.CLOSED;
  }

  /**
   * 是否已认证
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * 获取连接ID
   */
  getConnectionId(): string | null {
    return this.connectionId;
  }
}

// 创建全局实例
const websocketManager = new WebSocketManager();

// 兼容性导出
export const closeWebSocket = () => websocketManager.disconnect();

export default websocketManager;
