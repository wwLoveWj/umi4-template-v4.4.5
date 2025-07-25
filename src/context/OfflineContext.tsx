import React, { createContext, useContext, useState } from "react";

/**
 * 离线状态上下文
 */
export const OfflineContext = createContext<{
  offline: boolean;
  setOffline: (v: boolean) => void;
}>({
  offline: false,
  setOffline: () => {},
});

export const useOffline = () => useContext(OfflineContext);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [offline, setOffline] = useState<boolean>(
    localStorage.getItem("offline") === "1"
  );
  // 同步到 window/global，便于非 React 代码访问
  window.__OFFLINE__ = offline;
  return (
    <OfflineContext.Provider value={{ offline, setOffline }}>
      {children}
    </OfflineContext.Provider>
  );
};

declare global {
  interface Window {
    __OFFLINE__?: boolean;
  }
}
