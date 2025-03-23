import React, { useEffect, useRef, useState } from "react";
import { SearchBar, Space, Toast, Popup, NavBar } from "antd-mobile";
import { SearchBarRef } from "antd-mobile/es/components/search-bar";
import { ScanningOutline } from "antd-mobile-icons";
import styles from "../style.less";
import { useModel } from "umi";

export default function SearchHead() {
  const [visible1, setVisible1] = useState(false);
  const searchRef = useRef<SearchBarRef>(null);
  const { getCameras, html5QrCode, stop } = useModel("useScan");

  useEffect(() => {
    return () => {
      console.log(html5QrCode, "首页");
      if (html5QrCode) stop();
    };
  }, []);
  return (
    <div style={{ padding: "12px", background: "pink" }}>
      <SearchBar
        ref={searchRef}
        placeholder="请输入搜索内容"
        searchIcon={
          <ScanningOutline
            style={{ color: "#002FA7", fontSize: "24px" }}
            onClick={() => {
              getCameras();
            }}
          />
        }
        onFocus={() => {
          setVisible1(true);
        }}
      />
      <Popup
        visible={visible1}
        onMaskClick={() => {
          setVisible1(false);
        }}
        onClose={() => {
          setVisible1(false);
        }}
        bodyStyle={{ height: "100vh" }}
      >
        <NavBar
          back="取消"
          onBack={() => {
            setVisible1(false);
          }}
          backIcon={false}
          right={
            <a
              onClick={() => {
                setVisible1(false);
              }}
            >
              完成
            </a>
          }
        >
          标题
        </NavBar>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim, officiis
        numquam ipsam magni quisquam ea excepturi qui, quidem beatae, illo
        veniam atque voluptas? Incidunt delectus provident itaque at. Dicta,
        labore.
      </Popup>
    </div>
  );
}
