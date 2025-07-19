const express = require("express");
const router = express.Router();
const db = require("../../utils/mysql");
const notificationService = require("../notice/notificationService");
/**
 * 新增文章
 * @route POST /api/article/add
 */
// router.post("/add", async (req, res) => {
//   const {
//     title,
//     content,
//     coverType,
//     coverUrl,
//     type,
//     visible,
//     tag,
//     column,
//     author,
//     authorAvatar,
//   } = req.body;

//   // 校验必填项
//   if (!title || !content) {
//     return res.json({ code: 0, msg: "标题和内容不能为空" });
//   }

//   try {
//     const sql = `
//       INSERT INTO article_app
//       (title, content, coverType, coverUrl, type, visible, tag, \`column\`, author, authorAvatar, publishTime)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
//     `;
//     const params = [
//       title,
//       content,
//       coverType,
//       coverUrl,
//       type,
//       visible,
//       tag,
//       column,
//       author,
//       authorAvatar,
//     ];
//     const result = await db.query(sql, params);
//     res.json({ code: 1, msg: "新增成功", data: { id: result.insertId } });
//   } catch (err) {
//     console.error("新增文章失败", err);
//     res.json({ code: 0, msg: "新增失败", error: err.message });
//   }
// });

// 获取分类（静态）
const categories = [
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
router.get("/categories", (req, res) => {
  res.json(categories);
});

// 获取文章列表
router.get("/list", async (req, res) => {
  const { category, page = 1, pageSize = 10, isPage = false } = req.query;
  let sql = "SELECT * FROM article_app";
  let params = [];
  if (category && category !== "recommend") {
    sql += " WHERE category = ?";
    params.push(category);
  }
  if (isPage) {
    sql += " ORDER BY publishTime DESC LIMIT ?, ?";
    params.push((page - 1) * pageSize, Number(pageSize));
  }
  const [list, totalRes] = await Promise.all([
    db.query(sql, params),
    db.query(
      `SELECT COUNT(*) as total FROM article_app${category && category !== "recommend" ? " WHERE category = ?" : ""}`,
      category && category !== "recommend" ? [category] : []
    ),
  ]);
  const total = Array.isArray(totalRes) && totalRes[0] ? totalRes[0].total : 0;
  res.send({
    code: 1,
    msg: `文章列表请求成功~`,
    data: {
      list,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    },
  });
});

// 文章详情
router.get("/detail/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM article_app WHERE id = ?", [
      req.params.id,
    ]);
    const rows = Array.isArray(result) ? result[0] : result;
    const article = rows && rows.length > 0 ? rows[0] : null;

    if (!article) return res.status(404).json({ msg: "未找到文章" });
    res.send({
      code: 1,
      msg: `文章详情查询成功~`,
      data: {
        ...article,
        htmlContent: `<h1>${article.title}</h1><p>${article.summary}</p>`,
        markdownContent: `# ${article.title}\n\n${article.summary}`,
      },
    });
  } catch (error) {
    console.error("获取文章详情失败:", error);
    res.status(500).json({ msg: "获取文章详情失败" });
  }
});

// 获取评论
router.get("/comments", async (req, res) => {
  try {
    const { articleId, page = 1, pageSize = 20 } = req.query;
    const listResult = await db.query(
      "SELECT * FROM article_comment WHERE articleId = ? ORDER BY createTime DESC LIMIT ?, ?",
      [articleId, (page - 1) * pageSize, Number(pageSize)]
    );
    const totalResult = await db.query(
      "SELECT COUNT(*) as total FROM article_comment WHERE articleId = ?",
      [articleId]
    );

    const list = Array.isArray(listResult) ? listResult[0] : listResult;
    const totalRes = Array.isArray(totalResult) ? totalResult[0] : totalResult;

    res.send({
      code: 1,
      msg: `评论查询成功~`,
      data: {
        list: list || [],
        total: totalRes && totalRes.length > 0 ? totalRes[0].total : 0,
      },
    });
  } catch (error) {
    console.error("获取评论失败:", error);
    res.status(500).json({ msg: "获取评论失败" });
  }
});

// 发表评论
router.post("/comment", async (req, res) => {
  const { articleId, content, canvasImage } = req.body;
  const author = "测试用户";
  const authorAvatar =
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face";
  await db.query(
    "INSERT INTO article_comment (articleId, content,canvasImage, author, authorAvatar) VALUES (?, ?, ?, ?, ?)",
    [articleId, content, canvasImage, author, authorAvatar]
  );
  await db.query(
    "UPDATE article_app SET commentCount = commentCount + 1 WHERE id = ?",
    [articleId]
  );
  res.send({
    code: 1,
    msg: `评论发表成功~`,
    data: null,
  });
});

