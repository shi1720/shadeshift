"""Generate and time the synthetic demo narration without storing credentials.

Requires OPENAI_API_KEY in the environment, requests, and FFmpeg.
Only the public script and generated audio are sent to OpenAI.
"""
from pathlib import Path
import json
import os
import subprocess
import requests

ROOT = Path(__file__).resolve().parents[1]
BUILD = Path('/tmp/shadeshift-voice-v2')
OUTPUT = ROOT / 'submission/video'


def main():
    key = os.environ.get('OPENAI_API_KEY')
    if not key:
        raise SystemExit('Set OPENAI_API_KEY in your environment. Never commit it.')
    BUILD.mkdir(mode=0o700, exist_ok=True)
    cues = json.loads((OUTPUT / 'script-cues.json').read_text())
    settings = json.loads((OUTPUT / 'voice-settings.json').read_text())
    headers = {'Authorization': 'Bearer ' + key}
    response = requests.post('https://api.openai.com/v1/audio/speech', headers=headers,
                             json=dict(settings, input='\n\n'.join(c['text'] for c in cues)),
                             timeout=240)
    if not response.ok:
        raise SystemExit(f'Speech generation failed: HTTP {response.status_code}')
    (BUILD / 'narration-raw.wav').write_bytes(response.content)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(BUILD/'narration-raw.wav'),
                    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-ac', '1',
                    str(BUILD/'narration.wav')], check=True)
    with (BUILD/'narration.wav').open('rb') as audio:
        response = requests.post('https://api.openai.com/v1/audio/transcriptions',
                                 headers=headers, files={'file': ('narration.wav', audio, 'audio/wav')},
                                 data={'model': 'whisper-1', 'language': 'en',
                                       'response_format': 'verbose_json',
                                       'timestamp_granularities[]': 'word'}, timeout=240)
    if not response.ok:
        raise SystemExit(f'Timing transcription failed: HTTP {response.status_code}')
    (BUILD/'transcription.json').write_text(json.dumps(response.json(), indent=2))
    print('Narration and word timestamps prepared. Check the spoken text before composing.')


if __name__ == '__main__':
    main()
