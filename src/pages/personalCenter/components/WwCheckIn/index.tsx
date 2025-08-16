import React, { useState, useEffect } from "react";
import { GetLocationRegeoAPI } from "@/service/api/checkIn";
import { useRequest } from "ahooks";
import { storage } from "@/utils/storage";
import {
  initMapConfig,
  getGeolocation,
  commonSetCheckInPosition,
  monitorApproachedTarget,
  getLngAndLat,
} from "./map.ts";

let geolocation;
const LocationCheckIn = () => {
  const [mapInfo, setMapInfo] = useState<{
    map: any;
    mapInstance: any;
  }>();
  const [position, setPosition] = useState<
    { lng: number; lat: number } | number[] | undefined
  >(storage.get("lngAndLat-info"));
  const [currentUser, setCurrentUser] = useState<number[]>([0, 0]);
  const [checkIns, setCheckIns] = useState<
    {
      id: number;
      time: string;
      position: never;
      address: string;
    }[]
  >([]);
  const [lastCheckInPosition, setLastCheckInPosition] = useState<{
    lng: number;
    lat: number;
  }>(); //最近一次的打卡信息
  const [photo, setPhoto] = useState<string | ArrayBuffer | null>(null);
  // 转地址
  const { data: address, run: runGetLocationRegeoAPI } = useRequest(
    async (place) => {
      const res = await GetLocationRegeoAPI({
        key: process.env.GD_KEY,
        location: place,
        output: "JSON",
        extensions: "base", // 必需参数：base（精简）或 all（详细）
      });
      return res.data.regeocode.formatted_address;
    },
    {
      manual: true,
      onSuccess: (res) => {
        console.log(
          `%c获取设置的签到点的地理位置信息${res}`,
          "background: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet); color: white; padding: 2px;"
        );
      },
      onError(e, params) {
        console.log(e, params, "逆向编码地址报错了---------签到点-----");
      },
    }
  );
  // 当前用户地址
  const { data: currentAddress, run: runGetCurrentLocationRegeoAPI } =
    useRequest(
      async (place) => {
        const res = await GetLocationRegeoAPI({
          key: process.env.GD_KEY,
          location: place,
          output: "JSON",
          extensions: "base", // 必需参数：base（精简）或 all（详细）
        });
        return res.data.regeocode.formatted_address;
      },
      {
        manual: true,
        onSuccess: (res) => {
          console.log(
            `%c获取当前用户实时的地理位置信息%c${res}`,
            "color:red;",
            "color:green;"
          );
        },
        onError(e, params) {
          console.log(e, params, "逆向编码地址报错了----------实时----");
        },
      }
    );
  // 初始化地图
  const initMap = async () => {
    const getMapConfig = await initMapConfig();
    const { mapInstance, map } = getMapConfig;
    setMapInfo(getMapConfig);
    // 添加定位控件
    geolocation = getGeolocation(map, mapInstance);
  };
  useEffect(() => {
    initMap();

    // 组件卸载时清除监听
    return () => {
      geolocation?.clearWatch();
      geolocation = null;
    };
  }, []);

  const getCurrentUserInfo = async (AMap) => {
    const place = await monitorApproachedTarget(geolocation, AMap, position);
    console.log(`%c实时位置${place}`, "background:green");
    console.count("获取实时位置");
    setCurrentUser(place);
    runGetCurrentLocationRegeoAPI(`${place[0]},${place[1]}`);
  };
  useEffect(() => {
    const AMap = mapInfo?.map;
    const mapInstance = mapInfo?.mapInstance;
    if (AMap && position) {
      // 标记签到点位置
      commonSetCheckInPosition(mapInstance, AMap, position);
      console.log(
        `%c设置的签到地址中心点信息${position}`,
        "color: yellow; font-size: 20px; background-color: green;"
      );
      // 获取签到地址中心点信息
      runGetLocationRegeoAPI(
        `${getLngAndLat(position)[0]},${getLngAndLat(position)[1]}`
      );
      // 监听是否接近目标地点
      getCurrentUserInfo(AMap);
    }
  }, [position, mapInfo?.map]);

  // 添加拍照/上传函数
  const handleTakePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target!.result);
      };
      reader.readAsDataURL(file);
    }
  };
  // 在handleCheckIn函数中添加距离检查
  const handleCheckIn = () => {
    if (!position || !lastCheckInPosition) {
      // 第一次签到不做距离限制
      const newCheckIn = {
        id: Date.now(),
        time: new Date().toLocaleString(),
        position,
        address,
      };
      setCheckIns([...checkIns, newCheckIn]);
      setLastCheckInPosition(position);
      alert(`第一次签到成功！位置：${address}`);
      return;
    }

    // 计算与上次签到的距离(米)
    const distance = mapInfo?.map.GeometryUtil.distance(
      position,
      lastCheckInPosition
    );
    console.log(`%c距离上次签到位置相差${distance}米`, "background:red;");
    const allowedDistance = 500; // 允许500米内签到

    if (distance > allowedDistance) {
      alert(`距离上次签到点太远，请移动到${allowedDistance}米内再签到`);
      return;
    }

    // 允许签到
    const newCheckIn = {
      id: Date.now(),
      time: new Date().toLocaleString(),
      position,
      address,
      photo,
    };
    setCheckIns([...checkIns, newCheckIn]);
    setPhoto(null); // 清空照片
    setLastCheckInPosition(position);
    alert(`签到成功！位置：${address}`);
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div id="map-container" style={{ width: "100%", height: "70%" }} />

      <div style={{ padding: "20px" }}>
        <h2>签到点位置信息</h2>
        {address && <p>{address}</p>}
        <input
          type="file"
          accept="image/*"
          capture="camera"
          onChange={handleTakePhoto}
        />
        {photo && <img src={photo} alt="签到照片" style={{ width: "100px" }} />}
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

      <div style={{ padding: "20px" }}>
        <h2>当前位置信息</h2>
        {currentAddress && <p>{currentAddress}</p>}
        <h2 style={{ margin: "5px 0" }}>获取某地坐标</h2>
        <p>
          经度：{currentUser[0]}纬度：
          {currentUser[1]}
        </p>
      </div>
    </div>
  );
};

export default LocationCheckIn;
