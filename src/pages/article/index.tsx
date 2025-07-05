import React, { useState, useEffect } from "react";
import {
  Tabs,
  List,
  Card,
  Avatar,
  Tag,
  SpinLoading,
  InfiniteScroll,
} from "antd-mobile";
import { useNavigate } from "umi";
import { articleApi } from "@/service/api/article";
import {
  HeartOutline,
  HeartFill,
  StarOutline,
  StarFill,
  EyeOutline,
  MessageOutline,
} from "antd-mobile-icons";
import "./style.less";
import { addMessage } from "@/utils/messageCenter";

/**
 * 文章列表页面
 */
const ArticleList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recommend");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [articles, setArticles] = useState<API.ArticleItemType[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 文章分类配置
  const categories: API.ArticleCategoryType[] = [
    { key: "recommend", title: "推荐" },
    { key: "js", title: "JavaScript" },
    { key: "css", title: "CSS" },
    { key: "github", title: "GitHub" },
    { key: "git", title: "Git" },
    { key: "react", title: "React" },
    { key: "vue", title: "Vue" },
    { key: "vite", title: "Vite" },
    { key: "webpack", title: "Webpack" },
  ];

  /**
   * 加载文章列表
   */
  const loadArticles = async (isRefresh = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const currentPage = isRefresh ? 1 : page;
      const response = await articleApi.getArticleList({
        category: activeTab === "recommend" ? undefined : activeTab,
        page: currentPage,
        pageSize,
      });
      if (isRefresh) {
        setArticles(response.list);
        setPage(1);
      } else {
        setArticles((prev) => [...prev, ...response.list]);
        setPage(currentPage + 1);
      }

      setHasMore(response.list.length === pageSize);
    } catch (error) {
      console.error("加载文章列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 切换分类
   */
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setArticles([]);
    setPage(1);
    setHasMore(true);
  };
  useEffect(() => {
    loadArticles(true);
  }, [activeTab]);
  /**
   * 点赞/取消点赞
   */
  const handleLike = async (article: API.ArticleItemType) => {
    try {
      if (article.isLiked) {
        await articleApi.unlikeArticle(article.id);
        setArticles((prev) =>
          prev.map((item) =>
            item.id === article.id
              ? { ...item, isLiked: false, likeCount: item.likeCount - 1 }
              : item
          )
        );
      } else {
        await articleApi.likeArticle(article.id);
        setArticles((prev) =>
          prev.map((item) =>
            item.id === article.id
              ? { ...item, isLiked: true, likeCount: item.likeCount + 1 }
              : item
          )
        );
        // 推送点赞消息
        addMessage({
          type: "like",
          articleId: article.id,
          articleTitle: article.title,
          content: `您的文章《${article.title}》收到一个新的点赞！`,
        });
      }
    } catch (error) {
      console.error("操作失败:", error);
    }
  };

  /**
   * 收藏/取消收藏
   */
  const handleCollect = async (article: API.ArticleItemType) => {
    try {
      if (article.isCollected) {
        await articleApi.uncollectArticle(article.id);
        setArticles((prev) =>
          prev.map((item) =>
            item.id === article.id ? { ...item, isCollected: false } : item
          )
        );
      } else {
        await articleApi.collectArticle(article.id);
        setArticles((prev) =>
          prev.map((item) =>
            item.id === article.id ? { ...item, isCollected: true } : item
          )
        );
        // 推送收藏消息
        addMessage({
          type: "collect",
          articleId: article.id,
          articleTitle: article.title,
          content: `您的文章《${article.title}》被收藏啦！`,
        });
      }
    } catch (error) {
      console.error("操作失败:", error);
    }
  };

  /**
   * 跳转到文章详情
   */
  const handleArticleClick = (article: API.ArticleItemType) => {
    navigate(`/article/detail/${article.id}`);
  };

  /**
   * 格式化时间
   */
  const formatTime = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "今天";
    } else if (days === 1) {
      return "昨天";
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  useEffect(() => {
    loadArticles(true);
  }, []);

  return (
    <div className="article-list-page">
      {/* 分类Tabs */}
      <div className="article-tabs">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          style={{
            "--title-font-size": "14px",
            "--content-padding": "0",
          }}
        >
          {categories.map((category) => (
            <Tabs.Tab title={category.title} key={category.key} />
          ))}
        </Tabs>
      </div>

      {/* 文章列表 */}
      <div className="article-content">
        <div className="article-list">
          {articles.map((article) => (
            <div
              className="article-item"
              key={article.id}
              onClick={() => handleArticleClick(article)}
            >
              <div className="article-meta-row">
                <img
                  className="article-avatar"
                  src={article.authorAvatar}
                  alt={article.author}
                />
                <span className="article-author">{article.author}</span>
                <span className="article-time">
                  {formatTime(article.publishTime)}
                </span>
              </div>
              <div className="article-title">{article.title}</div>
              <div className="article-summary">{article.summary}</div>
              <div className="article-tags">
                {article.tags.slice(0, 3).map((tag) => (
                  <Tag key={tag} color="primary" fill="outline">
                    {tag}
                  </Tag>
                ))}
              </div>
              <div className="article-bottom-row">
                {/* 操作按钮 */}
                <span className="article-stat">
                  <EyeOutline />
                  {article.readCount}
                </span>
                <div
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(article);
                  }}
                >
                  {article.isLiked ? (
                    <HeartFill color="#ff4757" />
                  ) : (
                    <HeartOutline />
                  )}
                  <span>点赞</span>
                </div>
                <div
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCollect(article);
                  }}
                >
                  {article.isCollected ? (
                    <StarFill color="#ffa502" />
                  ) : (
                    <StarOutline />
                  )}
                  <span>收藏</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* 加载更多 */}
        <InfiniteScroll
          loadMore={() => loadArticles()}
          hasMore={hasMore}
          threshold={250}
        >
          {hasMore ? (
            <div className="loading-more">
              <SpinLoading />
              <span>加载中...</span>
            </div>
          ) : (
            <div className="no-more">
              <span>没有更多了</span>
            </div>
          )}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default ArticleList;
