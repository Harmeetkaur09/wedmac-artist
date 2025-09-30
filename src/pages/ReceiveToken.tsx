// ./pages/ReceiveToken.tsx
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ALLOWED_ADMIN_ORIGINS = [
  "https://wed-mac-admin.vercel.app", // <-- put your admin origin(s) here
  "https://wedmac-artist.vercel.app",
  "http://localhost:3000", // <-- local dev
];

export default function ReceiveToken() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ./pages/ReceiveToken.tsx — revised (only relevant parts shown)
  useEffect(() => {
    function processTokenData(data: any) {
      const access = data.access || data.accessToken || null;
      const refresh = data.refresh || data.refreshToken || null;
      const userId = data.user_id ?? data.userId ?? null;

      if (!access) {
        console.warn("❌ No access token in message payload:", data);
        return false;
      }

      localStorage.setItem("accessToken", String(access));
      if (refresh) localStorage.setItem("refreshToken", String(refresh));
      if (userId) localStorage.setItem("user_id", String(userId));
      localStorage.setItem("role", "artist");

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
  console.log("🔔 ReceiveToken got message", e.origin, e.data, "opener:", !!window.opener);

  // Accept messages from allowed admin origins
  if (!ALLOWED_ADMIN_ORIGINS.includes(e.origin)) {
    console.warn("❌ Rejected message from origin:", e.origin);
    return;
  }

  // We accept object payloads that contain token fields
  if (!e.data || typeof e.data !== "object") {
    console.warn("🔸 Ignored non-object message:", e.data);
    return;
  }

  // process token payload if present
  if (e.data.access || e.data.accessToken || e.data.refresh || e.data.user_id) {
    processTokenData(e.data);
  } else if (e.data.type === "ping") {
    // a harmless handshake — ignore or reply
    console.log("ping from admin");
  } else {
    console.warn("🔸 Received object but no tokens found — ignored:", e.data);
  }
}


    // IMPORTANT: register listener BEFORE telling opener we're ready.
    window.addEventListener("message", handleMessage, false);

    try {
      if (window.opener && !window.opener.closed) {
        // send the ready signal AFTER registering the listener
        window.opener.postMessage({ type: "receive-ready" }, "*");
        console.log("Sent receive-ready to opener");
      }
    } catch (err) {
      console.warn("Could not notify opener:", err);
    }

    // fallback: parse hash if admin used fragment fallback (unchanged)
    // ... (keep your existing hash fallback logic) ...

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
