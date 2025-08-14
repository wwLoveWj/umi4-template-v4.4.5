import React, { useState, useEffect } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import { GetLocationRegeoAPI } from "@/service/api/checkIn";
import { useRequest } from "ahooks";
import { Input } from "antd-mobile";
import { storage } from "@/utils/storage";

let marker;
const LocationCheckIn = () => {
  const [map, setMap] = useState();
  const [position, setPosition] = useState(
    storage.get("lngAndLat-info") || { lng: 106.49732, lat: 29.619233 }
  );
  const [checkIns, setCheckIns] = useState<
    {
      id: number;
      time: string;
      position: never;
      address: string;
    }[]
  >([]);
  const [lastCheckInPosition, setLastCheckInPosition] = useState(null); //最近一次的打卡信息
  const [photo, setPhoto] = useState<string | ArrayBuffer | null>(null);
  const [lngAndLat, setLngAndLat] = useState(); //获取输入地点的经纬度信息
  const [valueLngLat, setValueLngLat] = useState(""); //输入的想获取的地点名称
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
  // 设置签到点
  const handleSetCheckInPosition = (mapInstance, AMap, place) => {
    setPosition(place);
    // 设置中心点
    mapInstance.setCenter(place);
    // 添加当前位置标记
    marker = new AMap.Marker({
      position: place,
      map: mapInstance,
      title: "设定的签到地点",
    });
    // 获取签到地址信息
    runGetLocationRegeoAPI({
      key: process.env.GD_KEY,
      location: `${place?.lng},${place?.lat}`,
      output: "JSON",
      extensions: "base", // 必需参数：base（精简）或 all（详细）
    });
  };
  // 监听是否接近目标地点
  const monitorApproachedTarget = (
    geolocation,
    checkDistance,
    targetAddress
  ) => {
    // geolocation.clearWatch();
    console.log("666监听", geolocation);
    return geolocation.watchPosition((status, result) => {
      console.log("首次实时监听了吗", status, result, targetAddress);
      if (status === "complete") {
        // 实时移动位置
        const userLocation = [result.position.lng, result.position.lat];
        const isInRange = checkDistance(userLocation, targetAddress, 200);
        console.log(
          "监听目标,第一个实时位置，第二个是目标位置",
          userLocation,
          targetAddress,
          isInRange
        );
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
  };
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
        "AMap.AdvancedInfoWindow",
      ],
    })
      .then((AMap) => {
        //存储实例地图
        const mapInstance = new AMap.Map("map-container", {
          zoom: 15, //设置地图显示的缩放级别
          viewMode: "3D", //使用3D视图
        });
        setMap(AMap);
        // 添加定位控件
        const geolocation = new AMap.Geolocation({
          enableHighAccuracy: true, //是否使用高精度定位，默认:true
          timeout: 10000,
          buttonPosition: "RB",
          zoomToAccuracy: true, //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        });
        mapInstance.addControl(geolocation);

        // 测算两点间距离信息
        function checkDistance(userLocation, targetLocation, radius = 10) {
          console.log("尽力啊比较-", targetLocation);
          const distance = AMap.GeometryUtil.distance(
            new AMap.LngLat(userLocation[0], userLocation[1]),
            new AMap.LngLat(targetLocation[0], targetLocation[1])
          );
          console.log(distance, "接近距离");
          return distance <= radius; // 返回是否在范围内
        }
        //点击地图获取位置,设置打卡点
        mapInstance.on("click", function (e) {
          console.log(e, "点击地图获取位置");
          let lng = e?.lnglat.getLng(); //获取经度
          let lat = e?.lnglat.getLat(); //获取纬度
          marker?.remove();
          // 添加当前位置标记
          marker = new AMap.Marker({
            position: e.lnglat,
            map: mapInstance,
            title: "设定的签到地点",
          });
          setLngAndLat({ lng, lat });
          monitorApproachedTarget(geolocation, checkDistance, [lng, lat]);
          setPosition(e?.lnglat);
          storage.set("lngAndLat-info", e?.lnglat);
        });

        // 监听是否接近目标地点
        monitorApproachedTarget(geolocation, checkDistance, [
          position?.lng,
          position?.lat,
        ]);
        // 获取当前位置
        geolocation.getCurrentPosition((status, result) => {
          if (status === "complete") {
            const { position } = result;
            console.log(position, "当前位置");
            setPosition(position);
            storage.set("lngAndLat-info", position);
            mapInstance.setCenter(position);

            // 添加当前位置标记
            marker = new AMap.Marker({
              position: position,
              map: mapInstance,
              title: "设定的签到地点",
            });
            // 获取签到地址信息
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
    const geocoder = new AMap.Geocoder({
      city: "重庆", // 限定在北京市搜索
      radius: 1000, // 搜索半径（单位：米）
    });
    geocoder.getAddress(lnglat, (status, result) => {
      console.log(result, "地址=================", status);
      if (status === "complete" && result.regeocode) {
        // setAddress(result.regeocode.formattedAddress);
      } else {
        // Toast.show("根据经纬度查询地址失败！");
      }
    });
  };

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
    const distance = map.GeometryUtil.distance(position, lastCheckInPosition);
    console.log(distance, "距离-----------");
    const allowedDistance = 500; // 允许500米内签到

    if (distance < allowedDistance) {
      alert(`距离上次签到点太近，请移动至少${allowedDistance}米后再签到`);
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
        <Input
          placeholder="请输入想获取坐标的地点名称"
          clearable
          onChange={(e) => {
            setValueLngLat(e);
          }}
        />
        <button
          style={{
            padding: "10px 20px",
            background: "#1890ff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            margin: "5px 0",
          }}
          onClick={() => {
            // 使用官方推荐的异步加载方式

            // 初始化地理编码器
            const geocoder = new map.Geocoder();
            // {
            // city: "全国", // 优先搜索城市
            // radius: 1000, // 搜索范围（米）
            // extensions: "base", // 返回基础地址信息（可选'all'返回详细信息）
            // }
            console.log(
              "进来了吗？西湖自定义",
              valueLngLat,
              geocoder.getLocation
            );
            // 搜索杭州市的"西湖"
            geocoder.getLocation(valueLngLat, (status, result) => {
              console.log(status, "进来了西湖");
              console.log(
                valueLngLat,
                result,
                "西湖地址的结果----------------------"
              );
              if (status === "complete") {
                console.log("西湖坐标:", result.geocodes[0].location);
                setLngAndLat(result.geocodes[0].location);
              } else {
                console.error("地理编码失败:", result?.info || status);
              }
            });
            // 示例：逆地理编码
            // geocoder.getAddress(
            //   [116.397428, 39.90923],
            //   (status, result) => {
            //     if (status === "complete" && result.regeocode) {
            //       console.log(
            //         "完整地址:",
            //         result.regeocode.formattedAddress
            //       );
            //     } else {
            //       console.error("逆地理编码失败:", result?.info || status);
            //     }
            //   }
            // );
          }}
        >
          获取某地坐标
        </button>
        <p>
          经度：{lngAndLat?.lng}纬度：{lngAndLat?.lat}
        </p>
      </div>
    </div>
  );
};

export default LocationCheckIn;
