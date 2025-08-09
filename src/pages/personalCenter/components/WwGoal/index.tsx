import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Input,
  Toast,
  Tag,
  Dialog,
  Modal,
  PullToRefresh,
} from "antd-mobile";
import dayjs from "dayjs";
import {
  getGoals,
  completeGoal,
  setGoalRemind,
  deleteGoal,
} from "@/service/api/goal";
import { useNavigate } from "umi";
import { storage } from "@/utils/storage";
import {
  MailOutline,
  DeleteOutline,
  AddCircleOutline,
} from "antd-mobile-icons";
import AddGoal from "./AddGoal";

const goalTypes = ["学习", "运动", "阅读", "健康", "理财", "其他"];

const typeColor: Record<string, string> = {
  学习: "#1677ff",
  运动: "#00b578",
  阅读: "#722ed1",
  健康: "#eb2f96",
  理财: "#faad14",
  其他: "#bfbfbf",
};

const WwGoal: React.FC = () => {
  const loginInfo = storage.get("login-info");
  const [goals, setGoals] = useState<any[]>([]);
  const navigate = useNavigate();
  // 邮箱提醒弹窗相关state
  const [remindDialogVisible, setRemindDialogVisible] = useState(false);
  const [remindInput, setRemindInput] = useState("");
  const [remindGoalId, setRemindGoalId] = useState<number | null>(null);
  // 添加目标弹窗
  const [addGoalModal, setAddGoalModal] = useState(false);

  // 加载目标
  const loadGoals = async () => {
    const res = await getGoals(loginInfo?.userId || "");
    if (res) setGoals(res);
  };

  useEffect(() => {
    loadGoals();
  }, []);

  // 打开邮箱提醒弹窗
  const handleSetRemind = (goal: any) => {
    let remindArr: string[] = [];
    if (Array.isArray(goal.remindTimes)) {
      remindArr = goal.remindTimes;
    } else if (typeof goal.remindTimes === "string" && goal.remindTimes) {
      try {
        remindArr = JSON.parse(goal.remindTimes);
      } catch {
        remindArr = [];
      }
    }
    setRemindInput(remindArr.join(", "));
    setRemindGoalId(goal.id);
    setRemindDialogVisible(true);
  };
  // 邮箱提醒弹窗确认
  const handleRemindConfirm = async () => {
    if (remindGoalId) {
      const times = remindInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await setGoalRemind(remindGoalId, times);
      setRemindDialogVisible(false);
      setRemindGoalId(null);
      loadGoals();
    }
  };

  // 完成目标
  const handleComplete = async (id: number) => {
    await completeGoal(id);
    loadGoals();
  };

  // 删除目标
  const handleDelete = async (id: number) => {
    await deleteGoal(id);
    loadGoals();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f7faff 0%, #f0f4ff 100%)",
        padding: 0,
      }}
    >
      <div
        style={{
          background: "#1677ff",
          color: "#fff",
          padding: "0 0 12px 0",
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px 0 16px",
          }}
        >
          <Button
            color="primary"
            fill="solid"
            style={{ fontSize: 16, width: "60px" }}
            onClick={() => navigate(-1)}
          >
            返回
          </Button>
          <span style={{ fontSize: 18, fontWeight: 600 }}>我的目标</span>
          <AddCircleOutline
            style={{ fontSize: 24, width: "50px", cursor: "pointer" }}
            onClick={() => setAddGoalModal(true)}
          />
        </div>
      </div>
      <PullToRefresh
        onRefresh={async () => {
          await loadGoals();
        }}
      >
        <div style={{ maxWidth: 420, margin: "0 12px", padding: "18px 0" }}>
          {goals.length === 0 && (
            <div style={{ color: "#bbb", textAlign: "center", marginTop: 48 }}>
              暂无目标，快去添加吧！
            </div>
          )}
          {goals.map((goal, idx) => (
            <div
              key={goal.id}
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(22,119,255,0.06)",
                marginBottom: 18,
                padding: "18px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                position: "relative",
                borderLeft: `5px solid ${typeColor[goal.type] || "#1677ff"}`,
              }}
            >
              <Checkbox
                disabled={goal.completed}
                checked={!!goal.completed}
                onChange={() => handleComplete(goal.id)}
                style={{ marginTop: 4 }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 17,
                    marginBottom: 4,
                    color: goal.completed ? "#bbb" : "#222",
                  }}
                >
                  {goal.title}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <Tag
                    color={goal.completed ? "default" : "primary"}
                    style={{ borderRadius: 12, fontSize: 13 }}
                  >
                    {goal.type}
                  </Tag>
                  <span style={{ color: "#888", fontSize: 13 }}>
                    截止：{dayjs(goal.deadline).format("YYYY-MM-DD HH:mm")}
                  </span>
                </div>
                {goal.reward && (
                  <span
                    style={{ color: "#faad14", fontSize: 14, marginRight: 8 }}
                  >
                    奖励：{goal.reward}
                  </span>
                )}
                {goal.completed ? (
                  <span
                    style={{
                      color: "#00b578",
                      fontWeight: 600,
                      fontSize: 15,
                      marginLeft: 8,
                    }}
                  >
                    yyds
                  </span>
                ) : null}
              </div>
              {!goal.completed && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <MailOutline
                    style={{ borderRadius: 16, fontSize: 24, color: "#1677ff" }}
                    onClick={() => handleSetRemind(goal)}
                  />
                  <DeleteOutline
                    style={{ borderRadius: 16, fontSize: 24, color: "red" }}
                    onClick={() => handleDelete(goal.id)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </PullToRefresh>
      {/* 添加目标弹窗 */}
      <Modal
        visible={addGoalModal}
        showCloseButton
        onClose={() => setAddGoalModal(false)}
        bodyStyle={{ borderRadius: 18, padding: 0, minHeight: 480 }}
        content={
          <AddGoal
            onSuccess={() => {
              setAddGoalModal(false);
              loadGoals();
            }}
          />
        }
      />
      {/* 邮箱提醒弹窗 */}
      <Dialog
        visible={remindDialogVisible}
        title="设置提醒时间（可多次，逗号分隔，格式2024-03-01 20:00）"
        content={
          <Input
            value={remindInput}
            onChange={setRemindInput}
            placeholder="请输入提醒时间"
          />
        }
        actions={[
          [
            {
              key: "cancel",
              text: "取消",
              onClick: () => setRemindDialogVisible(false),
            },
            {
              key: "ok",
              text: "确定",
              bold: true,
              onClick: handleRemindConfirm,
            },
          ],
        ]}
      />
    </div>
  );
};

export default WwGoal;
