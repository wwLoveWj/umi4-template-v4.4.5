import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "umi";
import {
  NavBar,
  Button,
  Tag,
  Toast,
  SpinLoading,
  Popup,
  TextArea,
  List,
  Empty,
} from "antd-mobile";
import {
  HeartOutline,
  HeartFill,
  StarOutline,
  StarFill,
  EyeOutline,
  MessageOutline,
  LeftOutline,
} from "antd-mobile-icons";
import { articleApi } from "@/service/api/article";
import { addMessage } from "@/utils/messageCenter";
import "./detail.less";
import CanvasBoard from "@/components/CanvasBoard";

/**
 * 文章详情页面
 */
const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<API.ArticleDetailType | null>(null);
  const [comments, setComments] = useState<API.CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [commentPage, setCommentPage] = useState(1);
  const [commentCanvas, setCommentCanvas] = useState<string>("");
  const [showCanvas, setShowCanvas] = useState(false);

  /**
   * 加载文章详情
   */
  const loadArticleDetail = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await articleApi.getArticleDetail(id);
      setArticle(data);
    } catch (error) {
      console.error("加载文章详情失败:", error);
      Toast.show({
        icon: "fail",
        content: "加载文章失败",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 加载评论列表
   */
  const loadComments = async (isRefresh = false) => {
    if (!id) return;

    try {
      const currentPage = isRefresh ? 1 : commentPage;
      const response = await articleApi.getArticleComments(id, currentPage);

      if (isRefresh) {
        setComments(response.list);
        setCommentPage(1);
      } else {
        setComments((prev) => [...prev, ...response.list]);
        setCommentPage(currentPage + 1);
      }

      setHasMoreComments(response.list.length === 20);
    } catch (error) {
      console.error("加载评论失败:", error);
    }
  };

  /**
   * 发表评论
   */
  const handleSubmitComment = async () => {
    if (!id || !commentText.trim()) {
      Toast.show({
        icon: "fail",
        content: "请输入评论内容",
      });
      return;
    }

    setCommentLoading(true);
    try {
      // 发送评论内容和画板图片（如有）
      const newComment = await articleApi.addComment({
        articleId: id,
        content: commentText.trim(),
        canvasImage: commentCanvas || undefined,
      });

      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      setCommentCanvas("");
      setShowCommentInput(false);

      // 更新文章评论数
      if (article) {
        setArticle((prev) =>
          prev ? { ...prev, commentCount: prev.commentCount + 1 } : null
        );
      }

      Toast.show({
        icon: "success",
        content: "评论发表成功",
      });
      loadComments(true);
    } catch (error) {
      console.error("发表评论失败:", error);
      Toast.show({
        icon: "fail",
        content: "评论发表失败",
      });
    } finally {
      setCommentLoading(false);
    }
  };

  /**
   * 点赞/取消点赞文章
   */
  const handleLikeArticle = async () => {
    if (!article) return;
    try {
      if (article.isLiked) {
        await articleApi.unlikeArticle(article.articleId);
        setArticle((prev) =>
          prev
            ? { ...prev, isLiked: false, likeCount: prev.likeCount - 1 }
            : null
        );
        // 推送点赞消息
        addMessage({
          type: "like",
          articleId: article.articleId,
          articleTitle: article.title,
          content: `您的文章《${article.title}》收到一个新的点赞！`,
        });
      } else {
        await articleApi.likeArticle(article.articleId);
        setArticle((prev) =>
          prev
            ? { ...prev, isLiked: true, likeCount: prev.likeCount + 1 }
            : null
        );
        // 推送点赞消息
        addMessage({
          type: "like",
          articleId: article.articleId,
          articleTitle: article.title,
          content: `您的文章《${article.title}》收到一个新的点赞！`,
        });
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
   * 收藏/取消收藏文章
   */
  const handleCollectArticle = async () => {
    if (!article) return;
    try {
      if (article.isCollected) {
        await articleApi.uncollectArticle(article.articleId);
        setArticle((prev) => (prev ? { ...prev, isCollected: false } : null));
        Toast.show({
          icon: "success",
          content: "已取消收藏",
        });
      } else {
        await articleApi.collectArticle(article.articleId);
        setArticle((prev) => (prev ? { ...prev, isCollected: true } : null));
        Toast.show({
          icon: "success",
          content: "收藏成功",
        });
        // 推送收藏消息
        addMessage({
          type: "collect",
          articleId: article.articleId,
          articleTitle: article.title,
          content: `您的文章《${article.title}》被收藏啦！`,
        });
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
   * 点赞/取消点赞评论
   */
  const handleLikeComment = async (comment: API.CommentType) => {
    try {
      if (comment.isLiked) {
        await articleApi.unlikeComment(comment.id);
        setComments((prev) =>
          prev.map((item) =>
            item.id === comment.id
              ? { ...item, isLiked: false, likeCount: item.likeCount - 1 }
              : item
          )
        );
      } else {
        await articleApi.likeComment(comment.id);
        setComments((prev) =>
          prev.map((item) =>
            item.id === comment.id
              ? { ...item, isLiked: true, likeCount: item.likeCount + 1 }
              : item
          )
        );
      }
    } catch (error) {
      console.error("操作失败:", error);
    }
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
    loadArticleDetail();
    // 防重复统计浏览量
    if (id) {
      const key = `article_viewed_${id}`;
      const lastView = localStorage.getItem(key);
      const now = Date.now();
      const interval = 1000 * 60 * 30; // 30分钟内只计一次
      if (!lastView || now - Number(lastView) > interval) {
        articleApi.addView(id);
        localStorage.setItem(key, String(now));
      }
    }
    loadComments(true);
  }, [id]);

  if (loading) {
    return (
      <div className="article-detail-loading">
        <SpinLoading />
        <span>加载中...</span>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-detail-error">
        <span>文章不存在</span>
      </div>
    );
  }

  return (
    <div className="article-detail-page">
      {/* 导航栏 */}
      <NavBar
        onBack={() => navigate(-1)}
        backArrow={<LeftOutline />}
        className="article-navbar"
      >
        文章详情
      </NavBar>

      <div className="article-detail-content">
        {/* 作者信息区 */}
        <div className="article-detail-meta">
          <img
            className="detail-avatar"
            src={article.authorAvatar}
            alt={article.author}
          />
          <div className="detail-author-info">
            <div className="detail-author-row">
              <span className="detail-author">{article.author}</span>
              <span className="detail-publish">
                {formatTime(article.publishTime)}
              </span>
            </div>
            {/* 可加作者简介 */}
          </div>
          <Button className="detail-follow-btn" size="mini">
            关注
          </Button>
        </div>
        {/* 标题/摘要/正文 */}
        <div className="detail-title">{article.title}</div>
        <div className="detail-summary">{article.summary}</div>
        <div
          className="detail-html"
          dangerouslySetInnerHTML={{ __html: article.htmlContent }}
        />
        {/* 标签 */}
        <div className="detail-tags">
          {Array.isArray(article.tags) &&
            article.tags?.map((tag) => (
              <Tag key={tag} color="primary" fill="outline">
                {tag}
              </Tag>
            ))}
        </div>
        {/* 操作区 */}
        {/* <div className="detail-actions">
          <span className="action-btn">
            <EyeOutline />
            {article.readCount}
          </span>
          <span className="action-btn" onClick={handleLikeArticle}>
            {article.isLiked ? <HeartFill color="#ff4757" /> : <HeartOutline />}
            {article.likeCount}
          </span>
          <span className="action-btn" onClick={handleCollectArticle}>
            {article.isCollected ? (
              <StarFill color="#ffa502" />
            ) : (
              <StarOutline />
            )}
            收藏
          </span>
          <span className="action-btn">
            <MessageOutline />
            {article.commentCount}
          </span>
        </div> */}
        <div className="detail-divider" />
        {/* 评论区 */}
        <div className="detail-comments">
          <div
            style={{ fontWeight: 600, fontSize: 16, margin: "16px 0 8px 0" }}
          >
            评论
          </div>
          {comments.length === 0 ? (
            <Empty description="暂无评论" />
          ) : (
            <List>
              {comments.map((comment) =>
                comment && comment.authorAvatar ? (
                  <List.Item key={comment.id} className="comment-item">
                    <div
                      className="comment-content"
                      style={{ display: "flex", alignItems: "flex-start" }}
                    >
                      {/* 头像 */}
                      <img
                        className="detail-avatar"
                        src={comment.authorAvatar}
                        alt={comment.author}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          marginRight: 10,
                          flexShrink: 0,
                        }}
                      />
                      {/* 右侧信息+内容 */}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span style={{ fontWeight: 600, fontSize: 15 }}>
                            {comment.author}
                          </span>
                          <span
                            style={{
                              color: "#aaa",
                              fontSize: 12,
                              margin: "2px 0 0 0",
                            }}
                          >
                            {formatTime(comment.createTime)}
                          </span>
                        </div>
                        {/* 内容区，与时间左对齐 */}
                        <div style={{ marginTop: 8 }}>
                          <div className="comment-text">{comment.content}</div>
                          {comment.canvasImage && (
                            <div style={{ marginTop: 8 }}>
                              <img
                                src={comment.canvasImage}
                                alt="画板内容"
                                style={{
                                  width: "100%",
                                  maxHeight: 120,
                                  borderRadius: 8,
                                  objectFit: "contain",
                                  background: "#f6f6f6",
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="comment-actions">
                          <div
                            className="comment-like"
                            onClick={() => handleLikeComment(comment)}
                          >
                            {comment.isLiked ? (
                              <HeartFill color="#ff4757" />
                            ) : (
                              <HeartOutline />
                            )}
                            <span>{comment.likeCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                ) : null
              )}
            </List>
          )}
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="article-actions">
        <div className="action-input">
          <div
            className="comment-input-placeholder"
            onClick={() => setShowCommentInput(true)}
          >
            <MessageOutline />
            <span>写评论...</span>
          </div>
        </div>
        <div className="action-buttons">
          <div className="action-btn" onClick={handleLikeArticle}>
            {article.isLiked ? <HeartFill color="#ff4757" /> : <HeartOutline />}
            {article.likeCount}
          </div>
          <div className="action-btn" onClick={handleCollectArticle}>
            {article.isCollected ? (
              <StarFill color="#ffa502" />
            ) : (
              <StarOutline />
            )}
            <span>收藏</span>
          </div>
        </div>
      </div>

      {/* 评论输入弹窗 */}
      <Popup
        visible={showCommentInput}
        onMaskClick={() => setShowCommentInput(false)}
        position="bottom"
        bodyStyle={{ height: "50vh", padding: 0 }}
      >
        <div
          className="comment-input-popup"
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <div className="comment-input-header">
            <span>发表评论</span>
            <Button
              fill="none"
              size="small"
              onClick={() => setShowCommentInput(false)}
            >
              取消
            </Button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
            <TextArea
              placeholder="请输入评论内容..."
              value={commentText}
              onChange={setCommentText}
              rows={4}
              maxLength={500}
              showCount
            />
            {/* 打开画板按钮 */}
            {!showCanvas && (
              <Button
                style={{ margin: "12px 0" }}
                size="small"
                onClick={() => setShowCanvas(true)}
              >
                打开画板
              </Button>
            )}
            {/* 画板功能区 */}
            {showCanvas && (
              <div style={{ margin: "12px 0" }}>
                <CanvasBoard onChange={setCommentCanvas} height={220} />
              </div>
            )}
          </div>
          <div
            style={{
              padding: "12px",
              background: "#fff",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Button
              block
              color="primary"
              loading={commentLoading}
              onClick={handleSubmitComment}
              disabled={!commentText.trim() && !commentCanvas}
            >
              发表评论
            </Button>
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default ArticleDetail;
