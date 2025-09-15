// ./pages/ReceiveToken.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ALLOWED_ADMIN_ORIGINS = [
 "https://wed-mac-admin.vercel.app/login",  // <-- put your admin origin(s) here
  "http://localhost:3000"     // <-- local dev
];

export default function ReceiveToken() {
  const navigate = useNavigate();

  useEffect(() => {
    // Tell opener (admin) that this window is ready to receive tokens
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: "receive-ready" }, "*");
        console.log("Sent receive-ready to opener");
      }
    } catch (err) {
      console.warn("Could not notify opener:", err);
    }

    function processTokenData(data: any) {
      const access = data.access || data.accessToken || null;
      if (!access) {
        console.warn("No access token in message:", data);
        return false;
      }
      if (data.access) sessionStorage.setItem("accessToken", String(data.access));
      if (data.refresh) sessionStorage.setItem("refreshToken", String(data.refresh));
      if (data.user_id || data.userId) sessionStorage.setItem("user_id", String(data.user_id ?? data.userId));
      sessionStorage.setItem("role", "artist");
      console.log("✅ Tokens saved from admin message");
      navigate("/", { replace: true });
      return true;
    }

 function handleMessage(e: MessageEvent) {
  console.log("ReceiveToken got message", e.origin, e.data);

  // Ignore self-origin noise
  if (e.origin === window.location.origin) {
    return;
  }

  // Allow only known admin origins
  if (!ALLOWED_ADMIN_ORIGINS.includes(e.origin)) {
    console.warn("Rejected message from origin:", e.origin);
    return;
  }

  processTokenData(e.data);
}


    window.addEventListener("message", handleMessage, false);

    // fallback: parse hash if admin used fragment fallback
    const parsed = (() => {
      try {
        const h = window.location.hash;
        if (!h) return false;
        const p = new URLSearchParams(h.substring(1));
        const a = p.get("access");
        if (!a) return false;
        sessionStorage.setItem("accessToken", a);
        const r = p.get("refresh");
        if (r) sessionStorage.setItem("refreshToken", r);
        const uid = p.get("user_id");
        if (uid) sessionStorage.setItem("user_id", uid);
        sessionStorage.setItem("role", "artist");
        console.log("✅ Tokens saved from hash fallback");
        navigate("/", { replace: true });
        return true;
      } catch (err) {
        return false;
      }
    })();

    // cleanup
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div>
        <p className="text-center">Signing you in…</p>
      </div>
    </div>
  );
}
