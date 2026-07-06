/**
 * RoofWriter.ai — core data model
 *
 * This file is the direct code translation of Sections 2–3 of the product
 * spec. It's meant to be the shared TypeScript package imported by both the
 * React Native mobile app and the Next.js web portal (see spec Section 7),
 * so the pitch-compliance logic, field-trust levels, and QA validation are
 * defined exactly once rather than reimplemented per platform.
 *
 * A field's AI-trust level is encoded directly in its type via the
 * `Confirmable<T>` wrapper below — this makes "was this human-confirmed"
 * a property the compiler can check, not just a convention in a comment.
 */

// ---------------------------------------------------------------------------
// Field trust wrapper
// ---------------------------------------------------------------------------

/**
 * Wraps any AI-DRAFT field. `value` is what's shown/used; `source` records
 * where it came from; `confirmed` is false until a human has explicitly
 * accepted it. UI layers should treat `confirmed === false` as "render with
 * the draft-suggestion visual treatment," never as an already-final value —
 * see spec Section 3.4.2 / 8.2 for why this matters for compliance flags
 * specifically (a flag computed off an unconfirmed value is not trustworthy).
 */
export interface Confirmable<T> {
  value: T;
  source: "ai-draft" | "manual" | "ocr-gauge" | "ocr-handwriting" | "computed";
  confirmed: boolean;
  confirmedAt?: string; // ISO timestamp, set when confirmed flips true
}

/** Convenience constructor for a value the human typed directly — always confirmed. */
export function manual<T>(value: T): Confirmable<T> {
  return { value, source: "manual", confirmed: true, confirmedAt: new Date().toISOString() };
}

/** Convenience constructor for a model-suggested value — never pre-confirmed. */
export function aiDraft<T>(value: T, source: Confirmable<T>["source"] = "ai-draft"): Confirmable<T> {
  return { value, source, confirmed: false };
}

// ---------------------------------------------------------------------------
// Section 2 — The insurability determination
// ---------------------------------------------------------------------------

/**
 * The five insurable event types (spec Section 2). Every roof area's
 * `eventType` and the job-level `outcome.eventType` should draw from this
 * same enum — do not let a second, drifted copy of this list appear
 * elsewhere in the codebase.
 */
export type InsurableEventType =
  | "hail"
  | "heavy_rain_wind"
  | "impact"
  | "collision"
  | "break_and_enter"
  | "none"; // no insurable event affecting this roof area

/**
 * The formal decision gate from the official HR Roof Report V.2.1 template's
 * "Roof Inspection — Outcome" section. Every field here is [AI-NEVER] per
 * the spec — this type intentionally does NOT use Confirmable<T>, because
 * these values should only ever be settable via direct human input, never
 * via an AI-suggestion path at all.
 */
export interface InsurabilityOutcome {
  isSingleCauseEvent: boolean;
  eventType: InsurableEventType;
  canProceedWithRepairs: boolean;
  reasonsIfCannotProceed?: string;

  // Compliance-with-time-of-build, spec Section 2
  isCompliantWithCurrentGuidelines: boolean;
  complianceReasons?: string; // required if isCompliantWithCurrentGuidelines === false
  wasCompliantAtTimeOfBuild?: boolean; // only relevant if not currently compliant
  buildComplianceExplanation?: string; // should include building code citation
}

/**
 * The two maintenance fields, kept structurally distinct per spec Section 2
 * — "required" is claim-blocking, "recommended" is advisory. Never merge
 * these into a single field; they carry different legal weight.
 */
export interface MaintenanceDetermination {
  requiredToPreventFurtherDamage: boolean;
  requiredDescription?: string; // non-claim-related damage/maintenance required
  recommendedForFutureDamage: boolean;
  recommendedDescription?: string;
}

// ---------------------------------------------------------------------------
// Section 3.1 — Job details
// ---------------------------------------------------------------------------

export type PresentAtInspection = "insured" | "agent" | "tenant" | "none" | "other";
export type ReasonForInspection = "insurance_claim" | "pre_purchase" | "routine_maintenance" | "other";
export type Weather = "sunny" | "rain" | "overcast" | "snow";

export interface JobDetails {
  claimNumber?: string;
  homeRepairReference?: string;
  contractorReference?: string;

  roofingBusinessName: string;
  abn: string;
  contactNumber: string;
  licenceNumber?: string; // optional — spec Section 3.1
  assessorName: string;
  assessorLicenceNumber?: string;

  homeownerRepName?: string;
  homeownerRepPresentAtInspection: boolean;
  whoWasPresent: PresentAtInspection;
  reasonForInspection: ReasonForInspection;

  siteAddress: string;
  streetViewPhotoUrl: string;
  aerialViewPhotoUrl?: string;

