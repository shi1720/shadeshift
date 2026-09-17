"""Build the judge attachment from explicitly selected public project artifacts."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
target = root / 'submission' / 'ShadeShift-Submission.zip'
files = {
    'START-HERE.md': 'submission/TESTING.md',
    'Project-Story.md': 'submission/DEVPOST.md',
    'Pitch.pdf': 'submission/pitch/ShadeShift-Pitch.pdf',
    'Pitch.pptx': 'submission/pitch/ShadeShift-Pitch.pptx',
    'Methods-and-Results.pdf': 'submission/ShadeShift-Methods-and-Results.pdf',
    'Demo.mp4': 'submission/video/ShadeShift-Demo.mp4',
    'Captions.srt': 'submission/video/captions.srt',
    'Narration.md': 'submission/video/NARRATION.md',
    'Example-Scenario.json': 'public/data/example-scenario.json',
    'Optimized-Scenario.json': 'public/data/optimized-scenario.json',
}
with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
    for name, source in files.items():
        archive.write(root / source, name)
assert target.stat().st_size < 35_000_000, 'Devpost attachment exceeds 35 MB'
print(f'{target}: {target.stat().st_size / 1_000_000:.2f} MB')
