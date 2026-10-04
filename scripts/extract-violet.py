"""Split verified artist-wordmark.svg into editable Violet forms.
Native exterior/counter segments are retained; cuts at connected shoulders are
reconstructed. Unseen forms use explicit pressure-varying script skeletons.
Run from repository root; standard Python only, no runtime fonts.
"""
import json, re, math, xml.etree.ElementTree as ET
from pathlib import Path
ns={};exec(Path('scripts/extract-solomon.py').read_text().split('paths = [')[0],ns)
outline=ns['outline']
ps=[p.attrib['d'] for p in ET.parse('public/references/violet-wordmark.svg').getroot().iter('{http://www.w3.org/2000/svg}path')]
cs=re.findall(r'M[^M]+',ps[4]);ss=re.findall(r'[MLC][^MLCZ]+|Z',cs[0])
def seg(a,b):return ''.join(ss[a:b+1])
letters={
'V':outline(ps[10]+ps[0]+ps[3]+ps[11]),
'i':outline(seg(0,17)+'L219.552 398.172'+seg(176,197)+'Z'+ps[5]+''.join(cs[28:])),
'o':outline('M229.066 348.241'+seg(18,24)+'L330.483 328.333'+seg(171,175)+'Z'+cs[23]+cs[25]+cs[27]),
'l':outline('M371.049 281.773'+seg(27,57)+'L399.629 393.167'+seg(162,169)+'L371.049 281.773Z'+cs[1]+cs[2]),
'e':outline('M399.065 343.743'+seg(58,72)+'L490.394 382.209'+seg(158,161)+'Z'+cs[24]),
't':outline('M553.577 253.222'+seg(81,86)+'L569.156 290.922'+seg(132,157)+'L522.001 306.366'+seg(73,80)+'Z'),
}
bar=outline('M500.793 274.663'+seg(77,80)+'L604.737 241.566'+seg(87,131)+'L506.908 304.045L500.793 274.663Z'+''.join(cs[3:19])+''.join(ps[1:3])+''.join(ps[6:10]))
# Ribbonize sampled cubic skeletons: pressure follows pen direction, creating
# broad downstrokes and light rising connections. All output is filled outlines.
def ribbon(points, weight=1):
    left=[];right=[]
    for i,(x,y) in enumerate(points):
        a=points[max(0,i-1)];b=points[min(len(points)-1,i+1)];dx=b[0]-a[0];dy=b[1]-a[1];length=max(.001,math.hypot(dx,dy))
        pressure=(5+13*max(0,dy/length))*weight
        pressure*=min(1,.35+i/4,.35+(len(points)-1-i)/4)
        nx=-dy/length*pressure;ny=dx/length*pressure
        left.append((x+nx,y+ny));right.append((x-nx,y-ny))
    pts=left+right[::-1]
    return 'M'+'L'.join(f'{x:.3f} {y:.3f}' for x,y in pts)+'Z'
def stroke(start,*curves,weight=1):
    pts=[start];p=start
    for a,b,end in curves:
        for k in range(1,33):
            t=k/32;u=1-t;pts.append((u**3*p[0]+3*u*u*t*a[0]+3*u*t*t*b[0]+t**3*end[0],u**3*p[1]+3*u*u*t*a[1]+3*u*t*t*b[1]+t**3*end[1]))
        p=end
    # Forward slant of 0.52, matching native lowercase shoulders.
    return ribbon([(x+.52*(430-y),y) for x,y in pts],weight)
