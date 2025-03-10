import React, { useMemo, useState, useRef } from "react";
import { Toast, Form, Button, Input } from "antd-mobile";
import { history } from "umi";
import { Action } from "antd-mobile/es/components/swipe-action";
import WjPopup from "@/components/WjPopup";
import AddFloatingBubble from "@/components/floatingBubble";
import WjSwipeAction from "@/components/WjSwipeAction";
import { storage } from "@/utils/storage";
import { guid } from "@/utils";

export default function WwCollect({ tagName }: { tagName: string | number }) {
  const swipeActionRefs = useRef<any[]>([]);
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  // 查询收藏网址信息
  const [eventInfoList, setEventInfoList] = useState(
    storage.get("collect") || []
  );
  // 右侧操作列
  const rightActions = (index: number, item: API.EventInfoType): Action[] => {
    return [
      {
        key: "mute",
        text: "分类",
        color: "warning",
        onClick: () => {
          Toast.show("操作成功");
          history.push({ pathname: "/collect/tag" }, { item });
        },
      },
    ];
  };

  const onFinish = (values: any) => {
    const result = [...eventInfoList, { ...values, actionId: guid() }];
    storage.set("collect", result);
    setEventInfoList(result);
    form.resetFields();
    setVisible(false);
  };

  const eventInfoAction = useMemo(() => {
    return tagName
      ? eventInfoList?.filter((item) => {
          return item.tagName === tagName;
        })
      : eventInfoList;
  }, [tagName, eventInfoList]);
  return (
    <div>
      <WjSwipeAction
        eventInfoList={eventInfoAction}
        rightActions={rightActions}
        swipeActionRefs={swipeActionRefs}
        link={true}
      />
      <AddFloatingBubble onClick={() => setVisible(true)} />
      <WjPopup
        value={visible}
        onChange={setVisible}
        isShowSubmit={false}
        title={"添加网址"}
        popupHeight="50vh"
      >
        <Form
          name="form"
          form={form}
          onFinish={onFinish}
          footer={
            <Button block type="submit" color="primary" size="large">
              提交
            </Button>
          }
        >
          <Form.Header>网址收藏</Form.Header>
          <Form.Item
            name="link"
            label="网址"
            help="记录你复制的网址链接"
            rules={[
              { required: true },
              {
                pattern: /^https?:\/\/.+/,
                message: "请输入正确的网址",
              },
            ]}
          >
            <Input placeholder="请输入网址" clearable />
          </Form.Item>
          <Form.Item
            name="title"
            label="文本"
            help="给你收藏的网址取个名字"
            rules={[{ required: true }]}
          >
            <Input placeholder="请输入网址描述" clearable maxLength={20} />
          </Form.Item>
        </Form>
      </WjPopup>
    </div>
  );
}
