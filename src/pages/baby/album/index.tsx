import React, { useRef, useState, useEffect } from "react";
import { ImageViewer, Toast, PullToRefresh } from "antd-mobile";
import { imgInfoUploadAPI, imgInfoListAPI } from "@/service/api/album";
import { AddCircleOutline, PicturesOutline } from "antd-mobile-icons";
import AddFloatingBubble from "@/components/floatingBubble";

type Photo = {
  thumbUrl: string;
  url: string;
};

const BabyAlbum: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 获取图片列表
  const fetchPhotos = async () => {
    const list = await imgInfoListAPI({});
    setPhotos(list);
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // 上传多张图片
  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      await imgInfoUploadAPI(formData);
    }
    Toast.show("上传成功");
    fetchPhotos();
    // 清空input值，避免同一文件无法重复上传
    if (inputRef.current) inputRef.current.value = "";
  };

  // 触发input点击
  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  return (
    <div style={{ padding: 12 }}>
      {/* 隐藏的文件选择框 */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFilesChange}
      />
      {/* 瀑布流布局 */}
      <PullToRefresh
        onRefresh={async () => {
          await fetchPhotos();
        }}
      >
        <div
          style={{
            columnCount: 2,
            columnGap: 8,
          }}
        >
          {photos?.map((photo, idx) => (
            <div
              key={photo.url}
              style={{
                breakInside: "avoid",
                marginBottom: 8,
                borderRadius: 8,
                overflow: "hidden",
                cursor: "pointer",
                background: "#f6f6f6",
              }}
              onClick={() => setPreviewIndex(idx)}
            >
              <img
                src={photo.thumbUrl}
                alt="宝宝照片"
                style={{ width: "100%", display: "block" }}
                loading={idx < 4 ? undefined : "lazy"}
              />
            </div>
          ))}
        </div>
      </PullToRefresh>
      {previewIndex !== null && (
        <ImageViewer.Multi
          images={photos.map((p) => p.url)}
          defaultIndex={previewIndex}
          visible={true}
          onClose={() => setPreviewIndex(null)}
        />
      )}
      {/* 悬浮上传按钮 */}
      {/* <div
        onClick={handleUploadClick}
        style={{
          position: "fixed",
          right: 20,
          bottom: 32,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#1677ff",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          fontSize: 32,
          zIndex: 100,
          cursor: "pointer",
        }}
      >
        <AddCircleOutline />
      </div> */}
      <AddFloatingBubble
        iconRender={
          <PicturesOutline fontSize={26} onClick={handleUploadClick} />
        }
        isShowIcon={false}
      />
    </div>
  );
};

export default BabyAlbum;
