import json,urllib.request,urllib.parse,statistics,math
from pathlib import Path
import argparse
from datetime import datetime, timezone
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description='Rebuild the host weather benchmark from pinned raw ERA5 data, or refresh it explicitly.')
parser.add_argument('--refresh',action='store_true',help='Request ERA5 from Open-Meteo (educational/noncommercial service terms apply).')
args=parser.parse_args()
venues=json.loads((ROOT/'public/data/host-venues.json').read_text())['cities']
params={'latitude':','.join(str(v['latitude']) for v in venues),'longitude':','.join(str(v['longitude']) for v in venues),'start_date':'2025-06-01','end_date':'2025-07-19','hourly':'temperature_2m,relative_humidity_2m','timezone':','.join(v['timezone'] for v in venues),'models':'era5'}
url='https://archive-api.open-meteo.com/v1/archive?'+urllib.parse.urlencode(params)
raw_path=ROOT/'public/data/host-climate-raw-2025.json'
if args.refresh:
 request=urllib.request.Request(url,headers={'User-Agent':'ShadeShift-Educational/1.0'})
 raw=json.load(urllib.request.urlopen(request,timeout=60))
else:
 raw=json.loads(raw_path.read_text())
assert len(raw)==11, 'Expected exactly eleven venue responses'

def hi(c,r):
 t=c*9/5+32
 simple=(0.5*(t+61+(t-68)*1.2+r*.094)+t)/2
 if simple<80:return simple
 h=-42.379+2.04901523*t+10.14333127*r-.22475541*t*r-.00683783*t*t-.05481717*r*r+.00122874*t*t*r+.00085282*t*r*r-.00000199*t*t*r*r
 if r<13 and 80<=t<=112:h-=((13-r)/4)*math.sqrt((17-abs(t-95))/17)
 elif r>85 and 80<=t<=87:h+=(r-85)/10*(87-t)/5
 return h
for v,d in zip(venues,raw):
 assert abs(d['latitude']-v['latitude'])<.3 and abs(d['longitude']-v['longitude'])<.3, 'Weather/venue order mismatch'
 h=d['hourly'];rows=[{'localTime':t,'temperatureC':c,'relativeHumidity':r,'heatIndexF':round(hi(c,r),2)} for t,c,r in zip(h['time'],h['temperature_2m'],h['relative_humidity_2m']) if t.endswith('T15:00')]
 assert len(rows)==49 and all(r['temperatureC'] is not None for r in rows)
 vs=sorted(r['heatIndexF'] for r in rows)
 v.update(gridLatitude=d['latitude'],gridLongitude=d['longitude'],sampleCount=len(rows),medianTemperatureC=round(statistics.median(r['temperatureC'] for r in rows),1),medianHumidity=round(statistics.median(r['relativeHumidity'] for r in rows),1),medianHeatIndexF=round(statistics.median(vs),1),p95HeatIndexF=round(vs[math.ceil(.95*len(vs))-1],1),daysHeatIndexAbove90=sum(x>=90 for x in vs),daysHeatIndexAbove100=sum(x>=100 for x in vs),afternoons=rows)
 print(v['city'],v['medianHeatIndexF'],v['p95HeatIndexF'],v['daysHeatIndexAbove90'])
meta={'title':'2025 early-summer afternoon heat screening at 11 US host venues','retrievedAt':'2026-09-18','startDate':'2025-06-01','endDate':'2025-07-19','timeOfDay':'15:00 local venue time','sampleCountPerVenue':49,'weatherSource':'Open-Meteo Historical Weather API / ERA5 (ECMWF Copernicus)','weatherSourceUrl':'https://open-meteo.com/en/docs/historical-weather-api','requestUrl':url,'weatherModel':'era5','nominalResolution':'0.25 degrees (~25 km)','weatherDataLicense':'CC BY 4.0; attribution Open-Meteo, ECMWF ERA5 / Copernicus Climate Change Service','serviceTerms':'Free API is noncommercial; commercial service needs paid subscription or self-hosting. Snapshot distributed with attribution.','coordinateSource':'Wikipedia Geosearch/Coordinates API; stadium centroids approximate, independently linked per venue. Official organizer catalog supplies host-to-venue identities, not coordinates.','hostVenueIdentitySource':'https://github.com/HoustonSI/WorldCupUSSpatialData101','heatIndexMethod':'NWS Rothfusz regression with low/high humidity adjustments; simple heat-index preliminary calculation averaged with air temperature below 80F. Degrees Fahrenheit. p95 uses nearest rank ceil(0.95*n), 47th sorted sample of49.','heatIndexSource':'https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml','limitations':['Historical modeled grid weather, not stadium observations, street microclimate, WBGT, medical risk or a 2026 forecast.','Only49 afternoons in one prior summer: a comparable screening window, not a climate normal or future prediction.','Ranks may change with date/time/model; climate priority alone is not readiness or investment priority.','Heat index refers to shade/light winds and does not model solar exposure. Values below80F are comfort context, not severe-heat warning.','p95 is a sample percentile, not an uncertainty bound.']}
if args.refresh:
 meta['retrievedAt']=datetime.now(timezone.utc).date().isoformat()
 raw_path.write_text(json.dumps(raw))
(ROOT/'public/data/host-climate-2025.json').write_text(json.dumps({'metadata':meta,'cities':venues},indent=2))
(ROOT/'public/data/host-venues.json').write_text(json.dumps({'metadata':{k:meta[k] for k in ['retrievedAt','coordinateSource','hostVenueIdentitySource']},'cities':[{k:v[k] for k in ['id','city','venue','municipality','timezone','latitude','longitude','coordinateSource']} for v in venues]},indent=2))
