# ShadeShift demonstration video

- `ShadeShift-Demo.mp4`: 1920×1080 narrated product demonstration, H.264/AAC, with visible captions and an English subtitle track.
- `captions.srt`: matching English captions for a YouTube subtitle upload.
- `NARRATION.md` and `script-cues.json`: exact spoken script and scene sequence.
- `YOUTUBE.md`: title and description for publication.
- `YouTube-Thumbnail.png`: 1280×720 thumbnail.
- `Devpost-Gallery.png`: 1200×800 gallery image.
- `verification.json`: media stream properties from ffprobe.

The application scenes use the actual deployed application at https://shadeshift-city.web.app through Playwright. The video demonstrates real optimization, sensitivity, atlas selection, the sign-in modal and a JSON download. It does not stage a successful account save. The other scenes use the project's real pitch slides. The revised narration uses OpenAI gpt-4o-mini-tts with the built-in Cedar voice. It is a single conversational take, without cloning or impersonation. Its 56 phrase-level captions were aligned to word timestamps. The public description discloses the synthetic voice.

The video compares initial deployment spend. The optimizer does not constrain a full annual operating budget. At 12 event windows, modeled first-year program costs are $171,200 for the starting plan and $251,400 for the optimized plan. The primary figures are scenario calculations, not measured physical outcomes. Caption wording deliberately distinguishes historical observations, planning assumptions and modeled results.

## Reproduction

1. To capture fresh source scenes, run `python3 scripts/record-demo.py prepare`, then `DEMO_BASE_URL=https://shadeshift-city.web.app node scripts/record-demo.mjs`. The legacy macOS voice provides scratch timing only.
2. Set `OPENAI_API_KEY` locally, then run `python3 scripts/prepare-natural-narration.py`. This uses `voice-settings.json` and the current script. Credentials are not stored in the repository.
3. Check the generated speech against the script. Run `python3 scripts/compose-natural-demo.py` to retime the existing real UI takes and render phrase-level captions, AAC audio, and an English subtitle track.
4. Inspect the full decoded video, a representative frame from every scene, subtitle timing, audio levels, and the final YouTube playback before replacing the submission link.

Requirements: Python with requests and Pillow, FFmpeg, and the project Node dependencies. The renderer accepts `--font` for an alternative installed TrueType font. Raw captures remain in `/tmp/shadeshift-video-build`; revised audio, timing and editing intermediates remain in `/tmp/shadeshift-voice-v2`. The old `record-demo.py compose` is the original system-voice workflow, not the revised render.
