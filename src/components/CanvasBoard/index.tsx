import React, { useRef, useState, useEffect } from "react";

/**
 * 画板组件props
 * @typedef {Object} CanvasBoardProps
 * @property {(imgBase64: string) => void} [onChange] - 画布内容变更时回调，返回base64图片
 * @property {number} [height] - 画布高度，默认180
 */

/**
 * 评论专用画板组件，简洁美观，适配移动端弹窗
 * @component
 * @param {CanvasBoardProps} props
 */
const CanvasBoard: React.FC<{
  onChange?: (imgBase64: string) => void;
  height?: number;
}> = ({ onChange, height = 180 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState<string>("#000000");
  const [lineWidth, setLineWidth] = useState<number>(4);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  /**
   * 通知父组件画布内容变更
   */
  const notifyChange = () => {
    if (onChange && canvasRef.current) {
      onChange(canvasRef.current.toDataURL());
    }
  };

  useEffect(() => {
    notifyChange();
    // eslint-disable-next-line
  }, []);

  /**
   * 获取canvas坐标（兼容鼠标和触屏）
   */
  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: (e as React.MouseEvent).nativeEvent.offsetX,
        y: (e as React.MouseEvent).nativeEvent.offsetY,
      };
    }
  };

  /**
   * 保存当前画布状态到撤销栈
   */
  const pushToUndoStack = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL();
    setUndoStack((prev) => [...prev, url]);
    setRedoStack([]); // 新操作后清空重做栈
    notifyChange();
  };

  /**
   * 开始绘制（鼠标/触屏）
   */
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    pushToUndoStack();
    setDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    const pos = getCanvasPos(e);
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  /**
   * 绘制中（鼠标/触屏）
   */
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    const pos = getCanvasPos(e);
    if (ctx) {
      ctx.lineWidth = isEraser ? 18 : lineWidth;
      ctx.strokeStyle = isEraser ? "#fff" : color;
      ctx.lineCap = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      notifyChange();
    }
  };

  /**
   * 结束绘制（鼠标/触屏）
   */
  const handleEnd = () => {
    setDrawing(false);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.closePath();
      notifyChange();
    }
  };

  /**
   * 撤销上一步操作
   */
  const handleUndo = () => {
    if (undoStack.length === 0 || !canvasRef.current) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [...prev, canvasRef.current!.toDataURL()]);
    const img = new window.Image();
    img.src = last;
    img.onload = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(
          img,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        notifyChange();
      }
    };
  };

  /**
   * 重做操作
   */
  const handleRedo = () => {
    if (redoStack.length === 0 || !canvasRef.current) return;
    const last = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setUndoStack((prev) => [...prev, canvasRef.current!.toDataURL()]);
    const img = new window.Image();
    img.src = last;
    img.onload = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(
          img,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        notifyChange();
      }
    };
  };

  /**
   * 清空画布
   */
  const handleClear = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    pushToUndoStack();
    notifyChange();
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 6,
          gap: 8,
        }}
      >
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{
            width: 28,
            height: 28,
            border: "none",
            background: "none",
            padding: 0,
          }}
          title="画笔颜色"
          disabled={isEraser}
        />
        <input
          type="range"
          min={2}
          max={18}
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          style={{ width: 60 }}
          title="画笔粗细"
          disabled={isEraser}
        />
        <button
          onClick={() => setIsEraser(false)}
          style={{
            fontSize: 18,
            background: isEraser ? "#eee" : "#fff",
            border: "1px solid #ddd",
            borderRadius: 4,
            padding: "2px 8px",
          }}
          title="画笔"
        >
          🖌️
        </button>
        <button
          onClick={() => setIsEraser(true)}
          style={{
            fontSize: 18,
            background: isEraser ? "#fff" : "#eee",
            border: "1px solid #ddd",
            borderRadius: 4,
            padding: "2px 8px",
          }}
          title="橡皮擦"
        >
          🧽
        </button>
        <button
          onClick={handleUndo}
          style={{
            fontSize: 18,
            border: "1px solid #ddd",
            borderRadius: 4,
            padding: "2px 8px",
          }}
          disabled={undoStack.length === 0}
          title="撤销"
        >
          ↩️
        </button>
        <button
          onClick={handleRedo}
          style={{
            fontSize: 18,
            border: "1px solid #ddd",
            borderRadius: 4,
            padding: "2px 8px",
          }}
          disabled={redoStack.length === 0}
          title="重做"
        >
          ↪️
        </button>
        <button
          onClick={handleClear}
          style={{
            fontSize: 18,
            border: "1px solid #ddd",
            borderRadius: 4,
            padding: "2px 8px",
          }}
          title="清空"
        >
          🗑️
        </button>
      </div>
      <div
        style={{
          width: "100%",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 2px 8px #0001",
          overflow: "hidden",
          border: "1px solid #eee",
        }}
      >
        <canvas
          ref={canvasRef}
          width={window.innerWidth - 64 > 340 ? 340 : window.innerWidth - 64}
          height={height}
          style={{
            width: "100%",
            height: height,
            display: "block",
            background: "#fff",
            borderRadius: 10,
            touchAction: "none",
          }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>
    </div>
  );
};

export default CanvasBoard;
