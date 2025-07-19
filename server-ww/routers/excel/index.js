const express = require("express");
const db = require("../../utils/mysql");
const Excel = require("exceljs");
const multer = require("multer");
const { camelCaseKeys, handleQueryDb, guid } = require("../../utils");
// const client = require("../../utils/redis");
const router = express.Router();
const path = require("path");
const { storage, createFolder } = require("../../utils/files");

// router.use(express.json()); // for parsing application/json
// router.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// ==============================excel的上传导出================================
// excel上传接口
/**
 * @description: 上传技能
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @param {Function} next
 */
const uploadFolder = path.resolve(__dirname, "../upload/"); //文件按照日期分割创建文件夹
createFolder(uploadFolder);
const upload = multer({ storage: storage(uploadFolder) });

// 待办事项查询列表
router.get("/query", (req, res) => {
  try {
    // 接入分页参数
    let pageNo = req.query.pageNo;
    let pageSize = req.query.pageSize;
    const startIndex = (pageNo - 1) * pageSize;
    // 接入查询参数
    const keyWords = req.query.keyWords || "";
    const status = req.query.status || ["1", "2", "0"];
    console.log(pageNo, pageSize, startIndex, keyWords);
    // LIMIT ${startIndex}, ${pageSize}
    // 查询待办事项所有的数据
    const sqlStr = `select * from backlog_info WHERE (status IN (${status}) AND backlog_name LIKE '%${keyWords}%') LIMIT ${startIndex}, ${pageSize}`;
    // LIMIT ${pageSize} OFFSET ${startIndex}`;
    const sql = `SELECT COUNT(*) AS total FROM (select * from backlog_info WHERE status IN (${status}) AND backlog_name LIKE '%${keyWords}%') t`;
    db.query(sql, (err, results) => {
      // 查询数据失败
      if (err) return console.log(err.message);
      // 计算总页数
      const total = results[0].total;
      console.log(results, "导入-------------------");
      db.query(sqlStr, (err, rows) => {
        if (err) return console.log(err.message);
        // 查询数据成功
        rows = rows.map((item) => camelCaseKeys(item));
        console.log("待办事项列表查询成功", rows, total);
        res.send({
          code: 1,
          msg: "success",
          data: { total, list: rows },
        });
      });
    });
  } catch (error) {
    res.json({ success: false, msg: error.message, code: 0 });
  }
});
// 删除待办事项
router.post("/delete", (req, res) => {
  const { backlogId } = req.body;
  const sqlStr = "delete from backlog_info where backlog_id=?";
  handleQueryDb(sqlStr, backlogId, res, "待办事项删除成功~");
});
// 导入技能
router.post("/import/:append", upload.single("file"), (req, res) => {
  const { append } = req.params;
  // 下一步
  function next() {
    const workbook = new Excel.Workbook();
    console.log(req.file, "filePath");
    const filePath = req.file.path;

    // 读取文件
    workbook.xlsx
      .readFile(filePath)
      .then(async () => {
        const worksheet = workbook.getWorksheet(1);
        const data = [];
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber === 1) return; // 跳过表头
          const rowData = row.values.slice(1); // 去掉第一列的索引
          data.push(rowData);
        });
        // 处理sql语句
        let sql =
          "INSERT INTO backlog_info ( backlog_name,status,description,notice_time,source_buy,quantity_buy,expire_time,backlog_id) VALUES ?";
        const params = data.map((item) => [
          item[0],
          item[1],
          item[2],
          item[3],
          item[4],
          item[5],
          item[6],
          guid(),
        ]);
        console.log(params, "导入数据");
        db.query(sql, [params], (err, rows) => {
          // 查询数据失败
          if (err) {
            res.send({
              code: 0,
              data: null,
              msg: "导入失败",
            });
            return console.log(err.message);
          }
          if (rows.affectedRows >= 1) {
            // 注意：执行了 update 语句之后，执行的结果，也是一个对象，可以通过 affectedRows 判断是否更新成功
            if (res) {
              res.send({
                code: 1,
                msg: "导入成功",
                data: null,
              });
              return;
            }
          }
        });
      })
      .catch((err) => {
        console.log(err);
        res.send({
          code: 500,
          data: null,
          msg: "导入失败",
        });
      });
  }

  // 如果是覆盖导入
  if (Number(append) === 2) {
    // 先清点所有数据
    let cleanSql = "TRUNCATE TABLE backlog_info;";
    db.query(cleanSql, () => {
      next();
    });
  } else {
    next();
  }
});

// TODO:原文链接：https://blog.csdn.net/snows_l/article/details/139998373
// 导出技能
router.post("/export", (req, res) => {
  const { template, backlogIds } = req.body;
  const sqlStr = "SELECT * FROM backlog_info";
  db.query(sqlStr, async (err, rows) => {
    // 查询数据失败
    if (err) {
      res.send({
        code: 0,
        msg: err.message,
        data: null,
      });
      return console.log(err.message);
    }
    const allTableData = rows.map((item) => camelCaseKeys(item));
    // 查询数据成功
    const data =
      backlogIds && backlogIds?.length > 0
        ? allTableData?.filter((item) => backlogIds?.includes(item?.backlogId))
        : allTableData;
    console.log(data, "导出的数据", backlogIds);
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("待办事项");

    // 设置表头
    // worksheet.addRow(['标题', '月份', '收入金额', '备注', '收入截图']);
    let baseTableTitle = [
      { header: "待办事项", key: "backlogName", width: 12 },
      { header: "是否通知", key: "status", width: 10 },
      { header: "备注", key: "description", width: 20 },
      { header: "通知时间", key: "noticeTime", width: 12 },
      { header: "购买渠道", key: "sourceBuy", width: 18 },
    ];
    worksheet.columns = baseTableTitle;
    // 循环写入数据 如果不是模板，则默认写入数据
    if (!template) {
      data.forEach((item, index) => {
        const rowData = worksheet.addRow([
          item.backlogName,
          item.status,
          item.description,
          item.noticeTime,
          item.sourceBuy,
        ]);
        // 指定行高
        rowData.height = 50;
      });
    } else {
      console.log("进来了？待办事项");
      const rowData = worksheet.addRow([
        "尿不湿",
        "2",
        "技能描述",
        "2024/10/17",
        "淘宝",
      ]);
      // 指定行高
      rowData.height = 50;
    }
    const buffer = await workbook.xlsx.writeBuffer();
    // 处理中文文件名
    const realName = encodeURI("待办事项.xlsx", "GBK").toString("iso8859-1");
    // 设置响应头
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=" + realName);
    // 发送Excel文件
    // res.send(buffer);
    // 假设我们有一个Buffer对象，包含HTML内容
    // const Buffer = require("buffer").Buffer;
    // const bufferObj = Buffer.from(buffer);
    // // 将Buffer转换为字符串
    // const bufferString = bufferObj.toString();
    res.send({
      code: 1,
      msg: "导出成功",
      data: buffer,
    });
  });
});

module.exports = router;
