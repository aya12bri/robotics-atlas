"""A smooth joint trajectory (degree-5 polynomial) and the servo pulses that follow it."""
import numpy as np


def quintic(q0, q1, T, t):
    """Position at time t of a motion from q0 to q1 in T seconds, with zero speed and acceleration at both ends."""
    s = np.clip(t / T, 0.0, 1.0)
    return q0 + (q1 - q0) * (10 * s**3 - 15 * s**4 + 6 * s**5)


def to_pulse_us(angle_deg, offset_deg=0.0, us_min=500, us_max=2500):
    """Hobby servo: 0..180 deg -> 500..2500 microseconds; offset_deg = calibration of the zero."""
    a = np.clip(angle_deg + offset_deg, 0, 180)
    return int(round(us_min + (us_max - us_min) * a / 180))


if __name__ == '__main__':
    q_start = np.array([90.0, 45.0, 120.0])     # servo angles (deg)
    q_goal = np.array([30.0, 100.0, 60.0])
    T = 2.0                                      # duration (s)
    offsets = [0.0, -3.0, 2.0]                   # measured once, servo by servo
    for t in np.arange(0.0, T + 1e-9, 0.5):
        q = quintic(q_start, q_goal, T, t)
        pulses = [to_pulse_us(a, o) for a, o in zip(q, offsets)]
        print(f't = {t:.1f} s   angles = {np.round(q, 1)} deg   pulses = {pulses} us')
    mid_speed = (quintic(q_start, q_goal, T, 1.001) - quintic(q_start, q_goal, T, 0.999)) / 0.002
    print('peak speed at mid-time (deg/s):', np.round(mid_speed, 1), ' = 1.875 x average speed')
