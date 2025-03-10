import React, { RefObject } from "react";
import {
  Form,
  Input,
  Button,
  Dialog,
  TextArea,
  DatePicker,
  Selector,
  Slider,
  Stepper,
  Switch,
  Rate,
  Radio,
  Tabs,
} from "antd-mobile";
import dayjs from "dayjs";
import { history, useLocation } from "umi";
import type { DatePickerRef } from "antd-mobile/es/components/date-picker";
import { FeedingInfoCreateAPI, FeedingInfoUpdateAPI } from "@/service/api/baby";
import { useRequest } from "ahooks";
import { guid } from "@/utils";

const marks = {
  0: 0,
  20: 20,
  40: 40,
  60: 60,
  80: 80,
  100: 100,
  30: 30,
  150: 150,
  180: 180,
  200: 200,
};
export default function Add() {
  const { feedingId } = (useLocation() as any).state || {};
  const isEditMode = !!feedingId;
  const requestFeedingInfoCreateAPI = useRequest(FeedingInfoCreateAPI, {
    manual: true,
    onSuccess: (res) => {
      history.push("/baby");
      // TODO: 查询列表更新信息
      // 语音提示用户任务
      const utterThis = new window.SpeechSynthesisUtterance(
        "吃奶记录添加成功~"
      );
      window.speechSynthesis.speak(utterThis);
    },
  });
  const onFinish = (values: any) => {
    Dialog.alert({
      content: <pre>{JSON.stringify(values, null, 2)}</pre>,
    });
    const params = isEditMode
      ? { ...values, feedingId }
      : { ...values, feedingId: guid() };
    requestFeedingInfoCreateAPI.run(params);
  };
  return (
    <Form
      name="form"
      onFinish={onFinish}
      footer={
        <Button block type="submit" color="primary" size="large">
          提交
        </Button>
      }
    >
      <Form.Header>创办通知</Form.Header>
      <Form.Item
        name="notificationEmail"
        label="通知人"
        rules={[{ required: true }]}
      >
        <Input placeholder="请输入通知人邮箱" />
      </Form.Item>
      <Form.Item name="notificationTitle" label="通知主题" help="yyds">
        <Input placeholder="请输入通知主题" />
      </Form.Item>
      <Form.Item name="notificationContent" label="通知内容">
        <TextArea
          placeholder="请输入通知内容"
          autoSize={{ minRows: 3, maxRows: 5 }}
          showCount
          maxLength={100}
        />
        <Radio />
        <Radio>有描述的单选框</Radio>
      </Form.Item>
      <Tabs>
        <Tabs.Tab title="水果" key="fruits">
          菠萝
        </Tabs.Tab>
        <Tabs.Tab title="蔬菜" key="vegetables">
          西红柿
        </Tabs.Tab>
        <Tabs.Tab title="动物" key="animals">
          蚂蚁
        </Tabs.Tab>
      </Tabs>
      <Form.Item
        name="notificationTime"
        label="通知时间"
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
      <Form.Item
        name="startTime"
        label="开始时间"
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
      <Form.Item
        name="endTime"
        label="结束时间"
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
    </Form>
  );
}
