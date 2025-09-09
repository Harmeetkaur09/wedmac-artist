"use client";
import { useEffect } from "react";

export default function TokenCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash; // e.g. #access=xxx&refresh=yyy&user_id=123
    if (!hash) return;

    try {
      const params = new URLSearchParams(hash.substring(1)); // remove "#"
      const access = params.get("access");
      const refresh = params.get("refresh");
      const userId = params.get("user_id");

      if (access) {
        sessionStorage.setItem("accessToken", access);
        if (refresh) sessionStorage.setItem("refreshToken", refresh);
        if (userId) sessionStorage.setItem("user_id", userId);
        sessionStorage.setItem("role", "artist");
        console.log("✅ Artist token saved from hash");
      }
    } catch (err) {
      console.error("Failed to parse tokens from hash", err);
    } finally {
      // clean URL so tokens don't stay visible
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  return null;
}
