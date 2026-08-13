import json
d = json.load(open("hh.json"))
T0, T1 = 0.0, 14.0
X0, X1 = 34, 306
def sx(t): return X0 + (t - T0) / (T1 - T0) * (X1 - X0)

# membrane potential panel
V0, V1, Y0, Y1 = -85.0, 45.0, 100, 22
def sy(v): return Y0 + (v - V0) / (V1 - V0) * (Y1 - Y0)
# conductance panel
G1, GY0, GY1 = 34.0, 170, 132
def gy(g): return GY0 + g / G1 * (GY1 - GY0)

def rdp(pts, eps):
    """Ramer-Douglas-Peucker: keep the shape, drop the samples that carry none."""
    if len(pts) < 3: return pts
    (x0, y0), (x1, y1) = pts[0], pts[-1]
    dx, dy = x1 - x0, y1 - y0
    n = (dx*dx + dy*dy) ** .5 or 1e-9
    worst, idx = 0.0, 0
    for i in range(1, len(pts) - 1):
        x, y = pts[i]
        dist = abs(dy*x - dx*y + x1*y0 - y1*x0) / n
        if dist > worst: worst, idx = dist, i
    if worst <= eps: return [pts[0], pts[-1]]
    return rdp(pts[:idx+1], eps)[:-1] + rdp(pts[idx:], eps)

def path(xs, ys, eps=0.55):
    pts = [(sx(xs[i]), ys[i]) for i in range(len(xs)) if xs[i] <= T1]
    pts = rdp(pts, eps)
    return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)

V = path(d["t"], [sy(v) for v in d["V"]])
gNa = path(d["t"], [gy(g) for g in d["gNa"]], 0.5)
gK  = path(d["t"], [gy(g) for g in d["gK"]], 0.5)
tp, vp = d["peak"]; tt, vt = d["trough"]

svg = f'''<svg viewBox="0 0 320 200" role="img" aria-labelledby="ap-t"><title id="ap-t">Action potential — Hodgkin-Huxley simulation</title>\
<g stroke="currentColor" stroke-opacity=".28" stroke-width="1" stroke-dasharray="3 3">\
<path d="M{X0},{sy(0):.1f} H{X1}"/><path d="M{X0},{sy(-65):.1f} H{X1}"/></g>\
<text x="{X0-3:.0f}" y="{sy(0)+3:.1f}" text-anchor="end" font-size="7.5" class="mono" fill="var(--faint)">0</text>\
<text x="{X0-3:.0f}" y="{sy(-65)+3:.1f}" text-anchor="end" font-size="7.5" class="mono" fill="var(--faint)">-65</text>\
<text x="{X0-3:.0f}" y="{sy(40)+3:.1f}" text-anchor="end" font-size="7.5" class="mono" fill="var(--faint)">+40</text>\
<text x="12" y="60" font-size="8" fill="var(--muted)" transform="rotate(-90 12 60)" text-anchor="middle">mV</text>\
<path d="M{sx(2):.1f},{Y0:.0f} v6 h{sx(3)-sx(2):.1f} v-6" fill="none" stroke="var(--accent)" stroke-width="1.6"/>\
<text x="{sx(2.5):.1f}" y="{Y0+16:.0f}" text-anchor="middle" font-size="7.5" fill="var(--accent-ink)">stimulus</text>\
<path d="{V}" fill="none" stroke="var(--neuron)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>\
<circle cx="{sx(tp):.1f}" cy="{sy(vp):.1f}" r="2.4" fill="var(--neuron)"/>\
<text x="{sx(tp)+5:.1f}" y="{sy(vp)+1:.1f}" font-size="8" fill="var(--muted)">peak +{vp:.0f} mV</text>\
<text x="{sx(tt)+4:.1f}" y="{sy(vt)+9:.1f}" font-size="8" fill="var(--muted)">undershoot</text>\
<g stroke-width="1.8" fill="none">\
<path d="{gNa}" stroke="var(--accent)" stroke-opacity=".85"/>\
<path d="{gK}" stroke="currentColor" stroke-opacity=".45"/></g>\
<text x="{X1:.0f}" y="{GY1-3:.0f}" text-anchor="end" font-size="7.5" class="mono" fill="var(--muted)">gK</text>\
<text x="{X1-20:.0f}" y="{GY1-3:.0f}" text-anchor="end" font-size="7.5" class="mono" fill="var(--accent-ink)">gNa</text>\
<text x="12" y="152" font-size="8" fill="var(--muted)" transform="rotate(-90 12 152)" text-anchor="middle">mS/cm²</text>\
<path d="M{X0},{GY0:.0f} H{X1}" stroke="currentColor" stroke-opacity=".3" stroke-width="1"/>\
<g font-size="7.5" fill="var(--faint)" class="mono" text-anchor="middle">\
<text x="{sx(0):.1f}" y="{GY0+11:.0f}">0</text><text x="{sx(5):.1f}" y="{GY0+11:.0f}">5</text>\
<text x="{sx(10):.1f}" y="{GY0+11:.0f}">10</text><text x="{X1+2}" y="{GY0+11:.0f}">ms</text></g>\
<text x="160" y="194" text-anchor="middle" font-size="8" fill="var(--muted)">Na+ opens and closes; K+ follows and repolarises</text>\
</svg>'''
print(len(svg), "bytes")
open("ap.svg", "w").write(svg)
