import React from "react";
import {
  Button,
  DatePicker,
  Picker,
  Form,
  Input,
  Space,
  NoticeBar,
  TextArea,
  Selector,
} from "antd-mobile";
import dayjs from "dayjs";
import type { DatePickerRef } from "antd-mobile/es/components/date-picker";
import type { RefObject } from "react";

const basicColumns = [
  [
    { label: "手足口", value: "Mon" },
    { label: "乙肝", value: "Tues" },
    { label: "卡介苗", value: "Wed" },
    { label: "百白破", value: "Thur" },
    { label: "麻腮风", value: "Fri" },
    { label: "五联", value: "trt" },
  ],
];
export default function RegisterVaccination() {
  const [formRef] = Form.useForm();
  const onFinish = (values: API.VaccinationType) => {
    let params = {
      ...values,
      vaccineName: values?.vaccineName[0],
      inoculabilityTime: dayjs(values?.inoculabilityTime)?.format(
        "YYYY-MM-DD HH:mm"
      ),
    };
    debugger;
  };
  return (
    <Form
      name="form"
      form={formRef}
      onFinish={onFinish}
      footer={
        <Button block type="submit" color="primary" size="large">
          登记
        </Button>
      }
    >
      <NoticeBar
        content={"系统会根据您的接种时间，在30天后通知您进行二次接种"}
        color="alert"
      />
      <Form.Item
        name="batchNumber"
        label="疫苗批次号"
        rules={[{ required: true }]}
      >
        <Input placeholder="请输入疫苗批次号" />
      </Form.Item>
      <Form.Item
        name="vaccineName"
        label="疫苗名称"
        rules={[{ required: true }]}
      >
        {/* {(value, onChage) => ( */}
        <Picker
          columns={basicColumns}
          value={formRef?.getFieldValue("vaccineName")}
          onConfirm={(e) => {
            formRef?.setFieldValue("vaccineName", e);
          }}
          //   onSelect={(val, extend) => {
          //     console.log("onSelect", val, extend.items);
          //   }}
        >
          {(items, { open }) => {
            return (
              <Space align="center">
                {items.every((item) => item === null) ? (
                  <span onClick={open}>请选择疫苗</span>
                ) : (
                  items.map((item) => item?.label)
                )}
              </Space>
            );
          }}
        </Picker>
      </Form.Item>
      <Form.Item
        name="tag"
        label="接种情况"
        rules={[{ required: true }]}
        initialValue={[0]}
      >
        <Selector
          columns={3}
          options={[
            {
              label: "未接种",
              value: 0,
            },
            {
              label: "待接种",
              value: 1,
            },
            {
              label: "已接种",
              value: 2,
            },
          ]}
        />
      </Form.Item>
      <Form.Item
        name="inoculabilityTime"
        // label={
        //   formRef?.getFieldValue("tag") === 2
        //     ? "接种时间"
        //     : formRef?.getFieldValue("tag") === 1
        //     ? "待接种时间"
        //     : "创建时间"
        // }
        label="接种时间"
        trigger="onConfirm"
        rules={[{ required: true }]}
        onClick={(e, datePickerRef: RefObject<DatePickerRef>) => {
          datePickerRef.current?.open();
        }}
      >
        <DatePicker precision="minute">
          {(value) =>
            value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "请选择接种时间"
          }
        </DatePicker>
      </Form.Item>
      <Form.Item name="description" label="备注">
        <TextArea
          placeholder="请输入备注内容"
          autoSize={{ minRows: 3, maxRows: 5 }}
          showCount
          maxLength={500}
        />
      </Form.Item>
    </Form>
  );
}
