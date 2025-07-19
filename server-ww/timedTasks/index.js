const schedule = require("node-schedule");
const axios = require("axios");
const notifier = require("node-notifier");
const config = require("./config.js");

const job = schedule.scheduleJob("*/20 * * * * *", () => {
  axios({
    url: config.check_url,
    method: "post",
    headers: {
      Referer: config.url,
      Cookie: config.cookie,
    },
  })
    .then((res) => {
      if (res.data?.err_no === 0) {
        notifier.notify({
          title: "掘金签到通知",
          message: "恭喜你签到成功~",
          sound: "Submarine",
          closeLabel: "CANCEL",
          actions: "OK",
        });
        return;
      }
      if (res.data?.err_no === 15001) {
        console.log(res.data);
        notifier.notify({
          title: "掘金签到通知",
          message: res.data?.err_msg,
          sound: "Submarine",
          closeLabel: "CANCEL",
          actions: "OK",
        });
        // schedule.cancelJob();
        job.cancel();
        return;
      }
    })
    .catch((err) => {
      console.err(err);
    });
});
