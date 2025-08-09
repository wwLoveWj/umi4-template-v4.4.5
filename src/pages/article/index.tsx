import React, { useState, useEffect } from "react";
import {
  Tabs,
  List,
  Card,
  Avatar,
  Tag,
  SpinLoading,
  InfiniteScroll,
  Toast,
  PullToRefresh,
  Skeleton,
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
  SearchOutline,
  AddOutline,
} from "antd-mobile-icons";
import "./style.less";
import { addMessage } from "@/utils/messageCenter";
import { useRequest } from "ahooks";
import { sendSimpleNotification } from "@/utils/pushExample";
import { storage } from "@/utils/storage";
/**
 * 文章列表页面
 */
const ArticleList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recommend");
  const [hasMore, setHasMore] = useState(false);
  const [articleInfoList, setArticles] = useState<API.ArticleItemType[]>([]);
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const pageSize = 10;
  const loginInfo = storage.get("login-info");
  const myUserId = loginInfo?.id;

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

  const { runAsync: loadArticleList, loading } = useRequest(
    async (params) => {
      const res = await articleApi.getArticleList(params);
      return res?.list;
    },
    {
      refreshDeps: [activeTab],
    }
  );
  /**
   * 加载文章列表
   */
  const loadMore = async (
    search: string,
    currentPage: number,
    category: string = activeTab
  ) => {
    const res = await loadArticleList({
      category: category === "recommend" ? undefined : category,
      page: currentPage,
      pageSize,
      keyword: search || searchValue,
      isPage: true,
    });
    setArticles((prev) => [...prev, ...(res || [])]);
    setHasMore(res?.length === pageSize); // 关键：如果返回数据不足一页，说明没有更多了
    setPage((prev) => prev + 1);
  };

  // const { runAsync: articleRunAsync } = useRequest(
  //   async ({ search, page: currentPage }) => {
  //     const res = await articleApi.getArticleList({
  //       category: activeTab === "recommend" ? undefined : activeTab,
  //       page: currentPage,
  //       pageSize,
  //       keyword: search || searchValue,
  //       isPage: true,
  //     });
  //     return res?.list;
  //   },
  //   {
  //     onSuccess: (res) => {
  //       debugger;
  //       setPage((prev) => prev + 1);
  //       setArticles((prev) => [...prev, ...res]);
  //       setHasMore(res?.length === pageSize);
  //     },
  //   }
  // );

  /**
   * 切换分类
   */
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setArticles([]);
    setPage(1);
    // setHasMore(true);
    loadMore("", 1, key);
  };

  /**
   * 搜索
   */
  const handleSearch = () => {
    setArticles([]);
    setPage(1);
    // setHasMore(true);
    loadMore(searchValue, 1);
  };

  /**
   * 跳转到添加文章
   */
  const handleAddArticle = () => {
    navigate("/article/add");
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
              ? {
                  ...item,
                  isLiked: false,
                  likeCount: item.likeCount - 1,
                }
              : item
          )
        );
      } else {
        await articleApi.likeArticle({ fromUserId: myUserId || 0, article });
        setArticles((prev) =>
          prev.map((item) =>
            item.articleId === article.articleId
              ? {
                  ...item,
                  isLiked: true,
                  likeCount: item.likeCount + 1,
                }
              : item
          )
        );
        // 推送点赞消息
        addMessage({
          type: "like",
          articleId: article.articleId,
          articleTitle: article.title,
          content: `您的文章《${article.title}》收到一个新的点赞！`,
        });
        // 新增：点赞成功后通知
        sendSimpleNotification(
          "点赞成功",
          `你为《${article.title}》点了个赞！`
        );
      }
    } catch (error) {
      Toast.show({ icon: "fail", content: "操作失败" });
    }
  };

  /**
   * 收藏/取消收藏
   */
  const handleCollect = async (article: API.ArticleItemType) => {
    try {
      if (article.isCollected) {
        await articleApi.uncollectArticle(article.articleId);
        setArticles((prev) =>
          prev.map((item) =>
            item.articleId === article.articleId
              ? { ...item, isCollected: false }
              : item
          )
        );
      } else {
        await articleApi.collectArticle({ fromUserId: myUserId || 0, article });
        setArticles((prev) =>
          prev.map((item) =>
            item.articleId === article.articleId
              ? { ...item, isCollected: true }
              : item
          )
        );
        // 推送收藏消息
        addMessage({
          type: "collect",
          articleId: article.articleId,
          articleTitle: article.title,
          content: `您的文章《${article.title}》被收藏啦！`,
        });
      }
    } catch (error) {
      Toast.show({ icon: "fail", content: "操作失败" });
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
    loadMore("", 1);
  }, []);

  return (
    <div className="article-list-page">
      {/* 搜索栏和添加按钮 */}
      <div className="article-header-bar">
        <div className="article-search-box">
          <input
            className="article-search-input"
            type="text"
            placeholder="搜索文章/标签/作者"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <span className="search-icon" onClick={handleSearch}>
            <SearchOutline />
          </span>
        </div>
        <button className="article-add-btn" onClick={handleAddArticle}>
          <AddOutline />
        </button>
      </div>
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
      <PullToRefresh
        onRefresh={async () => {
          await loadMore("", 1);
        }}
      >
        <div className="article-content">
          {loading ? (
            <>
              <Skeleton.Title animated />
              <Skeleton.Paragraph lineCount={5} animated />
            </>
          ) : (
            <div className="article-list">
              {(articleInfoList || [])?.map((article) => (
                <div
                  className="article-item"
                  key={article.articleId}
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
                  {/* 新增：有封面图时右侧展示图片 */}
                  {article.coverImage ? (
                    <div className="article-item-row">
                      <div className="article-item-main">
                        <div className="article-title">{article.title}</div>
                        <div className="article-summary">{article.summary}</div>
                        <div className="article-tags">
                          {Array.isArray(article.tags) &&
                            article.tags?.slice(0, 3).map((tag) => (
                              <Tag key={tag} color="primary" fill="outline">
                                {tag}
                              </Tag>
                            ))}
                        </div>
                        <div className="article-bottom-row">
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
                      <img
                        className="article-cover"
                        src={article.coverImage}
                        alt="封面"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="article-title">{article.title}</div>
                      <div className="article-summary">{article.summary}</div>
                      <div className="article-tags">
                        {Array.isArray(article.tags) &&
                          article.tags?.slice(0, 3).map((tag) => (
                            <Tag key={tag} color="primary" fill="outline">
                              {tag}
                            </Tag>
                          ))}
                      </div>
                      <div className="article-bottom-row">
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
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* 加载更多 */}
          <InfiniteScroll
            loadMore={() => loadMore("", page)}
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
      </PullToRefresh>
    </div>
  );
};

export default ArticleList;
