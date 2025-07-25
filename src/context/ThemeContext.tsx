import React, { createContext, useContext, useState, useEffect } from "react";

const PRESET_COLORS = [
  { name: "科技蓝", color: "#1677ff" },
  { name: "活力橙", color: "#ff9800" },
  { name: "清新绿", color: "#00b96b" },
  { name: "优雅紫", color: "#722ed1" },
];

export const ThemeContext = createContext<{
  themeColor: string;
  setThemeColor: (c: string) => void;
  presetColors: typeof PRESET_COLORS;
}>({
  themeColor: "#1677ff",
  setThemeColor: () => {},
  presetColors: PRESET_COLORS,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeColor, setThemeColor] = useState<string>(
    localStorage.getItem("themeColor") || "#1677ff"
  );
  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", themeColor);
    localStorage.setItem("themeColor", themeColor);
  }, [themeColor]);
  return (
    <ThemeContext.Provider
      value={{ themeColor, setThemeColor, presetColors: PRESET_COLORS }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
