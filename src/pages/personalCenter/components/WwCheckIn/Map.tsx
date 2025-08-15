import React, { useState, useEffect } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import { GetLocationRegeoAPI } from "@/service/api/checkIn";
import { useRequest } from "ahooks";
import { storage } from "@/utils/storage";

let marker;
const Map = () => {
  const [map, setMap] = useState();
  const [position, setPosition] = useState(storage.get("lngAndLat-info"));
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
        console.log(res, "逆向编码地址=================");
        //用户所在的地理位置信息
        //   setAddress(res.data.regeocode.formatted_address);
      },
      onError(e, params) {
        console.log(e, params, "逆向编码地址报错了--------------");
      },
    }
  );
  // 设置签到点
  const handleSetCheckInPosition = (
    mapInstance,
    AMap,
    place,
    first = false
  ) => {
    // 设置中心点
    mapInstance.setCenter(place);
    console.log(place, "mmn---------");
    // 移除以前的标记
    marker?.remove();
    // 添加当前位置标记
    marker = new AMap.Marker({
      position: place,
      map: mapInstance,
      title: "设定的签到地点",
    });
    storage.set("lngAndLat-info", place);
    setPosition(place);
    // 获取签到地址信息
    runGetLocationRegeoAPI({
      key: process.env.GD_KEY,
      location: first
        ? `${place?.lng},${place?.lat}`
        : `${place[0]},${place[1]}`,
      output: "JSON",
      extensions: "base", // 必需参数：base（精简）或 all（详细）
    });
  };

  // 初始化地图
  const initMap = async () => {
    const AMap = await AMapLoader.load({
      key: process.env.GD_KEY, // 替换为你的实际key
      version: "2.0",
      plugins: [
        "AMap.Geolocation",
        "AMap.PlaceSearch",
        "AMap.Marker",
        "AMap.Geocoder",
        "AMap.AdvancedInfoWindow",
      ],
    });
    setMap(AMap);
    //存储实例地图
    const mapInstance = new AMap.Map("map-container", {
      zoom: 15, //设置地图显示的缩放级别
      viewMode: "3D", //使用3D视图
    });
    // 添加定位控件,获取中心点位置
    const geolocation = new AMap.Geolocation({
      enableHighAccuracy: true, //是否使用高精度定位，默认:true
      timeout: 10000,
      buttonPosition: "RB",
      zoomToAccuracy: true, //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
    });
    mapInstance.addControl(geolocation);

    //点击地图获取位置,设置打卡点
    mapInstance.on("click", function (e) {
      console.log(e?.lnglat, "点击地图获取位置");
      handleSetCheckInPosition(mapInstance, AMap, e?.lnglat);
    });
    if (!storage.get("lngAndLat-info")) {
      // 获取当前位置
      geolocation.getCurrentPosition((status, result) => {
        if (status === "complete") {
          const { position } = result;
          console.log(position, "当前位置");
          handleSetCheckInPosition(mapInstance, AMap, position);
        }
      });
    } else {
      const pos = storage.get("lngAndLat-info");
      console.log(pos, "009------------");
      handleSetCheckInPosition(mapInstance, AMap, pos, true);
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
          经度：{position?.lng}纬度：{position?.lat}
        </p>
      </div>
    </div>
  );
};

export default Map;
