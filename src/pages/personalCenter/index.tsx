import React, { useEffect, useState } from "react";
import { List, Dialog, Button, Toast, Image, Badge } from "antd-mobile";
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
import "./style.less";
import { createNotification } from "@/utils/index";
import Push from "push.js";
import { storage } from "@/utils/storage";
import { getMessages, onMessageChange } from "@/utils/messageCenter";

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

/**
 * 获取未读消息数量
 * @returns {number} 未读消息数量
 */
function getUnreadMsgCount() {
  try {
    const msgs = getMessages();
    return msgs.filter((m) => !m.read).length;
  } catch {
    return 0;
  }
}

export default function PersonalCenter() {
  const loginInfo = storage.get("login-info");
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
          const nav: any = navigator;
          nav.vibrate =
            nav.vibrate || nav.webkitVibrate || nav.mozVibrate || nav.msVibrate;
          if (nav.vibrate) {
            console.log("支持设备震动！");
            nav.vibrate(2000);
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
        history.push("/goal");
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

  // 动态获取未读消息数
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  /**
   * 更新未读消息数量
   */
  const updateUnreadCount = () => {
    const count = getUnreadMsgCount();
    setUnreadMsgCount(count);
  };

  // 监听消息变化，实时更新角标
  useEffect(() => {
    updateUnreadCount();

    // 监听消息变化事件
    const removeListener = onMessageChange(updateUnreadCount);

    return () => {
      removeListener();
    };
  }, []);

  const bgImage = localStorage.getItem("personalBg");

  return (
    <>
      <div className={styles?.bgAvtar}>
        <div
          className={styles?.avatarInfo}
          style={
            bgImage
              ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover" }
              : {}
          }
        >
          {/* 通知图标 */}
          <div
            style={{
              position: "absolute",
              right: 60,
              top: 20,
              zIndex: 10,
              cursor: "pointer",
            }}
            onClick={() => history.push("/notice/article")}
          >
            <Badge
              content={
                unreadMsgCount > 0
                  ? unreadMsgCount > 99
                    ? "99+"
                    : unreadMsgCount
                  : undefined
              }
            >
              <BellOutline style={{ fontSize: 28, color: "#fff" }} />
            </Badge>
          </div>
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
              <div className="article-follow-info">
                <span>关注 {loginInfo?.authorFollowCount ?? 0}</span>
                <span className="follow-divider">|</span>
                <span>粉丝 {loginInfo?.authorFollowerCount ?? 0}</span>
              </div>
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
    </>
  );
}
