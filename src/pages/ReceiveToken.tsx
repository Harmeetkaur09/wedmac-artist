// ./pages/ReceiveToken.tsx
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RAW_ALLOWED_ADMIN_ORIGINS = [
  "https://admin.wedmacindia.com",
  "http://localhost:3000", // dev
  // add other admin staging/domains here (no trailing slash)
];

export default function ReceiveToken() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // normalize origins (remove trailing slashes, use URL.origin if possible)
    const ALLOWED_ADMIN_ORIGINS = RAW_ALLOWED_ADMIN_ORIGINS.map((o) => {
      try {
        return new URL(o).origin;
      } catch {
        return String(o).replace(/\/+$/, "");
      }
    });

    function processTokenData(data: any) {
      const access = data.access || data.accessToken || null;
      const refresh = data.refresh || data.refreshToken || null;
      const userId = data.user_id ?? data.userId ?? null;

      if (!access) {
        console.warn("❌ No access token in message payload:", data);
        return false;
      }

      try {
        localStorage.setItem("accessToken", String(access));
        if (refresh) localStorage.setItem("refreshToken", String(refresh));
        if (userId) localStorage.setItem("user_id", String(userId));
        localStorage.setItem("role", "artist");

        // update app auth context
        login({
          access,
          refresh,
          user: { id: String(userId ?? ""), email: "", role: "artist" },
        });

        console.log("✅ Tokens saved + context updated");
        // navigate to artist home
        navigate("/", { replace: true });
        return true;
      } catch (err) {
        console.error("Failed to persist tokens:", err);
        return false;
      }
    }

    function handleMessage(e: MessageEvent) {
      console.log("🔔 ReceiveToken got message", e.origin, e.data, "opener:", !!window.opener);

      // Normalize origin and check allowed list
      const origin = e.origin || "";
      if (!ALLOWED_ADMIN_ORIGINS.includes(origin)) {
        console.warn("❌ Rejected message from origin:", origin);
        return;
      }

      if (!e.data || typeof e.data !== "object") {
        console.warn("🔸 Ignored non-object message:", e.data);
        return;
      }

      // If tokens present, process them
      if (e.data.access || e.data.accessToken || e.data.refresh || e.data.user_id) {
        processTokenData(e.data);
        return;
      }

      if (e.data.type === "ping") {
        console.log("ping from admin");
        return;
      }

      console.warn("🔸 Received object but no tokens found — ignored:", e.data);
    }

    // register listener BEFORE telling opener we're ready
    window.addEventListener("message", handleMessage, false);

    // Try to pick opener origin from document.referrer (safer than "*"), fallback to "*"
    let openerTarget = "*";
    try {
      if (document.referrer) {
        const refOrigin = new URL(document.referrer).origin;
        // only set if refOrigin is in our allowed list
        if (RAW_ALLOWED_ADMIN_ORIGINS.map(o => (o.replace(/\/+$/, ""))).includes(refOrigin)) {
          openerTarget = refOrigin;
        }
      }
    } catch (err) {
      // ignore - we will use "*"
    }

    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: "receive-ready" }, openerTarget);
        console.log("Sent receive-ready to opener (target:)", openerTarget);
      }
    } catch (err) {
      console.warn("Could not notify opener:", err);
    }

    // Fallback: parse fragment if admin used fragment fallback (#access=...)
    try {
      const hash = window.location.hash || "";
      if (hash && (hash.includes("access=") || hash.includes("accessToken="))) {
        const params = new URLSearchParams(hash.replace(/^#/, ""));
        const payload: any = {};
        if (params.get("access")) payload.access = params.get("access");
        if (params.get("refresh")) payload.refresh = params.get("refresh");
        if (params.get("user_id")) payload.user_id = params.get("user_id");
        if (Object.keys(payload).length > 0) {
          console.log("Found tokens in fragment fallback - processing");
          processTokenData(payload);
        }
      }
    } catch (err) {
      console.warn("Hash fallback parse failed:", err);
    }

    return () => window.removeEventListener("message", handleMessage);
    // include navigate and login to silence linter / ensure stable references
  }, [navigate, login]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div>
        <p className="text-center">Signing you in…</p>
      </div>
    </div>
  );
}
