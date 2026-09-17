# ShadeShift demonstration video

- `ShadeShift-Demo.mp4`: 1920×1080 narrated product demonstration, H.264/AAC, with visible captions and an English subtitle track.
- `captions.srt`: matching English captions for a YouTube subtitle upload.
- `NARRATION.md` and `script-cues.json`: exact spoken script and scene sequence.
- `YOUTUBE.md`: title and description for publication.
- `YouTube-Thumbnail.png`: 1280×720 thumbnail.
- `Devpost-Gallery.png`: 1200×800 gallery image.
- `verification.json`: media stream properties from ffprobe.

The application scenes use the actual deployed application at https://shadeshift-city.web.app through Playwright. The video demonstrates real optimization, sensitivity, atlas selection, the sign-in modal and a JSON download. It does not stage a successful account save. The other scenes use the project's real pitch slides. The narration uses the standard macOS Samantha synthetic voice, without cloning or impersonation.

The video compares initial deployment spend. The optimizer does not constrain a full annual operating budget. At 12 event windows, modeled first-year program costs are $171,200 for the starting plan and $251,400 for the optimized plan. The primary figures are scenario calculations, not measured physical outcomes. Caption wording deliberately distinguishes historical observations, planning assumptions and modeled results.

## Reproduction

1. Run `python3 scripts/record-demo.py prepare` on macOS with Samantha installed.
2. Run `DEMO_BASE_URL=https://shadeshift-city.web.app node scripts/record-demo.mjs`.
3. Run `python3 scripts/record-demo.py compose` with FFmpeg installed.
4. Run `node scripts/record-demo.gallery.mjs` for fresh thumbnail and gallery images.

The scripts write raw audio/video captures and the timing manifest into `/tmp/shadeshift-video-build`. The title, pricing and closing slide renders are included in `submission/video/slides`, so recording does not depend on external presentation paths. Raw intermediate captures remain separate from the repository. To redo selected scenes after a UI change, set `DEMO_SCENES=4,5,8` using zero-based cue IDs, then compose again.
