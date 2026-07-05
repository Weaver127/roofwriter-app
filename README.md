# RoofWriter mobile app — scaffold (v0.1)

## ⚠️ Honesty note — please read before relying on this

Same limitation as the backend scaffold: **no network access in the
sandbox I built this in**, so I could not run `npm install`, `expo start`,
Metro, or a simulator. I did not compile-check this with the actual
React Native / Expo / React Navigation type definitions, because those
packages aren't installable here.

What I *did* do:
- Wrote every file by hand with care, following standard Expo/React
  Navigation/React Native patterns I'm confident in.
- Ran a structural sanity check (brace/paren balance) across all 18 files
  — all balanced, no obvious syntax corruption.
- Reused, unmodified, the two pieces of this codebase that ARE independently
  verified: `src/types/inspection.ts` (compiled clean in strict mode, 18/18
  tests passed earlier this conversation) and `src/lib/pitchCompliance.ts` /
  `src/lib/qa.ts` (same logic as the API scaffold).

What I could NOT do: actually run this, click through it, or catch the
kind of type errors that only show up once `@types/react-native` and
`@react-navigation/native`'s real type definitions are loaded. There's a
real chance of small issues (a prop name, an import path) that only surface
on first `npm install && npx tsc --noEmit`. Please run that before assuming
this is production-ready — I'd rather you catch a small bug in 30 seconds
than trust a claim I can't back up.

## Setup

```bash
npm install
npx tsc --noEmit    # do this FIRST — catches anything I couldn't
npm start           # then scan the QR code with Expo Go, or press i/a for a simulator
```

## What to click through once it's running

This covers the full spec flow end to end:

1. **Job details** — fill in a few fields, confirm the weather chip.
2. **Roof access** — try the red "Entering roof space" toggle (manual-only styling).
3. **Roof areas** — tap into the default roof area.
4. **Roof area detail** — pick Metal → Custom Orb, type a pitch below 5° (e.g. `4`) and watch the red non-compliance message appear via the *actual* `computePitchCompliance()` function, not a mockup. Try Klip-Lok 700 HS at `1.5` to see the amber "enquiry-only" tier. Set Event type to Hail and a new "Hail damage %" field should appear.
5. Go back to the roof areas list — **Duplicate** and **Remove** should both work.
6. **Outcome** — the decision gate, all manual-only toggles.
7. **Maintenance** — required (red) vs recommended (neutral) split.
8. **Findings** — the insurable damage field starts as an unconfirmed AI-draft box; edit the text and tap Accept.
9. **Make safe** — toggle "still needed" to Yes and an escalation action + draft email body should appear.
10. **Accessories** — add and remove a couple of line items.
11. **Review & submit** — this calls the real `computeQASummary()` against whatever you actually entered. If you left the hail roof area without a damage percentage, you should see that specific error here, and Submit should be disabled until it's resolved.

If all of that behaves as described, the core logic is holding together end
to end, not just in isolated screens.

## What's real vs. still a placeholder

- **Real**: navigation between all 10 screens, one shared `InspectionContext`
  matching the exact `inspection.ts` shape, live pitch-compliance
  computation, live QA/flagged-items computation, the make-safe escalation
  action pattern.
- **Placeholder**: every "photo" button is currently just a `TextInput`/UI
  stub — no actual camera integration yet (would use `expo-camera`, already
  listed in package.json). The AI-drafted findings paragraph is hardcoded
  sample text, not a real model call. Object detection / photo annotation
  (Section 5.1 of the spec) isn't built at all yet — that's a genuinely
  bigger piece of work (on-device or API-based vision model integration)
  that deserves its own session rather than being rushed in here.
- **Not addressed yet**: offline-first local storage (spec Section 7 flags
  this as a real requirement, not optional) — right now all state lives in
  memory and is lost on app restart. Same for actually wiring this up to
  the backend API scaffold from earlier.
