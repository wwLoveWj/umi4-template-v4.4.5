import request from "../request";
import {
  mockCategories,
  mockArticles,
  mockComments,
  generateMockArticleDetail,
  getArticlesByCategory,
  getCollectedArticles,
} from "@/utils/mockArticleData";

/**
 * 文章系统API服务
 */
export const articleApi = {
  /**
   * 获取文章分类列表
   */
  getCategories: () => {
    // 使用模拟数据
    return Promise.resolve(mockCategories);
  },

  /**
   * 获取文章列表
   */
  getArticleList: (params: API.ArticleListParams) => {
    // 使用模拟数据
    const { category, page, pageSize } = params;
    const filteredArticles = getArticlesByCategory(category);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const list = filteredArticles.slice(start, end);

    return Promise.resolve({
      list,
      total: filteredArticles.length,
      page,
      pageSize,
    });
  },

  /**
   * 获取文章详情
   */
  getArticleDetail: (id: string) => {
    // 使用模拟数据
    const articleDetail = generateMockArticleDetail(id);
    if (!articleDetail) {
      return Promise.reject(new Error("文章不存在"));
    }
    return Promise.resolve(articleDetail);
  },

  /**
   * 获取文章评论列表
   */
  getArticleComments: (
    articleId: string,
    page: number = 1,
    pageSize: number = 20
  ) => {
    // 使用模拟数据
    const filteredComments = mockComments.filter(
      (comment) => comment.articleId === articleId
    );
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const list = filteredComments.slice(start, end);

    return Promise.resolve({
      list,
      total: filteredComments.length,
    });
  },

  /**
   * 发表评论
   */
  addComment: (data: {
    articleId: string;
    content: string;
    parentId?: string;
  }) => {
    return request<API.CommentType>("/api/article/comment", {
      method: "POST",
      data,
    });
  },

  /**
   * 点赞文章
   */
  likeArticle: (articleId: string) => {
    return request<{ success: boolean }>("/api/article/like", {
      method: "POST",
      data: { articleId },
    });
  },

  /**
   * 取消点赞文章
   */
  unlikeArticle: (articleId: string) => {
    return request<{ success: boolean }>("/api/article/unlike", {
      method: "POST",
      data: { articleId },
    });
  },

  /**
   * 收藏文章
   */
  collectArticle: (articleId: string) => {
    return request<{ success: boolean }>("/api/article/collect", {
      method: "POST",
      data: { articleId },
    });
  },

  /**
   * 取消收藏文章
   */
  uncollectArticle: (articleId: string) => {
    return request<{ success: boolean }>("/api/article/uncollect", {
      method: "POST",
      data: { articleId },
    });
  },

  /**
   * 获取我的收藏文章列表
   */
  getMyCollections: (page: number = 1, pageSize: number = 20) => {
    // 使用模拟数据
    const collectedArticles = getCollectedArticles();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const list = collectedArticles.slice(start, end);

    return Promise.resolve({
      list,
      total: collectedArticles.length,
      page,
      pageSize,
    });
  },

  /**
   * 点赞评论
   */
  likeComment: (commentId: string) => {
    return request<{ success: boolean }>("/api/article/comment/like", {
      method: "POST",
      data: { commentId },
    });
  },

  /**
   * 取消点赞评论
   */
  unlikeComment: (commentId: string) => {
    return request<{ success: boolean }>("/api/article/comment/unlike", {
      method: "POST",
      data: { commentId },
    });
  },
};
