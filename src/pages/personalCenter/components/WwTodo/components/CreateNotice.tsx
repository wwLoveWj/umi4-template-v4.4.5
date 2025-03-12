import React, { useEffect, RefObject } from "react";
import schedule from "node-schedule";
import { createNotification } from "@/utils/index";
import { Button, DatePicker, TextArea, Form, Input } from "antd-mobile";
import type { DatePickerRef } from "antd-mobile/es/components/date-picker";
import dayjs from "dayjs";
import { storage } from "@/utils/storage";
import { guid } from "@/utils";
export default function Index({
  onClose,
}: {
  onClose?: (params: any) => void;
}) {
  const todoList = storage?.get("todoList") || [];
  const onFinish = (values: any) => {
    const noticeTime = {
      hour: dayjs(values?.noticeTime).hour(),
      minute: dayjs(values?.noticeTime).minute(),
    };
    schedule.scheduleJob(noticeTime, (time) => {
      try {
        // 定时提醒时间到了发送邮件/通知
        console.log("通知时间", time);
        debugger;
        createNotification(values?.title, {
          body: values?.description,
        });
      } catch (error) {
        console.error("Send reminder email error:", error);
      }
    });
    let arr = [
      ...todoList,
      {
        ...values,
        noticeTime: dayjs(values?.noticeTime)?.format("YYYY-MM-DD HH:mm"),
        todoId: guid(),
        status: 1,
      },
    ];
    storage?.set("todoList", arr);
    onClose?.(arr);
  };
  return (
    <Form
      name="form"
      onFinish={onFinish}
      footer={
        <Button block type="submit" color="primary" size="large">
          定时提醒
        </Button>
      }
    >
      <Form.Item name="title" label="提醒主题" rules={[{ required: true }]}>
        <Input placeholder="请输入主题" />
      </Form.Item>
      <Form.Item name="description" label="提醒内容">
        <TextArea
          placeholder="请输入内容"
          autoSize={{ minRows: 3, maxRows: 5 }}
          showCount
          maxLength={100}
        />
      </Form.Item>
      <Form.Item
        name="noticeTime"
        label="提醒时间"
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
