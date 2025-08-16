import React, { useState, useEffect } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import { GetLocationRegeoAPI } from "@/service/api/checkIn";
import { useRequest } from "ahooks";
import { storage } from "@/utils/storage";

let myWatchId;
const LocationCheckIn = () => {
  const [mapInfo, setMapInfo] = useState();
  const [position, setPosition] = useState();
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
    async (params) => {
      const res = await GetLocationRegeoAPI(params);
      return res.data.regeocode.formatted_address;
    },
    {
      manual: true,
      refreshDeps: [position],
      onSuccess: (res) => {
        console.log(res, "逆向编码=================");
      },
      onError(e, params) {
        console.log(e, params, "Cuowu--------------");
      },
    }
  );

  // 监听是否接近目标地点
  const monitorApproachedTarget = (geolocation, checkDistance) => {
    myWatchId = geolocation.watchPosition((status, result) => {
      console.log("首次实时监听了吗", status, result);
      if (status === "complete") {
        // 实时移动位置
        const userLocation = [result.position.lng, result.position.lat];
        const isInRange = checkDistance(userLocation, 200);
        console.log("监听目标,第一个实时位置", userLocation, isInRange);
        if (isInRange) {
          alert("🚨 你已进入目标地点 200 米范围内！");
          setTimeout(() => {
            const nav: any = navigator;
            nav.vibrate =
              nav.vibrate ||
              nav.webkitVibrate ||
              nav.mozVibrate ||
              nav.msVibrate;
            if (nav.vibrate) {
              console.log("支持设备震动！");
              nav.vibrate(5000);
            }
          }, 1000);
          // 可选：停止监听
          geolocation.clearWatch();
        }
      } else {
        console.error("定位失败:", result.message);
      }
    });
    console.log(myWatchId, "监听消失了？");
  };

  // 初始化地图
  const initMap = async () => {
    const map = await AMapLoader.load({
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
    //存储实例地图
    const mapInstance = new map.Map("map-container", {
      zoom: 15, //设置地图显示的缩放级别
      viewMode: "3D", //使用3D视图
    });

    // 添加定位控件
    const geolocation = new map.Geolocation({
      enableHighAccuracy: true, //是否使用高精度定位，默认:true
      timeout: 10000,
      maximumAge: 0, //定位结果缓存0毫秒，默认：0
      convert: true, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
      showButton: true, //显示定位按钮，默认：true
      buttonPosition: "RB",
      buttonOffset: new map.Pixel(10, 20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
      showMarker: true, //定位成功后在定位到的位置显示点标记，默认：true
      showCircle: true, //定位成功后用圆圈表示定位精度范围，默认：true
      panToLocation: true, //定位成功后将定位到的位置作为地图中心点，默认：true
      zoomToAccuracy: true, //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
    });
    mapInstance.addControl(geolocation);
    setMapInfo({ map, mapInstance, geolocation });
    const place = storage.get("lngAndLat-info");
    setPosition(place);
    console.log(place, "place==========storge", place instanceof Array, !place);
    if (!place) {
      // 获取当前位置
      geolocation.getCurrentPosition((status, result) => {
        if (status === "complete") {
          const { position } = result;
          console.log(position, "当前位置============================");
          handleSetCheckInPosition(mapInstance, map, position);
        }
      });
    }
    return { map, mapInstance, geolocation };
  };
  useEffect(() => {
    initMap();
    // 组件卸载时清除监听
    return () => {
      if (myWatchId) {
        mapInfo?.geolocation.clearWatch(myWatchId);
        myWatchId = null;
      }
    };
  }, []);

  // 设置签到点
  const handleSetCheckInPosition = (mapInstance, AMap, place) => {
    //要转换的地理经纬度坐标
    var longitude = 116.4;
    var latitude = 39.9;

    //构造成 AMap.LngLat 对象后传入
    const lnglat = new AMap.LngLat(place?.lng, place?.lat);

    // 获得 AMap.Pixel 对象
    const pixel = mapInstance.lngLatToContainer(lnglat);
    console.log(pixel.x, pixel.y, "经纬度换px======"); //即为经纬度在 #container 上对应的像素坐标

    // 设置中心点
    mapInstance.setCenter(place);
    // 添加当前位置标记

    AMap.convertFrom(
      `${place?.lng},${place?.lat}`,
      "gps",
      function (status, result) {
        if (result.info === "ok") {
          var resLnglat = result.locations[0];
          const marker = new AMap.Marker({
            position: resLnglat,
            map: mapInstance,
            title: "设定的签到地点",
          });

          mapInstance.add(marker);
          marker.setLabel({
            offset: new AMap.Pixel(pixel.x, pixel.y),
            content: "高德坐标系中首开广场（正确）",
          });
        }
        console.log("result=转换坐标系" + result.locations);
      }
    );
    storage.set("lngAndLat-info", place);
    setPosition(place);
    // 获取签到地址信息
    runGetLocationRegeoAPI({
      key: process.env.GD_KEY,
      location: `${place?.lng},${place?.lat}`,
      output: "JSON",
      extensions: "base", // 必需参数：base（精简）或 all（详细）
    });
  };
  useEffect(() => {
    const AMap = mapInfo?.map;
    const mapInstance = mapInfo?.mapInstance;
    const geolocation = mapInfo?.geolocation;
    if (AMap) {
      if (position) {
        console.log("进来了多少次===============-----------------------");
        // 设置中心点坐标
        mapInstance.setCenter(position);
        // 添加当前位置标记
        const marker = new AMap.Marker({
          position,
          map: mapInstance,
          title: "设定的签到地点",
        });
        mapInstance.add(marker);
        console.log(
          position,
          "666------------position",
          position instanceof Array
        );
        // 获取签到地址信息
        runGetLocationRegeoAPI({
          key: process.env.GD_KEY,
          location: `${position[0]},${position[1]}`,
          output: "JSON",
          extensions: "base", // 必需参数：base（精简）或 all（详细）
        });
        // 测算两点间距离信息
        function checkDistance(userLocation, radius = 10) {
          console.log(
            userLocation,
            "尽力啊比较--------------目标位置",
            position
          );
          const distance = AMap.GeometryUtil.distance(
            new AMap.LngLat(userLocation[0], userLocation[1]),
            new AMap.LngLat(position[0], position[1])
          );
          console.log(distance, "接近距离");
          return distance <= radius; // 返回是否在范围内
        }

        // 监听是否接近目标地点
        monitorApproachedTarget(geolocation, checkDistance);
      }
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
    const distance = AMap.GeometryUtil.distance(position, lastCheckInPosition);
    console.log(distance, "距离-----------");
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
        <h2>当前位置信息</h2>
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
        <h2 style={{ margin: "5px 0" }}>获取某地坐标</h2>
        <p>
          经度：{position?.lng}纬度：{position?.lat}
        </p>
      </div>
    </div>
  );
};

export default LocationCheckIn;
