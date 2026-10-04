"""Separate Valve's unicorn.svg contours; no raster tracing or font substitution.
Run from repository root. Source C/E/L/S/T and separate details/stars remain
native contours. Unseen capitals use Celeste-specific curved serif skeletons.
"""
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
ns = {}
exec(Path('scripts/extract-solomon.py').read_text().split('paths = [')[0], ns)
outline = ns['outline']
d = next(ET.parse('public/references/celeste-wordmark.svg').getroot().iter('{http://www.w3.org/2000/svg}path')).attrib['d']
cs = re.findall(r'M[^M]+', d)
letters = {c: outline(cs[i]) for c, i in [('C',2),('E',7),('L',8),('S',14),('T',15)]}
ees = [outline(cs[i]) for i in [7,12,17]]
details = {c:outline(cs[i]) for c,i in [('C',5),('E',13),('L',18),('S',20),('T',21)]}
e_details = [outline(cs[i]) for i in [13,19,23]]
# Inferred strokes have flared ends, narrow proportions, rounded bowls and
# strongly contrasting stems/hairlines. They are not Harrow/Baba fallback fonts.
def poly(points):
    area=sum(x1*y2-x2*y1 for (x1,y1),(x2,y2) in zip(points,points[1:]+points[:1]))
    if area>0:points=list(reversed(points))
    return 'M'+'L'.join(f'{x} {y}' for x,y in points)+'Z'
def stem(x):
    return f'M{x-12} -280C{x+5} -268 {x+7} -267 {x+7} -246L{x+7} -36C{x+7} -14 {x+3} -12 {x-10} 0L{x+57} 0C{x+40} -10 {x+38} -14 {x+38} -36L{x+38} -246C{x+38} -264 {x+42} -270 {x+57} -280Z'
def bar(y,w): return poly([(0,y),(w,y-14),(w-5,y+9),(0,y+9)])
def diagonal(a,b,w):
    import math
    dx,dy=b[0]-a[0],b[1]-a[1];l=math.hypot(dx,dy);nx=-dy*w/l/2;ny=dx*w/l/2
    return poly([(a[0]+nx,a[1]+ny),(b[0]+nx,b[1]+ny),(b[0]-nx,b[1]-ny),(a[0]-nx,a[1]-ny)])
def oval(w=125):
    return f'M{w/2} -284C-18 -284 -18 0 {w/2} 0C{w+18} 0 {w+18} -284 {w/2} -284ZM{w/2} -272C{w-31} -272 {w-31} -12 {w/2} -12C31 -12 31 -272 {w/2} -272Z'
