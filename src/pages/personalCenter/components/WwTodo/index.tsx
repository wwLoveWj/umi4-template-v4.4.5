import React, { useState, useRef } from "react";
import { Button, Card, Toast } from "antd-mobile";
import dayjs from "dayjs";
import WjPopup from "@/components/WjPopup";
import CreateNotice from "./components/CreateNotice";
import AddFloatingBubble from "@/components/floatingBubble";
import { storage } from "@/utils/storage";
import {
  AntOutline,
  RightOutline,
  MessageFill,
  AddOutline,
} from "antd-mobile-icons";
import { history } from "umi";
import styles from "./style.less";

export default function Index() {
  const [visible, setVisible] = useState(false);
  const [todoList, setTodoList] = useState(storage?.get("todoList") || []);
  const noticeRef = useRef();

  return (
    <div className={styles.todoContainer}>
      {todoList
        ?.filter((item) => item.status === 1)
        ?.map((item, index) => {
          return (
            <div key={item?.todoId}>
              <span className={styles.time}>{item.noticeTime}</span>
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
                //   onBodyClick={onBodyClick}
                //   onHeaderClick={onHeaderClick}
                style={{ borderRadius: "16px" }}
                className={styles.babyCard}
              >
                <div className={styles.content}>{item.description}</div>
                <div
                  className={styles.footer}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    color="danger"
                    onClick={() => {
                      Toast.show("该待办已经完成");
                      const arr = [...todoList];
                      let idx = arr.findIndex(
                        (val) => val.todoId === item.todoId
                      );
                      arr[idx].status = 2;
                      setTodoList(arr);
                      storage?.set("todoList", [...arr]);
                    }}
                  >
                    完成
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
        title={"创建待办"}
        popupHeight={"60vh"}
        onClose={() => (noticeRef?.current as any).onFinish()}
      >
        <CreateNotice
          ref={noticeRef}
          onClose={(params) => {
            setTodoList(params);
            setVisible(false);
          }}
        />
      </WjPopup>
    </div>
  );
}
