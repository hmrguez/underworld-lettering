"""Extract Valve Viscous contours via DeadlockSkins.gg and design unseen forms.
Standard-library only; run from repository root. No font or image tracing.
"""
import json, math, re, xml.etree.ElementTree as ET
from pathlib import Path
ns={}
exec(Path('scripts/extract-solomon.py').read_text().split('paths = [')[0],ns)
outline=ns['outline']
d=next(ET.parse('public/references/viscous-wordmark.svg').getroot().iter('{http://www.w3.org/2000/svg}path')).attrib['d']
cs=re.findall(r'M[^M]+',d)
# Tiny contour 3 belongs to O's native surface detail, not another letter.
letters={c:[outline(cs[i])] for c,i in [('V',4),('I',2),('S',0),('C',1),('O',6),('U',10)]}
letters['S'].append(outline(cs[5]))
# Cubic Catmull-Rom outline around explicit swollen stroke skeletons.
def smooth(points):
    out=f'M{points[0][0]:.3f} {points[0][1]:.3f}'
    for i,p in enumerate(points):
        a=points[(i-1)%len(points)];b=points[(i+1)%len(points)];c=points[(i+2)%len(points)]
        out+=f'C{p[0]+(b[0]-a[0])/6:.3f} {p[1]+(b[1]-a[1])/6:.3f} {b[0]-(c[0]-p[0])/6:.3f} {b[1]-(c[1]-p[1])/6:.3f} {b[0]:.3f} {b[1]:.3f}'
    return out+'Z'
def stroke(pts,w=94,phase=0):
    # Unequal loaded shoulders and soft narrowing at bends; rounded terminals.
    left=[];right=[]
    for i,(x,y) in enumerate(pts):
        a=pts[max(0,i-1)];b=pts[min(len(pts)-1,i+1)];dx=b[0]-a[0];dy=b[1]-a[1];l=math.hypot(dx,dy)
        r=w*(1+.13*math.sin(i*1.7+phase))/2;nx=-dy/l;ny=dx/l
        left.append((x+nx*r,y+ny*r));right.append((x-nx*r,y-ny*r))
    a,b=pts[-2:];dx=b[0]-a[0];dy=b[1]-a[1];l=math.hypot(dx,dy);r=w*(1+.13*math.sin((len(pts)-1)*1.7+phase))/2
    end=(b[0]+dx/l*r*.85,b[1]+dy/l*r*.85)
    a,b=pts[:2];dx=b[0]-a[0];dy=b[1]-a[1];l=math.hypot(dx,dy);r=w*(1+.13*math.sin(phase))/2
    start=(a[0]-dx/l*r*.85,a[1]-dy/l*r*.85)
    return smooth(left+[end]+list(reversed(right))+[start])
def bowl(x=110,y=385,rx=88,ry=172):
    outer=[(x+rx*math.cos(t)* (1+.09*math.sin(t*3)),y+ry*math.sin(t)) for t in [i*math.tau/12 for i in range(12)]]
    inner=[(x+18*math.cos(t),y+75*math.sin(t)) for t in [i*math.tau/12 for i in range(12)]]
    return smooth(outer)+smooth(inner)
