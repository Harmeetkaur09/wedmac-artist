// ./pages/ReceiveToken.tsx
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ALLOWED_ADMIN_ORIGINS = [
 "https://wed-mac-admin.vercel.app",  // <-- put your admin origin(s) here
 "https://wedmac-artist.vercel.app",
  "http://localhost:3000"     // <-- local dev
];

export default function ReceiveToken() {
  const navigate = useNavigate();
    const { login } = useAuth(); 

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
      const refresh = data.refresh || data.refreshToken || null;
      const userId = data.user_id ?? data.userId ?? null;

      if (!access) {
        console.warn("❌ No access token in message payload:", data);
        return false;
      }

      // Save in sessionStorage
      sessionStorage.setItem("accessToken", String(access));
      if (refresh) sessionStorage.setItem("refreshToken", String(refresh));
      if (userId) sessionStorage.setItem("user_id", String(userId));
      sessionStorage.setItem("role", "artist");

      // 🔑 Also update AuthContext
      login({
        access,
        refresh,
        user: { id: String(userId), email: "", role: "artist" },
      });

      console.log("✅ Tokens saved + context updated");
      navigate("/", { replace: true });
      return true;
    }


function handleMessage(e: MessageEvent) {
  console.log("🔔 ReceiveToken got message");
  console.log("  → origin:", e.origin);
  console.log("  → data:", e.data);
  console.log("  → my location.origin:", window.location.origin);
  console.log("  → allowed origins:", ALLOWED_ADMIN_ORIGINS);

  // Ignore self-origin noise
// Allow both admin and self-origin (because admin may be served from same host)
if (!ALLOWED_ADMIN_ORIGINS.includes(e.origin) && e.origin !== window.location.origin) {
  console.warn("❌ Rejected message from origin:", e.origin);
  return;
}


  // Allow only known admin origins
  if (!ALLOWED_ADMIN_ORIGINS.includes(e.origin)) {
    console.warn("❌ Rejected message from origin:", e.origin);
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
