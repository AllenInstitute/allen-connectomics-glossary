"""Classic Hodgkin-Huxley (1952) squid axon, integrated with RK4, rendered to SVG."""
import math, json

C_m, g_Na, g_K, g_L = 1.0, 120.0, 36.0, 0.3
E_Na, E_K, E_L = 50.0, -77.0, -54.387

def a_n(V): return 0.01*(V+55)/(1-math.exp(-(V+55)/10)) if abs(V+55) > 1e-7 else 0.1
def b_n(V): return 0.125*math.exp(-(V+65)/80)
def a_m(V): return 0.1*(V+40)/(1-math.exp(-(V+40)/10)) if abs(V+40) > 1e-7 else 1.0
def b_m(V): return 4.0*math.exp(-(V+65)/18)
def a_h(V): return 0.07*math.exp(-(V+65)/20)
def b_h(V): return 1/(1+math.exp(-(V+35)/10))

def I_inj(t):            # a brief suprathreshold pulse
    return 25.0 if 2.0 <= t < 3.0 else 0.0

def deriv(y, t):
    V, m, h, n = y
    I = g_Na*m**3*h*(V-E_Na) + g_K*n**4*(V-E_K) + g_L*(V-E_L)
    return [(I_inj(t) - I)/C_m,
            a_m(V)*(1-m) - b_m(V)*m,
            a_h(V)*(1-h) - b_h(V)*h,
            a_n(V)*(1-n) - b_n(V)*n]

V0 = -65.0
y = [V0, a_m(V0)/(a_m(V0)+b_m(V0)), a_h(V0)/(a_h(V0)+b_h(V0)), a_n(V0)/(a_n(V0)+b_n(V0))]
dt, T = 0.005, 18.0
ts, Vs, gNa, gK = [], [], [], []
t = 0.0
while t < T:
    ts.append(t); Vs.append(y[0])
    gNa.append(g_Na*y[1]**3*y[2]); gK.append(g_K*y[3]**4)
    k1 = deriv(y, t)
    k2 = deriv([y[i]+dt/2*k1[i] for i in range(4)], t+dt/2)
    k3 = deriv([y[i]+dt/2*k2[i] for i in range(4)], t+dt/2)
    k4 = deriv([y[i]+dt*k3[i] for i in range(4)], t+dt)
    y = [y[i] + dt/6*(k1[i]+2*k2[i]+2*k3[i]+k4[i]) for i in range(4)]
    t += dt

peak = max(Vs); tpeak = ts[Vs.index(peak)]
trough = min(Vs[Vs.index(peak):]); ttrough = ts[Vs.index(trough)]
print(f"rest {V0:.1f} mV | peak {peak:.1f} mV at {tpeak:.2f} ms | "
      f"undershoot {trough:.1f} mV at {ttrough:.2f} ms | "
      f"amplitude {peak-V0:.0f} mV | width(0mV) ~"
      f"{sum(dt for v in Vs if v > 0):.2f} ms")
json.dump({"t": ts, "V": Vs, "gNa": gNa, "gK": gK,
           "peak": [tpeak, peak], "trough": [ttrough, trough]}, open("hh.json", "w"))
