import React from "react";
import { Tabs } from "antd-mobile";
import ArticleCollections from "./components/collections";
import LinkCollections from "./components/linkCollections";

/**
 * 我的收藏主页面，支持分类（文章收藏、网址收藏等）
 */
const MyCollections: React.FC = () => {
  return (
    <div className="my-collections-page">
      <Tabs>
        <Tabs.Tab title="文章收藏" key="article">
          <ArticleCollections />
        </Tabs.Tab>
        <Tabs.Tab title="网址收藏" key="link">
          <LinkCollections />
        </Tabs.Tab>
      </Tabs>
    </div>
  );
};

export default MyCollections;
