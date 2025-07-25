import React, { createContext, useContext, useState, useEffect } from "react";

const PRESET_COLORS = [
  { name: "科技蓝", color: "#1677ff" },
  { name: "活力橙", color: "#ff9800" },
  { name: "清新绿", color: "#00b96b" },
  { name: "优雅紫", color: "#722ed1" },
];
const PRESET_FONT_COLORS = [
  { name: "深色", color: "#222" },
  { name: "浅色", color: "#fff" },
  { name: "灰色", color: "#666" },
];
const PRESET_FONT_SIZES = [
  { name: "小", size: "14px" },
  { name: "中", size: "16px" },
  { name: "大", size: "18px" },
];

export const ThemeContext = createContext<{
  themeColor: string;
  setThemeColor: (c: string) => void;
  presetColors: typeof PRESET_COLORS;
  fontColor: string;
  setFontColor: (c: string) => void;
  presetFontColors: typeof PRESET_FONT_COLORS;
  fontSize: string;
  setFontSize: (s: string) => void;
  presetFontSizes: typeof PRESET_FONT_SIZES;
}>({
  themeColor: "#1677ff",
  setThemeColor: () => {},
  presetColors: PRESET_COLORS,
  fontColor: "#222",
  setFontColor: () => {},
  presetFontColors: PRESET_FONT_COLORS,
  fontSize: "16px",
  setFontSize: () => {},
  presetFontSizes: PRESET_FONT_SIZES,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeColor, setThemeColor] = useState<string>(
    localStorage.getItem("themeColor") || "#1677ff"
  );
  const [fontColor, setFontColor] = useState<string>(
    localStorage.getItem("fontColor") || "#222"
  );
  const [fontSize, setFontSize] = useState<string>(
    localStorage.getItem("fontSize") || "16px"
  );
  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", themeColor);
    document.documentElement.style.setProperty("--tabbar-active", themeColor);
    document.documentElement.style.setProperty("--font-color", fontColor);
    document.documentElement.style.setProperty("--font-size", fontSize);
    localStorage.setItem("themeColor", themeColor);
    localStorage.setItem("fontColor", fontColor);
    localStorage.setItem("fontSize", fontSize);
  }, [themeColor, fontColor, fontSize]);
  return (
    <ThemeContext.Provider
      value={{
        themeColor,
        setThemeColor,
        presetColors: PRESET_COLORS,
        fontColor,
        setFontColor,
        presetFontColors: PRESET_FONT_COLORS,
        fontSize,
        setFontSize,
        presetFontSizes: PRESET_FONT_SIZES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
