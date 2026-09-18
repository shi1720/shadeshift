"""Retiming and caption composition for ShadeShift's conversational narration.

Inputs are an OpenAI narration WAV, whisper-1 word timestamps, the exact cues,
and the original real-UI capture manifest. API credentials are never inputs to
this renderer. Requires FFmpeg and Pillow. See submission/video/README.md.
"""
from pathlib import Path
from difflib import SequenceMatcher
import argparse
import hashlib
import json
import re
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]


def run(args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL)


def probe(path):
    return json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(path)
    ]))


def stamp(seconds):
    ms = round(seconds * 1000)
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'


def normal(word):
    return re.sub(r'[^a-z0-9]', '', word.lower())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--build', type=Path, default=Path('/tmp/shadeshift-voice-v2'))
    parser.add_argument('--captures', type=Path, default=Path('/tmp/shadeshift-video-build/capture.json'))
    parser.add_argument('--font', default='/System/Library/Fonts/Supplemental/Arial.ttf')
    args = parser.parse_args()
    build = args.build
    output = ROOT / 'submission/video'
    cues = json.loads((output / 'script-cues.json').read_text())
    transcript = json.loads((build / 'transcription.json').read_text())
    measured = transcript['words']
    duration = float(probe(build / 'narration.wav')['format']['duration'])
    captures = {item['id']: item for item in json.loads(args.captures.read_text())}
    words, cue_offsets = [], []
    for cue in cues:
        cue_offsets.append(len(words))
        words.extend(cue['text'].split())
    aligned = [None] * len(words)
    matcher = SequenceMatcher(None, [normal(w) for w in words],
                              [normal(w['word']) for w in measured], autojunk=False)
    for block in matcher.get_matching_blocks():
        for offset in range(block.size):
            observed = measured[block.b + offset]
            aligned[block.a + offset] = (observed['start'], observed['end'])
    # Spoken numbers and hyphenated terms differ in ASR tokenization. Interpolate
    # those gaps between matched neighboring words, without changing the script.
    index = 0
    while index < len(words):
        if aligned[index] is not None:
            index += 1
            continue
        end = index
        while end < len(words) and aligned[end] is None:
            end += 1
        start_time = aligned[index - 1][1] if index else 0
        end_time = aligned[end][0] if end < len(words) else duration
        step = max(0, end_time - start_time) / (end - index)
        for i in range(index, end):
            aligned[i] = (start_time + (i-index)*step, start_time + (i-index+1)*step)
        index = end
    boundaries = [0]
    for index in cue_offsets[1:]:
        boundaries.append((aligned[index-1][1] + aligned[index][0]) / 2)
    boundaries.append(duration)
    timeline = []
    for i, cue in enumerate(cues):
        timeline.append(dict(id=i, **cue, start=boundaries[i], end=boundaries[i+1],
                             duration=boundaries[i+1]-boundaries[i]))
    assert all(c['duration'] > 5 for c in timeline), 'Suspicious scene alignment'
    (build / 'timeline.json').write_text(json.dumps(timeline, indent=2))
    # Short, phrase-level captions are easier to follow than paragraph overlays.
    captions = []
    first = 0
    for i, word in enumerate(words):
        phrase = ' '.join(words[first:i+1])
        if ((len(phrase) >= 73 or i-first >= 10 or re.search(r'[.!?]$', word))
                or i == len(words)-1):
            captions.append(dict(text=phrase, start=aligned[first][0], end=aligned[i][1]))
            first = i + 1
    for i, caption in enumerate(captions):
        next_start = captions[i+1]['start'] if i+1 < len(captions) else duration
        caption['end'] = min(next_start, max(caption['start']+.15, caption['end']+.08))
    (build / 'caption-timing.json').write_text(json.dumps(captions, indent=2))
    (output / 'captions.srt').write_text('\n\n'.join(
        f'{i+1}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}'
        for i, c in enumerate(captions))+'\n')
    font = ImageFont.truetype(args.font, 36)
    images = build / 'caption-images'
    images.mkdir(exist_ok=True)
    def paint(text, target):
        image = Image.new('RGB', (1920, 120), '#102e36')
        draw = ImageDraw.Draw(image)
        lines, line = [], ''
        for word in text.split():
            candidate = (line+' '+word).strip()
            if draw.textlength(candidate, font=font) > 1740:
                lines.append(line)
                line = word
            else:
                line = candidate
        if line:
            lines.append(line)
        assert len(lines) <= 2
        for i, line in enumerate(lines):
            draw.text((960, 60 + (i-(len(lines)-1)/2)*43), line, font=font,
                      fill='white', anchor='mm')
        image.save(target)
    paint('', images/'blank.png')
    manifest, cursor = [], 0.0
    def interval(path, length):
        if length > .001:
            manifest.extend([f"file '{path}'", f'duration {length:.6f}'])
    for i, caption in enumerate(captions):
        interval(images/'blank.png', caption['start']-cursor)
        path = images/f'{i:03}.png'
        paint(caption['text'], path)
        interval(path, caption['end']-caption['start'])
        cursor = caption['end']
    interval(images/'blank.png', duration-cursor)
    manifest.append(f"file '{images/'blank.png'}'")
    (build/'caption-concat.txt').write_text('\n'.join(manifest))
    run(['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i',str(build/'caption-concat.txt'),
         '-vf','fps=30','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p',
         '-t',str(duration),str(build/'caption-strip.mp4')])
    segments = []
    for scene in timeline:
        i = scene['id']
        capture = captures[i]
        segment = build/f'scene-{i:02}.mp4'
        ratio = scene['duration']/capture['duration']
        run(['ffmpeg','-y','-v','error','-i',capture['path'],'-an','-vf',
             f'trim=start={capture["start"]}:duration={capture["duration"]},'
             f'setpts={ratio}*(PTS-STARTPTS),fps=30,scale=1920:960:force_original_aspect_ratio=decrease,'
             'pad=1920:1080:(ow-iw)/2:0:color=0x102e36',
             '-t',str(scene['duration']),'-c:v','libx264','-preset','fast','-crf','18',
             '-pix_fmt','yuv420p',str(segment)])
        segments.append(f"file '{segment}'")
        print(f'Retimed scene {i+1}/{len(timeline)}: {scene["duration"]:.2f}s', flush=True)
    (build/'scene-concat.txt').write_text('\n'.join(segments))
    run(['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i',str(build/'scene-concat.txt'),
         '-c','copy',str(build/'silent-demo.mp4')])
    target = output/'ShadeShift-Demo.mp4'
    run(['ffmpeg','-y','-v','error','-i',str(build/'silent-demo.mp4'),
         '-i',str(build/'caption-strip.mp4'),'-i',str(build/'narration.wav'),
         '-i',str(output/'captions.srt'),'-filter_complex','[0:v][1:v]overlay=0:960[v]',
         '-map','[v]','-map','2:a','-map','3:0','-t',str(duration),
         '-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p',
         '-c:a','aac','-b:a','192k','-ar','48000','-c:s','mov_text',
         '-metadata:s:s:0','language=eng','-metadata','title=ShadeShift - A funded shade plan',
         '-movflags','+faststart',str(target)])
    verification = probe(target)
    verification['sha256'] = hashlib.sha256(target.read_bytes()).hexdigest()
    verification['narration'] = {'provider':'OpenAI','model':'gpt-4o-mini-tts','voice':'cedar',
                               'synthetic':True,'cloned':False}
    verification['caption_count'] = len(captions)
    (output/'verification.json').write_text(json.dumps(verification, indent=2))
    print(f'Created {target}: {duration:.2f}s, {len(captions)} captions', flush=True)


if __name__ == '__main__':
    main()
