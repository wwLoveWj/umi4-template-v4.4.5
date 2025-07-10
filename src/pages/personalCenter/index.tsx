import React, { useState } from "react";
import { List, Popup, NavBar, Dialog, Button, Toast, Image } from "antd-mobile";
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
import { storage } from "@/utils/storage";

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
      history.push("/article/collections");
    },
  },
];

export default function Index() {
  const loginInfo = storage.get("login-info");
  const [visible1, setVisible1] = useState(false);
  const canChgList = [
    {
      title: "通知",
      icon: <SetOutline />,
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
      },
    },
    {
      title: "设置",
      icon: <SetOutline />,
      onClick: () => {
        history.push("/settings");
      },
    },
    {
      title: "快捷操作",
      icon: <PayCircleOutline />,
      onClick: () => {
        var u = navigator.userAgent;
        var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Adr") > -1;
        var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        var msg = "hello world";
        if (isAndroid) {
          // sms:后面跟收件人的手机号,body后接短信内容
          window.location.href = "sms:15868191835?body=" + msg;
        } else if (isIOS) {
          window.location.href = "sms:10086&body=" + msg;
        }
      },
    },
    {
      title: "我的待办",
      icon: <BellOutline />,
      onClick: () => {
        history.push("/todo");
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
      title: "宝宝相册",
      icon: <PayCircleOutline />,
      onClick: () => {
        history.push("/baby/album");
      },
    },
  ];

  return (
    <>
      <div className={styles?.bgAvtar}>
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
            <Image
              src={loginInfo?.avatar || require("@/assets/avatar/avatar.png")}
              width={64}
              height={64}
              fit="cover"
              style={{ borderRadius: 32 }}
            />
            <div className={styles.authorInfo}>
              <h3>{loginInfo?.username}</h3>
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
      </div>
      <List className={styles?.canClickList}>
        {canChgList?.map((item) => (
          <List.Item prefix={item.icon} onClick={item.onClick} key={item.title}>
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
