import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "umi";
import { Toast } from "antd-mobile";
import {
  AddOutline,
  PictureOutline,
  FileOutline,
  LinkOutline,
  UndoOutline,
  RedoOutline,
} from "antd-mobile-icons";
import "./add.less";

const DRAFT_KEY = "article-draft";

const ArticleAdd: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 自动保存草稿
  useEffect(() => {
    timerRef.current = setInterval(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content }));
    }, 2000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [title, content]);

  // 恢复草稿
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      const { title, content } = JSON.parse(draft);
      setTitle(title || "");
      setContent(content || "");
    }
  }, []);

  return (
    <div className="article-add-page">
      <div className="add-navbar">
        <span className="add-cancel" onClick={() => navigate(-1)}>
          取消
        </span>
        <div className="add-autosave">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3M19 19H5V5H16.17L19 7.83V19M12 12C10.34 12 9 13.34 9 15S10.34 18 12 18 15 16.66 15 15 13.66 12 12 12M6 6H15V10H6V6Z" />
          </svg>
          <span>草稿将自动保存</span>
        </div>
        <span
          className="add-next"
          onClick={() => {
            if (!title.trim() || !content.trim()) {
              Toast.show({ content: "标题和内容不能为空", position: "top" });
              return;
            }
            navigate("/article/addSetting", { state: { title, content } });
          }}
        >
          下一步
        </span>
      </div>
      <div className="add-form">
        <input
          className="add-title"
          placeholder="请输入标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="add-content"
          placeholder="请输入正文"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div className="add-toolbar">
        <PictureOutline />
        <FileOutline />
        <FileOutline />
        <LinkOutline />
        <UndoOutline />
        <RedoOutline />
      </div>
    </div>
  );
};

export default ArticleAdd;
