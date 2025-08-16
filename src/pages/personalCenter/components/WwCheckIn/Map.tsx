import React, { useState, useEffect } from "react";
import { GetLocationRegeoAPI } from "@/service/api/checkIn";
import { useRequest } from "ahooks";
import { storage } from "@/utils/storage";
import { initMapConfig, getLngAndLat, getGeolocation } from "./map.ts";

let marker;
const Map = () => {
  const [position, setPosition] = useState<
    { lng: number; lat: number } | number[] | undefined
  >(storage.get("lngAndLat-info"));
  // 转地址
  const { data: address, run: runGetLocationRegeoAPI } = useRequest(
    async (params) => {
      const res = await GetLocationRegeoAPI(params);
      return res.data.regeocode.formatted_address;
    },
    {
      manual: true,
      onSuccess: (res) => {
        console.log(res, "用户所在的地理位置信息=================");
      },
      onError(e, params) {
        console.log(e, params, "逆向编码地址报错了--------------");
      },
    }
  );
  // 设置签到点
  const handleSetCheckInPosition = (mapInstance, AMap, place) => {
    // 设置中心点
    mapInstance.setCenter(place);
    // 移除以前的标记
    marker?.remove();
    // 添加当前位置标记
    marker = new AMap.Marker({
      position: place,
      map: mapInstance,
      title: "设定的签到地点",
    });
    mapInstance.add(marker);
    storage.set("lngAndLat-info", place);
    setPosition(place);
    // 获取签到地址信息
    console.log(getLngAndLat(place), "转变吗钱");
    runGetLocationRegeoAPI({
      key: process.env.GD_KEY,
      location: `${getLngAndLat(place)[0]},${getLngAndLat(place)[1]}`,
      output: "JSON",
      extensions: "base", // 必需参数：base（精简）或 all（详细）
    });
  };

  // 初始化地图
  const initMap = async () => {
    const getMapConfig = await initMapConfig();
    const { mapInstance, map } = getMapConfig;
    // 添加定位控件
    const geolocation = getGeolocation(map, mapInstance);
    //点击地图获取位置,设置打卡点
    mapInstance.on("click", function (e) {
      console.log(e?.lnglat, "点击地图获取位置");
      handleSetCheckInPosition(mapInstance, map, e?.lnglat);
    });
    const pos = storage.get("lngAndLat-info");
    if (!pos) {
      // 获取当前位置
      geolocation.getCurrentPosition((status, result) => {
        if (status === "complete") {
          const { position: current } = result;
          console.log(current, "当前位置");
          handleSetCheckInPosition(mapInstance, map, current);
        }
      });
    } else {
      console.log(pos, "存在签到位置------------");
      handleSetCheckInPosition(mapInstance, map, pos);
    }
  };
  useEffect(() => {
    initMap();
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div id="map-container" style={{ width: "100%", height: "70%" }} />

      <div style={{ padding: "20px" }}>
        <h2>当前位置信息</h2>
        {address && <p>{address}</p>}
        <p>
          经度：{getLngAndLat(position)[0]}纬度：
          {getLngAndLat(position)[1]}
        </p>
      </div>
    </div>
  );
};

export default Map;
