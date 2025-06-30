import React, { useState } from "react";
import { Button, Toast, Input, Card } from "antd-mobile";
import { Html5Qrcode } from "html5-qrcode";

/**
 * 扫码调试页面
 * 用于测试扫码功能和二维码解析
 */
const QRDebugPage: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [parsedResult, setParsedResult] = useState("");
  const [testQRCode, setTestQRCode] = useState("");

  /**
   * 开始扫码测试
   */
  const startScan = async () => {
    try {
      setIsScanning(true);

      const devices = await Html5Qrcode.getCameras();
      console.log("可用摄像头:", devices);

      if (devices.length === 0) {
        Toast.show({
          icon: "fail",
          content: "未找到摄像头设备",
        });
        return;
      }

      const html5QrCode = new Html5Qrcode("debug-reader");

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText, decodedResult) => {
          console.log("原始扫描结果:", decodedText);
          setScanResult(decodedText);

          // 测试解析逻辑
          const parsed = parseQRCode(decodedText);
          setParsedResult(JSON.stringify(parsed, null, 2));

          setIsScanning(false);
          html5QrCode.stop();

          Toast.show({
            icon: "success",
            content: "扫描成功！",
          });
        },
        (error) => {
          console.log("扫码错误:", error);
        }
      );
    } catch (error) {
      console.error("启动扫码失败:", error);
      setIsScanning(false);
      Toast.show({
        icon: "fail",
        content: "启动扫码失败",
      });
    }
  };

  /**
   * 解析二维码内容
   */
  const parseQRCode = (decodedText: string) => {
    const result = {
      original: decodedText,
      isUrl: false,
      isQueryString: false,
      sessionId: "",
      token: "",
      parsedUrl: null as any,
      parsedParams: null as any,
      error: null as any,
    };

    try {
      // 检查是否为URL
      if (
        decodedText.startsWith("http://") ||
        decodedText.startsWith("https://")
      ) {
        result.isUrl = true;
        const url = new URL(decodedText);

        // 先从search参数中获取
        result.sessionId = url.searchParams.get("sessionId") || "";
        result.token = url.searchParams.get("token") || "";

        // 如果search参数中没有，尝试从hash部分解析
        if (!result.sessionId || !result.token) {
          if (url.hash) {
            // 移除开头的#号
            const hashParams = url.hash.substring(1);
            if (hashParams.includes("?")) {
              const hashUrl = new URL(`http://dummy.com${hashParams}`);
              result.sessionId =
                result.sessionId || hashUrl.searchParams.get("sessionId") || "";
              result.token =
                result.token || hashUrl.searchParams.get("token") || "";
            }
          }
        }

        result.parsedUrl = {
          protocol: url.protocol,
          hostname: url.hostname,
          pathname: url.pathname,
          search: url.search,
          hash: url.hash,
          searchParams: Object.fromEntries(url.searchParams.entries()),
        };
      } else {
        // 尝试解析为查询字符串
        try {
          const params = new URLSearchParams(decodedText);
          result.isQueryString = true;
          result.parsedParams = Object.fromEntries(params.entries());
          result.sessionId = params.get("sessionId") || "";
          result.token = params.get("token") || "";
        } catch (e) {
          // 直接使用内容作为sessionId
          result.sessionId = decodedText;
        }
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
    }

    return result;
  };

  /**
   * 测试解析功能
   */
  const testParse = () => {
    if (!testQRCode.trim()) {
      Toast.show({
        icon: "fail",
        content: "请输入测试内容",
      });
      return;
    }

    const parsed = parseQRCode(testQRCode);
    setParsedResult(JSON.stringify(parsed, null, 2));
  };

  /**
   * 生成测试二维码内容
   */
  const generateTestQR = () => {
    const testContent = `https://example.com/qrLogin/confirm?sessionId=test_${Date.now()}`;
    setTestQRCode(testContent);
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1>扫码功能调试页面</h1>

      <Card title="摄像头扫码测试" style={{ marginBottom: 20 }}>
        <Button
          color="primary"
          onClick={startScan}
          disabled={isScanning}
          style={{ marginBottom: 15 }}
        >
          {isScanning ? "扫码中..." : "开始扫码测试"}
        </Button>

        <div
          id="debug-reader"
          style={{
            width: "100%",
            height: 300,
            border: "2px solid #ccc",
            borderRadius: 8,
            marginBottom: 15,
          }}
        ></div>

        {scanResult && (
          <div
            style={{
              padding: 15,
              background: "#f0f0f0",
              borderRadius: 8,
              marginBottom: 15,
            }}
          >
            <h3>扫描结果：</h3>
            <p style={{ wordBreak: "break-all" }}>{scanResult}</p>
          </div>
        )}
      </Card>

      <Card title="二维码解析测试" style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 15 }}>
          <Input
            placeholder="输入二维码内容进行测试"
            value={testQRCode}
            onChange={setTestQRCode}
            style={{ marginBottom: 10 }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <Button size="small" onClick={generateTestQR}>
              生成测试内容
            </Button>
            <Button size="small" color="primary" onClick={testParse}>
              测试解析
            </Button>
          </div>
        </div>

        {parsedResult && (
          <div
            style={{
              padding: 15,
              background: "#f8f9fa",
              border: "1px solid #e9ecef",
              borderRadius: 8,
            }}
          >
            <h3>解析结果：</h3>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                fontSize: "12px",
                margin: 0,
              }}
            >
              {parsedResult}
            </pre>
          </div>
        )}
      </Card>

      <Card title="测试用例">
        <div style={{ marginBottom: 10 }}>
          <h4>URL格式测试：</h4>
          <Button
            size="small"
            onClick={() =>
              setTestQRCode(
                "https://example.com/qrLogin/confirm?sessionId=abc123"
              )
            }
            style={{ marginRight: 10 }}
          >
            标准URL
          </Button>
          <Button
            size="small"
            onClick={() =>
              setTestQRCode(
                "http://localhost:3000/login?sessionId=test_session"
              )
            }
            style={{ marginRight: 10 }}
          >
            本地URL
          </Button>
          <Button
            size="small"
            onClick={() =>
              setTestQRCode(
                "http://localhost:8001/#/qrDebug?token=login-token-1751261596625&sessionId=3621eae9-4635-4da8-92c9-c67a1e6b531b"
              )
            }
          >
            实际扫码结果
          </Button>
        </div>

        <div style={{ marginBottom: 10 }}>
          <h4>查询字符串格式测试：</h4>
          <Button
            size="small"
            onClick={() => setTestQRCode("sessionId=direct_session&type=qr")}
            style={{ marginRight: 10 }}
          >
            查询字符串
          </Button>
          <Button
            size="small"
            onClick={() => setTestQRCode("sessionId=simple_id")}
            style={{ marginRight: 10 }}
          >
            简单参数
          </Button>
          <Button
            size="small"
            onClick={() =>
              setTestQRCode("token=test-token&sessionId=test-session")
            }
          >
            带Token参数
          </Button>
        </div>

        <div>
          <h4>纯文本格式测试：</h4>
          <Button
            size="small"
            onClick={() => setTestQRCode("qr_session_12345")}
            style={{ marginRight: 10 }}
          >
            纯文本ID
          </Button>
          <Button size="small" onClick={() => setTestQRCode("invalid content")}>
            无效内容
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default QRDebugPage;
