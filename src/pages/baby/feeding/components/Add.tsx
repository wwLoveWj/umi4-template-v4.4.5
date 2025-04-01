import React, { RefObject } from "react";
import {
  Form,
  Button,
  Dialog,
  TextArea,
  DatePicker,
  Selector,
  Slider,
  Stepper,
  Switch,
  Rate,
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
export default function Add({ onClose }: { onClose?: () => void }) {
  const { feedingId } = (useLocation() as any).state || {};
  const isEditMode = !!feedingId;
  const requestFeedingInfoCreateAPI = useRequest(FeedingInfoCreateAPI, {
    manual: true,
    onSuccess: (res) => {
      onClose?.();
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
        <Form.Header>喂奶记录</Form.Header>
        {/* <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
        <Input placeholder="请输入姓名" />
      </Form.Item>
      <Form.Item name="address" label="地址" help="详情地址">
        <Input placeholder="请输入地址" />
      </Form.Item> */}
        <Form.Item
          name="eventType"
          label="事件类型"
          rules={[{ required: true }]}
        >
          <Selector
            columns={3}
            multiple
            options={[
              {
                label: "换尿布",
                value: 1,
              },
              {
                label: "喂奶",
                value: 2,
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="feedingTime"
          label="喂奶时间"
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

        <Form.Item name="milkYield" label="奶量" rules={[{ required: true }]}>
          <Slider ticks step={10} marks={marks} />
        </Form.Item>
        {/* <Form.Item
        initialValue={0}
        rules={[
          {
            max: 150,
            min: 20,
            type: "number",
          },
        ]}
        name="stepper-demo"
        label="奶量"
      >
        <Stepper />
      </Form.Item> */}
        <Form.Item
          name="feedingStatus"
          label="吃奶情况"
          initialValue={2}
          rules={[{ required: true }]}
        >
          <Rate defaultValue={3} allowClear={true} />
        </Form.Item>
        <Form.Item name="description" label="备注">
          <TextArea
            placeholder="请输入内容"
            autoSize={{ minRows: 3, maxRows: 5 }}
            showCount
            maxLength={100}
          />
        </Form.Item>
      </Form>
    </>
  );
}
