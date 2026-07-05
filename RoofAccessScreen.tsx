/**
 * Pre-submission QA — spec Section 4. Deliberately plain rule-based logic,
 * not an AI call: the whole point of this feature is being a reliable
 * checklist an assessor can trust, not another place a model's judgement
 * could be wrong.
 */

export interface FlaggedItem {
  id: string;
  fieldPath: string;
  message: string;
  severity: "warning" | "error";
}

export function computeQASummary(inspection: any): {
  score: { complete: number; total: number };
  flaggedItems: FlaggedItem[];
} {
  const flags: FlaggedItem[] = [];
  const roofAreas: any[] = inspection.roofAreas ?? [];

  roofAreas.forEach((area, i) => {
    const label = area.roofType?.value ?? `roof area ${i + 1}`;

    if (area.pitchDegrees?.confirmed && !area.materialSecondary?.confirmed) {
      flags.push({
        id: `roof-${i}-material-missing`,
        fieldPath: `roofAreas[${i}].materialSecondary`,
        message: `Roof area "${label}" has a pitch reading but no confirmed material.`,
        severity: "error",
      });
    }

    if (area.pitchCompliance?.tier === "non_compliant") {
      const recs: string = inspection.findings?.recommendations ?? "";
      if (!recs.includes(label)) {
        flags.push({
          id: `roof-${i}-noncompliant-unaddressed`,
          fieldPath: `roofAreas[${i}].pitchCompliance`,
          message: `Roof area "${label}" has a non-compliant pitch flag not referenced in Recommendations.`,
          severity: "warning",
        });
      }
    }

    if (area.eventType === "hail" && (area.hailDamagePercent === undefined || area.hailDamagePercent === null)) {
      flags.push({
        id: `roof-${i}-hail-percent-missing`,
        fieldPath: `roofAreas[${i}].hailDamagePercent`,
        message: `Roof area "${label}" is marked hail-affected but has no damage percentage recorded.`,
        severity: "error",
      });
    }
  });

  if (inspection.makeSafe?.stillNeeded) {
    const actions: any[] = inspection.actions ?? [];
    const hasAction = actions.some((a) => a.trigger === "make_safe_still_needed" && !a.resolved);
    if (!hasAction) {
      flags.push({
        id: "makesafe-escalation-missing",
        fieldPath: "makeSafe.stillNeeded",
        message: "Make safe still needed, but no escalation action has been created.",
        severity: "error",
      });
    }
  }

  const mandatoryFieldsTotal = 10; // placeholder — enumerate real mandatory-field count per the spec's "*Denotes mandatory" pattern
  const errorCount = flags.filter((f) => f.severity === "error").length;
  const mandatoryFieldsComplete = Math.max(0, mandatoryFieldsTotal - errorCount);

  return {
    score: { complete: mandatoryFieldsComplete, total: mandatoryFieldsTotal },
    flaggedItems: flags,
  };
}
