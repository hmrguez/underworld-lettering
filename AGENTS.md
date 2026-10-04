# Agent instructions

## Start here

Read `docs/HANDOFF.md`, then `docs/ARCHITECTURE.md` and `docs/DEVELOPMENT.md` before substantive changes. `README.md` is the public product documentation.

## Essential product constraints

- Continue the existing Svelte 5 / Vite app. Do not replace it with a new scaffold or another framework.
- This is a short-name lettering editor with instant, deterministic SVG previews. It is not a landing page, a generic font picker, or an image-generation workflow.
- Rat King's visual fidelity is the top priority. Keep Nurse Harrow and Baba as genuinely distinct styles with their own geometry and rules.
- Compose editable glyphs and contextual flourishes. Do not substitute a complete hero-name image for the live renderer.
- Prefer automatic composition and simple switches / letter-level overrides. A manual Bézier editor is outside the agreed v1 scope.
- Preserve precedence: interface override > inline modifier > automatic/global behavior. Editing text currently clears interface overrides.
- Distinguish reference-derived letters from inferred letters. Do not claim exact reconstruction of an unseen alphabet.

## Development rules

- Preserve the lockfile and existing architecture unless the requested change requires otherwise.
- For parser / renderer changes, run `npm run check`, `npm test`, and `npm run build`. Inspect the affected styles visually; a successful build does not establish typography fidelity.
- Exported SVGs must contain their outlines and work without installed fonts. Keep source text out of raw SVG markup unless escaped and validated.
- Confirm which checkout an existing preview server serves. The original `127.0.0.1:5173` preview was launched from a separate staging copy, not this Personal repository.
- Do not stage unrelated files, including IDE files under `.idea/`. Do not overwrite user changes.
- Use compact, verified screenshots in the README: one editor overview and lettering close-ups. Never blindly replace them with full-page captures. Inspect the actual saved files.
- Keep third-party attribution and bundled font license notices. Do not apply a blanket license to Valve artwork or reference-derived glyphs.
- This is an ordinary existing local repository. Do not create or reconnect a hosted Site, change hosting, or push remote changes without a relevant user request.
