import request from "../request";

/**
 * 文章系统API服务
 */
export const articleApi = {
  /**
   * 获取文章分类列表
   */
  getCategories: () => {
    return request<API.ArticleCategoryType[]>("/api/article/categories", {
      method: "GET",
    });
  },

  /**
   * 获取文章列表
   */
  getArticleList: (params: API.ArticleListParams) => {
    return request<API.ArticleListResponse>("/api/article/list", {
      method: "GET",
      params,
    });
  },

  /**
   * 获取文章详情
   */
  getArticleDetail: (id: string) => {
    return request<API.ArticleDetailType>(`/api/article/detail/${id}`, {
      method: "GET",
    });
  },

  /**
   * 获取文章评论列表
   */
  getArticleComments: (
    articleId: string,
    page: number = 1,
    pageSize: number = 20
  ) => {
    return request<{ list: API.CommentType[]; total: number }>(
      "/api/article/comments",
      {
        method: "GET",
        params: { articleId, page, pageSize },
      }
    );
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
    return request<API.ArticleListResponse>("/api/article/my-collections", {
      method: "GET",
      params: { page, pageSize },
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

  /**
   * 新增文章
   */
  addArticle: (data: {
    title: string;
    summary?: string;
    content: string;
    coverImage?: string;
    category?: string;
    author?: string;
    authorAvatar?: string;
    tags?: string[];
    articleId: string;
  }) => {
    return request<{ id: string }>("/api/article/add", {
      method: "POST",
      data,
    });
  },
};
