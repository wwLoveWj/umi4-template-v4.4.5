const redis = require("redis");
const client = redis.createClient({ url: "redis://127.0.0.1:6379" }); //默认没有密码 127.0.0.1  端口也是默认

// 如果是连接远程的话
// redis[s]://[[username][:password]@][host][:port][/db-number]:
// const client = createClient({
// 	url: 'redis://alice:foobared@awesome.redis.server:6380'
// });
client.on("error", (err) => console.log("Redis Client Error", err));
client.on("connect", () => {
  console.log("redis connect success");
});

client.connect();

module.exports = client;

// // 存储文章
// const storeArticle = (articleId, articleData) => {
//   client.hmset(`article:${articleId}`, articleData, (err, reply) => {
//     if (err) throw err;
//     console.log(reply); // 输出: 'OK'
//   });
// };

// // 检索文章
// const fetchArticle = (articleId, callback) => {
//   client.hgetall(`article:${articleId}`, (err, reply) => {
//     if (err) throw err;
//     callback(reply);
//   });
// };

// // 销毁文章
// function deleteArticle(articleId) {
//   client.del(`article:${articleId}`);
// }

// TODO:每次启动完项目后需要cmd执行命令：redis-server
