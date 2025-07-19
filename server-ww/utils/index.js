const { getTransporter } = require("./config");
const db = require("./mysql");
const notifier = require("node-notifier"); //在 Node.js 中发送跨平台通知的工具

/**
 * 处理数据库中短横线转换小驼峰命名
 * @param {*} obj 数据库中的字段信息
 * @returns
 */
function camelCaseKeys(obj) {
  const result = {};
  for (let key in obj) {
    let newKey =
      key[0].toLowerCase() +
      key.slice(1).replace(/_([a-z])/g, function ($0, $1) {
        return $1.toUpperCase();
      });
    result[newKey] = obj[key];
  }
  return result;
}
// 生成六位随机验证码
function createCode() {
  return parseInt(Math.random() * 1000000);
  //  return String(Math.floor(Math.random() * 1000000)).padEnd(6, '0') //生成6位随机验证码
  // return 'xxxxxx'.replace(/[xy]/g, function (c) {
  // 	var r = (Math.random() * 16) | 0
  // 	var v = c == 'x' ? r : (r & 0x3) | 0x8
  // 	return v.toString(16)
  // })
}
// 邮箱验证码的格式
const htmlCode = (code) => {
  return `<head>
      <base target="_blank" />
      <style type="text/css">
          ::-webkit-scrollbar{ display: none; }
      </style>
      <style id="cloudAttachStyle" type="text/css">
          #divNeteaseBigAttach, 
          #divNeteaseBigAttach_bak{
              display:none;
          }
      </style>
      <style id="blockquoteStyle" type="text/css">
          blockquote{
              display:none;
          }
      </style>
      <style type="text/css">
          body{
              font-size:14px;
              font-family:arial,verdana,sans-serif;
              line-height:1.666;
              padding:0;
              margin:0;
              overflow:auto;
              white-space:normal;
              word-wrap:break-word;
              min-height:100px
          }  
          td, input, button, select, body{
              font-family:Helvetica, \'Microsoft Yahei\', verdana
          }  
          pre {
              white-space:pre-wrap;
              white-space:-moz-pre-wrap;
              white-space:-pre-wrap;
              white-space:-o-pre-wrap;
              word-wrap:break-word;
              width:95%
          }  
          th,td{
              font-family:arial,verdana,sans-serif;
              line-height:1.666
          } 
          img{
              border:0
          }  
          header,footer,section,aside,article,nav,hgroup,figure,figcaption{
              display:block
          }  
          blockquote{
              margin-right:0px
          }
      </style>
  </head>
  <body tabindex="0" role="listitem">
    <table width="700" border="0" align="center" cellspacing="0" style="width:700px;">
      <tbody>
          <tr>
           <td>
              <div style="width:700px;margin:0 auto;border-bottom:1px solid #ccc;margin-bottom:30px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="700" height="39" style="font:12px Tahoma, Arial, 宋体;">
                      <tbody>
                          <tr>
                          <td width="210"></td>
                          </tr>
                      </tbody>
                  </table>
              </div>
              <div style="width:680px;padding:0 10px;margin:0 auto;">
              <div style="line-height:1.5;font-size:14px;margin-bottom:25px;color:#4d4d4d;">
                  <strong style="display:block;margin-bottom:15px;">
                      尊敬的用户：<span style="color:#f60;font-size: 16px;"></span>
                      您好！</strong><strong style="display:block;margin-bottom:15px;">
                      您正在进行<span style="color: red">用户登录</span>操作，
                      请在验证码输入框中输入：<span style="color:#f60;font-size: 24px">${code}</span>
                      ，以完成操作。
                  </strong>
              </div>
              <div style="margin-bottom:30px;">
                  <small style="display:block;margin-bottom:20px;font-size:12px;">
                  <p style="color:#747474;">
                      注意：此操作可能会修改您的密码、登录邮箱或绑定手机。如非本人操作，
                      请及时登录并修改密码以保证帐户安全<br>（工作人员不会向你索取此验证码，请勿泄漏！)
                  </p></small></div></div><div style="width:700px;margin:0 auto;">
              <div style="padding:10px 10px 0;border-top:1px solid #ccc;color:#747474;margin-bottom:20px;line-height:1.3em;font-size:12px;">
              <p>此为系统邮件，请勿回复<br>请保管好您的邮箱，避免账号被他人盗用</p>
              <p>网络科技团队</p></div></div>
           </td>
          </tr>
      </tbody>
    </table>
  </body>`;
};
//成功返回参数
function successTip(msg, res, total = null) {
  if (total) {
    res.send({
      code: 1,
      data: null,
      msg,
      total,
    });
  } else {
    res.send({
      code: 1,
      msg,
      data: null,
    });
  }
}
//失败参数
function failMsg(msg, res) {
  res.send({
    code: 0,
    msg,
    data: null,
  });
}
/*  
 * @param options 邮件发送配置
 * let sendTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
 *  
   {
       to：`收件人<${mailInfo.to}>`,//发送给谁
       from: `发送方<${mailInfo.user}>`,,
       subject, //主题
       text,//正文
       // html内容，支持dom结构
       // html: "<b>发送时间:" + sendTime + "</b>",
       // 附件内容 是一个列表, 可以是package.json文件, 头像, zip包
       attachments: attachments
       ? [
           {
             filename: "package.json",
             path: path.resolve(__dirname, "package.json"),
           },
           {
             filename: "666.png",
             path: path.resolve(
               __dirname,
               "../upload/5604a827d4ba51cbcb8c87599411c274.png"
             ),
           },
           {
             filename: "room.zip",
             path: path.resolve(__dirname, "room.zip"),
           },
           {
               ...attachments,
           },
         ]
       : null
   }
*/

