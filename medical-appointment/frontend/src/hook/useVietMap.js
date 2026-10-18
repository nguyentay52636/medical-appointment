import { useEffect, useState } from "react";

export default function useVietMap(apiKey) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!apiKey || apiKey === "YOUR_VIETMAP_API_KEY") {
      console.error("Vui lòng điền đúng VIETMAP_API_KEY của bạn.");
      return;
    }

    // Nếu SDK đã load rồi
    if (window.vietmapgl) {
      if (window.vietmapgl.accessToken !== apiKey) {
        window.vietmapgl.accessToken = apiKey;
      }
      setLoaded(true);
      return;
    }

    // Load CSS chính thức VietMap
    const cssId = "vietmap-gl-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/@vietmap/vietmap-gl-js@6.0.0/dist/vietmap-gl.css"; // link chính thức
      document.head.appendChild(link);
    }

    // Load JS chính thức VietMap
    const scriptId = "vietmap-gl-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/@vietmap/vietmap-gl-js@6.0.0/dist/vietmap-gl.js"; // link chính thức
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.vietmapgl) {
          window.vietmapgl.accessToken = apiKey;
          setLoaded(true);
          console.log("VietMap SDK đã load thành công.");
        } else {
          console.error("VietMap SDK load thất bại hoặc chưa khởi tạo.");
        }
      };

      script.onerror = () => {
        console.error("Không tải được VietMap script. Kiểm tra mạng hoặc link SDK.");
      };

      document.body.appendChild(script);
    } else {
      // Script đã tồn tại, chờ window.vietmapgl init
      const interval = setInterval(() => {
        if (window.vietmapgl) {
          window.vietmapgl.accessToken = apiKey;
          setLoaded(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }

  }, [apiKey]);

  return loaded;
}
