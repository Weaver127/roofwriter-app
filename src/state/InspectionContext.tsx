import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Inspection, RoofArea, manual, aiDraft } from "../types/inspection";
import { computePitchCompliance } from "../lib/pitchCompliance";

function emptyRoofArea(): RoofArea {
  return {
    id: Math.random().toString(36).slice(2),
    roofType: manual("main"),
    pitchDegrees: aiDraft(0),
    pitchCaptureMethod: "typed",
    materialPrimary: manual("metal"),
    materialSecondary: manual("custom_orb"),
    pitchCompliance: { tier: "no_minimum", message: "Not yet assessed.", minimumPitch: null },
    railOrScaffoldRequired: false,
    eventType: "none",
    outcome: "not_insurable",
    damagePhotoUrls: [],
  };
}

function emptyInspection(): Inspection {
  return {
    id: Math.random().toString(36).slice(2),
    jobDetails: {
      roofingBusinessName: "",
      abn: "",
      contactNumber: "",
      licenceNumber: undefined,
      assessorName: "",
      homeownerRepPresentAtInspection: false,
      whoWasPresent: "none",
      reasonForInspection: "insurance_claim",
      siteAddress: "",
      streetViewPhotoUrl: "",
      inspectionDate: new Date().toISOString().slice(0, 10),
      inspectionTime: new Date().toISOString().slice(11, 16),
      preparedBy: "",
      weather: aiDraft("sunny"),
    },
    roofAccess: {
      approxPropertyAge: "10-20",
      buildingHeight: aiDraft("single_storey"),
      enteringRoofSpace: false,
      heightGreaterThan2m: false,
      roofHarnessRequired: false,
      overheadPowerPresent: aiDraft(false),
      sarkingInstalled: "none",
      ceilingInsulationInstalled: "unable_to_determine",
      roofInsulationInstalled: "unable_to_determine",
      edgeProtectionOrScaffoldRequired: false,
    },
    findings: {
      overallRoofCondition: "fair",
      waterEntryThroughRoof: false,
      insurableExternalDamageSummary: aiDraft(""),
      externalDamagePhotoUrls: [],
      internalDamageSummary: aiDraft(""),
      internalDamagePhotoUrls: [],
      worksRequiredBeforeInternalRepair: false,
      whatCausedTheDamage: "",
      recommendations: "",
    },
    roofAreas: [emptyRoofArea()],
    outcome: {
      isSingleCauseEvent: true,
      eventType: "none",
      canProceedWithRepairs: false,
      isCompliantWithCurrentGuidelines: true,
    },
    maintenance: {
      requiredToPreventFurtherDamage: false,
      recommendedForFutureDamage: false,
    },
    makeSafe: { conducted: false, stillNeeded: false },
    accessories: [],
    repairScope: [],
    actions: [],
    status: "draft",
  };
}

type Action =
  | { type: "UPDATE"; patch: (draft: Inspection) => Inspection }
  | { type: "RESET" };

function reducer(state: Inspection, action: Action): Inspection {
  switch (action.type) {
    case "UPDATE":
      return action.patch(state);
    case "RESET":
      return emptyInspection();
    default:
      return state;
  }
}

interface InspectionContextValue {
  inspection: Inspection;
  update: (patch: (draft: Inspection) => Inspection) => void;
  updateRoofArea: (id: string, patch: (area: RoofArea) => RoofArea) => void;
  addRoofArea: () => void;
  duplicateRoofArea: (id: string) => void;
  removeRoofArea: (id: string) => void;
  reset: () => void;
}

const InspectionContext = createContext<InspectionContextValue | null>(null);

export function InspectionProvider({ children }: { children: ReactNode }) {
  const [inspection, dispatch] = useReducer(reducer, undefined, emptyInspection);

  const update = (patch: (draft: Inspection) => Inspection) => dispatch({ type: "UPDATE", patch });

  const updateRoofArea = (id: string, patch: (area: RoofArea) => RoofArea) =>
    update((draft) => ({
      ...draft,
      roofAreas: draft.roofAreas.map((a) => {
        if (a.id !== id) return a;
        const updated = patch(a);
        if (updated.pitchDegrees.confirmed) {
          updated.pitchCompliance = computePitchCompliance(
            updated.materialPrimary.value,
            updated.materialSecondary.value,
            updated.pitchDegrees.value
          );
        }
        return updated;
      }),
    }));

  const addRoofArea = () =>
    update((draft) => ({ ...draft, roofAreas: [...draft.roofAreas, emptyRoofArea()] }));

  const duplicateRoofArea = (id: string) =>
    update((draft) => {
      const index = draft.roofAreas.findIndex((a) => a.id === id);
      if (index === -1) return draft;
      const copy = { ...draft.roofAreas[index], id: Math.random().toString(36).slice(2) };
      const roofAreas = [...draft.roofAreas];
      roofAreas.splice(index + 1, 0, copy);
      return { ...draft, roofAreas };
    });

  const removeRoofArea = (id: string) =>
    update((draft) => ({ ...draft, roofAreas: draft.roofAreas.filter((a) => a.id !== id) }));

  const reset = () => dispatch({ type: "RESET" });

  return (
    <InspectionContext.Provider
      value={{ inspection, update, updateRoofArea, addRoofArea, duplicateRoofArea, removeRoofArea, reset }}
    >
      {children}
    </InspectionContext.Provider>
  );
}

export function useInspection() {
  const ctx = useContext(InspectionContext);
  if (!ctx) throw new Error("useInspection must be used within an InspectionProvider");
  return ctx;
}
