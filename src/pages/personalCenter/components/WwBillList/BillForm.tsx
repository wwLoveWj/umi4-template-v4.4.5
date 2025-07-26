import React, { useState, useEffect, useRef } from "react";
import { billIcons } from "./billIcons";
import { Toast } from "antd-mobile";
import { set, get } from "idb-keyval";

const CATEGORIES = Object.keys(billIcons);
const CUSTOM_ICON_KEY = "my-bill-custom-icons";

/**
 * 账单表单 props
 * @param onSubmit 提交回调
 * @param onClose 关闭回调
 */
const BillForm: React.FC<{
  onSubmit: (bill: any) => void;
  onClose: () => void;
}> = ({ onSubmit, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [remark, setRemark] = useState("");
  const [customIcons, setCustomIcons] = useState<string[]>([]); // base64数组
  const user = localStorage.getItem("loginUser") || "我";
  const createdAt = new Date().toISOString();

  useEffect(() => {
    get(CUSTOM_ICON_KEY).then((arr: any) => {
      if (Array.isArray(arr)) setCustomIcons(arr);
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Toast.show("请选择图片文件");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const newIcons = [...customIcons, base64];
      setCustomIcons(newIcons);
      await set(CUSTOM_ICON_KEY, newIcons);
      setCategory("custom-" + newIcons.length);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Toast.show("请输入有效金额");
      return;
    }
    let icon = category;
    let iconData = "";
    if (category.startsWith("custom-")) {
      const idx = parseInt(category.replace("custom-", "")) - 1;
      iconData = customIcons[idx];
    }
    onSubmit({
      id: Date.now().toString(),
      category: category.startsWith("custom-") ? "自定义" : category,
      icon: iconData || category,
      amount: Number(amount),
      date,
      time,
      user,
      createdAt,
      remark,
    });
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 24,
        width: 320,
        boxShadow: "0 4px 24px #0002",
        margin: "0 auto",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: 16 }}>记录账单</h3>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
          justifyContent: "center",
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            style={{
              border: category === cat ? "2px solid #1677ff" : "2px solid #eee",
              borderRadius: 12,
              background: "#f5f7fa",
              padding: 6,
              cursor: "pointer",
              outline: "none",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
            onClick={() => setCategory(cat)}
            title={cat}
          >
            {billIcons[cat]}
            {category === cat && (
              <span
                style={{
                  position: "absolute",
                  right: 2,
                  top: 2,
                  color: "#1677ff",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                ✔
              </span>
            )}
          </button>
        ))}
        {/* 自定义图标 */}
        {customIcons.map((icon, idx) => (
          <button
            key={"custom-" + (idx + 1)}
            style={{
              border:
                category === "custom-" + (idx + 1)
                  ? "2px solid #1677ff"
                  : "2px solid #eee",
              borderRadius: 12,
              background: "#f5f7fa",
              padding: 6,
              cursor: "pointer",
              outline: "none",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
            onClick={() => setCategory("custom-" + (idx + 1))}
            title={"自定义"}
          >
            <img
              src={icon}
              alt="icon"
              style={{ width: 32, height: 32, borderRadius: 8 }}
            />
            {category === "custom-" + (idx + 1) && (
              <span
                style={{
                  position: "absolute",
                  right: 2,
                  top: 2,
                  color: "#1677ff",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                ✔
              </span>
            )}
          </button>
        ))}
        {/* 添加自定义图标按钮 */}
        <button
          style={{
            border: "2px dashed #bbb",
            borderRadius: 12,
            background: "#f5f7fa",
            padding: 6,
            cursor: "pointer",
            outline: "none",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            color: "#bbb",
            position: "relative",
          }}
          onClick={() => fileInputRef.current?.click()}
          title="自定义图标"
        >
          +
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
            }}
            onChange={handleFileChange}
            onClick={(e) => e.stopPropagation()}
          />
        </button>
      </div>
      <div style={{ marginBottom: 12 }}>
        <input
          type="number"
          placeholder="金额"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 8,
            border: "1px solid #eee",
            fontSize: 16,
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            flex: 1,
            padding: 6,
            borderRadius: 8,
            border: "1px solid #eee",
          }}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{
            flex: 1,
            padding: 6,
            borderRadius: 8,
            border: "1px solid #eee",
          }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="备注（可选）"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 8,
            border: "1px solid #eee",
            fontSize: 15,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 18,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "#eee",
            color: "#222",
            border: "none",
            borderRadius: 8,
            padding: "8px 24px",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          style={{
            background: "var(--primary-color)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 24px",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          保存
        </button>
      </div>
    </div>
  );
};

export default BillForm;
