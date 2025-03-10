import React, { useState } from "react";
import {
  Form,
  Button,
  CheckList,
  Input,
  NavBar,
  SwipeAction,
  Toast,
} from "antd-mobile";
import WjPopup from "@/components/WjPopup";
import AddFloatingBubble from "@/components/floatingBubble";
import { storage } from "@/utils/storage";
import { guid } from "@/utils";
import { useLocation } from "umi";

export default function WwTag() {
  const { state } = useLocation();
  const [visible, setVisible] = useState(false);
  // 查询标签
  const [checkList, setCheckList] = useState<
    { tagName: string; tagId: string }[]
  >(storage.get("tagList") || []);
  // 查询收藏网址信息
  const [eventInfoList, setEventInfoList] = useState(
    storage.get("collect") || []
  );
  const [currentChecked, setCurrentChecked] = useState<string[]>([
    state?.item?.tagName,
  ]);

  const onFinish = (values: any) => {
    const result = [...checkList, { ...values, tagId: guid() }];
    storage.set("tagList", result);
    setCheckList(result);
    setVisible(false);
  };

  return (
    <div>
      <NavBar
        back="取消"
        onBack={() => {
          history.back();
        }}
        backIcon={false}
        right={
          <a
            onClick={() => {
              const currentTagList = eventInfoList?.map((item) => {
                if (item.actionId === state?.item?.actionId) {
                  item.tagName = currentChecked[0];
                }
                return item;
              });
              setEventInfoList(currentTagList);
              storage.set("collect", currentTagList);
              history.back();
            }}
          >
            提交
          </a>
        }
      >
        添加标签
      </NavBar>
      <CheckList
        defaultValue={currentChecked}
        onChange={(e: any[]) => {
          setCurrentChecked(e);
        }}
      >
        {checkList?.map((item, index) => {
          return (
            <SwipeAction
              closeOnAction={false}
              closeOnTouchOutside={false}
              key={item?.tagId}
              rightActions={[
                {
                  key: "remove",
                  text: "移除",
                  color: "danger",
                  onClick: () => {
                    const arr = [...checkList];
                    if (arr?.length > 0) {
                      if (item?.tagId === currentChecked[0]) {
                        Toast.show("当前选中不可移除");
                      } else {
                        arr.splice(index, 1);
                        storage.set("tagList", arr);
                        setCheckList(arr);
                      }
                    } else {
                      Toast.show("最后一项不可移除");
                    }
                  },
                },
              ]}
            >
              <CheckList.Item value={item?.tagId} key={item?.tagId}>
                {item?.tagName}
              </CheckList.Item>
            </SwipeAction>
          );
        })}
      </CheckList>
      <AddFloatingBubble onClick={() => setVisible(true)} />
      <WjPopup
        value={visible}
        onChange={setVisible}
        isShowSubmit={false}
        title={"添加标签"}
      >
        <Form
          name="form"
          onFinish={onFinish}
          footer={
            <Button block type="submit" color="primary" size="large">
              提交
            </Button>
          }
        >
          <Form.Item
            name="tagName"
            label="标签名称"
            rules={[{ required: true, message: "请输入标签名称" }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>
        </Form>
      </WjPopup>
    </div>
  );
}
