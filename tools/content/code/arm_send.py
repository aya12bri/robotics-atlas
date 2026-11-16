"""Send a smooth trajectory to the 3-servo arm over USB (pip install pyserial numpy)."""
import time
import numpy as np
import serial                                   # pyserial
from arm_traj import quintic

PORT = '/dev/ttyACM0'                           # Windows: 'COM3'; macOS: '/dev/cu.usbmodem...'
OFFSETS = np.array([0.0, -3.0, 2.0])            # calibration of each servo (deg)

with serial.Serial(PORT, 115200, timeout=1) as link:
    time.sleep(2)                               # the Arduino restarts when the port opens
    q_start, q_goal, T, dt = np.array([90, 45, 120.0]), np.array([30, 100, 60.0]), 2.0, 0.02
    t0 = time.time()
    while (t := time.time() - t0) <= T:
        q = np.clip(quintic(q_start, q_goal, T, t) + OFFSETS, 0, 180)
        link.write(('%d %d %d\n' % tuple(np.round(q))).encode())
        time.sleep(dt)                          # 50 commands per second
