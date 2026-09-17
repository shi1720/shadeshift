/** Record the real local/Firebase app through public UI interactions.
 * Run after record-demo.py prepare. No mocked app responses or fabricated UI.
 * Caption imagery is a separate editorial layer rendered by Chromium.
 */
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
const ROOT=fileURLToPath(new URL('../',import.meta.url));
const BUILD='/tmp/shadeshift-video-build';
const BASE=process.env.DEMO_BASE_URL || 'http://127.0.0.1:5173';
const timeline=JSON.parse(await fs.readFile(`${BUILD}/timeline.json`,'utf8'));
const escapeHtml=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const browser=await chromium.launch({headless:true});
await fs.mkdir(`${BUILD}/captions`,{recursive:true});
await fs.mkdir(`${BUILD}/recordings`,{recursive:true});
const captionPage=await browser.newPage({viewport:{width:1920,height:120},deviceScaleFactor:1});
for(const c of timeline){await captionPage.setContent(`<html><body style="margin:0;width:1920px;height:120px;background:#102e36;color:white;display:flex;align-items:center;justify-content:center;font:31px/1.3 Arial,sans-serif;text-align:center"><div style="max-width:1750px;padding:8px 25px">${escapeHtml(c.text)}</div></body></html>`);await captionPage.screenshot({path:`${BUILD}/captions/${String(c.id).padStart(2,'0')}.png`});}
await captionPage.close();
const selected=process.env.DEMO_SCENES ? new Set(process.env.DEMO_SCENES.split(',').map(Number)) : null;
const manifest=selected ? JSON.parse(await fs.readFile(`${BUILD}/capture.json`,'utf8')) : [];const errors=[];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function top(p){await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));}
async function nav(p,name){await p.getByRole('button',{name,exact:true}).click();await top(p);await wait(700);}
async function ready(p){await p.goto(BASE,{waitUntil:'networkidle'});await p.locator('[data-ready=true]').waitFor();await p.locator('.leaflet-tile-loaded').first().waitFor();await wait(1000);}
async function optimized(p){await p.getByRole('button',{name:'Optimize investment'}).click();await p.locator('.metric-feature strong').filter({hasText:'31.3%'}).waitFor();}
async function title(p,n){let bytes=await fs.readFile(`${ROOT}/submission/video/slides/slide-${n}.png`);await p.setContent(`<html><body style="margin:0;background:#102e36;display:flex;align-items:center;justify-content:center;height:100vh"><img style="height:100%;width:100%;object-fit:contain" src="data:image/png;base64,${bytes.toString('base64')}"></body></html>`);}
for(const c of timeline){
 if(selected && !selected.has(c.id))continue;
 const ctx=await browser.newContext({viewport:{width:1920,height:960},deviceScaleFactor:1,recordVideo:{dir:`${BUILD}/recordings`,size:{width:1920,height:960}}});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push({scene:c.id,message:e.message}));
 // Prepare each scene before the take. The full raw capture remains auditable.
 if(c.id===0)await title(p,1);
 else if(c.id===12)await title(p,6);
 else if(c.id===13)await title(p,8);
 else {await ready(p);if([6,7,8,11].includes(c.id))await optimized(p);if(c.id===3)await nav(p,'Evidence & method');if(c.id===9)await nav(p,'Host city atlas');if(c.id===11)await nav(p,'Legacy & delivery');if(c.id===8)await p.locator('.sensitivity').scrollIntoViewIfNeeded();}
 await wait(500);
 const begin=Date.now();
 await p.screenshot({path:`${BUILD}/scene-${String(c.id).padStart(2,'0')}-start.png`});
 const action=(async()=>{
  if(c.id===1){await wait(3500);await p.locator('#budget').hover();}
  if(c.id===2){await wait(3000);await p.locator('.leaflet-container').first().scrollIntoViewIfNeeded();}
  if(c.id===3){await wait(4500);await p.evaluate(()=>window.scrollTo({top:380,behavior:'smooth'}));}
  if(c.id===4){await wait(4000);await p.getByRole('button',{name:'Pin comparison'}).click();}
  if(c.id===5){await wait(2200);await p.getByRole('button',{name:'Pin comparison'}).click();await wait(800);await optimized(p);await top(p);}
  if(c.id===6){await wait(3000);await p.locator('.detail-grid').first().scrollIntoViewIfNeeded();}
  if(c.id===7){await wait(4500);await p.locator('.metrics').first().hover();}
  if(c.id===8){await wait(3200);await p.locator('#effectiveness').fill('60');await wait(2500);await p.locator('#effectiveness').fill('100');}
  if(c.id===9){await wait(4500);await p.getByRole('button',{name:'Philadelphia Philadelphia, PA'}).click();await wait(2000);await p.locator('.city-detail').scrollIntoViewIfNeeded();}
  if(c.id===10){await wait(900);await p.getByRole('button',{name:'Sign in to save plans'}).click();await p.getByRole('dialog').waitFor();await wait(5000);await p.getByRole('button',{name:'Close sign in'}).click();await p.getByRole('button',{name:'Export',exact:true}).click();await wait(1600);const dl=p.waitForEvent('download');await p.getByRole('button',{name:'Reproducible plan (.json)'}).click();const d=await dl;await d.saveAs(`${BUILD}/recorded-scenario.json`);}
  if(c.id===11){await wait(5000);await p.locator('.detail-grid').first().scrollIntoViewIfNeeded();}
 })();
 await action;
 await wait(Math.max(0,c.duration*1000-(Date.now()-begin)));
 await p.screenshot({path:`${BUILD}/scene-${String(c.id).padStart(2,'0')}-end.png`});
 const video=p.video();await ctx.close();const source=await video.path();
 const path=`${BUILD}/recordings/scene-${String(c.id).padStart(2,'0')}.webm`;await fs.rename(source,path);
 const meta=JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-of','json',path],{encoding:'utf8'}));
 // Trim setup footage. A take ends when the context closes, so select its last narrated duration.
 const start=Math.max(0,Number(meta.format.duration)-c.duration);
 const previous=manifest.findIndex(x=>x.id===c.id);if(previous>=0)manifest.splice(previous,1);manifest.push({id:c.id,scene:c.scene,path,start,duration:c.duration,base:BASE});manifest.sort((a,b)=>a.id-b.id);await fs.writeFile(`${BUILD}/capture.json`,JSON.stringify(manifest,null,2));
 console.log(`Recorded ${c.id+1}/${timeline.length}: ${c.scene} (${c.duration.toFixed(1)} s)`);
}
await browser.close();await fs.writeFile(`${BUILD}/browser-errors.json`,JSON.stringify(errors,null,2));if(errors.length)throw new Error(`Browser errors: ${JSON.stringify(errors)}`);
console.log('Recording complete. Public flows used real application state. Authentication success is not shown.');
