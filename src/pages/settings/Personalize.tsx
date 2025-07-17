import React, { useState } from "react";
import { NavBar, ImageUploader, Toast } from "antd-mobile";
import { history } from "umi";

export default function Personalize() {
  // 读取本地已设置的图片
  const [carouselImages, setCarouselImages] = useState<string[]>(
    JSON.parse(localStorage.getItem("carouselImages") || "[]")
  );
  const [bgImage, setBgImage] = useState<string>(
    localStorage.getItem("personalBg") || ""
  );

  // 轮播图上传
  const handleCarouselChange = (files: any[]) => {
    const urls = files.map((f) => f.url || f);
    setCarouselImages(urls);
    localStorage.setItem("carouselImages", JSON.stringify(urls));
    Toast.show("首页轮播图已保存");
  };

  // 背景图上传
  const handleBgChange = (files: any[]) => {
    const url = files[0]?.url || files[0];
    setBgImage(url);
    localStorage.setItem("personalBg", url);
    Toast.show("个人中心背景已保存");
  };

  return (
    <div>
      <NavBar onBack={() => history.back()}>个性化设置</NavBar>
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>首页轮播图</div>
          <ImageUploader
            value={carouselImages.map((url) => ({ url }))}
            onChange={handleCarouselChange}
            multiple
            maxCount={5}
            upload={async (file) => {
              return { url: URL.createObjectURL(file) };
            }}
          />
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>个人中心背景图</div>
          <ImageUploader
            value={bgImage ? [{ url: bgImage }] : []}
            onChange={handleBgChange}
            maxCount={1}
            upload={async (file) => {
              return { url: URL.createObjectURL(file) };
            }}
          />
        </div>
      </div>
    </div>
  );
}
