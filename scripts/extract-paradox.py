"""Extract the inspected chrono.svg / PARADOX outlines and design unseen capitals.
Run from repository root; Python standard library only. No font or raster trace.
"""
import json, re, xml.etree.ElementTree as ET
from pathlib import Path
ns = {}
exec(Path('scripts/extract-solomon.py').read_text().split('paths = [')[0], ns)
bounds = ns['bounds']
paths = [p.attrib['d'] for p in ET.parse('public/references/paradox-wordmark.svg').getroot().iter('{http://www.w3.org/2000/svg}path')]
letters = {}
for c, indices in [('P',[6]),('A',[4,5]),('R',[0]),('D',[1]),('O',[3]),('X',[2])]:
    letters[c] = []
    for i in indices:
        contours = re.findall(r'M[^M]+', paths[i])
        letters[c].append({**bounds(contours[0]), 'ds':[contours[0]], 'counters':contours[1:]})
def poly(points): return 'M'+'L'.join(f'{x} {y}' for x,y in points)+'Z'
def rect(x,y,w,h): return poly([(x,y),(x+w,y),(x+w,y+h),(x,y+h)])
def capsule(w=318):
    return f'M120 0L{w-120} 0C{w-40} 0 {w} 42 {w} 115L{w} 315C{w} 390 {w-40} 430 {w-120} 430L120 430C40 430 0 390 0 315L0 115C0 42 40 0 120 0Z'
# Heavy horizontal bands and straight vertical walls share the source's massive
# proportions. Bowls stay solid by default like the source P/R/D.
custom = {
'B':['M0 0L215 0C285 0 320 45 320 112C320 162 299 196 271 211C309 226 330 264 330 317C330 392 290 430 215 430L0 430Z'],
'C':['M318 0L318 125L159 125L159 305L318 305L318 430L120 430C40 430 0 390 0 315L0 115C0 42 40 0 120 0Z'],
'E':[rect(0,0,159,430),rect(0,0,310,123),rect(0,155,285,120),rect(0,307,310,123)],
'F':[rect(0,0,159,430),rect(0,0,310,125),rect(0,166,282,125)],
'G':['M330 0L330 123L159 123L159 307L208 307L208 252L182 252L182 170L330 170L330 430L120 430C40 430 0 390 0 315L0 115C0 42 40 0 120 0Z'],
'H':[rect(0,0,145,430),rect(195,0,145,430),rect(0,151,340,128)],
'I':[rect(0,0,166,430)],
'J':['M166 0L325 0L325 315C325 390 281 430 205 430L0 430L0 302L166 302Z'],
'K':[rect(0,0,155,430),poly([(150,215),(242,0),(395,0),(292,215),(395,430),(242,430)])],
'L':[rect(0,0,166,430),rect(0,304,315,126)],
'M':[poly([(0,430),(0,0),(161,0),(219,155),(277,0),(438,0),(438,430),(293,430),(293,234),(253,330),(185,330),(145,234),(145,430)])],
'N':[rect(0,0,130,430),rect(230,0,130,430),poly([(100,0),(170,0),(260,430),(190,430)])],
'Q':[capsule(),poly([(173,295),(272,295),(351,430),(214,430)])],
'S':['M318 0L318 125L159 125L159 156L215 156C288 156 330 198 330 273L330 315C330 390 285 430 210 430L0 430L0 305L166 305L166 275L115 275C40 275 0 231 0 157L0 115C0 40 44 0 120 0Z'],
'T':[rect(0,0,360,132),rect(97,0,166,430)],
'U':['M0 0L150 0L150 300L190 300L190 0L340 0L340 315C340 391 297 430 221 430L119 430C43 430 0 391 0 315Z'],
'V':[poly([(0,0),(155,0),(205,247),(255,0),(410,0),(307,430),(103,430)])],
'W':[poly([(0,0),(143,0),(184,263),(220,152),(276,152),(312,263),(353,0),(496,0),(414,430),(288,430),(248,312),(208,430),(82,430)])],
'Y':[poly([(0,0),(155,0),(218,156),(281,0),(436,0),(301,275),(301,430),(135,430),(135,275)])],
'Z':[poly([(0,0),(340,0),(340,125),(177,305),(340,305),(340,430),(0,430),(0,305),(163,125),(0,125)])],
'0':[capsule()],
'1':[rect(67,0,166,430),poly([(0,42),(67,0),(67,138),(0,154)])],
'2':['M0 0L215 0C288 0 330 43 330 116L330 156C330 197 305 228 264 258L189 305L330 305L330 430L0 430L0 305L171 172L171 125L0 125Z'],
'3':['M0 0L210 0C287 0 330 40 330 112C330 162 310 194 280 215C310 236 330 268 330 318C330 390 287 430 210 430L0 430L0 305L163 305L163 276L75 276L75 154L163 154L163 125L0 125Z'],
'4':[rect(186,0,144,430),poly([(82,0),(186,0),(141,201),(330,201),(330,326),(0,326),(0,201)])],
'5':['M0 0L330 0L330 125L159 125L159 155L211 155C286 155 330 199 330 274L330 315C330 390 286 430 211 430L0 430L0 305L166 305L166 275L0 275Z'],
'6':['M120 0L318 0L318 123L159 123L159 157L205 157C280 157 318 197 318 270L318 315C318 390 278 430 198 430L120 430C40 430 0 390 0 315L0 115C0 42 40 0 120 0Z'],
'7':[poly([(0,0),(340,0),(340,123),(206,430),(44,430),(173,125),(0,125)])],
'8':['M115 0L215 0C287 0 330 40 330 112C330 162 310 194 280 215C310 236 330 268 330 318C330 390 287 430 215 430L115 430C43 430 0 390 0 318C0 268 20 236 50 215C20 194 0 162 0 112C0 40 43 0 115 0Z'],
'9':['M120 0L198 0C278 0 318 40 318 115L318 315C318 388 278 430 198 430L0 430L0 307L159 307L159 273L113 273C38 273 0 233 0 160L0 115C0 40 40 0 120 0Z'],
'-':[rect(0,166,176,98)],
"'": [poly([(0,0),(83,0),(83,105),(30,156),(0,156)])],
}
inferred = {c:[{**bounds(''.join(ds)), 'ds':ds, 'counters':[]}] for c,ds in custom.items()}
# Reuse side-profile sampling with no execution of other extraction scripts.
exec('def profile('+Path('scripts/extract-venator.py').read_text().split('def profile(')[1].split('for collection in')[0], ns)
# Helpers sample actual ink, rather than guessing a counter over a thin bar.
helpers = Path('scripts/extract-viscous.py').read_text().split('def polygon(')[1].split('for c,forms in')[0]
exec('def polygon('+helpers, ns)
# Native O counter is the template for explicitly requested inferred counters.
source = letters['O'][0]['counters'][0]
cb = bounds(source)
def counter(cx,cy,scale=1):
    tokens = re.findall(r'[MLCHVZ]|-?\d*\.?\d+(?:e[-+]?\d+)?',source,re.I)
    out=[];i=0
    while i<len(tokens):
        cmd=tokens[i];i+=1;n={'M':2,'L':2,'C':6,'H':1,'V':1,'Z':0}[cmd]
        values=list(map(float,tokens[i:i+n]));i+=n
        out.append(cmd+' '.join(f'{(v-(cb["x"]+cb["w"]/2 if j%2==0 else cb["y"]+cb["h"]/2))*scale+(cx if j%2==0 else cy):.3f}' for j,v in enumerate(values)))
    return ''.join(out)
