"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";

const CONSENT_COOKIE = "panoramanu_cookie_consent";

function hasConsent() {
  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim() === `${CONSENT_COOKIE}=granted`);
}

export default function VercelAnalytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const syncConsent = () => setConsented(hasConsent());

    syncConsent();
    window.addEventListener("panoramanu-consent-granted", syncConsent);

    return () => window.removeEventListener("panoramanu-consent-granted", syncConsent);
  }, []);

  return consented ? <Analytics /> : null;
}
