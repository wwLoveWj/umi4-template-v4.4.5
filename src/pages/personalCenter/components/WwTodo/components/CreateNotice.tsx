import React, { forwardRef, RefObject, useImperativeHandle } from "react";
import { createNotification } from "@/utils/index";
import { Button, DatePicker, TextArea, Form, Input } from "antd-mobile";
import type { DatePickerRef } from "antd-mobile/es/components/date-picker";
import dayjs from "dayjs";
import { storage } from "@/utils/storage";
import { guid } from "@/utils";
import { MailSendAPI } from "@/service/api/mail";
import { useRequest } from "ahooks";

export default forwardRef(function Index(
  {
    onClose,
  }: {
    onClose?: (params: any) => void;
  },
  ref
) {
  const [form] = Form.useForm();
  const todoList = storage?.get("todoList") || [];

  const onFinish = () => {
    return form.validateFields()?.then((values) => {
      const noticeTime = {
        hour: dayjs(values?.noticeTime).hour(),
        minute: dayjs(values?.noticeTime).minute(),
      };
      MailSendAPI({
        to: "123456789@qq.com",
        text: "我发送了一封邮件",
        subject: "首页",
        nickname: "系统",
        recipientname: "女王大人",
      });
      createNotification(values?.title, {
        body: values?.description,
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
    });
  };

  /**
   * 第一个参数是ref，父组件传过来的
   * 我们想要把方法挂载的ref
   *
   * 第二个参数是一个方法，必须有返回值
   * 返回的值就是要挂再到useRef上面的值
   *
   * 第三个参数是依赖项 依赖项改变的情况第一个参数
   * 会重新调用，如果依赖项不传则每次render都会调用
   */
  useImperativeHandle(
    ref,
    () => {
      return {
        onFinish,
      };
      /**
       * 如果依赖项传一个空数组
       * 则第一个方法只会在初始化的时候调用一次
       * 里面的值不是最新的
       */
    },
    []
  );
  return (
    <Form
      name="form"
      form={form}
      // onFinish={onFinish}
      // footer={
      //   <Button block type="submit" color="primary" size="large">
      //     定时提醒
      //   </Button>
      // }
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
});
