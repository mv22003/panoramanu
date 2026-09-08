"use client";

import { useEffect } from "react";

const CONSENT_COOKIE = "panoramanu_cookie_consent";
const SESSION_STORAGE_KEY = "panoramanu_visit_started_at";

function hasConsent() {
  return document.cookie
    .split(";")
    .some((entry) => entry.trim() === `${CONSENT_COOKIE}=granted`);
}

function getStartedAt() {
  const currentValue = window.sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (currentValue) {
    return Number(currentValue);
  }

  const now = Date.now();
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, String(now));
  return now;
}

function sendVisit(path: string) {
  if (!hasConsent()) {
    return;
  }

  const startedAt = getStartedAt();
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const controller = new AbortController();

  void fetch("/api/analytics", {
    body: JSON.stringify({ durationSeconds: elapsedSeconds, path }),
    headers: {
      "Content-Type": "application/json",
    },
    keepalive: true,
    method: "POST",
    signal: controller.signal,
  }).catch(() => {
    // Analytics should never interrupt the page experience.
  });
}

export default function VisitTracker() {
  useEffect(() => {
    function handleVisit() {
      sendVisit(window.location.pathname);
    }

    function handlePageHide() {
      sendVisit(window.location.pathname);
    }

    handleVisit();
    const interval = window.setInterval(handleVisit, 15000);
    window.addEventListener("panoramanu-consent-granted", handleVisit);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("panoramanu-consent-granted", handleVisit);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  return null;
}