// 点赞
router.post("/like", async (req, res) => {
  const { fromUserId, article, userId = 1 } = req.body;
  await db.query(
    "INSERT IGNORE INTO article_user_like (userId, articleId) VALUES (?, ?)",
    [userId, article?.articleId]
  );
  await db.query(
    "UPDATE article_app SET likeCount = likeCount + 1 , isLiked = 1 WHERE articleId = ?",
    [article?.articleId]
  );
  // websocket通知
  if (!fromUserId || !article?.id || !article?.title) {
    return res.status(400).json({ msg: "参数不能为空", code: 0 });
  }
  await notificationService.sendLikeNotification(
    article?.authorId,
    fromUserId,
    article
  );
  res.send({
    code: 1,
    msg: `感谢你的小心心~`,
    data: null,
  });
});

// 取消点赞
router.post("/unlike", async (req, res) => {
  const { articleId, userId = "1" } = req.body;
  await db.query(
    "DELETE FROM article_user_like WHERE userId = ? AND articleId = ?",
    [userId, articleId]
  );
  await db.query(
    "UPDATE article_app SET likeCount = IF(likeCount>0, likeCount-1, 0) ,isLiked = 0 WHERE articleId = ?",
    [articleId]
  );
  res.send({
    code: 1,
    msg: `你不喜欢人家了嘛~`,
    data: null,
  });
});

// 收藏
router.post("/collect", async (req, res) => {
  const { userId = 1, fromUserId, article } = req.body;
  await db.query(
    "INSERT IGNORE INTO article_user_collection (userId, articleId) VALUES (?, ?)",
    [userId, article?.articleId]
  );
  await db.query("UPDATE article_app SET isCollected = 1 WHERE articleId = ?", [
    article?.articleId,
  ]);
  // websocket通知
  if (!fromUserId || !article?.id || !article?.title) {
    return res.status(400).json({ msg: "参数不能为空", code: 0 });
  }
  await notificationService.sendCollectNotification(
    article?.authorId,
    fromUserId,
    article
  );

  res.send({
    code: 1,
    msg: `不要放到收藏夹落灰哦~`,
    data: null,
  });
});

// 取消收藏
router.post("/uncollect", async (req, res) => {
  const { articleId, userId = "1" } = req.body;
  await db.query(
    "DELETE FROM article_user_collection WHERE userId = ? AND articleId = ?",
    [userId, articleId]
  );
  await db.query("UPDATE article_app SET isCollected = 0 WHERE articleId = ?", [
    articleId,
  ]);
  res.send({
    code: 1,
    msg: `懒得动了？`,
    data: null,
  });
});

