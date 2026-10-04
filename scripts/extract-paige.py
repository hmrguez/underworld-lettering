"""Extract inspected bookworm.svg contours and design Paige's unseen alphabet.
Python standard library; run from repository root. No font or raster tracing.
"""
import json, re, math, xml.etree.ElementTree as ET
from pathlib import Path
ns = {}
exec(Path('scripts/extract-solomon.py').read_text().split('paths = [')[0], ns)
bounds = ns['bounds']
# Reuse only the side-profile helper, extending its vertical range for Paige.
helper = 'def profile('+Path('scripts/extract-venator.py').read_text().split('def profile(')[1].split('for collection in')[0]
exec(helper.replace('range(50)', 'range(120)'), ns)
paths = [p.attrib['d'] for p in ET.parse('public/references/paige-wordmark.svg').getroot().iter('{http://www.w3.org/2000/svg}path')]
# P and a/i/g/e each occupy complete separate paths. i's dot is path 4.
source = {c:[paths[i]] for c,i in [('P',1),('A',2),('I',3),('G',5),('E',6)]}
source['I'].append(paths[4])
def poly(pts): return 'M'+'L'.join(f'{x} {y}' for x,y in pts)+'Z'
def stem(x,top=232,bottom=549,w=85):
    return poly([(x-20,top+49),(x+35,top),(x+w+19,top+46),(x+w,top+73),(x+w,bottom-46),(x+w+22,bottom-24),(x+43,bottom),(x,bottom-31),(x,top+78)])
def bowl(x=0,top=232,bottom=549,w=218):
    return poly([(x,top+49),(x+105,top),(x+w,top+51),(x+w,bottom-49),(x+105,bottom),(x,bottom-46)])+poly([(x+85,top+70),(x+131,top+95),(x+131,bottom-68),(x+103,bottom-48),(x+85,bottom-66)])
def openbowl():
    return poly([(0,281),(99,232),(218,281),(173,327),(130,296),(86,282),(86,473),(137,499),(207,467),(222,489),(127,549),(0,505)])
def ribbon(a,b,w):
    dx,dy=b[0]-a[0],b[1]-a[1];l=math.hypot(dx,dy);nx=-dy*w/l/2;ny=dx*w/l/2
    return poly([(a[0]+nx,a[1]+ny),(b[0]+nx,b[1]+ny),(b[0]-nx,b[1]-ny),(a[0]-nx,a[1]-ny)])