for c, forms in {**letters,**inferred}.items():
    for p in forms:
        p['profile']=ns['profile'](''.join(p['ds']),p['x'])
        if p['counters']:continue
        if c not in 'BPDRQ0689':continue
        cx=p['x']+p['w']*(.66 if c in 'PR' else .5)
        cy=132 if c in 'PR9' else 295 if c=='6' else 215
        cut=counter(cx,cy,.7 if c in 'PR69' else 1)
        groups=[ns['polygon'](d) for d in p['ds']]
        # All sampled contour points and a safety halo must stay in solid ink.
        inside=lambda x,y:any(sum(ns['inside'](poly,x,y) for poly in group)%2 for group in groups)
        if not all(inside(x+dx,y+dy) for poly in ns['polygon'](cut) for x,y in poly for dx,dy in [(0,0),(-8,0),(8,0),(0,-8),(0,8)]):
            raise ValueError(f'Counter does not fit {c}')
        p['counters']=[cut]
# Source-relative bearings for the seven letters, retaining A variant geometry.
sequence=[letters[c][1 if c=='A' and i==3 else 0] for i,c in enumerate('PARADOX')]
gaps={a+b: sequence[i+1]['x']-sequence[i]['x']-sequence[i]['w'] for i,(a,b) in enumerate(zip('PARADOX','ARADOX'))}
Path('src/lib/paradox-paths.json').write_text(json.dumps({'letters':letters,'inferred':inferred,'gaps':gaps},indent=2))
