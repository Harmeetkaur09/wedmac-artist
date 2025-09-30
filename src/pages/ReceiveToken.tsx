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

      localstorage.setItem("accessToken", String(access));
      if (refresh) localstorage.setItem("refreshToken", String(refresh));
      if (userId) localstorage.setItem("user_id", String(userId));
      localstorage.setItem("role", "artist");

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
      console.log("  → source:", e.source);
      console.log("  → my location.origin:", window.location.origin);
      console.log("  → allowed origins:", ALLOWED_ADMIN_ORIGINS);

      // 1) Accept only messages FROM THE OPENER (if opener exists).
      if (window.opener && e.source !== window.opener) {
        console.warn(
          "🔸 Ignored: sender is not the opener (probably an extension/other script).",
          e.origin,
          e.data
        );
        return;
      }

      // 2) Basic origin check for extra safety
      if (
        !ALLOWED_ADMIN_ORIGINS.includes(e.origin) &&
        e.origin !== window.location.origin
      ) {
        console.warn("❌ Rejected message from origin:", e.origin);
        return;
      }

      // 3) We only accept object payloads with token fields
      if (!e.data || typeof e.data !== "object") {
        console.warn(
          "🔸 Ignored non-object message (likely internal/extension):",
          e.data
        );
        return;
      }

      // 4) Finally, process if it has token fields
      if (
        e.data.access ||
        e.data.accessToken ||
        e.data.refresh ||
        e.data.user_id
      ) {
        processTokenData(e.data);
      } else {
        console.warn(
          "🔸 Received object but no tokens found — ignored:",
          e.data
        );
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
