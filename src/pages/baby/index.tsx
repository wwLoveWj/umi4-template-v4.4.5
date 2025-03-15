import React, { useState } from "react";
import { Card, Toast, Button } from "antd-mobile";
import { AntOutline, RightOutline } from "antd-mobile-icons";
import WjPopup from "@/components/WjPopup";
import AddFloatingBubble from "@/components/floatingBubble";
import AddFeedingRecords from "./components/Add";
import styles from "./style.less";

export default function Index() {
  const [visible, setVisible] = useState(false);
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
      <AddFloatingBubble onClick={() => setVisible(true)} />
      <WjPopup
        value={visible}
        onChange={setVisible}
        isShowSubmit={false}
        title={"喂奶记录"}
      >
        <AddFeedingRecords
          onClose={() => {
            setVisible(false);
          }}
        />
      </WjPopup>
    </div>
  );
}
