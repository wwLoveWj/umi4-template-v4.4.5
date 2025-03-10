import React, { RefObject } from "react";
import {
  Form,
  Button,
  Dialog,
  TextArea,
  DatePicker,
  Selector,
  Input,
  Rate,
} from "antd-mobile";
import dayjs from "dayjs";
import { history, useLocation } from "umi";
import type { DatePickerRef } from "antd-mobile/es/components/date-picker";
import { EventInfoCreateAPI } from "@/service/api/event";
import { useRequest } from "ahooks";
import { guid } from "@/utils";

export default function Add({ onClose }: { onClose?: () => void }) {
  const { feedingId } = (useLocation() as any).state || {};

  const eventInfoCreateFn = useRequest(EventInfoCreateAPI, {
    manual: true,
    onSuccess: (res) => {
      onClose?.();
      // 语音提示用户任务
      const utterThis = new window.SpeechSynthesisUtterance(
        "吃奶记录添加成功~"
      );
      window.speechSynthesis.speak(utterThis);
    },
  });
  const onFinish = (values: any) => {
    // Dialog.alert({
    //   content: <pre>{JSON.stringify(values, null, 2)}</pre>,
    // });

    const params = {
      ...values,
      processTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      eventId: guid(),
      status: "wait",
    };
    eventInfoCreateFn.run(params);
  };
  return (
    <>
      <Form
        name="form"
        onFinish={onFinish}
        footer={
          <Button block type="submit" color="primary" size="large">
            提交
          </Button>
        }
      >
        <Form.Header>事件记录</Form.Header>
        <Form.Item
          name="title"
          label="事件"
          help="记录当天发生的事情"
          rules={[{ required: true }]}
        >
          <Input placeholder="请输入事件" />
        </Form.Item>
        <Form.Item name="tag" label="事件状态" rules={[{ required: true }]}>
          <Selector
            columns={3}
            options={[
              {
                label: "一般",
                value: 0,
              },
              {
                label: "待办",
                value: 1,
              },
              {
                label: "重要",
                value: 2,
              },
              // {
              //   label: "完成",
              //   value: "finish",
              // },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="processTime"
          label="重要时刻"
          trigger="onConfirm"
          rules={[{ required: true }]}
          onClick={(e, datePickerRef: RefObject<DatePickerRef>) => {
            datePickerRef.current?.open();
          }}
        >
          <DatePicker precision="minute">
            {(value) =>
              value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "请选择日期"
            }
          </DatePicker>
        </Form.Item>
        <Form.Item name="description" label="备注" rules={[{ required: true }]}>
          <TextArea
            placeholder="请输入备注"
            autoSize={{ minRows: 3, maxRows: 5 }}
            showCount
            maxLength={100}
          />
        </Form.Item>
      </Form>
    </>
  );
}
