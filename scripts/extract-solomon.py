"""Extract verified Solomon contours; run from the repository root.

Source: public/references/solomon-wordmark.svg (Valve art via DeadlockSkins.gg).
The reference contains only absolute M/L/C/H/V/Z commands. No raster tracing,
new letter design or path resampling happens here. Cubic extrema give bounds.
"""

import json
import math
import re
import xml.etree.ElementTree as ET
from pathlib import Path


def bounds(d):
    tokens = re.findall(r"[MLCHVZ]|-?\d*\.?\d+(?:e[-+]?\d+)?", d, re.I)
    i = 0
    x = y = 0
    xs, ys = [], []
    while i < len(tokens):
        command = tokens[i]
        i += 1
        count = {"M": 2, "L": 2, "C": 6, "H": 1, "V": 1, "Z": 0}[command]
        values = list(map(float, tokens[i:i + count]))
        i += count
        if command in ("M", "L", "C"):
            if command == "C":
                for axis, start in ((0, x), (1, y)):
                    p0, p1, p2, p3 = start, values[axis], values[axis + 2], values[axis + 4]
                    a = -p0 + 3 * p1 - 3 * p2 + p3
                    b = 2 * (p0 - 2 * p1 + p2)
                    c = p1 - p0
                    ts = [0, 1]
                    if abs(a) < 1e-10:
                        if abs(b) > 1e-10:
                            ts.append(-c / b)
                    elif b * b - 4 * a * c >= 0:
                        disc = math.sqrt(b * b - 4 * a * c)
                        ts.extend(((-b + disc) / (2 * a), (-b - disc) / (2 * a)))
                    extrema = [
                        (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1
                        + 3 * (1 - t) * t * t * p2 + t ** 3 * p3
                        for t in ts if 0 <= t <= 1
                    ]
                    (xs if axis == 0 else ys).extend(extrema)
            else:
                xs.extend(values[::2])
                ys.extend(values[1::2])
            x, y = values[-2:]
        elif command == "H":
            x = values[0]
            xs.append(x)
            ys.append(y)
        elif command == "V":
            y = values[0]
            xs.append(x)
            ys.append(y)
    return dict(x=min(xs), y=min(ys), w=max(xs) - min(xs), h=max(ys) - min(ys))


def outline(d):
    return dict(d=d, **bounds(d))


paths = [
    p.attrib["d"] for p in ET.parse("public/references/solomon-wordmark.svg")
    .getroot().iter("{http://www.w3.org/2000/svg}path")
]
letters = {char: outline(paths[i]) for char, i in (("S", 1), ("L", 2), ("M", 0), ("N", 3))}
# Compound plate paths contain a quadrilateral then the O silhouette. Retain
# only the second contour and its separate counter, ordered left to right.
ovals = [
    outline(paths[i][paths[i].index("ZM") + 1:] + " " + paths[j])
    for i, j in ((7, 10), (6, 9), (5, 8))
]
Path("src/lib/solomon-paths.json").write_text(
    json.dumps(dict(letters=letters, ovals=ovals, rook=outline(paths[4])), indent=2)
)
