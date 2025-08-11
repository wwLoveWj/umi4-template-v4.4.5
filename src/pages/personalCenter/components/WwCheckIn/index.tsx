import React, { useState, useEffect } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";

const LocationCheckIn = () => {
  const [map, setMap] = useState(null);
  const [position, setPosition] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [address, setAddress] = useState("");

  // 初始化地图
  useEffect(() => {
    AMapLoader.load({
      key: "882c94eea50e2900d1e33043cdfb88d5", // 替换为你的实际key
      version: "2.0",
      plugins: ["AMap.Geolocation", "AMap.PlaceSearch", "AMap.Marker"],
    })
      .then((AMap) => {
        const mapInstance = new AMap.Map("map-container", {
          zoom: 15,
          viewMode: "3D",
        });
        setMap(mapInstance);

        // 添加定位控件
        const geolocation = new AMap.Geolocation({
          enableHighAccuracy: true,
          timeout: 10000,
          buttonPosition: "RB",
        });
        mapInstance.addControl(geolocation);

        // 获取当前位置
        geolocation.getCurrentPosition((status, result) => {
          console.log(status, "地图===============", result);
          if (status === "complete") {
            const { position } = result;
            debugger;
            setPosition(position);
            mapInstance.setCenter(position);

            // 添加当前位置标记
            new AMap.Marker({
              position: position,
              map: mapInstance,
            });

            // 获取地址信息
            getAddress(AMap, position);
          }
        });
      })
      .catch((e) => {
        console.error("地图加载失败:", e);
      });
  }, []);

  // 获取地址信息
  const getAddress = (AMap, lnglat) => {
    const geocoder = new AMap.Geocoder();
    geocoder.getAddress(lnglat, (status, result) => {
      if (status === "complete" && result.regeocode) {
        setAddress(result.regeocode.formattedAddress);
      }
    });
  };

  // 签到功能
  const handleCheckIn = () => {
    if (!position) return;

    const newCheckIn = {
      id: Date.now(),
      time: new Date().toLocaleString(),
      position: position,
      address: address,
    };

    setCheckIns([...checkIns, newCheckIn]);
    alert(`签到成功！位置：${address}`);
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div id="map-container" style={{ width: "100%", height: "70%" }} />

      <div style={{ padding: "20px" }}>
        <h2>当前位置信息</h2>
        {address && <p>{address}</p>}

        <button
          onClick={handleCheckIn}
          style={{
            padding: "10px 20px",
            background: "#1890ff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          签到
        </button>

        <h3>签到记录</h3>
        <ul>
          {checkIns.map((item) => (
            <li key={item.id}>
              <p>时间: {item.time}</p>
              <p>地址: {item.address}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LocationCheckIn;
