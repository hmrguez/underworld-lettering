"""Split Valve's priest.svg compound path into glyph/ornament contours.

Run from the repository root. Source via DeadlockSkins.gg, verified against
https://www.playdeadlock.com/oldgods (splash_venator.png). No font or raster trace.
Native coordinates and counter/wear contours are retained.
"""
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

# Reuse the cubic-extrema utility without executing Solomon's extraction.
namespace = {}
exec(Path('scripts/extract-solomon.py').read_text().split('paths = [')[0], namespace)
outline = namespace['outline']
d = next(ET.parse('public/references/venator-wordmark.svg').getroot().iter('{http://www.w3.org/2000/svg}path')).attrib['d']
contours = re.findall(r'M[^M]+', d)
ranges = {'V': (65, 78), 'E': (20, 30), 'N': (89, len(contours)), 'A': (49, 65), 'T': (79, 88), 'O': (2, 15), 'R': (30, 49)}
letters = {c: outline(''.join(contours[a:b]) + (contours[88] if c == 'E' else '')) for c, (a, b) in ranges.items()}
# Custom inferred lowercase-form alphabet: 245-unit body, wedge shoulders,
# 65-unit stems and angular bowls. Explicit polygons, not a blackletter font.
def poly(points, outer=True):
    area = sum(x1*y2 - x2*y1 for (x1,y1),(x2,y2) in zip(points, points[1:] + points[:1]))
    if (area > 0) != outer:
        points = list(reversed(points))
    return 'M' + 'L'.join(f'{x} {y}' for x,y in points) + 'Z'
def stem(x, top=110, bottom=340, width=62):
    return poly([(x-14,top+27),(x+29,top-9),(x+width,top+17),(x+width, bottom-24),(x+width+16,bottom-12),(x+28,bottom+10),(x,bottom-8),(x,top+35)])
def bowl(top=105,bottom=343,width=175):
    return poly([(0,top+45),(width*.52,top),(width,top+47),(width,bottom-43),(width*.52,bottom),(0,bottom-45)]) + poly([(66,bottom-65),(width-65,bottom-44),(width-65,top+69),(66,top+48)], outer=False)
def ribbon(a,b,width):
    import math
    dx,dy=b[0]-a[0],b[1]-a[1]
    length=math.hypot(dx,dy); nx=-dy*width/length/2; ny=dx*width/length/2
    return poly([(a[0]+nx,a[1]+ny),(b[0]+nx,b[1]+ny),(b[0]-nx,b[1]-ny),(a[0]-nx,a[1]-ny)])
def bar(y,w=155):
    return poly([(20,y+17),(w-20,y-12),(w,y+17),(w-20,y+40),(20,y+47)])
def open_bowl():
    return poly([(0,150),(92,105),(175,151),(146,187),(110,158),(66,151),(66,282),(113,302),(168,278),(176,298),(126,343),(0,304)])