  inspectionDate: string; // ISO date
  inspectionTime: string; // ISO time, kept separate from date per spec
  preparedBy: string;
  weather: Confirmable<Weather>;
}

// ---------------------------------------------------------------------------
// Section 3.2 — Roof access
// ---------------------------------------------------------------------------

export type PropertyAge = "1-5" | "5-10" | "10-20" | "20-30" | "30-40" | "40+";
export type BuildingHeight = "single_storey" | "double_storey" | "multi_storey" | "other";
export type SarkingType = "anti_con" | "sarking" | "air_cell" | "none";
export type InstalledStatus = "yes" | "no" | "unable_to_determine";

export interface RoofAccess {
  approxPropertyAge: PropertyAge;
  buildingHeight: Confirmable<BuildingHeight>;

  enteringRoofSpace: boolean; // safety-critical, always direct manual entry
  heightGreaterThan2m: boolean;
  ladderAccessPhotoUrl?: string; // required if heightGreaterThan2m
  roofHarnessRequired: boolean;

  overheadPowerPresent: Confirmable<boolean>;
  overheadPowerPhotoUrl?: string;

  sarkingInstalled: SarkingType;
  ceilingInsulationInstalled: InstalledStatus;
  ceilingInsulationType?: string;
  roofInsulationInstalled: InstalledStatus;
  roofInsulationType?: string;

  roofPenetrationsAndFixtures?: string;
  electricalConnection?: string;
  battenType?: string;
  battensReusable?: boolean;
  battensNotReusableReason?: string;

  edgeProtectionOrScaffoldRequired: boolean;
  edgeProtectionDetails?: string;

  proximityToSaltWaterOrBAL?: string; // consider a dedicated BAL-category enum later
}

// ---------------------------------------------------------------------------
// Section 3.3 — Inspection findings
// ---------------------------------------------------------------------------

export type OverallRoofCondition = "poor" | "fair" | "good" | "excellent";

export interface InspectionFindings {
  overallRoofCondition: OverallRoofCondition;

  customerReportedDamage?: string;
  waterEntryThroughRoof: boolean;

  /**
   * Deliberately labelled "insurable external damage," not generic
   * "damage" — see spec Section 3.3 on why this framing is load-bearing,
   * not just wording.
   */
  insurableExternalDamageSummary: Confirmable<string>;
  percentOfRoofAffected?: number; // only meaningful for extensive/hail-pattern damage
  externalDamagePhotoUrls: string[];

  internalDamageSummary: Confirmable<string>;
  internalDamagePhotoUrls: string[];

  worksRequiredBeforeInternalRepair: boolean;
  detailsOfRequiredPriorWorks?: Confirmable<string>;
  rectificationsCompleted?: string;
  rectificationPhotoUrls?: string[];

  /** General informational observation — NOT the claim-relevant maintenance determination. */
  maintenanceItemsObserved?: Confirmable<string>;

  /** Free text, not an enum — insurers want the specific mechanism, not just a category. Section 2 event type is the categorical version; this is the narrative one. */
  whatCausedTheDamage: string;

  repairsRequiredToStopIngress?: Confirmable<string>;
  insurableRelatedItems?: string;
  recommendations: string; // draft-assisted but never auto-finalized — UI must show explicit confirm step
}

// ---------------------------------------------------------------------------
// Section 3.4 — Roof areas (repeatable)
// ---------------------------------------------------------------------------

export type RoofType =
  | "main" | "garage" | "shed" | "upper" | "lower" | "patio"
  | "alfresco" | "awning" | "granny_flat" | "carport" | "skillion" | "other";

export type MaterialPrimary = "metal" | "tile" | "polycarbonate";

export type MetalProfile =
  | "custom_orb" | "trimdek" | "klip_lok_700_hs" | "klip_lok_406"
  | "spandek" | "longline_305" | "other_metal";

export type TileMaterial = "concrete" | "terracotta" | "slate" | "other_tile";

export type PolycarbonateProfile =
  | "greca" | "corrugated" | "five_rib_trimclad" | "twinwall_multiwall" | "other_poly";

export type MaterialSecondary = MetalProfile | TileMaterial | PolycarbonateProfile;

export type PitchComplianceTier = "compliant" | "enquiry_only" | "non_compliant" | "no_minimum";

/** Result of the deterministic pitch-compliance lookup — see computePitchCompliance() below. */
export interface PitchComplianceResult {
  tier: PitchComplianceTier;
  message: string;
  minimumPitch: number | null;
}

export type RoofAreaOutcome = "insurable" | "not_insurable" | "mixed";

export interface RoofArea {
  id: string;
  label?: string; // free-text name like "Main house", "Rear shed" — assessor-entered
  roofType: Confirmable<RoofType>;