# Individual alphabet skeletons, deliberately asymmetric. C/I/S/U/V/O use source.
custom={
'A': [[(30,558),(62,352),(108,212),(165,345),(194,566)],[(55,448),(159,438)]],
'B': [[(43,225),(39,560)],[(56,241),(147,240),(177,304),(151,365),(64,380)],[(65,384),(159,387),(190,460),(162,544),(58,556)]],
'D': [[(43,223),(39,563)],[(54,234),(140,238),(189,324),(192,448),(145,550),(54,563)]],
'E': [[(161,217),(46,235),(40,552),(166,545)],[(45,394),(145,385)]],
'F': [[(171,224),(42,241),(38,557)],[(44,391),(148,389)]],
'G': [[(174,259),(94,220),(35,305),(28,457),(79,550),(180,536),(180,441),(124,435)]],
'H': [[(39,211),(43,555)],[(188,237),(177,560)],[(46,397),(179,387)]],
'J': [[(168,215),(169,460),(148,563),(56,569),(28,521)]],
'K': [[(40,221),(41,561)],[(184,239),(61,401),(184,559)]],
'L': [[(42,202),(34,454),(46,559),(170,549)]],
'M': [[(36,563),(45,227)],[(45,227),(111,318),(142,411)],[(142,411),(180,311),(237,237)],[(237,237),(256,563)]],
'N': [[(38,564),(40,220)],[(40,220),(96,353),(180,554)],[(180,554),(186,236)]],
'P': [[(40,570),(43,221)],[(51,236),(146,230),(187,294),(169,378),(66,388)]],
'Q': [],
'R': [[(40,562),(43,229)],[(54,240),(153,236),(185,307),(153,385),(59,395)],[(102,405),(189,560)]],
'T': [[(15,231),(102,218),(198,235)],[(113,234),(108,558)]],
'W': [[(27,223),(48,547)],[(48,547),(112,448),(143,352)],[(143,352),(181,471),(227,560)],[(227,560),(266,235)]],
'X': [[(31,233),(177,554)],[(178,245),(29,560)]],
'Y': [[(22,226),(101,405),(187,239)],[(101,405),(97,569)]],
'Z': [[(22,241),(172,225)],[(172,225),(159,302),(40,527),(31,562)],[(31,562),(180,552)]],
'1': [[(24,283),(83,229)],[(83,229),(83,555)]],
'2': [[(29,277),(90,218),(170,255),(180,322)],[(180,322),(130,405),(32,519),(37,555)],[(37,555),(179,550)]],
'3': [[(27,249),(129,227),(184,287),(155,358),(91,384),(161,408),(183,481),(131,560),(28,540)]],
'4': [[(104,220),(22,435)],[(22,435),(184,429)],[(151,249),(155,562)]],
'5': [[(176,233),(40,234),(34,382),(137,382),(181,445),(160,542),(47,554),(24,522)]],
'6': [[(160,236),(85,224),(31,335),(26,470)],[(26,470),(71,550),(150,542),(179,456),(144,401),(43,413)]],
'7': [[(22,236),(172,230),(104,403),(65,566)]],
'9': [[(160,394),(62,395),(25,318),(60,239),(134,237),(175,312)],[(175,312),(166,474),(122,556),(44,549)]],
'-': [[(18,398),(124,394)]],
"'": [[(33,225),(28,302)]],
}
inferred={}
for c,strokes in custom.items():
    if c=='Q':continue
    phase=(ord(c)%7)*.31
    ds=[stroke(s,94 if c not in "-'" else 61,phase) for s in strokes]
    inferred[c]=[{**ns['bounds'](''.join(ds)), 'ds':ds}, {**ns['bounds'](''.join(ds2:=[stroke(s,101 if c not in "-'" else 61,phase+1.2) for s in strokes])), 'ds':ds2}]
for c,ds in [('Q',[bowl(),stroke([(117,496),(208,589)],65)]),('0',[bowl()]),('8',[bowl(110,306,87,100),bowl(110,488,91,110)])]:
    inferred[c]=[{**ns['bounds'](''.join(ds)),'ds':ds}]
# Normalize all glyph x coordinates at render time. Keep native vertical placement.
for forms in letters.values():
    for p in forms:p['ds']=[p.pop('d')]
# Sample curves for fitting optional bubble holes strictly within existing ink.
def polygon(d):
    ts=re.findall(r'[MLCHVZ]|-?\d*\.?\d+(?:e[-+]?\d+)?',d,re.I);i=0;x=y=0;polys=[];pts=[]
    while i<len(ts):
        cmd=ts[i];i+=1;n={'M':2,'L':2,'C':6,'H':1,'V':1,'Z':0}[cmd];v=list(map(float,ts[i:i+n]));i+=n
        if cmd=='M':
            if pts:polys.append(pts)
            x,y=v;pts=[(x,y)]
        elif cmd=='C':
            for j in range(1,49):
                t=j/48;u=1-t;pts.append((u**3*x+3*u*u*t*v[0]+3*u*t*t*v[2]+t**3*v[4],u**3*y+3*u*u*t*v[1]+3*u*t*t*v[3]+t**3*v[5]))
            x,y=v[-2:]
        elif cmd=='L':x,y=v;pts.append((x,y))
        elif cmd=='H':x=v[0];pts.append((x,y))
        elif cmd=='V':y=v[0];pts.append((x,y))
    if pts:polys.append(pts)
    return polys
def inside(poly,x,y):
    hit=False
    for (a,b),(c,d) in zip(poly,poly[1:]+poly[:1]):
        if (b>y)!=(d>y) and x<(c-a)*(y-b)/(d-b)+a:hit=not hit
    return hit
for c,forms in {**letters,**inferred}.items():
    for p in forms:
        if c=='O':p['bubbles']=[cs[7],cs[8],cs[9]];continue
        polygons=[polygon(d) for d in p['ds']]
        def ink(x,y):return any(sum(inside(poly,x,y) for poly in group)%2 for group in polygons)
        candidates=[]
        for y in range(int(p['y']+p['h']*.45),int(p['y']+p['h']*.85),12):
            for x in range(int(p['x']+15),int(p['x']+p['w']-15),12):
                if all(ink(x+27*math.cos(t),y+27*math.sin(t)) for t in [i*math.tau/32 for i in range(32)]):candidates.append((x,y))
        if candidates:
            x,y=min(candidates,key=lambda q:abs(q[0]-(p['x']+p['w']*.55))+abs(q[1]-(p['y']+p['h']*.7)))
            p['bubbles']=[smooth([(x+18*math.cos(t),y+19*math.sin(t)) for t in [i*math.tau/12 for i in range(12)]])]
        else:p['bubbles']=[]
Path('src/lib/viscous-paths.json').write_text(json.dumps({'letters':letters,'inferred':inferred},indent=2))
