/**
 * Deterministic pitch-compliance lookup — deliberately NOT an AI/LLM call.
 * Identical logic to the shared frontend package's inspection.ts, kept here
 * as the API's own copy for now. Once the monorepo/shared-package tooling
 * is set up (see product spec Section 7), this should become a single
 * shared dependency imported by both frontend and backend rather than two
 * copies that can drift apart — flagging that explicitly so it doesn't get
 * forgotten once the scaffold grows.
 */

export type MaterialPrimary = "metal" | "tile" | "polycarbonate";

export type MetalProfile =
  | "custom_orb" | "trimdek" | "klip_lok_700_hs" | "klip_lok_406"
  | "spandek" | "longline_305" | "other_metal";

export type TileMaterial = "concrete" | "terracotta" | "slate" | "other_tile";

export type PolycarbonateProfile =
  | "greca" | "corrugated" | "five_rib_trimclad" | "twinwall_multiwall" | "other_poly";

export type MaterialSecondary = MetalProfile | TileMaterial | PolycarbonateProfile;

export type PitchComplianceTier = "compliant" | "enquiry_only" | "non_compliant" | "no_minimum";

export interface PitchComplianceResult {
  tier: PitchComplianceTier;
  message: string;
  minimumPitch: number | null;
}

interface PitchSpec {
  minimum: number;
  enquiryOnlyBelow?: number;
}

const METAL_PITCH_TABLE: Partial<Record<MetalProfile, PitchSpec>> = {
  custom_orb: { minimum: 5 },
  trimdek: { minimum: 2 },
  klip_lok_700_hs: { minimum: 1, enquiryOnlyBelow: 2 },
  klip_lok_406: { minimum: 1 },
  spandek: { minimum: 2 },
  longline_305: { minimum: 1 },
};

const POLY_PITCH_TABLE: Partial<Record<PolycarbonateProfile, PitchSpec>> = {
  greca: { minimum: 5 },
  corrugated: { minimum: 5 },
  five_rib_trimclad: { minimum: 3 },
  twinwall_multiwall: { minimum: 5 },
};

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
