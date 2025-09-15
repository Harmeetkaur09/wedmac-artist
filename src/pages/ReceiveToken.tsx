// ./pages/ReceiveToken.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ReceiveToken() {
  const navigate = useNavigate();

  useEffect(() => {
    const ADMIN_ORIGIN = "https://your-admin-domain.com"; // <-- CHANGE THIS to your admin origin

    function handleMessage(e: MessageEvent) {
      // SECURITY: accept only from your admin origin
      if (e.origin !== ADMIN_ORIGIN) {
        console.warn("Ignored message from origin:", e.origin);
        return;
      }

      const data = e.data || {};
      const access = data.access || data?.accessToken || null;
      const refresh = data.refresh || data?.refreshToken || null;
      const userId = data.user_id || data?.userId || null;

      if (!access) {
        console.warn("Message did not contain access token", data);
        return;
      }

      // Save tokens and basic info
      sessionStorage.setItem("accessToken", String(access));
      if (refresh) sessionStorage.setItem("refreshToken", String(refresh));
      if (userId) sessionStorage.setItem("user_id", String(userId));
      sessionStorage.setItem("role", "artist");

      console.log("✅ Tokens saved from postMessage");
      // Navigate to app root (ProtectedRoute should now allow)
      navigate("/", { replace: true });
    }

    window.addEventListener("message", handleMessage, false);

    // Fallback: parse hash fragment if admin used fragment fallback
    const tryParseHash = () => {
      try {
        const h = window.location.hash;
        if (!h) return false;
        const params = new URLSearchParams(h.substring(1));
        const a = params.get("access");
        if (!a) return false;
        sessionStorage.setItem("accessToken", a);
        const r = params.get("refresh");
        if (r) sessionStorage.setItem("refreshToken", r);
        const uid = params.get("user_id");
        if (uid) sessionStorage.setItem("user_id", uid);
        sessionStorage.setItem("role", "artist");
        console.log("✅ Tokens saved from hash");
        navigate("/", { replace: true });
        return true;
      } catch (err) {
        return false;
      }
    };

    // Try immediate hash parse (covers case admin opened receive-token#access=... directly)
    tryParseHash();

    // cleanup
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [navigate]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div>
        <p className="text-center">Signing you in…</p>
      </div>
    </div>
  );
}