  pitchDegrees: Confirmable<number>; // see PitchCaptureMethod below for provenance
  pitchCaptureMethod: "gauge_photo" | "handwritten" | "typed";

  materialPrimary: Confirmable<MaterialPrimary>;
  materialSecondary: Confirmable<MaterialSecondary>;
  materialPhotoUrl?: string; // required if materialPrimary === "tile"
  tileProfile?: Confirmable<string>; // free-text w/ autocomplete, only relevant if tile

  /** [AI-COMPUTED] — never set this manually or via AI drafting; always derive with computePitchCompliance(). */
  pitchCompliance: PitchComplianceResult;

  railOrScaffoldRequired: boolean;

  eventType: InsurableEventType; // [AI-NEVER]
  /** Only meaningful / should only be collected when eventType === "hail". */
  hailDamagePercent?: number; // 0-100, rounded to nearest 5

  outcome: RoofAreaOutcome; // [AI-NEVER]

  damagePhotoUrls: string[];
}

// ---------------------------------------------------------------------------
// Section 3.4.2 — Pitch compliance lookup (deterministic, NOT an AI call)
// ---------------------------------------------------------------------------

interface PitchSpec {
  minimum: number;
  enquiryOnlyBelow?: number; // if set, values in [minimum, enquiryOnlyBelow) are Tier "enquiry_only" rather than compliant
}

/**
 * Source: Lysaght PAB01 "Design Preliminaries" bulletin (metal) and
 * Ampelite Solasafe installation guide (polycarbonate) — see spec Section
 * 3.4.2. VERIFY against current manufacturer documentation before shipping;
 * these bulletins are updated periodically and this table will go stale.
 */
const METAL_PITCH_TABLE: Partial<Record<MetalProfile, PitchSpec>> = {
  custom_orb: { minimum: 5 },
  trimdek: { minimum: 2 },
  klip_lok_700_hs: { minimum: 1, enquiryOnlyBelow: 2 },
  klip_lok_406: { minimum: 1 },
  spandek: { minimum: 2 },
  longline_305: { minimum: 1 },
  // other_metal intentionally omitted — no auto-flag, assessor judgement
};

const POLY_PITCH_TABLE: Partial<Record<PolycarbonateProfile, PitchSpec>> = {
  greca: { minimum: 5 },
  corrugated: { minimum: 5 },
  five_rib_trimclad: { minimum: 3 },
  twinwall_multiwall: { minimum: 5 },
  // other_poly intentionally omitted
};

/**
 * The single source of truth for the pitch-compliance flag. This is plain
 * deterministic code — see spec Section 3.4.2 for why this must never be
 * delegated to an LLM call. Tile materials always return "no_minimum" by
 * design (spec: pitch variance too high across tile manufacturers to flag
 * safely).
 */
export function computePitchCompliance(
  materialPrimary: MaterialPrimary,
  materialSecondary: MaterialSecondary,
  pitchDegrees: number
): PitchComplianceResult {
  if (materialPrimary === "tile") {
    return { tier: "no_minimum", message: "No manufacturer minimum applied for tile — assessor judgement.", minimumPitch: null };
  }

  const spec: PitchSpec | undefined =
    materialPrimary === "metal"
      ? METAL_PITCH_TABLE[materialSecondary as MetalProfile]
      : POLY_PITCH_TABLE[materialSecondary as PolycarbonateProfile];

  if (!spec) {
    return { tier: "no_minimum", message: "No manufacturer minimum applied for this profile — assessor judgement.", minimumPitch: null };
  }

  const profileLabel = materialSecondary.replace(/_/g, " ");

  if (pitchDegrees < spec.minimum) {
    return {
      tier: "non_compliant",
      message: `Non-compliant roof pitch for ${profileLabel}. Minimum recommended is ${spec.minimum}\u00b0.`,
      minimumPitch: spec.minimum,
    };
  }

  if (spec.enquiryOnlyBelow && pitchDegrees < spec.enquiryOnlyBelow) {
    return {
      tier: "enquiry_only",
      message: `Enquiry-only range for ${profileLabel} — may need manufacturer sign-off.`,
      minimumPitch: spec.minimum,
    };
  }

  return {
    tier: "compliant",
    message: `Pitch meets manufacturer minimum for ${profileLabel}.`,
    minimumPitch: spec.minimum,
  };
}

// ---------------------------------------------------------------------------
// Section 3.5 — Make safe
// ---------------------------------------------------------------------------

export interface MakeSafe {
  conducted: boolean;
  worksCompletedDescription?: Confirmable<string>;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  stillNeeded: boolean; // [AI-NEVER] — triggers escalation action
}

// ---------------------------------------------------------------------------
// Section 3.7 — Accessories
// ---------------------------------------------------------------------------

