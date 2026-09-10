"use client";

import { useEffect, useState } from "react";

const CONSENT_COOKIE = "panoramanu_cookie_consent";
const CONSENT_DURATION_SECONDS = 60 * 60 * 24 * 365;

function readConsent() {
  const entry = document.cookie
    .split(";")
    .find((cookie) => cookie.trim().startsWith(`${CONSENT_COOKIE}=`));

  if (!entry) {
    return "";
  }

  return entry.split("=").slice(1).join("=").trim();
}

function setConsent(value: "granted" | "denied") {
  const secure = window.location.protocol === "https:";
  document.cookie = [
    `${CONSENT_COOKIE}=${value}`,
    "path=/",
    `max-age=${CONSENT_DURATION_SECONDS}`,
    "sameSite=lax",
    secure ? "secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Read browser-only consent state after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(readConsent() !== "granted" && readConsent() !== "denied");
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-[3000] flex justify-center px-4">
      <div className="w-full max-w-2xl rounded-[1.5rem] border border-stone-800/80 bg-[#12100d]/96 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-stone-100">Cookie consent</p>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              This site uses privacy-friendly analytics only after you accept cookies.
              You can decline and browse without analytics tracking.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-full border border-stone-700 px-4 py-2 text-sm text-stone-300 transition hover:border-stone-600 hover:text-stone-50"
              onClick={() => {
                setConsent("denied");
                setVisible(false);
              }}
              type="button"
            >
              Decline
            </button>
            <button
              className="rounded-full bg-amber-200 px-4 py-2 text-sm font-medium text-stone-950 transition hover:bg-amber-100"
              onClick={() => {
                setConsent("granted");
                setVisible(false);
                window.dispatchEvent(new Event("panoramanu-consent-granted"));
              }}
              type="button"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
