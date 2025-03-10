import React from "react";
import { Form, Input, Button, Dialog, TextArea } from "antd-mobile";

export default function SendMail() {
  const onFinish = (values: any) => {
    Dialog.alert({
      content: <pre>{JSON.stringify(values, null, 2)}</pre>,
    });
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
      <Form.Header>邮件信息</Form.Header>
      <Form.Item name="title" label="主题" rules={[{ required: true }]}>
        <Input placeholder="邮箱主题" />
      </Form.Item>
      <Form.Item name="email" label="接收人" help="接收人邮箱">
        <Input placeholder="请输入接收人邮箱" />
      </Form.Item>
      <Form.Item name="content" label="内容">
        <TextArea
          placeholder="请输入邮件内容信息"
          maxLength={100}
          rows={2}
          showCount
        />
      </Form.Item>
    </Form>
  );
}
