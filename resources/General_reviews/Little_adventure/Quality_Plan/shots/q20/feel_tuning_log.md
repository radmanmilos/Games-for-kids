# Q-20 Feel / Readability Tuning Log

Date: 2026-11-26
Agent: OpenCode/Big Pickle (task 453)

## Applied
- Beacon: soft god-ray cone + sparkles at objective (already in renderer); no pulsing text.
- Ground chevron arrow: points at next objective when hero stalled >6s; fades when close.
- Aim-assist ring: shows near grumpy target (<=3.2u), subtle opacity pulse.
- Gate/pedestal carried-item glow: emissive hint when holding matching key/gem nearby.
- Camera: velocity look-ahead (0.35s, ±2u clamp) + short reveal nudge (<=1.2s) on gateOpen/bridgeUp.

## Config notes
- No config constants changed in this slice; tuning uses existing renderer values.
- Aim distance: 3.2u (matches close combat feel). Arrow stall threshold: 6000ms.
- Nudge: 6u max, 1.2s decay, reduced-motion safe.

## Still USER-RUN / unverified
- Real tablet readability at arm's length.
- Feel tuning confirmation by user on device.
- Any further constant tweaks should be logged here with before/after values.