// TokenCapture.tsx (add logs + slight retry)
"use client";
import { useEffect } from "react";

export default function TokenCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const parseHash = () => {
      const hash = window.location.hash;
      if (!hash) return false;
      try {
        const params = new URLSearchParams(hash.substring(1));
        const access = params.get("access");
        const refresh = params.get("refresh");
        const userId = params.get("user_id");
        if (access) {
          localstorage.setItem("accessToken", access);
          if (refresh) localstorage.setItem("refreshToken", refresh);
          if (userId) localstorage.setItem("user_id", userId);
          localstorage.setItem("role", "artist");
          console.log("✅ Artist token saved from hash");
          // clear fragment and navigate to safe route
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search
          );
          return true;
        }
      } catch (err) {
        console.error("Failed to parse tokens from hash", err);
      }
      return false;
    };

    // Try immediate parse; if it fails, do nothing (don't redirect away immediately)
    parseHash();
  }, []);

  return null;
}
