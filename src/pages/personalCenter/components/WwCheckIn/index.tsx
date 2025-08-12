import React, { useState, useEffect } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import { GetLocationRegeoAPI } from "@/service/api/checkIn";
import { useRequest } from "ahooks";
import { Input } from "antd-mobile";

const LocationCheckIn = () => {
  const [map, setMap] = useState();
  const [position, setPosition] = useState(null);
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
  const [lngAndLat, setLngAndLat] = useState(null); //获取输入地点的经纬度信息
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
          zoom: 15, //级别
          viewMode: "3D", //使用3D视图
        });
        setMap(AMap);
        // 添加定位控件
        const geolocation = new AMap.Geolocation({
          enableHighAccuracy: true, //是否使用高精度定位，默认:true
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

      <div>
        <h2>获取某地坐标</h2>
        <Input
          placeholder="请输入想获取坐标的地点名称"
          clearable
          onChange={(e) => {
            setValueLngLat(e);
          }}
        />
        <button
          onClick={() => {
            // 使用官方推荐的异步加载方式
            AMapLoader.load({
              key: process.env.GD_KEY, // 必须是「Web端(JS API)」类型的Key
              version: "2.0",
              plugins: ["AMap.Geocoder"], // 明确加载Geocoder插件
            })
              .then((AMap) => {
                // 初始化地理编码器
                const geocoder = new AMap.Geocoder({
                  city: "全国", // 优先搜索城市
                  radius: 1000, // 搜索范围（米）
                  extensions: "base", // 返回基础地址信息（可选'all'返回详细信息）
                });
                console.log("进来了吗？", valueLngLat, geocoder.getLocation);
                // 搜索杭州市的"西湖"
                geocoder.getLocation(valueLngLat, (status, result) => {
                  console.log(status, "进来了");
                  console.log(
                    valueLngLat,
                    result,
                    "990-------------------------"
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
              })
              .catch((error) => {
                console.error("高德地图加载失败:", error);
              });
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
