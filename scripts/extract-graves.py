"""Reconstruct Graves glyphs from inspected necro.svg fragments.
Reference fractures remain original contours. Bridges and shared R/A, V/E, E/S
boundaries are reconstructed; unseen capitals are explicit heavy serif designs.
Run from the repository root; standard-library Python only.
"""
import json
import xml.etree.ElementTree as ET
from pathlib import Path
ns = {}
exec(Path('scripts/extract-solomon.py').read_text().split('paths = [')[0], ns)
ps = [p.attrib['d'] for p in ET.parse('public/references/graves-wordmark.svg').getroot().iter('{http://www.w3.org/2000/svg}path')]
def poly(points): return 'M'+'L'.join(f'{x} {y}' for x,y in points)+'Z'
# Original reference placement; compound R/A, V/E and E/S contours need boundaries.
groups = {'G':(0,326.262,[0,1,4,8,9,14]),'R':(317.331,235,[2,15]),'A':(547.382,266.854,[6,16,15]),'V':(731.348,252.638,[12]),'E':(967.119,211.251,[10]),'S':(1178.37,270.63,[3,5,7,11,10])}
letters = {c:dict(x=x,w=w,y=0,h=353,ds=[ps[i] for i in ids],bridges=[]) for c,(x,w,ids) in groups.items()}
# Path 13 joins V's right serif to E's upper-left fragment at (983.986,
# 50.5776). Split there, retaining every original exterior curve. The short
# vertical seam reconnects the two pieces in the preset without inventing ink.
e_head, v_tail = ps[13].split('H903.801', 1)
letters['V']['ds'].append('M983.986 50.5776V24.228H903.801' + v_tail)
letters['E']['ds'].insert(0, e_head + 'H983.986V50.5776Z')
def rect(x,y,w,h):return poly([(x,y),(x+w,y),(x+w,y+h),(x,y+h)])
def stem(x,w=64):return poly([(x-14,27),(x+w+14,27),(x+w+14,35),(x+w,50),(x+w,265),(x+w+14,284),(x+w+14,291),(x-14,291),(x-14,284),(x,265),(x,50),(x-14,35)])
def diag(a,b,w):
 import math
 dx=b[0]-a[0];dy=b[1]-a[1];l=math.hypot(dx,dy);nx=-dy*w/l/2;ny=dx*w/l/2
 return poly([(a[0]+nx,a[1]+ny),(b[0]+nx,b[1]+ny),(b[0]-nx,b[1]-ny),(a[0]-nx,a[1]-ny)])
