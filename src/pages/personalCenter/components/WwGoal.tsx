import React, { useEffect, useState } from "react";
import {
  Button,
  List,
  Checkbox,
  Input,
  Toast,
  Tag,
  Dialog,
  DatePicker,
} from "antd-mobile";
import dayjs from "dayjs";
import {
  getGoals,
  addGoal,
  completeGoal,
  setGoalRemind,
  deleteGoal,
} from "@/service/api/goal";
import { useNavigate } from "umi";
import { storage } from "@/utils/storage";

const goalTypes = ["学习", "运动", "阅读", "健康", "理财", "其他"];

/**
 * 我的目标主页面
 */
const WwGoal: React.FC = () => {
  const loginInfo = storage.get("login-info");
  const [goals, setGoals] = useState<any[]>([]);
  const navigate = useNavigate();
  // 添加目标弹窗相关state
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [addForm, setAddForm] = useState({
    title: "",
    type: "",
    deadline: "",
    reward: "",
  });
  const [pickerValue, setPickerValue] = useState<Date | undefined>(undefined);
  // 邮箱提醒弹窗相关state
  const [remindDialogVisible, setRemindDialogVisible] = useState(false);
  const [remindInput, setRemindInput] = useState("");
  const [remindGoalId, setRemindGoalId] = useState<number | null>(null);

  // 加载目标
  const loadGoals = async () => {
    const res = await getGoals(loginInfo?.userId || "");
    if (res) setGoals(res);
  };

  useEffect(() => {
    loadGoals();
  }, []);

  // 添加目标弹窗
  const handleAddGoal = async () => {
    if (!addForm.title || !addForm.type || !addForm.deadline) {
      Toast.show({ content: "请填写完整信息" });
      return;
    }
    await addGoal(addForm);
    setAddDialogVisible(false);
    setAddForm({ title: "", type: "", deadline: "", reward: "" });
    setPickerValue(undefined);
    loadGoals();
  };

  // 打开邮箱提醒弹窗
  const handleSetRemind = (goal: any) => {
    setRemindInput((goal.remindTimes || []).join(", "));
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
    <div>
      <Button
        color="primary"
        onClick={() => navigate("/personalCenter/add-goal")}
      >
        添加目标
      </Button>
      <List>
        {goals.map((goal) => (
          <List.Item
            key={goal.id}
            prefix={
              <Checkbox
                checked={!!goal.completed}
                onChange={() => handleComplete(goal.id)}
              />
            }
            description={
              <>
                <Tag color="primary">{goal.type}</Tag>
                <span style={{ marginLeft: 8 }}>
                  截止：{dayjs(goal.deadline).format("YYYY-MM-DD HH:mm")}
                </span>
                {goal.reward && (
                  <span style={{ marginLeft: 8, color: "#faad14" }}>
                    奖励：{goal.reward}
                  </span>
                )}
                {goal.completed && (
                  <span style={{ marginLeft: 8, color: "#52c41a" }}>yyds</span>
                )}
              </>
            }
            extra={
              !goal.completed && (
                <>
                  <Button size="mini" onClick={() => handleSetRemind(goal)}>
                    邮箱提醒
                  </Button>
                  <Button
                    size="mini"
                    color="danger"
                    onClick={() => handleDelete(goal.id)}
                  >
                    删除
                  </Button>
                </>
              )
            }
          >
            {goal.title}
          </List.Item>
        ))}
      </List>
      {/* 添加目标弹窗 */}
      <Dialog
        visible={addDialogVisible}
        title="添加目标"
        content={
          <div>
            <Input
              placeholder="目标内容"
              value={addForm.title}
              onChange={(v) => setAddForm((f) => ({ ...f, title: v }))}
            />
            <div style={{ margin: "8px 0" }}>
              {goalTypes.map((type) => (
                <Tag
                  key={type}
                  color={addForm.type === type ? "primary" : "default"}
                  onClick={() => setAddForm((f) => ({ ...f, type }))}
                  style={{ marginRight: 8 }}
                >
                  {type}
                </Tag>
              ))}
            </div>
            <DatePicker
              title="截止时间"
              value={pickerValue}
              onConfirm={(date) => {
                setAddForm((f) => ({
                  ...f,
                  deadline: dayjs(date).format("YYYY-MM-DD HH:mm"),
                }));
                setPickerValue(date);
              }}
              precision="minute"
            >
              {(val) => (
                <Button block>
                  {pickerValue
                    ? dayjs(pickerValue).format("YYYY-MM-DD HH:mm")
                    : "选择截止时间"}
                </Button>
              )}
            </DatePicker>
            <Input
              placeholder="奖励（可选）"
              value={addForm.reward}
              onChange={(v) => setAddForm((f) => ({ ...f, reward: v }))}
            />
          </div>
        }
        actions={[
          [
            {
              key: "cancel",
              text: "取消",
              onClick: () => setAddDialogVisible(false),
            },
            { key: "ok", text: "添加", bold: true, onClick: handleAddGoal },
          ],
        ]}
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
