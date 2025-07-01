import React, { useRef, useState, useEffect } from "react";
import "./style.less";

/**
 * 滑块验证组件
 * @param onPass 滑动通过回调
 */
interface SliderVerifyProps {
  onPass: () => void;
}

const BUTTON_WIDTH = 44;

const SliderVerify: React.FC<SliderVerifyProps> = ({ onPass }) => {
  const [passed, setPassed] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [maxOffset, setMaxOffset] = useState(0);
  const startX = useRef(0);
  const dragging = useRef(false);

  // 动态计算滑块最大距离
  useEffect(() => {
    if (sliderRef.current) {
      setMaxOffset(sliderRef.current.offsetWidth - BUTTON_WIDTH);
    }
    const handleResize = () => {
      if (sliderRef.current) {
        setMaxOffset(sliderRef.current.offsetWidth - BUTTON_WIDTH);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 鼠标事件
  const handleMouseDown = (e: React.MouseEvent) => {
    if (passed) return;
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX - offset;
    document.addEventListener("mousemove", handleMouseMove as any);
    document.addEventListener("mouseup", handleMouseUp as any);
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging.current || passed) return;
    let x = e.clientX - startX.current;
    x = Math.max(0, Math.min(x, maxOffset));
    setOffset(x);
    if (x >= maxOffset) {
      setPassed(true);
      dragging.current = false;
      setOffset(maxOffset);
      onPass();
      document.removeEventListener("mousemove", handleMouseMove as any);
      document.removeEventListener("mouseup", handleMouseUp as any);
    }
  };
  const handleMouseUp = () => {
    if (!passed) {
      dragging.current = false;
      setOffset(0);
    }
    document.removeEventListener("mousemove", handleMouseMove as any);
    document.removeEventListener("mouseup", handleMouseUp as any);
  };

  // 触摸事件
  const handleTouchStart = (e: React.TouchEvent) => {
    if (passed) return;
    e.preventDefault();
    dragging.current = true;
    startX.current = e.touches[0].clientX - offset;
    document.addEventListener("touchmove", handleTouchMove as any, {
      passive: false,
    });
    document.addEventListener("touchend", handleTouchEnd as any);
  };
  const handleTouchMove = (e: TouchEvent) => {
    if (!dragging.current || passed) return;
    let x = e.touches[0].clientX - startX.current;
    x = Math.max(0, Math.min(x, maxOffset));
    setOffset(x);
    if (x >= maxOffset) {
      setPassed(true);
      dragging.current = false;
      setOffset(maxOffset);
      onPass();
      document.removeEventListener("touchmove", handleTouchMove as any);
      document.removeEventListener("touchend", handleTouchEnd as any);
    }
    e.preventDefault();
  };
  const handleTouchEnd = () => {
    if (!passed) {
      dragging.current = false;
      setOffset(0);
    }
    document.removeEventListener("touchmove", handleTouchMove as any);
    document.removeEventListener("touchend", handleTouchEnd as any);
  };

  // 组件卸载时清理事件监听
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove as any);
      document.removeEventListener("mouseup", handleMouseUp as any);
      document.removeEventListener("touchmove", handleTouchMove as any);
      document.removeEventListener("touchend", handleTouchEnd as any);
    };
  }, []);

  // 计算按钮left，滑到最右时不超出
  const btnLeft = Math.max(0, Math.min(offset, maxOffset));

  return (
    <div className={`slider-verify${passed ? " passed" : ""}`} ref={sliderRef}>
      <div
        className="slider-bg"
        style={{ width: `${btnLeft + BUTTON_WIDTH}px` }}
      />
      <div
        className="slider-btn"
        style={{ left: btnLeft, width: BUTTON_WIDTH, height: BUTTON_WIDTH }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {passed ? "✔" : "→"}
      </div>
      <span className={`slider-text${passed ? " passed" : ""}`}>
        {passed ? "验证通过" : "请按住滑块拖动完成验证"}
      </span>
    </div>
  );
};

export default SliderVerify;
