"use client";

import { useEffect } from "react";

export default function VisitTracker() {
  useEffect(() => {
    void fetch("/api/analytics", {
      keepalive: true,
      method: "POST",
    }).catch(() => {
      // Analytics should never interrupt the page experience.
    });
  }, []);

  return null;
}