def curve():return 'M120 -275C-38 -335 -40 56 120 -8L122 -62C70 61 25 -48 32 -152C38 -267 72 -316 113 -223Z'
s=stem(0)
custom={
'A':diagonal((7,-4),(66,-278),12)+diagonal((66,-278),(125,-4),33)+bar(-100,111)+bar(-9,141),
'B':s+'M25 -280C167 -303 159 -156 69 -146C176 -155 182 12 25 0L25 -12C132 6 118 -141 38 -134L38 -150C115 -153 119 -282 25 -266Z',
'C':curve(), 'D':s+'M24 -280C190 -302 182 22 24 0L24 -12C131 12 132 -290 24 -268Z',
'F':s+bar(-280,123)+bar(-148,101), 'G':curve()+bar(-103,115)+stem(78),
'H':s+stem(88)+bar(-146,122), 'I':s,
'J':stem(50)+'M57 -72C57 13 11 16 0 -51L-9 -20C15 48 91 16 88 -68Z',
'K':s+diagonal((28,-132),(114,-270),13)+diagonal((37,-156),(122,-9),31)+bar(-10,138),
'M':s+stem(133)+diagonal((23,-276),(88,-28),21)+diagonal((87,-29),(145,-276),10),
'N':s+stem(100)+diagonal((23,-271),(125,-12),23), 'O':oval(),
'P':s+'M25 -280C181 -303 165 -116 25 -137L25 -151C126 -117 125 -289 25 -267Z',
'Q':oval()+diagonal((63,-58),(146,27),17),
'R':s+'M25 -280C181 -303 165 -116 25 -137L25 -151C126 -117 125 -289 25 -267Z'+diagonal((52,-141),(132,-7),30),
'U':stem(0)+stem(92)+'M7 -56C0 33 137 23 130 -56L119 -56C119 3 38 3 38 -56Z',
'V':diagonal((5,-271),(65,-5),32)+diagonal((65,-5),(127,-271),11)+bar(-280,142),
'W':diagonal((7,-271),(54,-5),30)+diagonal((54,-5),(95,-252),10)+diagonal((95,-252),(146,-5),30)+diagonal((146,-5),(190,-271),10)+bar(-280,206),
'X':diagonal((10,-270),(127,-8),30)+diagonal((123,-270),(9,-8),12)+bar(-280,142)+bar(-9,142),
'Y':diagonal((7,-271),(62,-140),30)+diagonal((121,-271),(62,-140),11)+stem(41),
'Z':bar(-280,132)+diagonal((119,-266),(8,-9),29)+bar(-9,133),
'-':bar(-124,65), "'":poly([(0,-280),(23,-280),(17,-234),(0,-211),(7,-246)])}
# Numerals are explicitly inferred too, sharing the narrow high-contrast hand.
custom.update({'0':oval(),'1':s,'2':curve()+diagonal((111,-210),(6,-9),25)+bar(-9,128),'3':custom['B'].replace(s,''),'4':diagonal((12,-114),(88,-278),12)+bar(-105,125)+stem(73),'5':bar(-280,122)+stem(0)+custom['B'].replace(s,''),'6':oval()+bar(-279,90),'7':bar(-280,126)+diagonal((110,-271),(30,-5),26),'8':oval(103),'9':oval()+stem(81)})
# Distinct numeral silhouettes rather than reusing capital B/O as digits.
custom.update({
'2':'M0 -228C-6 -318 151 -314 125 -217C111 -166 46 -96 12 -19L124 -19L121 0L0 0L0 -13C28 -75 97 -171 100 -231C104 -290 30 -303 15 -224Z',
'3':'M0 -265C58 -306 132 -279 126 -221C124 -181 102 -154 69 -142C108 -139 139 -108 129 -56C121 6 49 26 0 -13L6 -42C69 20 104 -22 99 -73C95 -127 64 -131 39 -133L39 -147C68 -152 91 -174 94 -222C101 -273 50 -291 8 -240Z',
'5':'M10 -280L120 -280L117 -259L26 -259L22 -167C148 -206 167 24 31 1L0 -13L7 -45C75 25 130 -71 89 -123C69 -148 34 -147 6 -137Z',
'6':'M117 -270C25 -334 -35 -161 4 -43C45 50 141 -1 133 -84C124 -159 51 -189 22 -133L21 -164C19 -239 65 -304 112 -241ZM29 -128C42 -165 106 -142 104 -70C110 5 37 13 29 -70Z',
'8':'M65 -284C-15 -293 -19 -174 33 -142C-24 -113 -16 13 65 0C148 10 153 -112 97 -143C145 -177 151 -288 65 -284ZM65 -271C112 -270 111 -162 65 -152C23 -163 22 -271 65 -271ZM65 -132C119 -122 113 -9 65 -12C14 -9 12 -122 65 -132Z',
'9':'M13 -12C105 52 165 -121 126 -239C85 -332 -11 -281 -3 -198C6 -123 79 -93 108 -149L109 -118C111 -43 65 22 18 -41ZM101 -154C88 -117 24 -140 26 -212C20 -287 93 -295 101 -212Z',
})
# Unify outer winding so overlapping stems/ribbons paint solid ink. Only
# oval inner contours reverse it, retaining their transparent counters.
def winding(d, char):
    result=[]
    for index,c in enumerate(re.findall(r'M[^M]+',d)):
        ts=re.findall(r'[MLCZ]|-?\d*\.?\d+',c);j=0;segments=[];pts=[];current=(0,0)
        while j<len(ts):
            op=ts[j];j+=1
            if op=='Z':continue
            n={'M':2,'L':2,'C':6}[op];v=list(map(float,ts[j:j+n]));j+=n
            end=tuple(v[-2:])
            if op=='M':current=end;pts.append(end);continue
            segments.append((op,current,v,end))
            if op=='C':
                x,y=current
                for k in range(1,33):
                    t=k/32;u=1-t;pts.append((u**3*x+3*u*u*t*v[0]+3*u*t*t*v[2]+t**3*v[4],u**3*y+3*u*u*t*v[1]+3*u*t*t*v[3]+t**3*v[5]))
            else:pts.append(end)
            current=end
        area=sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(pts,pts[1:]+pts[:1]))
        hole=(char in ['O','Q','0','6','9'] and index==1) or (char=='8' and index in [1,2])
        if (area>0)==hole:result.append(c);continue
        rev=f'M{current[0]} {current[1]}'
        for op,start,v,end in reversed(segments):
            rev+= ('C'+ ' '.join(map(str,[v[2],v[3],v[0],v[1],*start]))) if op=='C' else f'L{start[0]} {start[1]}'
        result.append(rev+'Z')
    return ''.join(result)
custom={c:winding(d,c) for c,d in custom.items()}
Path('src/lib/celeste-paths.json').write_text(json.dumps(dict(letters=letters,ees=ees,details=details,eDetails=e_details,dots=[outline(cs[i]) for i in [6,9,16,22,24]],stars=[outline(cs[i]) for i in [3,4,10,11,25,26]],underlines=[outline(cs[i]) for i in [1,0]],inferred={c:outline(v) for c,v in custom.items()}),indent=2)+'\n')
