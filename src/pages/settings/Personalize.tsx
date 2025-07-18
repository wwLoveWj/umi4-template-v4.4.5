import React, { useState } from "react";
import { NavBar, ImageUploader, Toast } from "antd-mobile";
import { history } from "umi";
import imageCompression from "browser-image-compression";

// 工具函数：文件转base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 校验和压缩
async function compressAndCheck(file: File, maxSizeKB = 300) {
  if (file.size > maxSizeKB * 1024) {
    // 压缩
    const compressed = await imageCompression(file, {
      maxSizeMB: maxSizeKB / 1024,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    });
    if (compressed.size > maxSizeKB * 1024) {
      throw new Error(`图片过大，压缩后仍超过${maxSizeKB}KB`);
    }
    return compressed;
  }
  return file;
}

export default function Personalize() {
  // 读取本地已设置的图片
  const [carouselImages, setCarouselImages] = useState<string[]>(
    JSON.parse(localStorage.getItem("carouselImages") || "[]")
  );
  const [bgImage, setBgImage] = useState<string>(
    localStorage.getItem("personalBg") || ""
  );

  // 轮播图上传
  const handleCarouselChange = async (files: any[]) => {
    try {
      if (files.length > 4) {
        Toast.show("最多只能上传4张轮播图");
        return;
      }
      const base64Arr: string[] = [];
      for (const f of files) {
        if (f.url && f.url.startsWith("data:")) {
          base64Arr.push(f.url);
        }
      }
      setCarouselImages(base64Arr);
      localStorage.setItem("carouselImages", JSON.stringify(base64Arr));
      Toast.show("首页轮播图已保存");
    } catch (e: any) {
      Toast.show(e.message || "图片处理失败");
    }
  };

  // 背景图上传
  const handleBgChange = async (files: any[]) => {
    try {
      const f = files[0];
      if (f?.url && f.url.startsWith("data:")) {
        setBgImage(f.url);
        localStorage.setItem("personalBg", f.url);
        Toast.show("个人中心背景已保存");
      }
      if (!f) {
        setBgImage("");
        localStorage.setItem("personalBg", "");
      }
    } catch (e: any) {
      Toast.show(e.message || "图片处理失败");
    }
  };

  return (
    <div>
      <NavBar onBack={() => history.back()}>个性化设置</NavBar>
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            首页轮播图（最多4张，单张≤300KB）
          </div>
          <ImageUploader
            value={carouselImages.map((url) => ({ url }))}
            onChange={handleCarouselChange}
            maxCount={4}
            upload={async (file) => {
              const compressed = await compressAndCheck(file, 300);
              return { url: await fileToBase64(compressed) };
            }}
            showUpload={carouselImages.length < 4}
            preview
            multiple
          />
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            个人中心背景图（单张≤300KB）
          </div>
          <ImageUploader
            value={bgImage ? [{ url: bgImage }] : []}
            onChange={handleBgChange}
            maxCount={1}
            upload={async (file) => {
              const compressed = await compressAndCheck(file, 300);
              return { url: await fileToBase64(compressed) };
            }}
            showUpload={!bgImage}
            preview
          />
        </div>
      </div>
    </div>
  );
}
