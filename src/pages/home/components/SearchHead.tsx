import React, { useRef, useState } from "react";
import { SearchBar, Popup, List } from "antd-mobile";
import { SearchBarRef } from "antd-mobile/es/components/search-bar";
import { ScanningOutline } from "antd-mobile-icons";
import { useModel, history } from "umi";
import { menuRoutes } from "@/routes/menuRoutes";

const hotKeywords = [
  "首页",
  "文章",
  "我的收藏",
  "个人中心",
  "育儿",
  "扫码",
  "通知",
  "我的目标",
  "宝宝相册",
  "我的待办",
  "接种记录",
];

// 扁平化菜单（递归）
function flattenMenus(menus: API.MenuRoutesType[]): API.MenuRoutesType[] {
  let res: API.MenuRoutesType[] = [];
  for (const m of menus) {
    if (m.title && m.path && !m.hidden) res.push(m);
    if (Array.isArray(m.routes)) res = res.concat(flattenMenus(m.routes));
  }
  return res;
}

export default function SearchHead() {
  const [visible1, setVisible1] = useState(false);
  const searchRef = useRef<SearchBarRef>(null);
  const { getCameras } = useModel("useScan");
  const [keyword, setKeyword] = useState("");
  const [historyList, setHistoryList] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem("search-history") || "[]");
  });
  const allMenus: API.MenuRoutesType[] = flattenMenus(menuRoutes);
  // 菜单搜索结果
  const menuResults: API.MenuRoutesType[] = keyword.trim()
    ? allMenus.filter((m: API.MenuRoutesType) =>
        m.title?.toLowerCase().includes(keyword.trim().toLowerCase())
      )
    : [];

  // 搜索并跳转
  const handleSearch = (val: string) => {
    const kw = val.trim();
    if (!kw) return;
    // 存历史
    const newHistory = [kw, ...historyList.filter((h) => h !== kw)].slice(0, 8);
    setHistoryList(newHistory);
    localStorage.setItem("search-history", JSON.stringify(newHistory));
    setVisible1(false);
    setKeyword(kw);
    // 如果有菜单匹配，优先跳转第一个
    const match = allMenus.find(
      (m: API.MenuRoutesType) =>
        m.title === kw || m.title?.toLowerCase() === kw.toLowerCase()
    );
    if (match) {
      history.push(match.path);
    } else {
      history.push(`/article?keyword=${encodeURIComponent(kw)}`);
    }
  };

  return (
    <div
      style={{
        padding: "12px",
        background: "pink",
      }}
    >
      <SearchBar
        ref={searchRef}
        placeholder="请输入搜索内容"
        searchIcon={
          <ScanningOutline
            style={{ color: "#002FA7", fontSize: "24px" }}
            onClick={() => {
              getCameras();
            }}
          />
        }
        onFocus={() => {
          setVisible1(true);
        }}
      />
      <Popup
        visible={visible1}
        onMaskClick={() => setVisible1(false)}
        onClose={() => setVisible1(false)}
        bodyStyle={{
          height: "80vh",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
        position="bottom"
      >
        <div style={{ padding: 16 }}>
          <SearchBar
            value={keyword}
            onChange={setKeyword}
            onSearch={handleSearch}
            placeholder="请输入菜单或内容关键词"
            autoFocus
            onClear={() => setKeyword("")}
            onCancel={() => setVisible1(false)}
            style={{ marginBottom: 12 }}
          />
          {/* 菜单搜索结果 */}
          {keyword.trim() && menuResults.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>菜单匹配</div>
              <List>
                {menuResults.map((menu: API.MenuRoutesType) => (
                  <List.Item
                    key={menu.path}
                    onClick={() => {
                      setVisible1(false);
                      setKeyword(menu.title!);
                      handleSearch(menu.title!);
                    }}
                  >
                    {menu.title}
                  </List.Item>
                ))}
              </List>
            </div>
          )}
          {/* 历史搜索区域 */}
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 8 }}
          >
            <div style={{ fontWeight: 600, flex: 1 }}>历史搜索</div>
            {historyList.length > 0 && (
              <span
                style={{ color: "#1677ff", fontSize: 14, cursor: "pointer" }}
                onClick={() => {
                  setHistoryList([]);
                  localStorage.removeItem("search-history");
                }}
              >
                一键清空
              </span>
            )}
          </div>
          <div style={{ maxHeight: 250, overflowY: "auto", marginBottom: 16 }}>
            {historyList.length === 0 ? (
              <div style={{ color: "#bbb", marginBottom: 16 }}>暂无历史</div>
            ) : (
              <List>
                {historyList.map((item) => (
                  <List.Item
                    key={item}
                    onClick={() => {
                      setKeyword(item);
                      handleSearch(item);
                    }}
                  >
                    {item}
                  </List.Item>
                ))}
              </List>
            )}
          </div>
          <div style={{ fontWeight: 600, margin: "16px 0 8px" }}>常用菜单</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {hotKeywords.map((kw) => (
              <span
                key={kw}
                style={{
                  background: "#f5f5f5",
                  borderRadius: 12,
                  padding: "4px 12px",
                  fontSize: 14,
                  color: "#333",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setKeyword(kw);
                  handleSearch(kw);
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </Popup>
    </div>
  );
}
