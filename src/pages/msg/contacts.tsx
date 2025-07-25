import React, { useEffect, useState } from "react";
import { List, NavBar, Avatar, Empty, Toast, SearchBar } from "antd-mobile";
import { UserOutline, MessageOutline } from "antd-mobile-icons";
import { history } from "umi";
import { request } from "@/service/request";
import { UserListAPI } from "@/service/api/user";

interface ContactUser {
  id: string;
  username: string;
  nickname?: string;
  avatar?: string;
  email?: string;
}

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<ContactUser[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  /**
   * 加载联系人列表
   */
  const loadContacts = async () => {
    try {
      setIsLoading(true);
      // 这里应该调用获取用户列表的API
      const data = await UserListAPI();
      setContacts(data);
      setFilteredContacts(data);
    } catch (error) {
      console.error("加载联系人失败:", error);
      Toast.show({
        content: "加载失败",
        icon: "fail",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 初始化
   */
  useEffect(() => {
    loadContacts();
  }, []);

  /**
   * 搜索过滤
   */
  useEffect(() => {
    if (!searchKeyword) {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(
        (contact) =>
          contact.nickname
            ?.toLowerCase()
            .includes(searchKeyword.toLowerCase()) ||
          contact.username
            .toLowerCase()
            .includes(searchKeyword.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  }, [searchKeyword, contacts]);

  /**
   * 处理联系人点击
   */
  const handleContactClick = (contact: ContactUser) => {
    // 跳转到聊天页面
    history.push(`/msg/chat/${contact.id}`);
  };

  /**
   * 获取用户头像
   */
  const getUserAvatar = (user: ContactUser) => {
    if (user.avatar) {
      return user.avatar;
    }
    // 使用默认头像生成
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
  };

  /**
   * 获取显示名称
   */
  const getDisplayName = (user: ContactUser) => {
    return user.nickname || user.username;
  };

  return (
    <div>
      {/* 搜索栏 */}
      <div style={{ padding: "12px 16px", background: "#f5f5f5" }}>
        <SearchBar
          placeholder="搜索联系人"
          value={searchKeyword}
          onChange={setSearchKeyword}
          style={{
            "--border-radius": "20px",
            "--background": "#fff",
          }}
        />
      </div>

      <div style={{ padding: "0 12px" }}>
        {filteredContacts?.length === 0 ? (
          <Empty
            description={isLoading ? "加载中..." : "暂无联系人"}
            image={
              <div style={{ fontSize: 48, color: "#ccc" }}>
                <UserOutline />
              </div>
            }
          />
        ) : (
          <List>
            {filteredContacts?.map((contact) => (
              <List.Item
                key={contact.id}
                prefix={
                  <Avatar
                    src={getUserAvatar(contact)}
                    style={{ "--size": "48px" }}
                  />
                }
                description={
                  <div style={{ marginTop: 4 }}>
                    <span style={{ color: "#999", fontSize: 12 }}>
                      {contact.email}
                    </span>
                  </div>
                }
                extra={
                  <MessageOutline
                    style={{
                      color: "#1677ff",
                      fontSize: 20,
                      cursor: "pointer",
                    }}
                  />
                }
                onClick={() => handleContactClick(contact)}
                style={{
                  background: "#fff",
                  marginBottom: 8,
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    fontWeight: 500,
                    color: "#333",
                    fontSize: 16,
                  }}
                >
                  {getDisplayName(contact)}
                </div>
              </List.Item>
            ))}
          </List>
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div
            style={{ textAlign: "center", padding: "20px 0", color: "#999" }}
          >
            加载中...
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;
