import React, { useEffect, useState } from "react";
import { List, Card, Empty, SpinLoading } from "antd-mobile";
import { queryLinkCardListAPI } from "@/service/api/link";

/**
 * 网址收藏列表组件
 */
const LinkCollections: React.FC = () => {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLinks = async () => {
      setLoading(true);
      try {
        const res = await queryLinkCardListAPI();
        setLinks(res.list || res.data || []);
      } catch (e) {
        setLinks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  return (
    <div className="link-collections-content">
      {loading ? (
        <div style={{ textAlign: "center", padding: 32 }}>
          <SpinLoading />
        </div>
      ) : links.length === 0 ? (
        <Empty description="暂无网址收藏" />
      ) : (
        <List>
          {links.map((item) => (
            <List.Item key={item.id}>
              <Card className="link-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img
                    src={item.icon || require("@/assets/avatar/avatar.png")}
                    alt="icon"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      objectFit: "cover",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 15,
                        color: "#1677ff",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.title || item.url}
                    </div>
                    <div
                      style={{
                        color: "#888",
                        fontSize: 13,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.url}
                    </div>
                  </div>
                </div>
              </Card>
            </List.Item>
          ))}
        </List>
      )}
    </div>
  );
};

export default LinkCollections;
