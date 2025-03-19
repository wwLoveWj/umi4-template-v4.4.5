import React, { useState } from "react";
import { List, ImageUploader, Popup, NavBar, Dialog } from "antd-mobile";
import type { ImageUploadItem } from "antd-mobile";
import {
  UnorderedListOutline,
  PayCircleOutline,
  SetOutline,
  PictureOutline,
  ReceivePaymentOutline,
  BankcardOutline,
  CouponOutline,
  StarOutline,
  FlagOutline,
  MovieOutline,
  BellOutline,
  SystemQRcodeOutline,
} from "antd-mobile-icons";
import { history } from "umi";
import styles from "./style.less";
import { createNotification } from "@/utils/index";
import Push from "push.js";

export const demoSrc =
  "https://images.unsplash.com/photo-1567945716310-4745a6b7844b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=60";

const configList = [
  {
    title: "银行卡",
    icon: <BankcardOutline />,
  },
  {
    title: "账单",
    icon: <ReceivePaymentOutline />,
  },
  {
    title: "优惠券",
    icon: <CouponOutline />,
  },
  {
    title: "收藏",
    icon: <StarOutline />,
    onClick: () => {
      history.push("/collect");
    },
  },
];

export default function Index() {
  const [visible1, setVisible1] = useState(false);
  const canChgList = [
    {
      title: "重大事件",
      icon: <UnorderedListOutline />,
      onClick: () => {
        history.push("/event");
      },
    },
    {
      title: "总资产",
      icon: <PayCircleOutline />,
      onClick: () => {},
    },
    {
      title: "设置",
      icon: <SetOutline />,
      onClick: () => {
        history.push("/todo");
      },
    },
    {
      title: "我的待办",
      icon: <BellOutline />,
      onClick: () => {
        // createNotification("通知我");
        Push.Permission.request();
        Push.create("遵师维小宝", {
          body: "我来了！！！",
          requireInteraction: true,
          //icon: '/icon.png',
          timeout: 60000,
        });
        setTimeout(() => {
          navigator.vibrate =
            navigator.vibrate ||
            navigator.webkitVibrate ||
            navigator.mozVibrate ||
            navigator.msVibrate;
          if (navigator.vibrate) {
            console.log("支持设备震动！");
            navigator.vibrate(2000);
          }
        }, 1000);

        // var u = navigator.userAgent;
        // var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Adr") > -1;
        // var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        // var msg = "hello world";
        // if (isAndroid) {
        //   // sms:后面跟收件人的手机号,body后接短信内容

        //   window.location.href = "sms:15868191835?body=" + msg;
        // } else if (isIOS) {
        //   window.location.href = "sms:10086&body=" + msg;
        // }
      },
    },
    {
      title: "我的目标",
      icon: <FlagOutline />,
      onClick: () => {
        setVisible1(true);
      },
    },
    {
      title: "接种记录",
      icon: <MovieOutline />,
      onClick: () => {
        history.push("/vaccination");
      },
    },
  ];
  // 自定义上传按钮
  const [fileList, setFileList] = useState<ImageUploadItem[]>([
    {
      url: demoSrc,
    },
  ]);

  async function mockUpload(file: File) {
    return {
      url: URL.createObjectURL(file),
    };
  }
  return (
    <>
      <div className={styles?.avatarInfo}>
        <div
          className={styles?.qrcodeIcon}
          onClick={() =>
            Dialog.alert({
              content: (
                <div>
                  <img
                    src={require("@/assets/ocr.png")}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
              ),
              onConfirm: () => {
                console.log("Confirmed");
              },
            })
          }
        >
          <SystemQRcodeOutline />
        </div>
        {/* <div className={styles?.tool}>
          <BellOutline />
          <SetOutline />
        </div> */}
        <div className={styles?.avatarShow}>
          <ImageUploader
            value={fileList}
            onChange={setFileList}
            upload={mockUpload}
            maxCount={1}
            deletable={false}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#f5f5f5",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#999999",
              }}
            >
              <PictureOutline style={{ fontSize: 32 }} />
            </div>
          </ImageUploader>
          <div className={styles.authorInfo}>
            <h3>我的名字</h3>
            <span>关注量</span>
          </div>
        </div>
      </div>
      <ul className={styles?.funcList}>
        {configList?.map((item, index) => (
          <li key={index} onClick={item?.onClick}>
            <div>{item?.icon}</div>
            <div>{item?.title}</div>
          </li>
        ))}
      </ul>
      <List header="可点击列表" className={styles?.canClickList}>
        {canChgList?.map((item) => (
          <List.Item prefix={item.icon} onClick={item.onClick}>
            {item?.title}
          </List.Item>
        ))}
      </List>
      <Popup
        visible={visible1}
        onMaskClick={() => {
          setVisible1(false);
        }}
        onClose={() => {
          setVisible1(false);
        }}
        bodyStyle={{ height: "100vh" }}
      >
        <NavBar
          back="取消"
          onBack={() => {
            setVisible1(false);
          }}
          backIcon={false}
          right={
            <a
              onClick={() => {
                setVisible1(false);
              }}
            >
              完成
            </a>
          }
        >
          标题
        </NavBar>
        <h1>今年目标：为明年买车和结婚奋斗</h1>
        <h1>明年目标：为明年买车和结婚奋斗</h1>
        <h1>三年目标：为明年买车和结婚奋斗</h1>
        <h1>五年目标：为明年买车和结婚奋斗</h1>
        <h1>十年目标：为明年买车和结婚奋斗</h1>
      </Popup>
    </>
  );
}