def bar(y,w=218): return poly([(12,y+18),(w-44,y-10),(w,y+18),(w-22,y+49),(31,y+56)])
def bend(): return poly([(0,281),(99,232),(209,277),(170,319),(103,282),(82,322),(204,387),(218,498),(117,549),(0,505),(34,463),(112,505),(135,461),(17,392)])
s=stem(0);tall=stem(0,127)
custom={
'B':[tall,bowl()], 'C':[openbowl()], 'D':[bowl(),stem(133,127)],
'F':[stem(33,127,637),bar(263,224),poly([(33,167),(130,113),(211,154),(184,193),(129,169),(118,214)])],
'H':[tall,stem(139),bar(260,225)], 'J':[stem(26),poly([(26,490),(111,516),(111,603),(34,654),(-39,615),(-18,580),(26,604)]),poly([(47,127),(123,127),(123,153),(59,220),(34,207)])],
'K':[tall,ribbon((88,395),(185,273),49),ribbon((102,367),(211,507),83)],
'L':[stem(0,127)], 'M':[stem(0),stem(131),stem(262),bar(266,347)],
'N':[s,stem(139),bar(262,222)], 'O':[bowl()],
'P':[stem(0,232,654),bowl(0,232,527)], 'Q':[bowl(),stem(133,399,654)],
'R':[s,poly([(65,283),(145,232),(218,268),(180,316),(131,294),(84,341)])],
'S':[bend()], 'T':[stem(34,164),bar(252,225)],
'U':[s,stem(139),bar(475,226)],
'V':[poly([(-20,281),(35,232),(99,278),(85,452),(133,497),(151,477),(151,275),(190,232),(237,276),(237,493),(126,549),(0,505),(0,305)])],
'W':[s,stem(131),stem(262),bar(475,350)],
'X':[ribbon((31,269),(191,510),85),ribbon((177,274),(29,503),42),bar(250,224),bar(488,224)],
'Y':[stem(0,232,485),stem(139,232,625),bar(440,225),poly([(139,582),(224,600),(154,654),(37,621),(55,585),(128,610)])],
'Z':[bar(249,225),ribbon((177,291),(43,500),82),bar(488,225)],
'0':[bowl()], '1':[stem(30),poly([(0,276),(63,232),(82,270),(22,323)])],
'2':[bar(249,218),ribbon((165,293),(38,499),82),bar(488,218)],
'3':[poly([(0,281),(99,232),(218,281),(218,359),(176,390),(218,419),(218,505),(112,549),(0,505),(33,466),(123,506),(135,439),(83,418),(83,372),(135,350),(128,287),(35,324)])],
'4':[ribbon((69,253),(17,416),67),bar(393,220),stem(131)],
'5':[bar(249,218),poly([(0,279),(85,279),(85,370),(138,358),(218,407),(218,505),(112,549),(0,505),(33,466),(127,506),(133,441),(0,399)])],
'6':[bowl(0,353,549),stem(0,232,497),bar(252,197)],
'7':[bar(249,225),ribbon((177,293),(79,529),85)],
'8':[bowl(0,232,397),bowl(0,383,549)],
'9':[bowl(0,232,431),stem(133,285,549)],
'-':[poly([(0,369),(135,369),(135,412),(0,412)])],
"'": [poly([(0,232),(61,232),(61,292),(20,333),(0,321),(13,286)])],
}
# Compact p is custom; an enlarged P uses its native source contour.
def transformed(d,scale,dx,dy):
    ts=re.findall(r'[MLCHVZ]|-?\d*\.?\d+(?:e[-+]?\d+)?',d,re.I);out=[];i=0
    while i<len(ts):
        cmd=ts[i];i+=1;n={'M':2,'L':2,'C':6,'H':1,'V':1,'Z':0}[cmd];vs=list(map(float,ts[i:i+n]));i+=n
        out.append(cmd+' '.join(str(v*scale+(dy if cmd=='V' or (cmd!='H' and j%2) else dx)) for j,v in enumerate(vs)))
    return ''.join(out)
def form(ds,large=False):
    b=bounds(''.join(ds));s=621.6164/b['h'] if large else 1;dy=67.5566-b['y']*s if large else 0
    d=''.join(transformed(d,s,-b['x']*s,dy) for d in ds)
    return dict(ds=ds,rawX=b['x'],scale=s,dy=dy,w=b['w']*s,y=b['y']*s+dy,h=b['h']*s,profile=ns['profile'](d,0))
letters={c:form(ds) for c,ds in source.items() if c!='P'}
inferred={c:form(ds) for c,ds in custom.items()}
initials={c:form(source.get(c,ds),True) for c,ds in {**custom,**source}.items() if c.isalpha()}
seq=[initials['P']]+[letters[c] for c in 'AIGE'];xs=[79.0608,452.233,669.295,787.767,1037.02]
gaps={a+b:xs[i+1]-xs[i]-seq[i]['w'] for i,(a,b) in enumerate(zip('PAIG','AIGE'))}
# The rough, open rectangle is independent of P. Preserve its source vertices;
# runtime piecewise remapping keeps border thickness and adapts the opening.
# Expand H/V to explicit vertices so the independent frame remains reproducible.
frame=[];tokens=re.findall(r'[MLHVZ]|-?\d*\.?\d+',paths[0]);i=0;x=y=0
while i<len(tokens):
    cmd=tokens[i];i+=1;n={'M':2,'L':2,'H':1,'V':1,'Z':0}[cmd];vs=list(map(float,tokens[i:i+n]));i+=n
    if cmd in 'ML':x,y=vs
    elif cmd=='H':x=vs[0]
    elif cmd=='V':y=vs[0]
    else:continue
    frame.append([x,y])
Path('src/lib/paige-paths.json').write_text(json.dumps(dict(letters=letters,inferred=inferred,initials=initials,gaps=gaps,frame=frame),indent=2)+'\n')
