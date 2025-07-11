// 成长轨迹
import React, { useEffect } from "react";
import "./style.css";

const growthEvents = [
  { month: 1, icon: "👶", title: "抬头", desc: "能短暂抬头" },
  { month: 2, icon: "😊", title: "会笑", desc: "对人微笑" },
  { month: 3, icon: "👀", title: "追视", desc: "眼睛能追随物体" },
  { month: 4, icon: "🥛", title: "厌奶期", desc: "可能出现厌奶" },
  { month: 5, icon: "🔄", title: "翻身", desc: "能自主翻身" },
  { month: 6, icon: "🍚", title: "吃辅食", desc: "尝试米粉、泥糊等" },
  { month: 7, icon: "🪑", title: "坐稳", desc: "能独坐" },
  { month: 8, icon: "🦷", title: "长牙", desc: "长出第一颗牙" },
  { month: 9, icon: "🐾", title: "爬行", desc: "会爬、探索力增强" },
  { month: 10, icon: "🧍", title: "扶站", desc: "扶物站立" },
  { month: 11, icon: "🗣️", title: "叫爸妈", desc: "会发简单音节" },
  { month: 12, icon: "🚶", title: "独立行走", desc: "能独立走几步" },
];

const arrowColor = "#ff6f00";

/**
 * 成长轨迹漫画风格组件，竖向排列12个节点，节点间用带流动动画的虚线箭头连接
 */
const GrowthTrajectoryComic: React.FC = () => {
  useEffect(() => {
    // 触发重绘以实现动画
  }, []);

  return (
    <div className="growth-trajectory-comic-vertical">
      <div className="comic-scroll-vertical">
        {growthEvents.map((event, idx) => {
          const isLeft = idx % 2 === 0;
          const nextIsLeft = (idx + 1) % 2 === 0;
          // 箭头终点x坐标，动态对齐下一个节点
          const endX = nextIsLeft ? 40 : 80; // 可根据节点宽度和偏移微调
          const controlX = isLeft ? 0 : 120;
          return (
            <div
              className={`comic-node-vertical ${isLeft ? "left" : "right"}`}
              key={event.month}
            >
              <div className="comic-icon">{event.icon}</div>
              <div className="comic-bubble">
                <div className="bubble-title">{event.title}</div>
                <div className="bubble-desc">{event.desc}</div>
                <div className="bubble-month">{event.month}月</div>
              </div>
              {/* 交错弯曲虚线箭头，终点动态对齐下一个节点 */}
              {idx < growthEvents.length - 1 && (
                <svg
                  className="comic-arrow-vertical"
                  width="120"
                  height="160"
                  viewBox="0 0 120 160"
                >
                  <defs>
                    <marker
                      id="arrowhead-vertical"
                      markerWidth="12"
                      markerHeight="12"
                      refX="12"
                      refY="6"
                      orient="auto"
                    >
                      <path d="M12,6 L4,2 L4,10 Z" fill={arrowColor} />
                    </marker>
                  </defs>
                  <path
                    d={`M60,0 Q${controlX},80 ${endX},160`}
                    stroke={arrowColor}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="10,8"
                    markerEnd="url(#arrowhead-vertical)"
                    className="arrow-flow-path"
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GrowthTrajectoryComic;
