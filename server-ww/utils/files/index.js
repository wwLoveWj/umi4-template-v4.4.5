const fs = require("fs"); //文件
const multer = require("multer"); //上传文件中间件
const md5 = require("md5");

// 创建文件夹  使用此代码就是为了让我们查找磁盘中是否有该文件夹，如果没有，可以自动创建，而不是我们提前手动创建好。如果不使用此代码，则我们再使用该文件夹之前，需要手动创建好当前文件夹
const createFolder = function (folder) {
  try {
    // 测试 path 指定的文件或目录的用户权限,我们用来检测文件是否存在
    // 如果文件路径不存在将会抛出错误"no such file or directory"
    fs.accessSync(folder);
  } catch (e) {
    // 文件夹不存在，以同步的方式创建文件目录。
    fs.mkdirSync(folder);
  }
};
/**
 * 图片文件存储的位置
 * @param {*} uploadFolder 上传文件的存储路径
 */
const storage = (uploadFolder) => {
  // 使用硬盘存储模式设置存放接收到的文件的路径以及文件名
  return multer.diskStorage({
    destination: function (req, file, cb) {
      // 接收到文件后输出的保存路径（若不存在则需要创建）
      cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
      // 将保存文件名设置为 时间戳 + 文件原始名，比如 151342376785-123.jpg
      // file.originalname   是文件名+后缀
      // file.originalname.substring(file.originalname.lastIndexOf("."))  这里是拿到文件的后缀
      cb(
        null,
        md5(Date.now() + file.originalname) +
          file.originalname.substring(file.originalname.lastIndexOf("."))
      ); //对当前时间戳 加文件名取MD5 加上后缀名
      // cb(null, Date.now() + "-" + file.originalname);
    },
  });
};

module.exports = {
  storage,
  createFolder,
};
