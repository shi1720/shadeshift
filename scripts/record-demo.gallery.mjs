import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
const source=await browser.newPage({viewport:{width:1512,height:1050}});
await source.goto('https://shadeshift-city.web.app',{waitUntil:'networkidle'});
await source.locator('[data-ready=true]').waitFor();
await source.getByRole('button',{name:'Optimize investment'}).click();
await source.locator('.metric-feature strong').filter({hasText:'31.3%'}).waitFor();
await source.waitForTimeout(1500);
const map=await source.locator('.geography').screenshot();
await fs.writeFile('/tmp/shadeshift-video-build/optimized-map.png',map);
await source.close();
for(const [filename,width,height] of [['YouTube-Thumbnail.png',1280,720],['Devpost-Gallery.png',1200,800]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const gallery=height===800;
 await page.setContent(`<html><head><style>*{box-sizing:border-box}body{margin:0;background:#102e36;color:#fff;font-family:Arial,sans-serif}.wrap{padding:52px;display:grid;grid-template-columns:${gallery?'530px 1fr':'620px 1fr'};gap:28px;height:100vh}.brand{font-size:36px;font-weight:bold;color:#d1f36d;margin-bottom:${gallery?'74':'55'}px}.title{font-size:${gallery?'67':'74'}px;line-height:1.06;font-weight:700;letter-spacing:-2.5px;margin:0 0 26px}.subtitle{font-size:25px;color:#c8dad3;max-width:490px;line-height:1.3}.metric{font-size:57px;font-weight:bold;color:#d1f36d;margin-top:${gallery?'65':'40'}px}.metric-label{font-size:21px;line-height:1.3;max-width:480px;color:#fff;margin-top:4px}.context{font-size:15px;color:#bed1c9;margin-top:22px;line-height:1.4}.image{align-self:center;background:#fff;border-radius:8px;overflow:hidden}.image img{display:block;width:100%;height:auto}.url{font-size:17px;color:#d1f36d;margin-top:22px}</style></head><body><div class="wrap"><div><div class="brand">ShadeShift.</div><h1 class="title">A funded<br>shade plan.</h1><div class="subtitle">Put an event's preparation budget<br>where it can reduce time in the sun.</div><div class="metric">31.25%</div><div class="metric-label">modeled direct-sun exposure reduction<br>in the illustrated Houston scenario</div><div class="context">$70,000 selected spend. Planning assumptions.<br>No measured health outcome claimed.</div>${gallery?'<div class="url">shadeshift-city.web.app</div>':''}</div><div class="image"><img src="data:image/png;base64,${map.toString('base64')}" alt="Actual ShadeShift Houston map"></div></div></body></html>`);
 await page.screenshot({path:`submission/video/${filename}`});await page.close();
}
await browser.close();
