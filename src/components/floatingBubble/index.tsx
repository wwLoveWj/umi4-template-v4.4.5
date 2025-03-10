import React, { useState } from "react";
import { FloatingBubble } from "antd-mobile";
import { AddOutline } from "antd-mobile-icons";
import { history } from "umi";

export default function Index({
  pathname = "/", //跳转的路由地址
  query = {}, //路由参数
  iconRender,
  isShowIcon = true,
  onClick,
}: {
  pathname?: string;
  query?: any;
  iconRender?: React.ReactNode;
  isShowIcon?: boolean;
  onClick?: (params?: any) => void;
}) {
  const [offset, setOffset] = useState({ x: -24, y: -24 });
  return (
    <FloatingBubble
      axis="xy"
      style={{
        "--initial-position-bottom": "122px",
        "--initial-position-right": "0",
      }}
      onOffsetChange={(offset) => {
        setOffset(offset);
      }}
      offset={offset}
    >
      {isShowIcon ? (
        <AddOutline
          fontSize={32}
          onClick={() =>
            onClick
              ? onClick()
              : history.push(
                  {
                    pathname,
                  },
                  query
                )
          }
        />
      ) : (
        iconRender
      )}
    </FloatingBubble>
  );
}
