"""LQR for a joint seen as a double integrator: find the best gains K for u = -K x."""
import numpy as np

A = np.array([[0.0, 1.0], [0.0, 0.0]])     # x = (position error, speed), x' = A x + B u
B = np.array([[0.0], [1.0]])               # u = acceleration
R = np.array([[1.0]])                      # price of the command

for q in [1.0, 100.0, 10000.0]:            # price of the position error
    Q = np.diag([q, 0.0])
    P = np.eye(2)
    for _ in range(200000):                # integrate the Riccati equation until it stops changing
        dP = A.T @ P + P @ A - P @ B @ np.linalg.inv(R) @ B.T @ P + Q
        P += 1e-4 * dP
        if np.abs(dP).max() < 1e-9:
            break
    K = np.linalg.inv(R) @ B.T @ P
    poles = np.linalg.eigvals(A - B @ K)
    wn = abs(poles[0]); zeta = -poles[0].real / wn
    print(f'q = {q:7.0f}:  K = [{K[0, 0]:7.3f} {K[0, 1]:6.3f}]   poles = {np.round(poles, 3)}   '
          f'wn = {wn:5.2f} rad/s   damping = {zeta:.3f}')
