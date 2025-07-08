declare namespace API {
  import type { Dayjs } from "dayjs";
  /**
   * 全局类型接口编写规则：
   * 1. 首字母大写，并且驼峰命名
   * 2. 尾部以Type结尾，表明属于类型字段
   */
  // ======================================================================
  /**
   * 菜单的配置项，用于动态渲染：
   *  key: 唯一标志
   *  title: 菜单项值（国际化已开启）
   *  path：用于路由跳转
   *  layout： 是否是布局组件，如果不是，则不会渲染菜单
   *  component：组件所在路径，从pages路径下开始
   *  icon：菜单图标
   *  hidden: 是否隐藏该菜单项
   *  routes：子级菜单项
   */
  interface MenuRoutesType extends Record<string, any> {
    title?: string;
    key?: string;
    path: string;
    layout?: boolean;
    icon?: string | FunctionComponent<any> | ComponentClass<any, any>;
    routes?: MenuRoutesType[];
    component?: any;
    exact?: boolean;
    redirect?: string;
    hidden?: boolean;
    hideTabBar?: boolean;
  }
  // 卡片列表类型
  interface CardListType {
    name: string;
    link: string;
    avatar: string;
    description: string;
    id: number;
    linkId: string;
  }
  // 讯飞API密钥类型
  interface ApiInfoType {
    APIKey: string;
    APISecret: string;
    APPID: string;
  }
  // 用户信息类型
  interface UseInfoType {
    username: string;
    userId: string;
    [propsname: string]: any;
  }
  // =======================文章列表类型==============================
  interface ArticleTableDataType {
    editorId: string;
    editorContent: string;
    title: string;
    createTime: string;
    id: number;
    imgBg: string;
    typeName: string;
    count: number;
  }
  //============================任务通知==================================
  interface TaskListType {
    task: string;
    taskId: string;
    jobId: string;
    createTime: string;
    reminderTime: string;
    reminderPattern: string;
    intervalUnit: string;
    status: string;
    checked: boolean;
  }
  // ==============================图片上传======================
  interface ImageUploadType {
    id: number;
    createTime: string;
    originalname: string;
    filename: string;
    imgId: string;
    imgPath: string;
    imgUrl: string;
    imgType: string;
    descrption: string;
  }

  interface CalendarEvent {
    calendarId: string;
    startDate: string | Dayjs;
    endDate?: string | Dayjs;
    content: string;
    type?: "warning" | "success" | "error" | "processing";
  }

  // =======================大事件===========================
  interface EventInfoType {
    eventId: string;
    title: string;
    descrption: string;
    createTime: string;
    finishTime: string;
    processTime: string;
    description?: string;
    status: "finish" | "error" | "wait" | "process";
    tag: number; //事情重要程度
  }
  // =============================接种疫苗=================================
  interface VaccinationType {
    batchNumber: string;
    vaccineName: string;
    inoculabilityTime?: string;
    noticeTime?: string;
    createTime?: string;
    description?: string;
    status?: "finish" | "error" | "wait" | "process";
    tag: number; //事情重要程度
  }

  // =============================文章系统=================================
  /**
   * 文章分类类型
   */
  interface ArticleCategoryType {
    key: string;
    title: string;
    icon?: string;
  }

  /**
   * 文章列表项类型
   */
  interface ArticleItemType {
    id: string;
    title: string;
    summary: string;
    content: string;
    coverImage: string;
    category: string;
    author: string;
    authorAvatar: string;
    publishTime: string;
    readCount: number;
    likeCount: number;
    commentCount: number;
    isLiked: boolean;
    isCollected: boolean;
    tags: string[];
    articleId: string;
  }

  /**
   * 文章详情类型
   */
  interface ArticleDetailType extends ArticleItemType {
    htmlContent: string;
    markdownContent: string;
  }

  /**
   * 评论类型
   */
  interface CommentType {
    id: string;
    articleId: string;
    content: string;
    author: string;
    authorAvatar: string;
    createTime: string;
    likeCount: number;
    isLiked: boolean;
    replies?: CommentType[];
    canvasImage?: string;
  }

  /**
   * 文章列表请求参数
   */
  interface ArticleListParams {
    category?: string;
    page: number;
    pageSize: number;
    keyword?: string;
  }

  /**
   * 文章列表响应类型
   */
  interface ArticleListResponse {
    list: ArticleItemType[];
    total: number;
    page: number;
    pageSize: number;
  }
}