def ring(w=214): return f'M{w/2} 21C-38 21 -38 297 {w/2} 297C{w+38} 297 {w+38} 21 {w/2} 21ZM{w/2} 87C{w-61} 87 {w-61} 231 {w/2} 231C61 231 61 87 {w/2} 87Z'
def bowl(y,h):return f'M48 {y}H117C253 {y} 253 {y+h} 117 {y+h}H48ZM73 {y+53}V{y+h-53}H111C171 {y+h-53} 171 {y+53} 111 {y+53}Z'
l=stem(14);bar=lambda y,w=200:rect(14,y,w,53)
custom={
'B':[l,bowl(27,134),bowl(150,141)], 'C':['M208 31C-48 -45 -51 362 208 285L216 208C60 307 42 22 210 111Z'],
'D':[l,bowl(27,264)],'F':[l,bar(27),bar(143,158),rect(180,27,34,70)],
'H':[l,stem(153),bar(140,181)],'I':[stem(14)],
'J':[stem(129),'M129 202C133 300 -8 321 0 232L53 225C48 275 129 264 129 202Z'],
'K':[l,diag((75,163),(202,43),49),diag((85,154),(213,280),69),bar(27,214),bar(265,214)],
'L':[l,bar(238),poly([(169,238),(214,203),(227,291),(164,291)])],
'M':[l,stem(219),diag((60,40),(155,214),63),diag((155,214),(246,40),63)],
'N':[l,stem(175),diag((68,47),(198,271),66)],'O':[ring()],
'P':[l,bowl(27,165)],'Q':[ring(),diag((127,229),(236,321),45)],
'T':[stem(94),rect(0,27,268,54),poly([(0,27),(33,27),(33,95),(0,117)]),poly([(235,27),(268,27),(268,117),(235,95)])],
'U':[l,stem(158),'M14 216C14 334 222 334 222 216H158C158 259 78 259 78 216Z'],
'W':[diag((37,34),(98,281),70),diag((98,281),(164,102),57),diag((164,102),(230,281),57),diag((230,281),(293,34),70),rect(0,27,330,23)],
'X':[diag((42,40),(208,279),70),diag((208,40),(42,279),58),rect(0,27,250,23),rect(0,268,250,23)],
'Y':[diag((35,40),(124,164),65),diag((218,40),(124,164),65),rect(93,145,64,146),rect(78,268,94,23),rect(0,27,251,23)],
'Z':[bar(27,223),diag((207,54),(44,266),65),bar(238,223)],
'0':[ring(188)],'1':[stem(35),poly([(0,74),(35,27),(99,27),(99,80)])],
'2':['M0 87C0 -12 235 -9 214 110C203 165 112 191 74 237H217V291H0V239C44 170 145 142 146 97C148 66 64 57 62 99Z'],
'3':['M0 45C210 -43 282 130 165 152C295 195 226 363 0 276L13 215C124 260 202 198 100 181H62V129H104C190 116 133 56 10 105Z'],
'4':[diag((17,182),(121,42),57),rect(0,178,224,53),stem(135)],
'5':[rect(0,27,213,54),rect(0,27,62,137),'M0 141C295 42 290 372 0 275L12 216C178 293 212 132 0 204Z'],
'6':['M197 28C5 -39 -62 299 101 297C247 310 253 101 80 130C82 81 129 63 190 91ZM99 180C158 176 167 244 106 245C64 248 58 190 99 180Z'],'7':[rect(0,27,222,54),diag((186,66),(74,278),63)],
'8':['M109 21C-23 15 -23 122 49 153C-41 193 -11 297 109 297C229 297 259 193 169 153C241 122 241 15 109 21ZM109 74C164 74 164 127 109 127C54 127 54 74 109 74ZM109 182C174 182 174 244 109 244C44 244 44 182 109 182Z'],'9':['M0 288C192 355 259 17 96 19C-50 6 -56 215 117 186C115 235 68 253 7 225ZM98 136C39 140 30 72 91 71C133 68 139 126 98 136Z'],
'-':[rect(0,145,103,42)],"'": [poly([(0,27),(48,27),(40,89),(10,114),(20,77),(0,77)])]}
# Bounds are conservative unions of separate filled components; counters are
# local even-odd paths, never a global xor of overlapping stems.
inferred={}
for c,ds in custom.items():
 bs=[ns['bounds'](d) for d in ds];x=min(b['x'] for b in bs);y=min(b['y'] for b in bs)
 inferred[c]=dict(ds=ds,x=x,y=y,w=max(b['x']+b['w'] for b in bs)-x,h=max(b['y']+b['h'] for b in bs)-y,bridges=[])
# Intact envelopes reconnect the structural gaps without filling counters.
# These are deliberately disclosed reconstructions, not additional source paths.
solid = {
'G':'M285 5L299 118L265 99C234 81 189 73 155 83C53 108 67 254 160 273C182 277 211 275 231 267V206H192C177 206 163 210 145 216L161 140H325C315 155 311 171 311 185V284C312 296 315 304 319 311C280 341 239 350 194 353C109 357 34 317 8 234L10 216L3 211C-2 182 -1 151 7 122L19 93C49 34 107 3 172 0C216 -1 257 15 285 5Z',
'R':'M317 27H460C509 27 548 55 548 112C548 147 527 177 495 190L548 269L552 291H481L427 198H405V247C405 269 413 282 421 291H317C330 279 336 268 337 256V74C337 55 333 42 317 32ZM405 82V143H450C489 143 489 82 450 82Z',
'A':'M605 27H710L769 198C776 216 784 244 794 262C799 271 806 280 814 291H714C731 275 721 255 716 240H638L625 242C620 257 612 275 628 291H552C547 286 543 281 533 285L548 268C555 252 560 239 569 214L613 90C623 62 629 44 605 31ZM644 185H698L671 103Z',
'V':'M732 24H834C826 34 825 45 830 69L869 177L905 77C912 57 918 42 903 24H984V51L950 134L903 256L869 344L845 290L765 81L755 59C750 46 742 37 732 28Z',
'E':'M967 24H1158L1173 100C1150 85 1129 79 1106 79H1054V126H1085C1107 126 1122 124 1137 111V193C1124 182 1114 179 1103 179H1054V233H1120C1140 233 1159 226 1178 211L1166 288H967C980 276 986 263 986 247V74C986 65 986 58 984 51L967 28Z',
'S':'M1414 9L1428 115C1395 92 1365 77 1330 73C1290 67 1260 77 1276 112C1285 122 1312 125 1325 129C1402 141 1446 176 1449 237L1445 273C1429 341 1356 359 1294 351C1250 339 1229 335 1202 345L1178 226C1210 255 1258 275 1314 278C1366 278 1372 236 1322 221C1300 216 1265 212 1231 196L1202 170C1183 145 1180 110 1187 81C1200 27 1250 -7 1347 4C1370 20 1395 13 1414 9Z'
}
for c,d in solid.items(): letters[c]['bridges']=[d]