// 我的收藏
router.get("/my-collections", async (req, res) => {
  try {
    const { userId = "1", page = 1, pageSize = 10 } = req.query;
    const listResult = await db.query(
      `SELECT a.* FROM article_app a
       JOIN article_user_collection c ON a.articleId = c.articleId
       WHERE c.userId = ?
       ORDER BY c.articleId DESC
       LIMIT ?, ?`,
      [userId, (page - 1) * pageSize, Number(pageSize)]
    );
    const totalResult = await db.query(
      `SELECT COUNT(*) as total FROM article_user_collection WHERE userId = ?`,
      [userId]
    );

    const list = Array.isArray(listResult) ? listResult[0] : listResult;
    const totalRes = Array.isArray(totalResult) ? totalResult[0] : totalResult;

    res.send({
      code: 1,
      msg: `一大堆收藏正在袭来~`,
      data: {
        list: list || [],
        total: totalRes && totalRes.length > 0 ? totalRes[0].total : 0,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    });
  } catch (error) {
    console.error("获取收藏失败:", error);
    res.status(500).json({ msg: "获取收藏失败" });
  }
});

// 新增文章
router.post("/add", async (req, res) => {
  const {
    title,
    summary,
    content,
    coverImage,
    category,
    author,
    authorAvatar,
    tags,
    articleId,
    authorId,
  } = req.body;
  if (!title || !content) {
    return res.json({ code: 1, msg: "标题和内容不能为空" });
  }
  const sql = `
    INSERT INTO article_app
    (title, summary, content, coverImage, category, author, authorAvatar, tags, articleId,authorId, publishTime)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  const params = [
    title,
    summary,
    content,
    coverImage,
    category,
    author,
    authorAvatar,
    Array.isArray(tags) ? tags.join(",") : tags,
    articleId,
    authorId,
  ];
  const result = await db.query(sql, params);
  res.json({ code: 1, msg: "新增成功", data: { id: result.insertId } });
});

// 内存缓存（可用redis替换，生产建议用redis）
const viewCache = new Map();

/**
 * 统计文章浏览量，30分钟内同一IP/同一用户只计一次
 */
router.post("/view/:id", async (req, res) => {
  const articleId = req.params.id;
  // 用户唯一标识（优先用用户ID，没有则用IP）
  const userId = req.user?.userId; // 如果有登录
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const uniqueKey = userId
    ? `user_${userId}_${articleId}`
    : `ip_${ip}_${articleId}`;
  const now = Date.now();
  const interval = 1000 * 60 * 30; // 30分钟

  // 检查缓存
  if (viewCache.has(uniqueKey)) {
    const lastView = viewCache.get(uniqueKey);
    if (now - lastView < interval) {
      // 30分钟内已统计过
      // 查询最新浏览量返回
      const rows = await db.query(
        "SELECT readCount FROM article_app WHERE id = ?",
        [articleId]
      );
      return res.json({ code: 1, readCount: rows[0]?.readCount || 0 });
    }
  }

  // 更新数据库
  await db.query(
    "UPDATE article_app SET readCount = readCount + 1 WHERE id = ?",
    [articleId]
  );
  // 更新缓存
  viewCache.set(uniqueKey, now);

  // 查询最新浏览量
  const rows = await db.query(
    "SELECT readCount FROM article_app WHERE id = ?",
    [articleId]
  );
  res.json({ code: 1, readCount: rows[0]?.readCount || 0 });
});

/**
 * @api {post} /api/article/follow 关注作者
 * @apiName FollowAuthor
 * @apiGroup Article
 * @apiBody {String} userId 当前用户ID
 * @apiBody {String} followUserId 被关注用户ID
 * @apiSuccess {Number} code 1-成功 0-失败
 * @apiSuccess {String} msg 提示信息
 */
router.post("/follow", async (req, res) => {
  /**
   * @type {{userId: string, followUserId: string}}
   */
  const { userId, followUserId } = req.body; //userId为当前登录用户
  if (!userId || !followUserId) {
    return res.json({ code: 0, msg: "userId和followUserId不能为空" });
  }
  try {
    // 1. 插入article_user_follow表
    await db.query(
      "INSERT IGNORE INTO article_user_follow (userId, followUserId) VALUES (?, ?)",
      [userId, followUserId]
    );
    // 2. 更新关注数
    await db.query(
      "UPDATE user_info SET authorFollowCount = authorFollowCount + 1 WHERE user_id = ?",
      [userId]
    );
    await db.query(
      "UPDATE user_info SET authorFollowerCount = authorFollowerCount + 1 WHERE user_id = ?",
      [followUserId]
    );
    res.json({ code: 1, msg: "关注成功" });
  } catch (err) {
    res.json({ code: 0, msg: "关注失败", error: err.message });
  }
});

/**
 * @api {post} /api/article/unfollow 取消关注
 * @apiName UnfollowAuthor
 * @apiGroup Article
 * @apiBody {String} userId 当前用户ID
 * @apiBody {String} followUserId 被取关用户ID
 * @apiSuccess {Number} code 1-成功 0-失败
 * @apiSuccess {String} msg 提示信息
 */
router.post("/unfollow", async (req, res) => {
  /**
   * @type {{userId: string, followUserId: string}}
   */
  const { userId, followUserId } = req.body;
  if (!userId || !followUserId) {
    return res.json({ code: 0, msg: "userId和followUserId不能为空" });
  }
  try {
    // 1. 删除article_user_follow表
    await db.query(
      "DELETE FROM article_user_follow WHERE userId = ? AND followUserId = ?",
      [userId, followUserId]
    );
    // 2. 更新关注数
    await db.query(
      "UPDATE user_info SET authorFollowCount = authorFollowCount - 1 WHERE user_id = ?",
      [userId]
    );
    await db.query(
      "UPDATE user_info SET authorFollowerCount = authorFollowerCount - 1 WHERE user_id = ?",
      [followUserId]
    );
    res.json({ code: 1, msg: "取消关注成功" });
  } catch (err) {
    res.json({ code: 0, msg: "取消关注失败", error: err.message });
  }
});

// 查询是否已关注  GET /api/user/isFollow?userId=xxx&followUserId=yyy
router.get("/isFollow", async (req, res) => {
  const { userId, followUserId } = req.query;
  const rows = await db.query(
    "SELECT 1 FROM article_user_follow WHERE userId = ? AND followUserId = ?",
    [userId, followUserId]
  );
  res.json({ code: 1, data: { isFollowed: rows.length > 0 } });
});
module.exports = router;