export type AccessoryType =
  | "skylight" | "whirlybird_ventilator" | "solar_panel" | "solar_hot_water"
  | "gutter_mesh" | "flashing_dektite" | "ridge_capping" | "antenna" | "other";

export interface Accessory {
  id: string;
  type: Confirmable<AccessoryType>;
  quantityAffected: number;
  unit: "count" | "linear_metres";
  damageDescription: Confirmable<string>;
  requiresSpecialistInspection: boolean;
  photoUrls: string[];
}

// ---------------------------------------------------------------------------
// Section 3.8 — Repair scope (scope only — no pricing, see spec note)
// ---------------------------------------------------------------------------

export type RepairAction = "supply_and_replace" | "remove_rebed_point" | "repair" | "inspect_specialist";

export interface RepairLineItem {
  id: string;
  roofAreaId: string; // links back to RoofArea, keeps scope and findings from drifting apart
  action: Confirmable<RepairAction>;
  component: Confirmable<string>;
  quantity: Confirmable<number>;
  isUpTo: boolean; // the "up to N" hedge toggle
}

// ---------------------------------------------------------------------------
// Section 4 — Pre-submission QA
// ---------------------------------------------------------------------------

export type ActionTrigger = "make_safe_still_needed" | "manual";

export interface InspectionAction {
  id: string;
  trigger: ActionTrigger;
  description: string;
  draftEmailBody?: string; // e.g. auto-drafted makesafe@ escalation, spec Section 3.5
  resolved: boolean;
}

export interface FlaggedItem {
  id: string;
  fieldPath: string; // e.g. "roofAreas[0].pitchCompliance"
  message: string;
  severity: "warning" | "error";
}

/**
 * Computes the pre-submission QA summary described in spec Section 4.
 * Deliberately simple/rule-based rather than AI-driven — the whole point
 * of this feature is being a reliable checklist, not another place where
 * a model's judgement could be wrong.
 */
export function computeQASummary(inspection: Inspection): {
  score: { complete: number; total: number };
  flaggedItems: FlaggedItem[];
} {
  const flags: FlaggedItem[] = [];

  inspection.roofAreas.forEach((area, i) => {
    if (area.pitchDegrees.confirmed && !area.materialSecondary.confirmed) {
      flags.push({
        id: `roof-${i}-material-missing`,
        fieldPath: `roofAreas[${i}].materialSecondary`,
        message: `Roof area "${area.roofType.value}" has a pitch reading but no material selected.`,
        severity: "error",
      });
    }
    if (area.pitchCompliance.tier === "non_compliant" && !inspection.findings.recommendations.includes(area.roofType.value)) {
      flags.push({
        id: `roof-${i}-noncompliant-unaddressed`,
        fieldPath: `roofAreas[${i}].pitchCompliance`,
        message: `Roof area "${area.roofType.value}" has a non-compliant pitch flag not referenced in Recommendations.`,
        severity: "warning",
      });
    }
    if (area.eventType === "hail" && (area.hailDamagePercent === undefined || area.hailDamagePercent === null)) {
      flags.push({
        id: `roof-${i}-hail-percent-missing`,
        fieldPath: `roofAreas[${i}].hailDamagePercent`,
        message: `Roof area "${area.roofType.value}" is marked as hail-affected but has no damage percentage recorded.`,
        severity: "error",
      });
    }
  });

  if (inspection.makeSafe.stillNeeded) {
    const hasAction = inspection.actions.some(a => a.trigger === "make_safe_still_needed" && !a.resolved);
    if (!hasAction) {
      flags.push({
        id: "makesafe-escalation-missing",
        fieldPath: "makeSafe.stillNeeded",
        message: "Make safe still needed, but no escalation action has been created.",
        severity: "error",
      });
    }
  }

  const mandatoryFieldsTotal = 10; // placeholder — enumerate real mandatory-field count per spec's "*Denotes mandatory" pattern
  const mandatoryFieldsComplete = mandatoryFieldsTotal - flags.filter(f => f.severity === "error").length;

  return {
    score: { complete: Math.max(0, mandatoryFieldsComplete), total: mandatoryFieldsTotal },
    flaggedItems: flags,
  };
}

// ---------------------------------------------------------------------------
// Root Inspection object
// ---------------------------------------------------------------------------

export interface Inspection {
  id: string;
  jobDetails: JobDetails;
  roofAccess: RoofAccess;
  findings: InspectionFindings;
  roofAreas: RoofArea[]; // spec Section 3.4 — array of 1 to 11+
  outcome: InsurabilityOutcome; // spec Section 2
  maintenance: MaintenanceDetermination; // spec Section 2
  makeSafe: MakeSafe;
  accessories: Accessory[];
  repairScope: RepairLineItem[];
  actions: InspectionAction[];
  status: "draft" | "complete";
  signatureUrl?: string;
  signedAt?: string;
}
