import React, { useState, useEffect } from "react";
import { useNavigate } from "umi";
import {
  NavBar,
  List,
  Card,
  Image,
  Tag,
  SpinLoading,
  InfiniteScroll,
  Empty,
  Toast,
  PullToRefresh,
} from "antd-mobile";
import {
  HeartOutline,
  HeartFill,
  StarOutline,
  StarFill,
  EyeOutline,
  LeftOutline,
} from "antd-mobile-icons";
import { articleApi } from "@/service/api/article";
import "./collections.less";

/**
 * 收藏文章页面
 */
const ArticleCollections: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [articles, setArticles] = useState<API.ArticleItemType[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  /**
   * 加载收藏文章列表
   */
  const loadCollections = async (isRefresh = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const currentPage = isRefresh ? 1 : page;
      const response = await articleApi.getMyCollections(currentPage, pageSize);

      if (isRefresh) {
        setArticles(response.list);
        setPage(1);
      } else {
        setArticles((prev) => [...prev, ...response.list]);
        setPage(currentPage + 1);
      }

      setHasMore(response.list.length === pageSize);
    } catch (error) {
      console.error("加载收藏文章失败:", error);
      Toast.show({
        icon: "fail",
        content: "加载失败",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 点赞/取消点赞
   */
  const handleLike = async (article: API.ArticleItemType) => {
    try {
      if (article.isLiked) {
        await articleApi.unlikeArticle(article.articleId);
        setArticles((prev) =>
          prev.map((item) =>
            item.articleId === article.articleId
              ? { ...item, isLiked: false, likeCount: item.likeCount - 1 }
              : item
          )
        );
      } else {
        await articleApi.likeArticle(article.articleId);
        setArticles((prev) =>
          prev.map((item) =>
            item.articleId === article.articleId
              ? { ...item, isLiked: true, likeCount: item.likeCount + 1 }
              : item
          )
        );
      }
    } catch (error) {
      console.error("操作失败:", error);
      Toast.show({
        icon: "fail",
        content: "操作失败",
      });
    }
  };

  /**
   * 取消收藏
   */
  const handleUncollect = async (article: API.ArticleItemType) => {
    try {
      await articleApi.uncollectArticle(article?.articleId);
      setArticles((prev) =>
        prev.filter((item) => item.articleId !== article.articleId)
      );
      Toast.show({
        icon: "success",
        content: "已取消收藏",
      });
    } catch (error) {
      console.error("取消收藏失败:", error);
      Toast.show({
        icon: "fail",
        content: "操作失败",
      });
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

  return (
    <div className="article-collections-page">
      {/* 收藏文章列表 */}
      <PullToRefresh
        onRefresh={async () => {
          await loadCollections(true);
        }}
      >
        <div className="collections-content">
          {articles.length === 0 && !loading ? (
            <Empty
              description="暂无收藏文章"
              image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            />
          ) : (
            <ul>
              {articles.map((article) => (
                <li
                  key={article.id}
                  onClick={() => handleArticleClick(article)}
                  style={{ marginBottom: "12px" }}
                >
                  <Card className="collection-card">
                    <div className="author-info">
                      {article.authorAvatar && (
                        <Image
                          src={article.authorAvatar}
                          width={32}
                          height={32}
                          fit="cover"
                          style={{ borderRadius: 16 }}
                        />
                      )}
                      <span className="author-name">{article.author}</span>
                      {/* <span className="publish-time">
                            {formatTime(article.publishTime)}
                          </span> */}
                    </div>
                    <div className="article-header">
                      <div className="article-cover">
                        <img src={article.coverImage} alt={article.title} />
                      </div>
                      <div className="article-info">
                        <h3 className="article-title">{article.title}</h3>
                        <p className="article-summary">{article.summary}</p>
                        <div className="article-tags">
                          {Array.isArray(article.tags) &&
                            article.tags?.slice(0, 3).map((tag) => (
                              <Tag key={tag} color="primary" fill="outline">
                                {tag}
                              </Tag>
                            ))}
                        </div>
                      </div>
                    </div>
                    {/* 操作按钮 */}
                    <div className="article-actions">
                      <div className="action-btn">
                        <EyeOutline />
                        {article.readCount}
                      </div>
                      <div
                        className="action-btn"
                        // onClick={(e) => {
                        //   e.stopPropagation();
                        //   handleLike(article);
                        // }}
                      >
                        {article.isLiked ? (
                          <HeartFill color="#ff4757" />
                        ) : (
                          <HeartOutline />
                        )}
                        {article.likeCount}
                      </div>
                      <div
                        className="action-btn danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUncollect(article);
                        }}
                      >
                        <StarFill color="#ffa502" />
                        <span>取消收藏</span>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}

          {/* 加载更多 */}
          <InfiniteScroll
            loadMore={() => loadCollections()}
            hasMore={hasMore}
            threshold={250}
          >
            {hasMore ? (
              <div className="loading-more">
                <SpinLoading />
                <span>加载中...</span>
              </div>
            ) : articles.length > 0 ? (
              <div className="no-more">
                <span>没有更多了</span>
              </div>
            ) : null}
          </InfiniteScroll>
        </div>
      </PullToRefresh>
    </div>
  );
};

export default ArticleCollections;
