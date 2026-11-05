import math

# Wavy reference path y = 0.8 sin(0.6 x), 5 cm between points
PATH = [(0.05 * i, 0.8 * math.sin(0.6 * 0.05 * i)) for i in range(0, 281)]

def pure_pursuit(ld, v, lag, start=(0.0, -0.4, 0.0), w_max=2.5, dt=0.02):
    """Differential robot with pure pursuit and a first-order lag on the turning rate.
    Returns (max cross-track error, RMS error, finished). The first 3 s are ignored (start offset)."""
    x, y, th = start
    w_actual, idx, t = 0.0, 0, 0.0
    sse, n, emax = 0.0, 0, 0.0
    while t < 60.0:
        # nearest path point (search only a small window ahead of the last one)
        window = range(max(0, idx - 5), min(len(PATH), idx + 80))
        idx = min(window, key=lambda i: math.hypot(PATH[i][0] - x, PATH[i][1] - y))
        e = math.hypot(PATH[idx][0] - x, PATH[idx][1] - y)
        if idx >= len(PATH) - 3:
            return emax, math.sqrt(sse / max(n, 1)), True
        # look-ahead target: first path point farther than ld from the robot
        j = idx
        while j < len(PATH) - 1 and math.hypot(PATH[j][0] - x, PATH[j][1] - y) < ld:
            j += 1
        gx, gy = PATH[j][0] - x, PATH[j][1] - y
        xr = math.cos(th) * gx + math.sin(th) * gy        # target in the robot frame
        yr = -math.sin(th) * gx + math.cos(th) * gy
        kappa = 2.0 * yr / (xr * xr + yr * yr)            # pure pursuit curvature
        w_cmd = max(-w_max, min(w_max, v * kappa))
        w_actual += (w_cmd - w_actual) * dt / lag if lag > 0 else (w_cmd - w_actual)
        x += v * math.cos(th) * dt; y += v * math.sin(th) * dt; th += w_actual * dt
        t += dt
        if t > 3.0:
            emax = max(emax, e); sse += e * e; n += 1
        if abs(y) > 20:
            return emax, math.sqrt(sse / max(n, 1)), False
    return emax, math.sqrt(sse / max(n, 1)), False

if __name__ == "__main__":
    print("v = 1.0 m/s, motor lag 0.4 s")
    print(" Ld [m]   max error [m]   RMS error [m]")
    for ld in (0.3, 0.6, 1.0, 1.5, 2.5):
        emax, rms, ok = pure_pursuit(ld, 1.0, 0.4)
        print("  %.1f       %.3f           %.3f   %s" % (ld, emax, rms, "" if ok else "(lost the path)"))