s=stem(0); tall=stem(0,35)
custom={
'B': [tall,bowl()], 'C':[open_bowl()], 'D':[bowl(),stem(112,35)],
'F':[stem(28,35),bar(113,165),bar(195,143)], 'G':[open_bowl(),stem(111,235,395,55)],
'H':[tall,stem(115),bar(193,162)], 'I':[stem(0)],
'J':[stem(25,110,355),poly([(25,315),(87,335),(87,377),(32,415),(-28,388),(0,364),(25,377)])],
'K':[tall,ribbon((66,227),(151,128),42),ribbon((77,216),(161,316),58)],
'L':[stem(0,35)], 'M':[stem(0),stem(104),stem(208),bar(113,263)],
'P':[stem(0,110,411),bowl(105,288)], 'Q':[bowl(),ribbon((113,290),(181,393),35)],
'S':[poly([(0,151),(86,105),(169,143),(142,180),(78,149),(61,187),(160,235),(174,299),(90,343),(0,302),(25,265),(91,299),(111,261),(14,216)])],
'U':[stem(0),stem(114),bar(296,171)],
'V':[poly([(-14,137),(30,105),(63,127),(63,284),(98,306),(116,289),(116,127),(149,105),(178,133),(178,298),(99,348),(0,304),(0,153)])],
'W':[stem(0),stem(106),stem(212),bar(296,270)],
'X':[ribbon((22,130),(149,319),62),ribbon((145,132),(20,319),37),bar(112,177),bar(298,173)],
'Y':[stem(0,110,280),stem(114,110,379),bar(249,170),poly([(114,354),(176,361),(124,413),(30,394),(48,366),(102,379)])],
'Z':[bar(112,184),ribbon((141,151),(30,299),60),bar(297,184)],
'-':[poly([(0,215),(86,215),(86,244),(0,244)])],
"'": [poly([(0,107),(35,107),(35,149),(8,178),(0,167),(12,147),(0,147)])],
}
# Numerals are custom angular bowls/stems, with the same pointed terminals.
custom.update({
'0':[bowl()], '1':[stem(0)],
'2':[bar(112,177),ribbon((139,149),(29,299),60),bar(297,177)],
'3':[poly([(0,145),(87,105),(168,145),(168,202),(135,224),(168,245),(168,304),(87,343),(0,306),(22,275),(98,301),(106,257),(63,239),(63,210),(106,191),(100,147),(23,177)])],
'4':[ribbon((29,125),(5,248),44),bar(237,170),stem(108)],
'5':[bar(112,172),poly([(0,133),(62,133),(62,203),(122,203),(173,243),(173,303),(91,343),(0,309),(22,275),(105,302),(110,252),(0,221)])],
'6':[bowl(197,343),stem(0,110,310),bar(112,151)],
'7':[bar(112,172),ribbon((130,148),(61,325),62)],
'8':[bowl(105,229),bowl(223,343)],
'9':[bowl(105,252),stem(113,147,340)],
})
inferred={c:outline(''.join(ds)) for c,ds in custom.items()}
# An alternate changes the pointed shoulder, rather than scaling the glyph.
alternates={c:outline(''.join(ds)+poly([(20,125),(39,82),(60,125)])) for c,ds in custom.items() if c.isalpha() and c!='V'}

# Conservative 9-unit horizontal ink bands. Sample cubic segments densely,
# retaining extrema in bounds; pair clearance uses actual side profiles.
def profile(d, origin):
    tokens=re.findall(r'[MLCHVZ]|-?\d*\.?\d+(?:e[-+]?\d+)?',d,re.I)
    i=0; x=y=0; start=(0,0); edges=[]
    while i<len(tokens):
        command=tokens[i];i+=1
        n={'M':2,'L':2,'C':6,'H':1,'V':1,'Z':0}[command]
        v=list(map(float,tokens[i:i+n]));i+=n
        if command=='M': x,y=v;start=(x,y);continue
        pts=[]
        if command=='C':
            for j in range(1,65):
                t=j/64;u=1-t
                pts.append((u**3*x+3*u*u*t*v[0]+3*u*t*t*v[2]+t**3*v[4],u**3*y+3*u*u*t*v[1]+3*u*t*t*v[3]+t**3*v[5]))
        elif command=='L': pts=[tuple(v)]
        elif command=='H': pts=[(v[0],y)]
        elif command=='V': pts=[(x,v[0])]
        else: pts=[start]
        for px,py in pts:
            edges.append((x,y,px,py));x,y=px,py
    result=[]
    for band in range(50):
        xs=[];low=band*9;high=low+9
        for x1,y1,x2,y2 in edges:
            if max(y1,y2)<low or min(y1,y2)>high:continue
            if low<=y1<=high:xs.append(x1)
            if low<=y2<=high:xs.append(x2)
            if y1!=y2:
                for yy in (low,high):
                    t=(yy-y1)/(y2-y1)
                    if 0<=t<=1:xs.append(x1+t*(x2-x1))
        result.append([round(min(xs)-origin,3),round(max(xs)-origin,3)] if xs else None)
    return result
for collection in (letters,inferred,alternates):
    for p in collection.values(): p['profile']=profile(p['d'],p['x'])
Path('src/lib/venator-paths.json').write_text(json.dumps({
    'letters': letters, 'inferred': inferred, 'alternates': alternates,
    'initialOrnamentOffset': outline(''.join(contours[15:20]))['x'] + outline(''.join(contours[15:20]))['w']/2 - (letters['V']['x'] + letters['R']['x'] + letters['R']['w'])/2,
    'diamonds': [outline(''.join(contours[:2])), outline(contours[78])],
    'inscription': outline(''.join(contours[15:20])),
},indent=2)+'\n')
