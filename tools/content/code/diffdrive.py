import math

class DiffDrive:
    """Kinematics, limits and odometry of a differential-drive robot (SI units, radians)."""
    def __init__(self, radius, track, max_wheel_speed, max_accel=None):
        self.r, self.L, self.wmax, self.amax = radius, track, max_wheel_speed, max_accel
        self.x = self.y = self.th = 0.0
        self.cmd = (0.0, 0.0)                          # last wheel speeds sent (rad/s): right, left

    def wheel_speeds(self, v, w, dt=None):
        """body (v, w) -> wheel angular speeds (right, left), scaled if a motor would saturate
        and limited in acceleration if dt is given."""
        wr = (v + w * self.L / 2) / self.r
        wl = (v - w * self.L / 2) / self.r
        s = max(1.0, abs(wr) / self.wmax, abs(wl) / self.wmax)       # scale BOTH wheels by the same factor
        wr, wl = wr / s, wl / s
        if self.amax and dt:                                         # ramp: limit the change per step
            dmax = self.amax * dt / self.r
            wr = min(max(wr, self.cmd[0] - dmax), self.cmd[0] + dmax)
            wl = min(max(wl, self.cmd[1] - dmax), self.cmd[1] + dmax)
        self.cmd = (wr, wl)
        return wr, wl

    def body_speeds(self, wr, wl):
        return self.r * (wr + wl) / 2, self.r * (wr - wl) / self.L

    def integrate(self, wr, wl, dt):
        """odometry from the measured wheel speeds (midpoint rule)."""
        ds = self.r * (wr + wl) / 2 * dt
        dth = self.r * (wr - wl) / self.L * dt
        self.x += ds * math.cos(self.th + dth / 2)
        self.y += ds * math.sin(self.th + dth / 2)
        self.th += dth
        return self.x, self.y, self.th

def go_to_goal(robot, kr=1.5, ka=6.0, kb=-2.0, tol=0.01, dt=0.02, t_max=60.0):
    """Lesson 11 controller (goal = origin, heading 0)."""
    wrap = lambda a: (a + math.pi) % (2 * math.pi) - math.pi
    t = 0.0
    while t < t_max:
        rho = math.hypot(robot.x, robot.y)
        if rho < tol:
            break
        gamma = math.atan2(-robot.y, -robot.x)
        alpha = wrap(gamma - robot.th); th = robot.th; sign = 1.0
        if abs(alpha) > math.pi / 2:                    # goal behind: drive backwards
            th += math.pi; alpha = wrap(gamma - th); sign = -1.0
        beta = wrap(-th - alpha)
        v = sign * kr * rho; w = ka * alpha + kb * beta
        wr, wl = robot.wheel_speeds(v, w, dt)
        robot.integrate(wr, wl, dt)
        t += dt
    return t

if __name__ == "__main__":
    bot = DiffDrive(radius=0.05, track=0.30, max_wheel_speed=30.0)
    # unit tests
    wr, wl = bot.wheel_speeds(0.4, 0.0); assert abs(wr - wl) < 1e-9 and abs(wr - 8.0) < 1e-9
    wr, wl = bot.wheel_speeds(0.0, 1.0); assert abs(wr + wl) < 1e-9 and abs(wr - 3.0) < 1e-9
    v, w = bot.body_speeds(*bot.wheel_speeds(0.45, 0.33)); assert abs(v - 0.45) < 1e-9 and abs(w - 0.33) < 1e-9
    wr, wl = bot.wheel_speeds(3.0, 0.0); assert abs(wr - 30.0) < 1e-9            # 60 rad/s asked, scaled to the limit
    print("unit tests passed")
    print("wheel speeds for v=0.45, w=0.33 :", tuple(round(x, 3) for x in DiffDrive(0.05, 0.30, 30).wheel_speeds(0.45, 0.33)))
    print("saturation: v=1.2, w=2.0 ->", tuple(round(x, 3) for x in DiffDrive(0.05, 0.30, 20).wheel_speeds(1.2, 2.0)), "(limit 20 rad/s, ratio kept)")
    bot = DiffDrive(radius=0.05, track=0.30, max_wheel_speed=30.0); bot.x, bot.y, bot.th = -2.0, -1.0, 0.0
    t = go_to_goal(bot)
    print("go to goal       : arrived after %.1f s at (%.3f, %.3f), heading %.1f deg" % (t, bot.x, bot.y, math.degrees(math.atan2(math.sin(bot.th), math.cos(bot.th)))))
