import React, { useState, useEffect } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import { GetLocationRegeoAPI } from "@/service/api/checkIn";
import { useRequest } from "ahooks";
// import { Toast } from "antd-mobile";

const LocationCheckIn = () => {
  const [map, setMap] = useState(null);
  const [position, setPosition] = useState(null);
  const [checkIns, setCheckIns] = useState<
    {
      id: number;
      time: string;
      position: never;
      address: string;
    }[]
  >([]);
  // const [address, setAddress] = useState("");
  // 转地址
  const { data: address, run: runGetLocationRegeoAPI } = useRequest(
    async (params) => {
      const res = await GetLocationRegeoAPI(params);
      return res.data.regeocode.formatted_address;
    },
    {
      manual: true,
      onSuccess: (res) => {
        console.log(res, "逆向编码=================");
        //用户所在的地理位置信息
        //   setAddress(res.data.regeocode.formatted_address);
      },
      onError(e, params) {
        console.log(e, params, "Cuowu--------------");
      },
    }
  );

  // 初始化地图
  useEffect(() => {
    AMapLoader.load({
      key: process.env.GD_KEY, // 替换为你的实际key
      version: "2.0",
      plugins: [
        "AMap.Geolocation",
        "AMap.PlaceSearch",
        "AMap.Marker",
        "AMap.Geocoder",
      ],
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
            setPosition(position);
            mapInstance.setCenter(position);

            // 添加当前位置标记
            new AMap.Marker({
              position: position,
              map: mapInstance,
            });
            runGetLocationRegeoAPI({
              key: process.env.GD_KEY,
              location: `${position?.lng},${position?.lat}`,
              output: "JSON",
              extensions: "base", // 必需参数：base（精简）或 all（详细）
            });
            // 获取地址信息
            // getAddress(AMap, [position?.lng, position?.lat]);
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
      console.log(result, "地址=================", status);
      if (status === "complete" && result.regeocode) {
        // setAddress(result.regeocode.formattedAddress);
      } else {
        // Toast.show("根据经纬度查询地址失败！");
      }
    });
  };

  // 签到功能
  const handleCheckIn = () => {
    if (!position) return;
    console.log(address, "地址信息");
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
