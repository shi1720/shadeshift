"""Generate standard macOS Samantha narration and compose the real UI recording.
Run prepare, then scripts/record-demo.mjs, then compose. No voice cloning.
"""
from pathlib import Path
import json, subprocess, sys, wave, shutil
ROOT=Path(__file__).resolve().parents[1]
BUILD=Path('/tmp/shadeshift-video-build')
OUTPUT=ROOT/'submission/video'
CUES=json.loads((OUTPUT/'script-cues.json').read_text())
def run(args): subprocess.run(args,check=True,stdout=subprocess.DEVNULL)
def probe(p): return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(p)]))
def timestamp(t):
 msec=round(t*1000);h,msec=divmod(msec,3600000);m,msec=divmod(msec,60000);s,msec=divmod(msec,1000)
 return f'{h:02}:{m:02}:{s:02},{msec:03}'
if sys.argv[1]=='prepare':
 BUILD.mkdir(exist_ok=True); (BUILD/'audio').mkdir(exist_ok=True)
 result=[];elapsed=0;srt=[]
 for i,c in enumerate(CUES):
  raw=BUILD/'audio'/f'{i:02}.aiff';wav=BUILD/'audio'/f'{i:02}.wav';textfile=BUILD/'audio'/f'{i:02}.txt';textfile.write_text(c['text'])
  run(['say','-v','Samantha','-r','146','-f',str(textfile),'-o',str(raw)])
  run(['ffmpeg','-y','-v','error','-i',str(raw),'-af','adelay=350,apad=pad_dur=0.65','-ar','48000','-ac','1',str(wav)])
  duration=float(probe(wav)['format']['duration'])
  result.append({**c,'id':i,'duration':duration,'start':elapsed,'end':elapsed+duration,'audio':str(wav)})
  srt.extend([str(i+1),f'{timestamp(elapsed+0.15)} --> {timestamp(elapsed+duration-0.1)}',c['text'],''])
  elapsed+=duration
 (BUILD/'timeline.json').write_text(json.dumps(result,indent=2));(OUTPUT/'captions.srt').write_text('\n'.join(srt))
 (BUILD/'audio-concat.txt').write_text('\n'.join("file '"+c['audio']+"'" for c in result))
 run(['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i',str(BUILD/'audio-concat.txt'),'-c:a','pcm_s16le',str(BUILD/'narration.wav')])
 print(f'Prepared {len(result)} cues, {elapsed:.2f} seconds')
elif sys.argv[1]=='compose':
 timeline=json.loads((BUILD/'timeline.json').read_text());manifest=json.loads((BUILD/'capture.json').read_text())
 for c,record in zip(timeline,manifest):
  i=c['id'];out=BUILD/f'segment-{i:02}.mp4'
  # Captions occupy their own 120px band, preserving the entire app capture.
  run(['ffmpeg','-y','-v','error','-i',record['path'],'-loop','1','-i',str(BUILD/'captions'/f'{i:02}.png'),'-i',c['audio'],
       '-filter_complex',f'[0:v]trim=start={record["start"]}:duration={c["duration"]},setpts=PTS-STARTPTS,fps=30,scale=1920:960:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:0:color=0x102e36[base];[base][1:v]overlay=0:960:shortest=1[v]',
       '-map','[v]','-map','2:a','-t',str(c['duration']),'-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',str(out)])
 (BUILD/'video-concat.txt').write_text('\n'.join("file '"+str(BUILD/f'segment-{c["id"]:02}.mp4')+"'" for c in timeline))
 run(['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i',str(BUILD/'video-concat.txt'),'-i',str(OUTPUT/'captions.srt'),'-map','0:v','-map','0:a','-map','1:0','-c','copy','-c:s','mov_text','-metadata:s:s:0','language=eng','-metadata','title=ShadeShift - A funded shade plan for major events','-movflags','+faststart',str(OUTPUT/'ShadeShift-Demo.mp4')])
 data=probe(OUTPUT/'ShadeShift-Demo.mp4');(OUTPUT/'verification.json').write_text(json.dumps(data,indent=2));print(OUTPUT/'ShadeShift-Demo.mp4')
