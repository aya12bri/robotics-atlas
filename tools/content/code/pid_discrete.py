"""A digital PI(D) speed controller for a DC motor, simulated in discrete time.

Motor (first order): tau * dw/dt + w = K * u   (u in volts, w in rad/s)
Controller: runs every Ts seconds, like the code inside a motor drive.
"""


class PID:
    def __init__(self, kp, ki, kd, ts, u_min, u_max, d_filter=0.1):
        self.kp, self.ki, self.kd, self.ts = kp, ki, kd, ts
        self.u_min, self.u_max = u_min, u_max
        self.a = d_filter            # 0 < a <= 1: smaller = smoother derivative
        self.integral = 0.0
        self.prev_meas = None
        self.d_filt = 0.0

    def step(self, target, meas):
        error = target - meas
        # derivative of the MEASUREMENT (not of the error): no kick when the target jumps
        d_raw = 0.0 if self.prev_meas is None else -(meas - self.prev_meas) / self.ts
        self.prev_meas = meas
        self.d_filt += self.a * (d_raw - self.d_filt)          # low-pass filter on D
        u = self.kp * error + self.integral + self.kd * self.d_filt
        # anti-windup: integrate only if the output is not saturated (or if it helps to leave saturation)
        if self.u_min < u < self.u_max or (u >= self.u_max and error < 0) or (u <= self.u_min and error > 0):
            self.integral += self.ki * error * self.ts
        return max(self.u_min, min(self.u_max, u))


def simulate(kp, ki, kd=0.0, ts=0.001, t_end=0.6, target=20.0):
    K, tau = 2.0, 0.1                 # motor gain (rad/s per volt) and time constant (s)
    w, t = 0.0, 0.0
    pid = PID(kp, ki, kd, ts, u_min=-24.0, u_max=24.0)
    log = []
    while t <= t_end + 1e-9:
        u = pid.step(target, w)       # 1. measure and compute (once per sample)
        w += ts * (K * u - w) / tau   # 2. the motor reacts during one sample (Euler step)
        log.append((t, w, u))
        t += ts
    return log


if __name__ == '__main__':
    for name, kp, ki in [('P only', 0.5, 0.0), ('PI', 0.5, 5.0)]:
        log = simulate(kp, ki)
        print(name)
        for t, w, u in log:
            if any(abs(t - x) < 1e-6 for x in (0.05, 0.1, 0.2, 0.4, 0.6)):
                print(f'  t = {t:.2f} s   speed = {w:6.2f} rad/s   voltage = {u:6.2f} V')
