import React, { useState } from "react";
import { Button, Input, Toast, Tag, DatePicker, NavBar } from "antd-mobile";
import { useNavigate } from "umi";
import { CalendarOutline, GiftOutline } from "antd-mobile-icons";
import dayjs from "dayjs";
import { addGoal } from "@/service/api/goal";
import { storage } from "@/utils/storage";

const goalTypes = ["学习", "运动", "阅读", "健康", "理财", "其他"];

interface AddGoalProps {
  onSuccess?: () => void;
}

const AddGoal: React.FC<AddGoalProps> = ({ onSuccess }) => {
  const loginInfo = storage.get("login-info");
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "",
    deadline: "",
    reward: "",
  });
  const [pickerValue, setPickerValue] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!form.title || !form.type || !form.deadline) {
      Toast.show({ content: "请填写完整信息" });
      return;
    }
    setLoading(true);
    await addGoal({ ...form, userId: loginInfo?.userId || "" });
    setLoading(false);
    Toast.show({ content: "添加成功" });
    if (onSuccess) onSuccess();
  };

  return (
    <div
      style={
        {
          // minHeight: "100vh",
          // background: "linear-gradient(180deg, #f7faff 0%, #f0f4ff 100%)",
        }
      }
    >
      {/* <NavBar
        onBack={() => navigate(-1)}
        style={{ background: "#1677ff", color: "#fff" }}
      >
        添加目标
      </NavBar> */}
      <div
        style={{
          maxWidth: 500,
          margin: "24px auto",
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 4px 16px rgba(22,119,255,0.06)",
          padding: "24px 18px",
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>
          目标内容
        </div>
        <Input
          placeholder="请输入目标内容"
          value={form.title}
          onChange={(v) => setForm((f) => ({ ...f, title: v }))}
          clearable
          style={{
            marginBottom: 16,
            background: "#f7f8fa",
            borderRadius: 8,
            padding: 8,
          }}
        />
        <div style={{ marginBottom: 16 }}>
          {goalTypes.map((type) => (
            <Tag
              key={type}
              color={form.type === type ? "primary" : "default"}
              onClick={() => setForm((f) => ({ ...f, type }))}
              style={{
                marginRight: 8,
                marginBottom: 8,
                borderRadius: 16,
                fontSize: 14,
                padding: "4px 16px",
              }}
            >
              {type}
            </Tag>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          <DatePicker
            title="选择截止时间"
            value={pickerValue}
            onConfirm={(date) => {
              setForm((f) => ({
                ...f,
                deadline: dayjs(date).format("YYYY-MM-DD HH:mm"),
              }));
              setPickerValue(date);
            }}
            visible={visible}
            onClose={() => {
              setVisible(false);
            }}
            precision="minute"
          >
            {(val) => (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#f7f8fa",
                  borderRadius: 8,
                  padding: "10px 12px",
                  color: form.deadline ? "#333" : "#bbb",
                  fontSize: 15,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setVisible(true);
                }}
              >
                <CalendarOutline
                  style={{ fontSize: 20, marginRight: 8, color: "#1677ff" }}
                />
                {val ? dayjs(val).format("YYYY-MM-DD HH:mm") : "选择截止时间"}
              </div>
            )}
          </DatePicker>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#f7f8fa",
              borderRadius: 8,
              padding: 8,
            }}
          >
            <GiftOutline
              style={{ color: "#faad14", fontSize: 18, marginRight: 4 }}
            />
            <Input
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                boxShadow: "none",
              }}
              placeholder="奖励（可选）"
              value={form.reward}
              onChange={(v) => setForm((f) => ({ ...f, reward: v }))}
              clearable
            />
          </div>
        </div>
        <Button
          block
          color="primary"
          size="large"
          style={{ borderRadius: 24, fontWeight: 600, fontSize: 17 }}
          loading={loading}
          onClick={handleAdd}
        >
          添加
        </Button>
      </div>
    </div>
  );
};

export default AddGoal;