def line(a,b,weight=1):return stroke(a,(a,b,b),weight=weight)
def oval():return stroke((65,285),((5,250),(-20,433),(38,418)),((95,405),(110,285),(65,285)))
def stem(x=25,top=275):return stroke((x,top),((x-12,330),(x-40,442),(x+16,411)))
def arch(x=20):return stroke((x,407),((x+5,285),(x+66,239),(x+66,302)),((x+58,340),(x+20,432),(x+79,405)))
def exit(x=70):return stroke((x,405),((x+18,397),(x+28,382),(x+38,365)),weight=.8)
loop=oval(); s=stem()
lower={
'a':loop+stem(75)+exit(91), 'b':stem(25,100)+loop+exit(),
'c':stroke((80,287),((10,253),(-30,451),(47,412)),((62,405),(78,386),(88,368))),
'd':loop+stem(78,110)+exit(94),
'f':stroke((25,528),((40,260),(86,66),(118,113)),((164,166),(41,239),(25,323)))+line((-5,292),(112,266),.7),
'g':loop+stroke((79,279),((72,385),(2,589),(-38,523)),((-71,469),(55,452),(101,377))),
'h':stem(25,110)+arch(28),
'i':stem(25)+line((37,217),(36,235),1.2),
'j':stroke((32,282),((22,367),(-7,557),(-48,518)),((-66,500),(-55,480),(-24,458)))+line((44,219),(43,237),1.2)+exit(10),
'k':stem(25,110)+stroke((82,279),((57,315),(21,341),(11,348)),((47,340),(21,440),(85,402))),
'l':stroke((15,406),((25,312),(105,69),(114,103)),((140,146),(33,270),(8,373)),((-16,460),(45,418),(72,378))),
'm':s+arch(20)+arch(89), 'n':s+arch(20), 'o':loop+exit(),
'p':stem(15,275)+line((18,320),(-43,540))+arch(26)+exit(95),
'q':loop+line((80,278),(20,535))+exit(65),
'r':s+stroke((21,341),((46,249),(64,273),(73,289)),((81,304),(76,320),(99,302)))+exit(50),
's':stroke((74,288),((1,252),(-5,325),(47,347)),((96,383),(18,461),(-7,401)),((5,396),(47,399),(78,374))),
'u':stroke((24,279),((10,332),(-30,449),(29,413)),((62,393),(73,311),(87,279)))+stem(86)+exit(102),
'v':stroke((17,278),((3,339),(-7,421),(29,415)),((66,406),(102,321),(90,278)))+exit(77),
'w':stroke((17,278),((3,339),(-7,421),(29,415)),((55,406),(68,338),(75,282)),((65,343),(60,426),(92,414)),((124,400),(156,320),(143,277)))+exit(132),
'x':line((8,284),(77,420))+line((86,282),(-3,418))+exit(73),
'y':stroke((20,278),((6,333),(-25,447),(32,408)),((55,390),(70,332),(87,278)),((64,394),(-10,567),(-42,523)),((-62,492),(42,452),(93,380))),
'z':stroke((6,289),((38,271),(65,272),(83,283)),((45,324),(25,365),(-5,412)),((35,395),(62,436),(90,398))),
}
# Capitals retain their own identity, with broad descending diagonals and fine
# rising strokes. They are inferred, including capital I/O/L/E/T.
cap={
'A':line((-4,429),(77,110),.65)+line((77,110),(113,419),1.3)+line((20,316),(105,301),.7),
'B':stem(20,110)+stroke((25,120),((149,46),(144,235),(44,272)),((176,242),(153,462),(15,422))),
'C':stroke((147,133),((35,21),(-47,462),(83,421)),((113,409),(139,371),(148,343))),
'D':stem(20,110)+stroke((25,121),((224,47),(172,468),(12,424))),
'E':stem(20,110)+line((22,125),(149,106),.8)+line((9,279),(107,261),.7)+line((-7,420),(125,398),.8),
'F':stem(20,110)+line((22,125),(149,106),.8)+line((9,279),(107,261),.7),
'G':stroke((147,133),((35,21),(-47,462),(83,421)),((127,400),(125,345),(130,298)))+line((72,307),(149,291),.8),
'H':stem(20,110)+stem(123,110)+line((0,289),(135,270),.8),
'I':stem(40,110)+line((13,127),(90,106),.7)+line((8,426),(87,407),.7),
'J':stroke((109,110),((76,300),(56,469),(-16,415)),((-33,401),(-24,360),(-12,346))),
'K':stem(20,110)+line((135,111),(7,305),.7)+line((20,282),(113,424),1.2),
'L':stem(30,110)+line((4,426),(141,401),1.1),
'M':line((0,425),(41,112),.7)+line((41,112),(85,399),1.2)+line((85,399),(153,112),.7)+line((153,112),(179,425),1.2),
'N':line((0,425),(35,112),.7)+line((35,112),(120,422),1.3)+line((120,422),(159,110),.7),
'O':stroke((95,115),((-9,65),(-61,454),(76,420)),((191,393),(193,112),(95,115))),
'P':stem(20,110)+stroke((25,120),((188,46),(166,305),(23,285))),
'Q':stroke((95,115),((-9,65),(-61,454),(76,420)),((191,393),(193,112),(95,115)))+line((67,374),(155,467)),
'R':stem(20,110)+stroke((25,120),((188,46),(166,305),(23,285)))+line((42,283),(143,425),1.3),
'S':stroke((155,140),((59,21),(-3,206),(71,270)),((201,379),(38,498),(-1,399))),
'T':line((3,135),(193,101),.9)+stem(91,120),
'U':stroke((25,111),((-20,297),(-47,468),(47,415)),((105,381),(121,195),(150,110))),
'V':line((13,111),(34,429),1.3)+line((34,429),(187,110),.8),
'W':line((13,111),(24,429),1.3)+line((24,429),(111,154),.7)+line((111,154),(117,429),1.3)+line((117,429),(209,110),.7),
'X':line((13,111),(143,425),1.3)+line((151,110),(-3,426),.7),
'Y':line((13,111),(70,283),1.3)+line((168,110),(70,283),.7)+line((70,283),(38,426),1.3),
'Z':line((10,128),(160,109),.8)+line((160,109),(-5,423),1.2)+line((-5,423),(149,402),.8),
}
# Numerals and punctuation remain outlined, explicitly inferred.
for c in '0123456789':
    patterns={'0':cap['O'],'1':cap['I'],'2':stroke((0,172),((35,50),(183,63),(125,197)),((104,254),(28,351),(-3,420)))+line((-3,420),(129,401)), '3':stroke((0,131),((147,42),(155,253),(54,270)),((187,233),(151,478),(-1,415))), '4':line((109,112),(-5,314),.7)+line((-5,314),(150,295),.7)+stem(110,110), '5':line((19,129),(153,105))+line((19,129),(2,269))+stroke((2,269),((164,218),(150,478),(-1,415))), '6':cap['C']+oval(), '7':line((4,132),(159,108))+line((159,108),(25,423)), '8':stroke((64,122),((-15,83),(-7,226),(71,267)),((183,330),(85,484),(4,413)),((-70,338),(91,260),(105,178)),((122,136),(85,104),(64,122))), '9':cap['O']+line((137,214),(45,426))}
    cap[c]=patterns[c]
cap['6']=stroke((115,116),((26,72),(-45,444),(52,420)),((152,402),(129,236),(41,283)),((2,308),(12,386),(52,420)))
cap['9']=stroke((88,117),((-14,62),(-49,312),(63,291)),((135,281),(161,110),(88,117)),((150,140),(119,353),(37,428)))
cap['-']=line((0,325),(66,311),.8);cap["'"]=line((24,143),(7,190))
Path('src/lib/violet-paths.json').write_text(json.dumps(dict(letters=letters,crossbar=bar,lower={c:outline(d) for c,d in lower.items()},capitals={c:outline(d) for c,d in cap.items()}),indent=2))
