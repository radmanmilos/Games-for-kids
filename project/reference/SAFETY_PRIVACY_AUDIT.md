# Child-safety & privacy audit (task 366)

Scope: all runtime files under game/.

## Network paths
- Only local-origin fetches: manifest.json (version discovery), sw-cache-list.json, offline-manifest.json (service worker). No external URLs, no analytics/telemetry/tracking, no ads, no third-party scripts at runtime. (Verified by grep for fetch/XHR/WebSocket/EventSource/sendBeacon and http(s) URLs.)

## Storage
- shared/main.js: single tiny local progress key (deliberately minimal). reset() clears it.
- fastcat.js, kitty-standalone.js: 'pkMusic' preference.
- cat_forest.js: one validated save key.
- parent.html: localStorage.clear() on reset.

## Permissions / injection
- No camera/mic/location/contacts/notifications requests found.
- innerHTML usages are static templates or trusted local data; no user-controlled values enter DOM/URL/speech (verified). No eval of untrusted input; new Function only for registry eval in tools (not runtime).

## Parent gate
- parent.html describes multiplication question as toddler speed bump, not secure auth (preserved).

## Conclusion
No prohibited runtime network surface. Data stays local and minimal. Parent reset clears app-owned progress. No changes required.
