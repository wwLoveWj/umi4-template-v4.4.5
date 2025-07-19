const cheerio = require("cheerio");
const axios = require("axios");
const intervalArticle = require("./config");

// 当前页码，这个可以自定义也可以从页面抓取，这里我就不赘述了
let indexPage = 1;
// 博客地址 + /article/list/ + 页码  表示当前网页
let url = "https://blog.csdn.net/weixin_46268888/article/list/" + indexPage;
// 获取博客主页
axios({
  url,
  method: "get",
}).then((res) => {
  if (res.status === 200) {
    // 获取html文档
    let $ = cheerio.load(res.data);
    // 计算总页数
    let allCount = $("#csdn-toolbar-collection li span").first().text() || 20;

    let page = parseInt(allCount) / 20;
    let pageStr = page.toString();
    // 不能被整除
    if (pageStr.indexOf(".") > 0) {
      page = parseInt(pageStr.split(".")[0]) + 1;
    }
    // 返回的json数据
    let data = {};
    // 文章集合
    let articles = [];
    data.allPages = page;

    data.currentPage = parseInt(indexPage);

    // 博客主页列表网址存在 .article-list h4 a 标签中，这个随时可能变
    $(".article-list h4 a").each((ins, el) => {
      let article = {}; // 每篇文章的字典
      $(el).find(".article-type").remove();
      // 获取文本去除空格以及回车换行
      let text = $(el)
        .text()
        .replace(/\ +/g, "")
        .replace(/[\r\n]/g, "");
      // 获取博客网址
      let url = $(el)
        .attr("href")
        .replace(/\ +/g, "")
        .replace(/[\r\n]/g, "");
      // title太长可以隐藏
      if (text.length > 20) {
        text = text.substring(0, 20).concat("...");
      }
      article.title = text;
      article.url = url;
      articles.push(article);
    });
    data.articles = articles;

    // console.log(articles, "articles--------------");

    // 执行函数，开启定时任务，请求博客
    intervalArticle(articles);
  } else {
    // 返回的json数据
    let data = {};
    data.msg = "爬取失败";
  }
});
