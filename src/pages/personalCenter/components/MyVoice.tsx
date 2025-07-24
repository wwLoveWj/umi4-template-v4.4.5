import React, { useRef, useState, useEffect } from "react";
import { Toast, FloatingBubble } from "antd-mobile";
import { PlayOutline, CloseCircleFill, SoundOutline } from "antd-mobile-icons";
import { set, get } from "idb-keyval";
import styles from "./MyVoice.module.css";

/**
 * 音频文件信息类型
 * @typedef {Object} AudioFileInfo
 * @property {string} name 文件名
 * @property {string} url 本地URL
 * @property {Blob} blob 文件二进制
 */

const BG_IMG = require("@/assets/avatar/avatar1.jpg"); // 可替换为任意炫酷图片
const DB_KEY = "my-voice-files";
const PLAYER_STATE_KEY = "my-voice-player-state";

const MyVoice: React.FC = () => {
  /** @type {[AudioFileInfo[], Function]} */
  const [audioFiles, setAudioFiles] = useState<
    { name: string; url: string; blob: Blob }[]
  >([]);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [progress, setProgress] = useState(0); // 0-1
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [, setRerender] = useState(0);
  const forceUpdate = () => setRerender((v) => v + 1);
  const [showVolumeBarIdx, setShowVolumeBarIdx] = useState<number | null>(null);
  const [playerBarPos, setPlayerBarPos] = useState({ left: 0, bottom: 32 });
  const [dragging, setDragging] = useState(false);
  const playerBarRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [showPlayerVolume, setShowPlayerVolume] = useState(false);

  // 页面加载时从 indexedDB 恢复音频文件
  useEffect(() => {
    get(DB_KEY).then((list: any) => {
      if (Array.isArray(list) && list.length > 0) {
        // 重新生成 blob url
        const files = list.map((item: any) => ({
          name: item.name,
          blob: new Blob([item.blob]),
          url: URL.createObjectURL(new Blob([item.blob])),
        }));
        setAudioFiles(files);
      }
    });
  }, []);

  // 恢复播放器状态
  useEffect(() => {
    get(PLAYER_STATE_KEY).then((state: any) => {
      if (state && audioFiles.length > 0) {
        if (
          typeof state.playingIdx === "number" &&
          audioFiles[state.playingIdx]
        ) {
          setPlayingIdx(state.playingIdx);
          setCurrentAudioUrl(audioFiles[state.playingIdx].url);
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.currentTime = state.currentTime || 0;
              audioRef.current.volume = state.volume ?? 1;
              audioRef.current.muted = !!state.muted;
              if (state.isPlaying) {
                setTimeout(() => {
                  audioRef.current?.play().catch(() => {});
                }, 100);
              }
            }
          }, 200);
        }
      }
    });
    // eslint-disable-next-line
  }, [audioFiles.length]);

  // 存储播放器状态
  useEffect(() => {
    if (playingIdx === null) return;
    const saveState = () => {
      set(PLAYER_STATE_KEY, {
        playingIdx,
        currentTime: audioRef.current?.currentTime || 0,
        isPlaying: audioRef.current ? !audioRef.current.paused : false,
        volume: audioRef.current?.volume ?? 1,
        muted: audioRef.current?.muted ?? false,
      });
    };
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("timeupdate", saveState);
      audio.addEventListener("volumechange", saveState);
      audio.addEventListener("pause", saveState);
      audio.addEventListener("play", saveState);
    }
    return () => {
      if (audio) {
        audio.removeEventListener("timeupdate", saveState);
        audio.removeEventListener("volumechange", saveState);
        audio.removeEventListener("pause", saveState);
        audio.removeEventListener("play", saveState);
      }
    };
  }, [playingIdx]);

  // 监听播放进度
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [currentAudioUrl]);

  useEffect(() => {
    if (showVolumeBarIdx === null) return;
    const handleClick = (e: MouseEvent) => {
      // 如果点击的不是音量条或按钮，则关闭
      const volBar = document.getElementById("volume-bar-" + showVolumeBarIdx);
      if (volBar && !volBar.contains(e.target as Node)) {
        setShowVolumeBarIdx(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showVolumeBarIdx]);

  // 监听点击页面其他地方关闭音量弹窗
  useEffect(() => {
    if (!showPlayerVolume) return;
    const handleClick = (e: MouseEvent) => {
      const volBar = document.getElementById("player-volume-bar");
      if (volBar && !volBar.contains(e.target as Node)) {
        setShowPlayerVolume(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPlayerVolume]);

  // 拖动事件
  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      const bar = playerBarRef.current;
      if (!bar) return;
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const barRect = bar.getBoundingClientRect();
      let newLeft = e.clientX - dragOffset.current.x;
      let newBottom =
        winH - e.clientY - (barRect.height - dragOffset.current.y);
      // 限制不超出页面
      newLeft = Math.max(0, Math.min(newLeft, winW - barRect.width));
      newBottom = Math.max(0, Math.min(newBottom, winH - barRect.height));
      setPlayerBarPos({ left: newLeft, bottom: newBottom });
    };
    const handleUp = () => setDragging(false);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
  }, [dragging]);

  /**
   * 处理文件上传
   * @param files 选择的文件列表
   */
  const handleUpload = (files: File[]) => {
    const validFiles = files.filter((file) => /\.(mp3|m4a)$/i.test(file.name));
    if (validFiles.length !== files.length) {
      Toast.show({ content: "仅支持mp3、m4a格式音频文件", position: "bottom" });
    }
    const newAudioFiles = validFiles.map((file) => ({
      name: file.name,
      blob: file,
      url: URL.createObjectURL(file),
    }));
    const allFiles = [...audioFiles, ...newAudioFiles];
    setAudioFiles(allFiles);
    // 存储到 indexedDB
    set(
      DB_KEY,
      allFiles.map((f) => ({ name: f.name, blob: f.blob }))
    );
    setShowUpload(false);
  };

  /**
   * 播放或暂停音频
   * @param file 选中的音频文件
   * @param idx 当前音频索引
   */
  const handlePlay = (
    file: { name: string; url: string; blob: Blob },
    idx: number
  ) => {
    if (playingIdx === idx) {
      // 正在播放，点击暂停
      audioRef.current?.pause();
      setPlayingIdx(null);
      setCurrentAudioUrl(null);
      setProgress(0);
      setCurrentTime(0);
    } else {
      setCurrentAudioUrl(file.url);
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
    setProgress(0);
    setCurrentTime(0);
  };

  /**
   * 拖动进度条
   * @param e React.ChangeEvent<HTMLInputElement>
   */
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current && duration) {
      audioRef.current.currentTime = val * duration;
      setCurrentTime(val * duration);
      setProgress(val);
      // 拖动后始终尝试播放
      setTimeout(() => {
        audioRef.current?.play().catch(() => {});
      }, 0);
    }
  };

  /**
   * 关闭当前播放
   */
  const handleClose = () => {
    audioRef.current?.pause();
    setPlayingIdx(null);
    setCurrentAudioUrl(null);
    setProgress(0);
    setCurrentTime(0);
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
            <div
              key={idx}
              className={
                playingIdx === idx
                  ? `${styles.listItem} ${styles.activeItem}`
                  : styles.listItem
              }
            >
              {/* 歌名始终在最上方 */}
              <div className={styles.fileName}>{file.name}</div>
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
        {/* 全局悬浮播放器控制条 */}
        {playingIdx !== null && (
          <div
            ref={playerBarRef}
            className={styles.floatingPlayerBar}
            style={{
              left: playerBarPos.left,
              bottom: playerBarPos.bottom,
              position: "fixed",
              zIndex: 9999,
            }}
            onMouseDown={(e) => {
              if (
                (e.target as HTMLElement).classList.contains(
                  styles.playerBarDrag
                )
              ) {
                setDragging(true);
                const bar = playerBarRef.current;
                if (bar) {
                  const rect = bar.getBoundingClientRect();
                  dragOffset.current = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  };
                }
              }
            }}
          >
            <div
              className={styles.playerBarDrag}
              style={{
                cursor: "move",
                userSelect: "none",
                fontWeight: 600,
                color: "#fff",
                fontSize: 16,
                marginBottom: 8,
              }}
            >
              {audioFiles[playingIdx]?.name || ""}
            </div>
            <div className={styles.playerBarMain}>
              <audio
                ref={audioRef}
                src={currentAudioUrl || undefined}
                controls={false}
                style={{ display: "none" }}
                onEnded={handleEnded}
              />
              {/* <span
                className={styles.playBtn}
                onClick={() => handlePlay(audioFiles[playingIdx], playingIdx)}
                style={{ marginRight: 8 }}
              >
                {audioRef.current && !audioRef.current.paused ? (
                  <CloseCircleFill fontSize={28} color="#ff9800" />
                ) : (
                  <PlayOutline fontSize={28} color="#fff" />
                )}
              </span> */}
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={progress}
                onChange={handleSeek}
                className={styles.progressBarSmall}
                style={{ flex: 1, marginRight: "8px" }}
              />
              <span className={styles.time}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <button
                className={styles.muteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlayerVolume((v) => !v);
                }}
                style={{ marginLeft: 8 }}
              >
                {audioRef.current?.muted ? "🔇" : "🔊"}
              </button>
              {showPlayerVolume && (
                <div
                  id="player-volume-bar"
                  className={styles.volumePopup}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 10,
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* 一键静音按钮 */}
                  <button
                    className={styles.muteBtn}
                    style={{ fontSize: 20 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (audioRef.current) {
                        audioRef.current.muted = !audioRef.current.muted;
                      }
                      forceUpdate();
                    }}
                  >
                    {audioRef.current?.muted ? "🔇" : "🔈"}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={audioRef.current?.volume ?? 1}
                    onChange={(e) => {
                      if (audioRef.current) {
                        audioRef.current.volume = Number(e.target.value);
                      }
                      forceUpdate();
                    }}
                    className={styles.volumeBarPopup}
                  />
                </div>
              )}
            </div>
          </div>
        )}
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
          <SoundOutline fontSize={36} />
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
      </div>
    </div>
  );
};

/**
 * 格式化秒为 mm:ss
 * @param s 秒数
 * @returns {string}
 */
function formatTime(s: number): string {
  if (!s || isNaN(s)) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export default MyVoice;