/**
 * @description 发送邮件函数
 * @param options 邮件发送配置
 * @param res 接口响应配置
 * @param msg 接口响应成功的提示语
 */
function sendMailFn(options, res, current, msg = "邮件发送成功~", params) {
  const transporter = getTransporter(current);
  transporter.sendMail(options, (error, info) => {
    if (error) {
      if (res) {
        failMsg(error.message, res);
      }
      return console.log(error);
    }
    console.log("邮件发送成功~", info.response);
    if (res) {
      notifier.notify({
        title: "邮件通知",
        message: msg,
        sound: "Submarine",
        closeLabel: "CANCEL",
        actions: "OK",
      });
      if (params && params?.reminderPattern !== "intervalTime") {
        handleQueryDb(
          params.sqlStr,
          [params.taskId],
          res,
          "✅任务提醒发送成功~",
          params?.reminderPattern
        );
      }
    }
  });
}
const handleResposeFn = (err, results, res, msg, data, callback) => {
  if (err) {
    if (res) {
      res.send({
        code: 0,
        msg: err.message,
        data: null,
      });
    }
    return console.log(err.message);
  }
  console.log(
    msg,
    "%c 成功的信息--------------------results.affectedRows",
    results.affectedRows
  );
  if (results?.affectedRows >= 1) {
    console.log("成功执行--------------------------OK");
    // 注意：执行了 update 语句之后，执行的结果，也是一个对象，可以通过 affectedRows 判断是否更新成功
    if (res) {
      res.send({
        code: 1,
        msg,
        data,
      });
      callback && callback();
    }
  }
};
/**
 * 查询数据库的方法
 * @param {*} sql 查询语句
 * @param {*} param 查询语句参数
 * @param {*} res 响应结果数据
 * @param {*} msg 响应成功的提示
 * @param {*} data 响应成功后返回的数据
 * @param {*} callback 响应成功后需要的操作
 */
const handleQueryDb = (sql, param, res, msg, data = null, callback = null) => {
  db.query(sql, param, (err, results) =>
    handleResposeFn(err, results, res, msg, data, callback)
  );
};

const guid = () => {
  return "xxxxxxxx-xxxx-6xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

module.exports = {
  camelCaseKeys,
  createCode,
  htmlCode,
  successTip,
  failMsg,
  sendMailFn,
  handleQueryDb,
  guid,
};
