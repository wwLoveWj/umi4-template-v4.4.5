/**
 * 模拟文章数据
 */

export const mockCategories: API.ArticleCategoryType[] = [
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

export const mockArticles: API.ArticleItemType[] = [
  {
    id: "1",
    title: "React 18 新特性详解：并发渲染与自动批处理",
    summary:
      "React 18 带来了许多激动人心的新特性，包括并发渲染、自动批处理、Suspense 改进等。本文将详细介绍这些新特性的使用方法和最佳实践。",
    content: "React 18 是 React 的一个重要版本更新，引入了并发渲染的概念...",
    coverImage:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
    category: "react",
    author: "React 官方团队",
    authorAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
    publishTime: "2024-01-15T10:00:00Z",
    readCount: 1250,
    likeCount: 89,
    commentCount: 23,
    isLiked: false,
    isCollected: false,
    tags: ["React", "JavaScript", "前端"],
  },
  {
    id: "2",
    title: "Vue 3 Composition API 深度解析",
    summary:
      "Vue 3 的 Composition API 为组件逻辑复用提供了更灵活的方式。本文将从基础概念到高级用法，全面解析 Composition API。",
    content: "Vue 3 的 Composition API 是一个全新的组件逻辑组织方式...",
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
    category: "vue",
    author: "Vue.js 社区",
    authorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
    publishTime: "2024-01-14T14:30:00Z",
    readCount: 980,
    likeCount: 67,
    commentCount: 15,
    isLiked: true,
    isCollected: true,
    tags: ["Vue", "JavaScript", "前端框架"],
  },
  {
    id: "3",
    title: "现代 CSS 布局技术：Grid 与 Flexbox 实战指南",
    summary:
      "CSS Grid 和 Flexbox 是现代网页布局的两大核心技术。本文将通过实际案例展示如何结合使用这两种技术创建复杂的响应式布局。",
    content: "CSS Grid 和 Flexbox 的出现彻底改变了网页布局的方式...",
    coverImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    category: "css",
    author: "CSS 专家",
    authorAvatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face",
    publishTime: "2024-01-13T09:15:00Z",
    readCount: 756,
    likeCount: 45,
    commentCount: 12,
    isLiked: false,
    isCollected: false,
    tags: ["CSS", "布局", "响应式"],
  },
  {
    id: "4",
    title: "Git 工作流程最佳实践：从分支策略到代码审查",
    summary:
      "高效的 Git 工作流程是团队协作的基础。本文将介绍几种流行的 Git 工作流程，包括 Git Flow、GitHub Flow 等，并分享最佳实践。",
    content:
      "Git 作为最流行的版本控制系统，其工作流程的设计直接影响团队协作效率...",
    coverImage:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
    category: "git",
    author: "Git 专家",
    authorAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
    publishTime: "2024-01-12T16:45:00Z",
    readCount: 1120,
    likeCount: 78,
    commentCount: 19,
    isLiked: true,
    isCollected: false,
    tags: ["Git", "版本控制", "团队协作"],
  },
  {
    id: "5",
    title: "Vite 构建工具深度解析：为什么它比 Webpack 更快？",
    summary:
      "Vite 作为新一代前端构建工具，以其极快的启动速度和热更新能力受到开发者青睐。本文将深入分析 Vite 的工作原理和性能优势。",
    content: "Vite 是由 Vue.js 作者尤雨溪开发的新一代前端构建工具...",
    coverImage:
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop",
    category: "vite",
    author: "前端工具专家",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
    publishTime: "2024-01-11T11:20:00Z",
    readCount: 890,
    likeCount: 56,
    commentCount: 14,
    isLiked: false,
    isCollected: true,
    tags: ["Vite", "构建工具", "前端工程化"],
  },
  {
    id: "6",
    title: "JavaScript 异步编程完全指南：从回调到 async/await",
    summary:
      "异步编程是 JavaScript 开发中的核心概念。本文将系统介绍从回调函数到 Promise，再到 async/await 的演进过程和使用技巧。",
    content: "JavaScript 的异步编程模型经历了多次演进，从最初的回调函数...",
    coverImage:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
    category: "js",
    author: "JavaScript 专家",
    authorAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
    publishTime: "2024-01-10T13:10:00Z",
    readCount: 1340,
    likeCount: 92,
    commentCount: 28,
    isLiked: true,
    isCollected: true,
    tags: ["JavaScript", "异步编程", "Promise"],
  },
  {
    id: "7",
    title: "GitHub Actions 自动化部署实战",
    summary:
      "GitHub Actions 提供了强大的 CI/CD 能力。本文将通过实际项目演示如何配置自动化测试、构建和部署流程。",
    content: "GitHub Actions 是 GitHub 提供的持续集成和持续部署服务...",
    coverImage:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
    category: "github",
    author: "DevOps 工程师",
    authorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
    publishTime: "2024-01-09T15:30:00Z",
    readCount: 670,
    likeCount: 38,
    commentCount: 9,
    isLiked: false,
    isCollected: false,
    tags: ["GitHub", "CI/CD", "自动化"],
  },
  {
    id: "8",
    title: "Webpack 5 新特性与优化策略",
    summary:
      "Webpack 5 带来了模块联邦、持久化缓存等重要特性。本文将详细介绍这些新功能以及如何优化构建性能。",
    content:
      "Webpack 5 是 Webpack 的一个重要版本更新，引入了模块联邦等新概念...",
    coverImage:
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop",
    category: "webpack",
    author: "Webpack 专家",
    authorAvatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face",
    publishTime: "2024-01-08T10:45:00Z",
    readCount: 820,
    likeCount: 49,
    commentCount: 16,
    isLiked: false,
    isCollected: false,
    tags: ["Webpack", "构建工具", "前端工程化"],
  },
];

export const mockComments: API.CommentType[] = [
  {
    id: "1",
    articleId: "1",
    content: "这篇文章写得很好，对 React 18 的新特性解释得很清楚！",
    author: "前端开发者",
    authorAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
    createTime: "2024-01-15T11:30:00Z",
    likeCount: 12,
    isLiked: false,
  },
  {
    id: "2",
    articleId: "1",
    content: "并发渲染的概念解释得很透彻，期待更多相关内容！",
    author: "React 爱好者",
    authorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
    createTime: "2024-01-15T12:15:00Z",
    likeCount: 8,
    isLiked: true,
  },
  {
    id: "3",
    articleId: "2",
    content: "Composition API 确实比 Options API 更灵活，感谢分享！",
    author: "Vue 开发者",
    authorAvatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face",
    createTime: "2024-01-14T15:20:00Z",
    likeCount: 15,
    isLiked: false,
  },
];

/**
 * 生成模拟文章详情数据
 */
export const generateMockArticleDetail = (
  id: string
): API.ArticleDetailType | null => {
  const article = mockArticles.find((a) => a.id === id);
  if (!article) return null;

  return {
    ...article,
    htmlContent: `
      <h1>${article.title}</h1>
      <p>${article.summary}</p>
      <h2>引言</h2>
      <p>这是一篇关于 ${article.category} 的深度技术文章。我们将从基础概念开始，逐步深入到高级应用场景。</p>
      
      <h2>核心概念</h2>
      <p>在开始之前，让我们先了解一些核心概念：</p>
      <ul>
        <li>基础原理</li>
        <li>最佳实践</li>
        <li>常见问题</li>
        <li>性能优化</li>
      </ul>
      
      <h2>实际应用</h2>
      <p>下面是一个简单的代码示例：</p>
      <pre><code>// 示例代码
function example() {
  console.log('Hello, World!');
}</code></pre>
      
      <h2>总结</h2>
      <p>通过本文的学习，相信大家对 ${article.category} 有了更深入的理解。在实际项目中，要根据具体需求选择合适的技术方案。</p>
      
      <blockquote>
        <p>记住：技术的学习是一个持续的过程，保持好奇心和学习热情是最重要的。</p>
      </blockquote>
    `,
    markdownContent: `# ${article.title}\n\n${article.summary}\n\n## 引言\n\n这是一篇关于 ${article.category} 的深度技术文章...`,
  };
};

/**
 * 根据分类获取文章列表
 */
export const getArticlesByCategory = (
  category?: string
): API.ArticleItemType[] => {
  if (!category || category === "recommend") {
    return mockArticles;
  }
  return mockArticles.filter((article) => article.category === category);
};

/**
 * 获取收藏的文章列表
 */
export const getCollectedArticles = (): API.ArticleItemType[] => {
  return mockArticles.filter((article) => article.isCollected);
};
