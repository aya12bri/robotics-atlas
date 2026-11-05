import math, random

class Odometry:
    """Differential-drive dead reckoning from the distance rolled by each wheel."""
    def __init__(self, track, x=0.0, y=0.0, th=0.0):
        self.L, self.x, self.y, self.th = track, x, y, th

    def update(self, ds_right, ds_left):
        ds = 0.5 * (ds_right + ds_left)            # distance of the robot centre
        dth = (ds_right - ds_left) / self.L        # change of heading
        self.x += ds * math.cos(self.th + 0.5 * dth)   # midpoint rule
        self.y += ds * math.sin(self.th + 0.5 * dth)
        self.th += dth
        return self.x, self.y, self.th

def drive_square(side, v, w, true_r_scale=(1.0, 1.0), true_track_scale=1.0, noise=0.0, dt=0.01, ccw=True, seed=1):
    """Open-loop square. The commands are computed with the NOMINAL robot (r = 0.05, L = 0.30),
    the robot really moves with the TRUE parameters. Returns the real final pose."""
    random.seed(seed)
    r, L = 0.05, 0.30
    rr, rl = r * true_r_scale[0], r * true_r_scale[1]; Lt = L * true_track_scale
    x = y = th = 0.0
    sgn = 1 if ccw else -1
    def run(vv, ww, T):
        nonlocal x, y, th
        n = int(round(T / dt))
        for _ in range(n):
            wr = (vv + ww * L / 2) / r; wl = (vv - ww * L / 2) / r            # commanded wheel speeds (rad/s)
            dsr = rr * wr * dt * (1 + random.gauss(0, noise)); dsl = rl * wl * dt * (1 + random.gauss(0, noise))
            ds = 0.5 * (dsr + dsl); dth = (dsr - dsl) / Lt
            x += ds * math.cos(th + 0.5 * dth); y += ds * math.sin(th + 0.5 * dth); th += dth
    for _ in range(4):
        run(v, 0.0, side / v)
        run(0.0, sgn * w, (math.pi / 2) / w)
    return x, y, th

if __name__ == "__main__":
    # 1. perfect robot: the 2 m square closes
    x, y, th = drive_square(2.0, 0.4, 1.0)
    print("perfect robot     : end (%.3f, %.3f) m, heading %.2f deg" % (x, y, math.degrees(th)))
    # 2. left wheel 1 % bigger than expected
    x, y, th = drive_square(2.0, 0.4, 1.0, true_r_scale=(1.0, 1.01))
    print("left wheel +1 %%    : end (%.3f, %.3f) m -> error %.3f m" % (x, y, math.hypot(x, y)))
    # 3. track 3 % wider than expected, ccw and cw
    for ccw in (True, False):
        x, y, th = drive_square(2.0, 0.4, 1.0, true_track_scale=1.03, ccw=ccw)
        print("track +3 %% %s: end (%.3f, %.3f) m -> error %.3f m" % ("CCW" if ccw else "CW ", x, y, math.hypot(x, y)))
    # 4. random slip 1 %: 20 runs
    errs = []
    for s in range(20):
        x, y, th = drive_square(2.0, 0.4, 1.0, noise=0.01, seed=s)
        errs.append(math.hypot(x, y))
    m = sum(errs) / len(errs); sd = (sum((e - m) ** 2 for e in errs) / (len(errs) - 1)) ** 0.5
    print("random slip 1 %%    : mean error %.3f m, std %.3f m (20 runs)" % (m, sd))
