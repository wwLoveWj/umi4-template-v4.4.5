import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "umi";
import { Toast, Dialog, Input } from "antd-mobile";
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
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDesc, setLinkDesc] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  // 撤销/恢复栈
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);

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

  /**
   * 在光标处插入内容
   * @param insertText 要插入的内容
   */
  const insertAtCursor = (insertText: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue =
      content.substring(0, start) + insertText + content.substring(end);
    setContent(newValue);
    // 设置光标到插入内容后
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd =
        start + insertText.length;
    }, 0);
  };

  /**
   * 处理图片插入
   */
  const handleInsertImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    insertAtCursor(
      `<img src=\"${url}\" alt=\"图片\" style=\"max-width:100%\" />`
    );
    e.target.value = ""; // 重置input
  };

  /**
   * 处理插入链接
   */
  const handleInsertLink = () => {
    if (!linkUrl.trim()) {
      Toast.show({ content: "请输入链接地址" });
      return;
    }
    insertAtCursor(
      `<a href=\"${linkUrl}\" target=\"_blank\">${linkDesc || linkUrl}</a>`
    );
    setShowLinkDialog(false);
    setLinkUrl("");
    setLinkDesc("");
  };

  /**
   * 撤销
   */
  const handleUndo = () => {
    if (undoStack.current.length === 0) return;
    redoStack.current.push(content);
    const prev = undoStack.current.pop()!;
    setContent(prev);
  };

  /**
   * 恢复
   */
  const handleRedo = () => {
    if (redoStack.current.length === 0) return;
    undoStack.current.push(content);
    const next = redoStack.current.pop()!;
    setContent(next);
  };

  // 内容变化时，入栈撤销栈
  useEffect(() => {
    if (
      undoStack.current.length === 0 ||
      undoStack.current[undoStack.current.length - 1] !== content
    ) {
      undoStack.current.push(content);
      if (undoStack.current.length > 100) undoStack.current.shift();
    }
  }, [content]);

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
          placeholder="请输入标题（最多20个字）"
          value={title}
          maxLength={20}
          onChange={(e) => {
            if (e.target.value.length > 20) {
              Toast.show({ content: "标题最多20个字" });
              return;
            }
            setTitle(e.target.value);
          }}
        />
        <textarea
          className="add-content"
          placeholder="请输入正文"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          ref={contentRef}
        />
        {/* 富文本预览区 */}
        <div
          className="add-content-preview"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
      <div className="add-toolbar">
        {/* 隐藏的图片上传input */}
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          id="add-img-input"
          onChange={handleInsertImage}
        />
        <span
          className="toolbar-btn"
          onClick={() => document.getElementById("add-img-input")?.click()}
        >
          <PictureOutline />
        </span>
        <span className="toolbar-btn">
          <FileOutline />
        </span>
        <span className="toolbar-btn">
          <FileOutline />
        </span>
        <span className="toolbar-btn" onClick={() => setShowLinkDialog(true)}>
          <LinkOutline />
        </span>
        <span className="toolbar-btn" onClick={handleUndo}>
          <UndoOutline />
        </span>
        <span className="toolbar-btn" onClick={handleRedo}>
          <RedoOutline />
        </span>
      </div>
      {/* 插入链接弹窗 */}
      <Dialog
        visible={showLinkDialog}
        title="插入链接"
        content={
          <div>
            <Input
              placeholder="请输入链接地址"
              value={linkUrl}
              onChange={(val) => setLinkUrl(val)}
              style={{ marginBottom: 8 }}
            />
            <Input
              placeholder="链接描述（可选）"
              value={linkDesc}
              onChange={(val) => setLinkDesc(val)}
            />
          </div>
        }
        onClose={() => setShowLinkDialog(false)}
        closeOnAction
        actions={[{ key: "ok", text: "插入", onClick: handleInsertLink }]}
      />
    </div>
  );
};

export default ArticleAdd;