# Fit curated cuts to actual ink intervals (curves sampled densely). No cut is
# longer than its connected ink run; small counters and narrow pieces survive.
import re

def contours(d):
 ts=re.findall(r'[MLCHVZ]|-?\d*\.?\d+(?:e[-+]?\d+)?',d,re.I);j=0;result=[];pts=[];x=y=0
 while j<len(ts):
  op=ts[j];j+=1;n={'M':2,'L':2,'C':6,'H':1,'V':1,'Z':0}[op];v=list(map(float,ts[j:j+n]));j+=n
  if op=='M':
   if pts:result.append(pts)
   x,y=v;pts=[(x,y)]
  elif op=='L':x,y=v;pts.append((x,y))
  elif op=='H':x=v[0];pts.append((x,y))
  elif op=='V':y=v[0];pts.append((x,y))
  elif op=='C':
   for k in range(1,65):
    t=k/64;u=1-t;pts.append((u**3*x+3*u*u*t*v[0]+3*u*t*t*v[2]+t**3*v[4],u**3*y+3*u*u*t*v[1]+3*u*t*t*v[3]+t**3*v[5]))
   x,y=v[-2:]
  elif op=='Z':
   if pts:result.append(pts);pts=[]
 if pts:result.append(pts)
 return result

def contains(p,cs):
 x,y=p;inside=False
 for pts in cs:
  for (a,b),(c,d) in zip(pts,pts[1:]+pts[:1]):
   if (b>y)!=(d>y) and x<(c-a)*(y-b)/(d-b)+a:inside=not inside
 return inside
for c,g in {**letters,**inferred}.items():
 shapes=[contours(d) for d in g['ds']+g['bridges']]
 def ink(x,y):return g['x']<=x<=g['x']+g['w'] and any(contains((x,y),cs) for cs in shapes)
 def run(vertical,position):
  start=g['y'] if vertical else g['x'];length=g['h'] if vertical else g['w'];runs=[];first=None
  for n in range(int(length)+2):
   v=start+n;yes=ink(position,v) if vertical else ink(v,position)
   if yes and first is None:first=v
   if not yes and first is not None:runs.append((first,v-1));first=None
  return max(runs,key=lambda p:p[1]-p[0],default=(0,0))
 patterns=[]
 for vertical,fraction in [(False,.38),(True,.34),(False,.69)]:
  pos=(g['x']+g['w']*fraction) if vertical else (g['y']+g['h']*fraction)
  a,b=run(vertical,pos)
  if b-a<26:patterns.append([]);continue
  # Reach one contour edge, stop inside thick ink. Jaggedness is restrained.
  stop=a+(b-a)*.82
  coords=[(a-2,pos),(a+(b-a)*.28,pos+2),(a+(b-a)*.46,pos-2),(stop,pos+1)]
  if vertical:coords=[(y,x) for x,y in coords]
  # Shift source coordinates to local normalized ink coordinates.
  coords=[(round(x-g['x'],2),round(y,2)) for x,y in coords]
  patterns.append([dict(d='M'+'L'.join(f'{x} {y}' for x,y in coords),width=min(4.2,(b-a)*.07))])
 g['patterns']=patterns
Path('src/lib/graves-paths.json').write_text(json.dumps(dict(letters=letters,inferred=inferred),indent=2)+'\n')
