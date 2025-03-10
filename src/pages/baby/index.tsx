import React, { useState } from "react";
import { Card, Toast, Button, FloatingBubble } from "antd-mobile";
import {
  AntOutline,
  RightOutline,
  MessageFill,
  AddOutline,
} from "antd-mobile-icons";
import { history } from "umi";
import styles from "./style.less";

export default function Index() {
  const [offset, setOffset] = useState({ x: -24, y: -24 });
  const onHeaderClick = () => {
    Toast.show("点击了卡片Header区域");
  };

  const onBodyClick = () => {
    Toast.show("点击了卡片Body区域");
  };

  const feedingData = [
    {
      time: "2025-03-03 12:35:34",
      title: "历史记录",
      content: "卡片内容",
    },
  ];
  return (
    <div className={styles.babyContainer}>
      {feedingData?.map((item, index) => {
        return (
          <div key={index}>
            <span className={styles.time}>{item.time}</span>
            <Card
              title={
                <div style={{ fontWeight: "normal" }}>
                  <AntOutline
                    color="var(--adm-color-primary)"
                    style={{ marginRight: "4px" }}
                  />
                  {item.title}
                </div>
              }
              extra={<RightOutline />}
              onBodyClick={onBodyClick}
              onHeaderClick={onHeaderClick}
              style={{ borderRadius: "16px" }}
              className={styles.babyCard}
            >
              <div className={styles.content}>{item.content}</div>
              <div
                className={styles.footer}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  color="danger"
                  onClick={() => {
                    Toast.show("点击了底部按钮");
                  }}
                >
                  删除
                </Button>
              </div>
            </Card>
          </div>
        );
      })}

      <FloatingBubble
        axis="xy"
        style={{
          "--initial-position-bottom": "122px",
          "--initial-position-right": "0",
        }}
        onOffsetChange={(offset) => {
          setOffset(offset);
        }}
        offset={offset}
      >
        <AddOutline
          fontSize={32}
          onClick={() =>
            history.push(
              {
                pathname: "/baby/add",
              },
              { feedingId: "" }
            )
          }
        />
      </FloatingBubble>
    </div>
  );
}
