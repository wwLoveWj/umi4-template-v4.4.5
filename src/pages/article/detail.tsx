import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "umi";
import {
  NavBar,
  Card,
  Avatar,
  Tag,
  Button,
  TextArea,
  List,
  SpinLoading,
  Toast,
  Popup,
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
      const newComment = await articleApi.addComment({
        articleId: id,
        content: commentText.trim(),
      });

      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
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
        await articleApi.unlikeArticle(article.id);
        setArticle((prev) =>
          prev
            ? { ...prev, isLiked: false, likeCount: prev.likeCount - 1 }
            : null
        );
        // 推送点赞消息
        addMessage({
          type: "like",
          articleId: article.id,
          articleTitle: article.title,
          content: `您的文章《${article.title}》收到一个新的点赞！`,
        });
      } else {
        await articleApi.likeArticle(article.id);
        setArticle((prev) =>
          prev
            ? { ...prev, isLiked: true, likeCount: prev.likeCount + 1 }
            : null
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
        await articleApi.uncollectArticle(article.id);
        setArticle((prev) => (prev ? { ...prev, isCollected: false } : null));
        Toast.show({
          icon: "success",
          content: "已取消收藏",
        });
      } else {
        await articleApi.collectArticle(article.id);
        setArticle((prev) => (prev ? { ...prev, isCollected: true } : null));
        Toast.show({
          icon: "success",
          content: "收藏成功",
        });
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

      {/* 文章内容 */}
      <div className="article-content">
        <Card className="article-header-card">
          <h1 className="article-title">{article.title}</h1>
          <div className="article-meta">
            <div className="author-info">
              <Avatar src={article.authorAvatar} />
              <span className="author-name">{article.author}</span>
              <span className="publish-time">
                {formatTime(article.publishTime)}
              </span>
            </div>
            <div className="article-stats">
              <span className="stat-item">
                <EyeOutline />
                {article.readCount}
              </span>
              <span className="stat-item">
                {article.isLiked ? (
                  <HeartFill color="#ff4757" />
                ) : (
                  <HeartOutline />
                )}
                {article.likeCount}
              </span>
              <span className="stat-item">
                <MessageOutline />
                {article.commentCount}
              </span>
            </div>
          </div>
          <div className="article-tags">
            {article.tags.map((tag) => (
              <Tag key={tag} color="primary" fill="outline">
                {tag}
              </Tag>
            ))}
          </div>
        </Card>

        <Card className="article-body-card">
          <div
            className="article-content-html"
            dangerouslySetInnerHTML={{ __html: article.htmlContent }}
          />
        </Card>

        {/* 评论列表 */}
        <Card className="comments-card">
          <div className="comments-header">
            <h3>评论 ({article.commentCount})</h3>
          </div>
          <List className="comments-list">
            {comments.map((comment) => (
              <List.Item key={comment.id} className="comment-item">
                <div className="comment-content">
                  <div className="comment-header">
                    <Avatar src={comment.authorAvatar} />
                    <div className="comment-info">
                      <span className="comment-author">{comment.author}</span>
                      <span className="comment-time">
                        {formatTime(comment.createTime)}
                      </span>
                    </div>
                  </div>
                  <div className="comment-text">{comment.content}</div>
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
              </List.Item>
            ))}
          </List>

          {hasMoreComments && (
            <div className="load-more-comments">
              <Button fill="none" size="small" onClick={() => loadComments()}>
                加载更多评论
              </Button>
            </div>
          )}
        </Card>
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
            <span>点赞</span>
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
        bodyStyle={{ height: "40vh" }}
      >
        <div className="comment-input-popup">
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
          <div className="comment-input-content">
            <TextArea
              placeholder="请输入评论内容..."
              value={commentText}
              onChange={setCommentText}
              rows={4}
              maxLength={500}
              showCount
            />
            <Button
              block
              color="primary"
              loading={commentLoading}
              onClick={handleSubmitComment}
              disabled={!commentText.trim()}
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
