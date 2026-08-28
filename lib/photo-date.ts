export function formatTakenOn(value: string | null | undefined) {
  const takenOn = String(value ?? "").trim();

  if (!takenOn) {
    return "";
  }

  const normalized = /^\d{4}-\d{2}$/.test(takenOn) ? `${takenOn}-01` : takenOn;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return takenOn;
  }

  const [year, month] = normalized.split("-");
  const date = new Date(`${year}-${month}-01T00:00:00Z`);

  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
