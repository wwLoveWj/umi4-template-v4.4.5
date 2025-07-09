import React, { useState } from "react";
import { ImageViewer, ImageUploader, Toast } from "antd-mobile";
import { imgInfoUploadAPI } from "@/service/api/album";
/**
 * 宝宝相册页面，瀑布流布局，支持全屏预览和上传
 */
type Photo = {
  thumbUrl: string;
  url: string;
};

const BabyAlbum: React.FC = () => {
  // 假设图片数据结构
  const [photos, setPhotos] = useState<Photo[]>([
    {
      thumbUrl:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    },
    {
      thumbUrl:
        "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=200",
      url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
    },
    {
      thumbUrl:
        "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=200",
      url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
    },
    {
      thumbUrl:
        "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200",
      url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9",
    },
  ]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // 上传图片
  const handleUpload = async (file: File) => {
    // 实际应上传到后端，返回 { url, thumbUrl }
    // 示例：
    const formData = new FormData();
    formData.append("file", file);
    const res = await imgInfoUploadAPI(formData);
    setPhotos((prev) => [{ url: res.url, thumbUrl: res.thumbUrl }, ...prev]);
    Toast.show("上传成功");
    return;

    // 本地预览模拟
    // const url = URL.createObjectURL(file);
    // setPhotos((prev) => [{ url, thumbUrl: url }, ...prev]);
    // Toast.show("上传成功");
  };

  return (
    <div style={{ padding: 12 }}>
      {/* 上传按钮 */}
      <ImageUploader
        upload={async (file: File) => {
          await handleUpload(file);
          return { url: "" };
        }}
        showUpload={false}
        renderUpload={() => (
          <div
            style={{
              width: 80,
              height: 80,
              border: "1px dashed #ccc",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              color: "#999",
            }}
          >
            上传照片
          </div>
        )}
      />
      {/* 瀑布流布局 */}
      <div
        style={{
          columnCount: 2,
          columnGap: 8,
        }}
      >
        {photos.map((photo, idx) => (
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
      {/* 全屏预览 */}
      {previewIndex !== null && (
        <ImageViewer.Multi
          images={photos.map((p) => p.url)}
          defaultIndex={previewIndex}
          visible={true}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </div>
  );
};

export default BabyAlbum;
