import React, { useRef, useState } from "react";
import { Toast, FloatingBubble } from "antd-mobile";
import {
  PlayOutline,
  CloseCircleFill,
  AddCircleOutline,
} from "antd-mobile-icons";
import styles from "./MyVoice.module.css";

/**
 * 我的声音模块组件，支持本地音频文件（mp3、m4a等）上传和播放，带炫酷播放列表和背景
 * @component
 */
const BG_IMG = require("@/assets/avatar/avatar1.jpg"); // 可替换为任意炫酷图片

const MyVoice: React.FC = () => {
  /** 已上传的音频文件列表 */
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  /** 当前播放的音频URL */
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  /** 当前播放的音频索引 */
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  /** 上传弹窗显示状态 */
  const [showUpload, setShowUpload] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  /**
   * 处理文件上传
   * @param files 选择的文件列表
   */
  const handleUpload = (files: File[]) => {
    const validFiles = files.filter((file) => /\.(mp3|m4a)$/i.test(file.name));
    if (validFiles.length !== files.length) {
      Toast.show({ content: "仅支持mp3、m4a格式音频文件", position: "bottom" });
    }
    setAudioFiles((prev) => [...prev, ...validFiles]);
    setShowUpload(false);
  };

  /**
   * 播放或暂停音频
   * @param file 选中的音频文件
   * @param idx 当前音频索引
   */
  const handlePlay = (file: File, idx: number) => {
    const url = URL.createObjectURL(file);
    if (playingIdx === idx) {
      // 正在播放，点击暂停
      audioRef.current?.pause();
      setPlayingIdx(null);
      setCurrentAudioUrl(null);
    } else {
      setCurrentAudioUrl(url);
      setPlayingIdx(idx);
      setTimeout(() => {
        audioRef.current?.play();
      }, 100);
    }
  };

  /**
   * 音频播放结束时重置播放状态
   */
  const handleEnded = () => {
    setPlayingIdx(null);
    setCurrentAudioUrl(null);
  };

  return (
    <div
      className={styles.bg}
      style={{
        minHeight: 400,
        backgroundImage: `url(${BG_IMG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        padding: 0,
      }}
    >
      <div className={styles.overlay}>
        <h3 className={styles.title}>我的声音</h3>
        <div className={styles.listWrap}>
          {audioFiles.length === 0 && (
            <div className={styles.empty}>暂无已上传音频</div>
          )}
          {audioFiles.map((file, idx) => (
            <div key={idx} className={styles.listItem}>
              <span className={styles.fileName}>{file.name}</span>
              <span
                className={styles.playBtn}
                onClick={() => handlePlay(file, idx)}
              >
                {playingIdx === idx ? (
                  <CloseCircleFill fontSize={28} color="#ff9800" />
                ) : (
                  <PlayOutline fontSize={28} color="#fff" />
                )}
              </span>
            </div>
          ))}
        </div>
        {/* 悬浮上传按钮 */}
        <FloatingBubble
          axis="xy"
          style={{
            right: "32px",
            bottom: "32px",
            zIndex: 10,
          }}
          onClick={() => setShowUpload(true)}
        >
          <AddCircleOutline fontSize={36} color="#1677ff" />
        </FloatingBubble>
        {/* 上传弹窗 */}
        {showUpload && (
          <div className={styles.uploadModal}>
            <div className={styles.uploadBox}>
              <input
                type="file"
                accept=".mp3,.m4a"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    handleUpload(Array.from(e.target.files));
                  }
                }}
                className={styles.uploadInput}
              />
              <button
                className={styles.closeBtn}
                onClick={() => setShowUpload(false)}
              >
                取消
              </button>
            </div>
          </div>
        )}
        {/* 隐藏的audio标签 */}
        <audio
          ref={audioRef}
          src={currentAudioUrl || undefined}
          controls={false}
          style={{ display: "none" }}
          onEnded={handleEnded}
        />
      </div>
    </div>
  );
};

export default MyVoice;
