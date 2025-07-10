import React, { useState } from "react";
import { useLocation, useNavigate } from "umi";
import {
  Button,
  ImageUploader,
  Toast,
  Popup,
  List,
  Radio,
  DotLoading,
} from "antd-mobile";
import { RightOutline, AddOutline } from "antd-mobile-icons";
import "./add.less";
import { articleApi } from "@/service/api/article";
import { guid } from "@/utils";
import { storage } from "@/utils/storage";

const TAGS = ["前端", "后端", "React", "Vue", "算法", "面试", "随笔"];
const COLUMNS = ["技术专栏", "生活随笔", "学习笔记"];
const TYPES = ["原创", "转载", "翻译"];
const VISIBLES = ["全部可见", "仅我可见", "粉丝可见", "VIP可见"];

/**
 * 文章设置页面
 * @returns {JSX.Element}
 */
const ArticleAddSetting: React.FC = () => {
  const loginInfo = storage.get("login-info");
  const navigate = useNavigate();
  const location = useLocation();
  const { title, content } = (location.state as any) || {};

  const [cover, setCover] = useState<any[]>([]);
  const [coverType, setCoverType] = useState<"none" | "single">("none");
  const [type, setType] = useState<string>("");
  const [visible, setVisible] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [column, setColumn] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const [visiblePickerVisible, setVisiblePickerVisible] = useState(false);
  const [tagPickerVisible, setTagPickerVisible] = useState(false);
  const [columnPickerVisible, setColumnPickerVisible] = useState(false);

  // 图片上传模拟
  const mockUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await articleApi.imgUploadAPI(formData);
    return { url: res?.url };
  };

  // 校验必填项
  const isValid = !!(title && content && type && visible && tag && column);

  // 发布
  const handlePublish = async () => {
    if (!isValid) {
      Toast.show({ icon: "fail", content: "请填写所有必填项" });
      return;
    }
    setSaving(true);
    try {
      await articleApi.addArticle({
        title,
        summary: content.slice(0, 100),
        content,
        category: column || "",
        author: loginInfo?.loginName, // TODO: 替换为真实登录用户
        authorAvatar: loginInfo?.avatar || "", // TODO: 替换为真实头像
        coverImage: cover[0]?.url || "",
        tags: [tag],
        articleId: guid(),
      });
      Toast.show({ icon: "success", content: "发布成功" });
      localStorage.removeItem("article-draft");
      setSaving(false);
      navigate("/article");
    } catch (e) {
      Toast.show({ icon: "fail", content: "网络异常" });
      // 错误提示已由request拦截器处理
      setSaving(false);
    }
  };

  // 保存草稿
  const handleSaveDraft = () => {
    Toast.show({ icon: "success", content: "草稿已保存" });
    // 可扩展为后端保存
  };

  return (
    <div className="article-add-setting-page">
      <div className="add-setting-form">
        {/* 标题和上传图片 */}
        <div className="setting-title-cover-row">
          <div className="setting-title-preview">{title}</div>
          {coverType === "single" && (
            <div className="cover-uploader">
              <ImageUploader
                value={cover}
                onChange={setCover}
                upload={mockUpload}
                maxCount={1}
              >
                <div className="cover-upload-btn">
                  <AddOutline style={{ fontSize: 32 }} />
                  <div>上传图片</div>
                </div>
              </ImageUploader>
            </div>
          )}
        </div>
        {/* 封面类型切换 */}
        <div className="setting-row cover-type-row">
          <span className="setting-label required">封面设置</span>
          <div className="cover-type-group">
            <div
              className={`cover-type-btn${
                coverType === "none" ? " active" : ""
              }`}
              onClick={() => setCoverType("none")}
            >
              无封面
            </div>
            <div
              className={`cover-type-btn${
                coverType === "single" ? " active" : ""
              }`}
              onClick={() => setCoverType("single")}
            >
              单图
            </div>
          </div>
        </div>
        {/* 文章类型 */}
        <div className="setting-row">
          <span className="setting-label required">文章类型</span>
          <div
            className="setting-selector"
            onClick={() => setTypePickerVisible(true)}
          >
            <span className={type ? "selector-value" : "selector-placeholder"}>
              {type || "请选择"}
            </span>
            <RightOutline />
          </div>
        </div>
        {/* 可见范围 */}
        <div className="setting-row">
          <span className="setting-label required">可见范围</span>
          <div
            className="setting-selector"
            onClick={() => setVisiblePickerVisible(true)}
          >
            <span
              className={visible ? "selector-value" : "selector-placeholder"}
            >
              {visible || "请选择"}
            </span>
            <RightOutline />
          </div>
        </div>
        {/* 标签选择 */}
        <div className="setting-row">
          <span className="setting-label required">标签选择</span>
          <div
            className="setting-selector"
            onClick={() => setTagPickerVisible(true)}
          >
            <span className={tag ? "selector-value" : "selector-placeholder"}>
              {tag || "请选择"}
            </span>
            <RightOutline />
          </div>
        </div>
        {/* 分类专栏 */}
        <div className="setting-row">
          <span className="setting-label">分类专栏</span>
          <div
            className="setting-selector"
            onClick={() => setColumnPickerVisible(true)}
          >
            <span
              className={column ? "selector-value" : "selector-placeholder"}
            >
              {column || "请选择"}
            </span>
            <RightOutline />
          </div>
        </div>
      </div>
      <div className="add-setting-bottom">
        <Button
          block
          size="small"
          onClick={handleSaveDraft}
          className="draft-btn"
        >
          保存草稿
        </Button>
        <Button
          block
          size="small"
          color="primary"
          loading={saving}
          onClick={handlePublish}
          disabled={!isValid}
          className="publish-btn"
        >
          发布内容
        </Button>
      </div>
      {/* 文章类型选择弹窗 */}
      <Popup
        visible={typePickerVisible}
        onMaskClick={() => setTypePickerVisible(false)}
        bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <List header="选择文章类型">
          {TYPES.map((t) => (
            <List.Item
              key={t}
              onClick={() => {
                setType(t);
                setTypePickerVisible(false);
              }}
              extra={type === t ? <DotLoading color="primary" /> : null}
            >
              {t}
            </List.Item>
          ))}
        </List>
      </Popup>
      {/* 可见范围选择弹窗 */}
      <Popup
        visible={visiblePickerVisible}
        onMaskClick={() => setVisiblePickerVisible(false)}
        bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <List header="选择可见范围">
          {VISIBLES.map((v) => (
            <List.Item
              key={v}
              onClick={() => {
                setVisible(v);
                setVisiblePickerVisible(false);
              }}
              extra={visible === v ? <DotLoading color="primary" /> : null}
            >
              {v}
            </List.Item>
          ))}
        </List>
      </Popup>
      {/* 标签选择弹窗 */}
      <Popup
        visible={tagPickerVisible}
        onMaskClick={() => setTagPickerVisible(false)}
        bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <List header="选择标签">
          {TAGS.map((t) => (
            <List.Item
              key={t}
              onClick={() => {
                setTag(t);
                setTagPickerVisible(false);
              }}
              extra={tag === t ? <DotLoading color="primary" /> : null}
            >
              {t}
            </List.Item>
          ))}
        </List>
      </Popup>
      {/* 分类专栏选择弹窗 */}
      <Popup
        visible={columnPickerVisible}
        onMaskClick={() => setColumnPickerVisible(false)}
        bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <List header="选择专栏">
          {COLUMNS.map((c) => (
            <List.Item
              key={c}
              onClick={() => {
                setColumn(c);
                setColumnPickerVisible(false);
              }}
              extra={column === c ? <DotLoading color="primary" /> : null}
            >
              {c}
            </List.Item>
          ))}
        </List>
      </Popup>
    </div>
  );
};

export default ArticleAddSetting;
