/**
 * 图片优化脚本
 * 用于压缩项目中的图片文件，提升加载性能
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * 检查是否安装了图片优化工具
 */
function checkImageOptimizationTools() {
  try {
    execSync("imagemin --version", { stdio: "ignore" });
    return true;
  } catch (error) {
    console.log("❌ 未检测到 imagemin，请先安装：");
    console.log(
      "npm install -g imagemin-cli imagemin-mozjpeg imagemin-pngquant"
    );
    return false;
  }
}

/**
 * 优化单个图片文件
 */
function optimizeImage(inputPath, outputPath, quality = 80) {
  try {
    const command = `imagemin "${inputPath}" --out-dir="${path.dirname(
      outputPath
    )}" --plugin.mozjpeg.quality=${quality}`;
    execSync(command, { stdio: "inherit" });
    console.log(`✅ 优化完成: ${path.basename(inputPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ 优化失败: ${path.basename(inputPath)}`, error.message);
    return false;
  }
}

/**
 * 批量优化图片
 */
function optimizeImages() {
  const assetsDir = path.join(__dirname, "../src/assets");
  const imagesToOptimize = [
    { input: "lake.jpg", output: "lake-optimized.jpg", quality: 85 },
    { input: "login.png", output: "login-optimized.png", quality: 80 },
    { input: "articleBg.jpg", output: "articleBg-optimized.jpg", quality: 85 },
  ];

  console.log("🚀 开始优化图片...");

  imagesToOptimize.forEach(({ input, output, quality }) => {
    const inputPath = path.join(assetsDir, input);
    const outputPath = path.join(assetsDir, output);

    if (fs.existsSync(inputPath)) {
      console.log(`📸 正在优化: ${input}`);
      optimizeImage(inputPath, outputPath, quality);
    } else {
      console.log(`⚠️  文件不存在: ${input}`);
    }
  });

  console.log("🎉 图片优化完成！");
}

/**
 * 生成WebP格式图片
 */
function generateWebP() {
  const assetsDir = path.join(__dirname, "../src/assets");
  const imagesToConvert = ["lake.jpg", "login.png", "articleBg.jpg"];

  console.log("🔄 开始生成WebP格式...");

  imagesToConvert.forEach((image) => {
    const inputPath = path.join(assetsDir, image);
    const outputPath = path.join(
      assetsDir,
      image.replace(/\.(jpg|png)$/, ".webp")
    );

    if (fs.existsSync(inputPath)) {
      try {
        const command = `imagemin "${inputPath}" --out-dir="${path.dirname(
          outputPath
        )}" --plugin.webp.quality=85`;
        execSync(command, { stdio: "inherit" });
        console.log(`✅ WebP生成完成: ${path.basename(outputPath)}`);
      } catch (error) {
        console.error(`❌ WebP生成失败: ${image}`, error.message);
      }
    }
  });
}

/**
 * 主函数
 */
function main() {
  console.log("🖼️  图片优化工具启动...\n");

  if (!checkImageOptimizationTools()) {
    return;
  }

  // 优化JPEG/PNG图片
  optimizeImages();

  // 生成WebP格式
  generateWebP();

  console.log("\n📋 优化建议:");
  console.log("1. 将优化后的图片替换原始图片");
  console.log("2. 在CSS中使用WebP格式作为首选，JPEG作为fallback");
  console.log("3. 考虑使用响应式图片，为不同设备提供不同尺寸");
  console.log("4. 使用CDN加速图片加载");
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  optimizeImages,
  generateWebP,
  checkImageOptimizationTools,
};
