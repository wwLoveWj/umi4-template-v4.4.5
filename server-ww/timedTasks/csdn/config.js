const axios = require("axios");
const dayjs = require("dayjs");

const intervalArticle = (urls) => {
  var count = 0; // 刷了多少次
  var len = urls.length; // 需要刷的文章篇数
  var co = 0; // 为了循环刷新

  setInterval(function () {
    count = count + 1;
    // 随机生成0~len的数字，可以按顺序刷，也可以随机刷
    // co = Math.floor(Math.random() * len)
    // 请求博客地址
    axios({
      url: urls[co].url,
      method: "get",
    })
      .then((res) => {
        let sendTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
        console.log(sendTime, "33333--------------");

        console.log(
          `浏览量：${count} , 文章：${urls[co].title} , 加载次数：${parseInt((count + len) / len)}`
        );
      })
      .catch((err) => console.log(err));
    ++co;
    if (co === len) {
      co = 0;
    }
  }, 6000);
};

module.exports = intervalArticle;
