import { Inspection } from "../types/inspection";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function row(label: string, value: string): string {
  if (!value) return "";
  return `<div class="row"><span class="label">${escapeHtml(label)}</span><span class="value">${escapeHtml(value)}</span></div>`;
}

function photoImgs(uris: string[]): string {
  if (!uris || uris.length === 0) return "";
  return `<div class="photos">${uris.map((u) => `<img src="${u}" />`).join("")}</div>`;
}

export function generateReportHtml(inspection: Inspection, disclaimer: string): string {
  const jd = inspection.jobDetails;
  const ra = inspection.roofAccess;
  const f = inspection.findings;

  const areasHtml = inspection.roofAreas
    .map(
      (area, i) => `
    <div class="area-block">
      <h3>${escapeHtml(area.label || area.roofType.value || `Roof area ${i + 1}`)}</h3>
      ${row("Material", area.materialSecondary.value.replace(/_/g, " "))}
      ${row("Pitch", area.pitchDegrees.confirmed ? `${area.pitchDegrees.value}°` : "Not recorded")}
      ${row("Pitch compliance", area.pitchCompliance.message)}
      ${row("Event type", area.eventType.replace(/_/g, " "))}
      ${area.eventType === "hail" ? row("Hail damage %", area.hailDamagePercent !== undefined ? `${area.hailDamagePercent}%` : "Not recorded") : ""}
      ${row("Outcome", area.outcome.replace(/_/g, " "))}
      ${photoImgs(area.materialPhotoUrl ? [area.materialPhotoUrl] : [])}
      ${photoImgs(area.damagePhotoUrls)}
    </div>
  `
    )
    .join("");

  const accessoriesHtml =
    inspection.accessories.length > 0
      ? `
    <h2>Roof-top services</h2>
    ${inspection.accessories
      .map(
        (a) => `
      ${row(a.type.value.replace(/_/g, " "), a.damageDescription.value || "Present")}
      ${photoImgs(a.photoUrls)}
    `
      )
      .join("")}
  `
      : "";

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px; color: #111114; }
        h1 { font-size: 22px; margin-bottom: 2px; }
        .sub { color: #8a8a90; font-size: 13px; margin-bottom: 20px; }
        h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.4px; border-top: 1px solid #eee; padding-top: 14px; margin-top: 20px; }
        h3 { font-size: 14px; margin-bottom: 6px; }
        .row { display: flex; margin-bottom: 4px; font-size: 12px; }
        .label { color: #8a8a90; width: 160px; flex-shrink: 0; }
        .value { color: #111114; text-transform: capitalize; }
        .area-block { background: #f7f7f8; border-radius: 8px; padding: 12px; margin-bottom: 10px; }
        .photos { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0; }
        .photos img { width: 90px; height: 90px; object-fit: cover; border-radius: 6px; }
        .disclaimer { background: #f7f7f8; border-radius: 8px; padding: 14px; margin-top: 20px; font-size: 10px; color: #5a5a60; line-height: 1.5; }
        .signature { font-size: 22px; font-style: italic; font-weight: 600; margin-top: 12px; }
        .date { font-size: 11px; color: #8a8a90; margin-top: 4px; }
      </style>
    </head>
    <body>
      <h1>Roof Inspection Report</h1>
      <div class="sub">${escapeHtml(jd.siteAddress || "Address not entered")}</div>

      <h2>Job details</h2>
      ${row("Claim number", jd.claimNumber ?? "")}
      ${row("Roofing business", jd.roofingBusinessName)}
      ${row("Assessor", jd.assessorName)}
      ${row("Homeowner / rep", jd.homeownerRepName ?? "")}
      ${row("Inspection date", jd.inspectionDate)}
      ${row("Weather", jd.weather.value)}

      <h2>Roof access</h2>
      ${row("Property age", ra.approxPropertyAge)}
      ${row("Property type", ra.buildingHeight.value.replace(/_/g, " "))}
      ${row("Overhead power present", ra.overheadPowerPresent.value ? "Yes" : "No")}
      ${photoImgs(ra.ladderAccessPhotoUrl ? [ra.ladderAccessPhotoUrl] : [])}
      ${photoImgs(ra.overheadPowerPhotoUrl ? [ra.overheadPowerPhotoUrl] : [])}

      <h2>Roof areas</h2>
      ${areasHtml}

      <h2>Outcome</h2>
      ${row("Event type", inspection.outcome.eventType.replace(/_/g, " "))}
      ${row("Can proceed with repairs", inspection.outcome.canProceedWithRepairs ? "Yes" : "No")}
      ${!inspection.outcome.canProceedWithRepairs ? row("Reasons", inspection.outcome.reasonsIfCannotProceed ?? "") : ""}

      <h2>Findings</h2>
      ${row("Overall condition", f.overallRoofCondition)}
      ${row("Insurable external damage", f.insurableExternalDamageSummary.value)}
      ${photoImgs(f.externalDamagePhotoUrls)}
      ${row("Cause of damage", f.whatCausedTheDamage)}
      ${row("Internal damage", f.internalDamageSummary.value)}
      ${photoImgs(f.internalDamagePhotoUrls)}
      ${row("Recommendations", f.recommendations)}

      <h2>Make safe</h2>
      ${row("Conducted", inspection.makeSafe.conducted ? "Yes" : "No")}
      ${row("Still needed", inspection.makeSafe.stillNeeded ? "Yes" : "No")}
      ${photoImgs(inspection.makeSafe.beforePhotoUrl ? [inspection.makeSafe.beforePhotoUrl] : [])}
      ${photoImgs(inspection.makeSafe.afterPhotoUrl ? [inspection.makeSafe.afterPhotoUrl] : [])}

      ${accessoriesHtml}

      <div class="disclaimer">${escapeHtml(disclaimer).replace(/\n/g, "<br/>")}</div>

      <h2>Sign &amp; date</h2>
      <div class="signature">${escapeHtml(inspection.signatureUrl || "")}</div>
      <div class="date">${inspection.signedAt ? new Date(inspection.signedAt).toLocaleString() : ""}</div>
    </body>
  </html>
  `;
}
