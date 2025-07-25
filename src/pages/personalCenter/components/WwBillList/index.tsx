import React, { useState, useEffect } from "react";
import { FloatingBubble, Toast } from "antd-mobile";
import { UpCircleOutline } from "antd-mobile-icons";
import BillForm from "./BillForm";
import { billIcons } from "./billIcons";

const BILL_KEY = "my-bill-list";

function getMonth(dateStr: string) {
  return dateStr.slice(0, 7); // yyyy-MM
}

function groupByMonth(bills: any[]) {
  const map: Record<string, any[]> = {};
  bills.forEach((bill) => {
    const m = getMonth(bill.date);
    if (!map[m]) map[m] = [];
    map[m].push(bill);
  });
  return map;
}

function sumAmount(bills: any[]) {
  return bills.reduce((sum, b) => sum + Number(b.amount), 0);
}

const BillList: React.FC = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem(BILL_KEY) || "[]");
    setBills(list);
  }, [showForm]);

  const monthMap = groupByMonth(bills);
  const months = Object.keys(monthMap).sort((a, b) => b.localeCompare(a));
  const currentBills = monthMap[month] || [];

  return (
    <div style={{ padding: 16, minHeight: 400, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontWeight: 600, fontSize: 18, marginRight: 12 }}>
          账单
        </span>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={{ fontSize: 16, borderRadius: 6, padding: "2px 8px" }}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <span style={{ marginLeft: 16, color: "#888", fontSize: 15 }}>
          合计：
          <b style={{ color: "var(--primary-color)" }}>
            {sumAmount(currentBills).toFixed(2)}
          </b>
        </span>
      </div>
      {currentBills.length === 0 && (
        <div style={{ color: "#aaa", textAlign: "center", marginTop: 48 }}>
          本月暂无账单
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {currentBills
          .sort(
            (a, b) =>
              b.date.localeCompare(a.date) || b.time.localeCompare(a.time)
          )
          .map((bill) => (
            <div
              key={bill.id}
              style={{
                display: "flex",
                alignItems: "center",
                background: "#fff",
                borderRadius: 14,
                boxShadow: "0 2px 8px #0001",
                padding: 12,
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "#f5f7fa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                {billIcons[bill.category]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>
                  {bill.category}
                </div>
                <div style={{ color: "#888", fontSize: 13 }}>
                  {bill.date} {bill.time} {bill.remark && `｜${bill.remark}`}
                </div>
              </div>
              <div
                style={{
                  fontWeight: 700,
                  color: "var(--primary-color)",
                  fontSize: 18,
                }}
              >
                -￥{Number(bill.amount).toFixed(2)}
              </div>
            </div>
          ))}
      </div>
      <FloatingBubble
        axis="xy"
        style={{ right: 32, bottom: 32, zIndex: 10, "--background": "#ff9800" }}
        onClick={() => setShowForm(true)}
      >
        <UpCircleOutline fontSize={36} />
      </FloatingBubble>
      {showForm && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BillForm
            onSubmit={(bill) => {
              const list = JSON.parse(localStorage.getItem(BILL_KEY) || "[]");
              list.push(bill);
              localStorage.setItem(BILL_KEY, JSON.stringify(list));
              setShowForm(false);
              Toast.show("账单已记录");
            }}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default BillList;
