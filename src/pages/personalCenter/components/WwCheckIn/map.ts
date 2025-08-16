import AMapLoader from "@amap/amap-jsapi-loader";
// 初始化地图配置
export const getGeolocation = (map, mapInstance) => {
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
  return geolocation;
};
export const initMapConfig = async () => {
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

  return { map, mapInstance };
};
// 获取经纬度
export const getLngAndLat = (place) => {
  if (!place && typeof place !== "object") {
    return [0, 0];
  }
  if (place instanceof Array) {
    return place;
  } else {
    return [place?.lng, place?.lat];
  }
};
// 给当前经纬度位置打标记录
export const commonSetCheckInPosition = (mapInstance, AMap, place) => {
  //构造成 AMap.LngLat 对象后传入
  const lnglat = new AMap.LngLat(
    getLngAndLat(place)[0],
    getLngAndLat(place)[1]
  );
  // 获得 AMap.Pixel 对象
  const pixel = mapInstance.lngLatToContainer(lnglat);
  console.log(pixel.x, pixel.y, "经纬度换px======"); //即为经纬度在 #container 上对应的像素坐标
  // 设置中心点
  mapInstance.setCenter(place);
  const marker = new AMap.Marker({
    position: place,
    map: mapInstance,
    title: "当前用户实时位置",
  });
  // 添加当前位置标记
  mapInstance.add(marker);
  marker.setLabel({
    offset: new AMap.Pixel(pixel?.x, pixel?.y),
    content: "高德坐标系中首开广场（正确）",
  });
};

// 测算两点间距离信息
function checkDistance(AMap, position, userLocation, radius = 10) {
  console.log(`%c目标位置${position}`, "background:green;");
  const distance = AMap.GeometryUtil.distance(
    new AMap.LngLat(userLocation[0], userLocation[1]),
    new AMap.LngLat(getLngAndLat(position)[0], getLngAndLat(position)[1])
  );
  console.log(`%c目标位置与当前用户位置之间距离${distance}米`, "color:red;");
  return distance <= radius; // 返回是否在范围内
}
// 监听是否接近设定的签到目标地点
export const monitorApproachedTarget = async (geolocation, map, position) => {
  return new Promise((resolve, reject) => {
    geolocation?.watchPosition((status, result) => {
      if (status === "complete") {
        const userLocation = [result.position.lng, result.position.lat];
        const isInRange = checkDistance(map, position, userLocation, 200);
        console.log(
          `%c监听用户实时位置${userLocation}, 是否在范围内：${isInRange}`,
          "background:green;"
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
          geolocation.clearWatch();
        }
        resolve(userLocation); // 返回用户位置
      } else {
        console.error("定位失败:", result.message);
        reject(new Error("定位失败"));
      }
    });
  });
};
