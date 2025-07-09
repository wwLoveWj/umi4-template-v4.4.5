import React, { useState, useEffect } from "react";
import { ImageViewer, ImageUploader, Toast } from "antd-mobile";
import { imgInfoUploadAPI, imgInfoListAPI } from "@/service/api/album";

type Photo = {
  thumbUrl: string;
  url: string;
};

const BabyAlbum: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // 获取图片列表
  const fetchPhotos = async () => {
    const list = await imgInfoListAPI({});
    setPhotos(list);
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // 上传图片
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    await imgInfoUploadAPI(formData);
    Toast.show("上传成功");
    fetchPhotos(); // 上传后刷新图片列表
  };

  return (
    <div style={{ padding: 12 }}>
      <ImageUploader
        upload={async (file: File) => {
          await handleUpload(file);
          return { url: "" };
        }}
        preview={false}
      >
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
      </ImageUploader>
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
