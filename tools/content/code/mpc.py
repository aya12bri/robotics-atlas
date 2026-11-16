"""Model predictive control of a joint (double integrator) with a limit on the acceleration."""
import numpy as np

dt, N = 0.1, 20                   # sample time (s) and horizon (steps): the controller looks 2 s ahead
A = np.array([[1, dt], [0, 1]])   # state x = (position, speed)
B = np.array([[0.5 * dt**2], [dt]])
U_MAX = 1.0                       # |acceleration| <= 1 rad/s^2 (the motor limit)
Q, R_W = np.diag([10.0, 1.0]), 0.1


def predict_matrices():
    """Stack the predictions: X = F x0 + G U over the whole horizon."""
    F = np.vstack([np.linalg.matrix_power(A, k + 1) for k in range(N)])
    G = np.zeros((2 * N, N))
    for k in range(N):
        for j in range(k + 1):
            G[2 * k:2 * k + 2, j:j + 1] = np.linalg.matrix_power(A, k - j) @ B
    return F, G


F, G = predict_matrices()
Qbar = np.kron(np.eye(N), Q)
H = G.T @ Qbar @ G + R_W * np.eye(N)          # cost = U^T H U + 2 U^T g  (a quadratic programme)


def mpc_step(x0, target):
    g = G.T @ Qbar @ (F @ x0 - np.tile(target, N))
    U = np.zeros(N)
    step = 1.0 / np.linalg.eigvalsh(H).max()
    for _ in range(300):                       # projected gradient: descend, then clip to the limits
        U = np.clip(U - step * (H @ U + g), -U_MAX, U_MAX)
    return U[0]                                # apply only the first command, then do it all again


if __name__ == '__main__':
    x, target = np.array([0.0, 0.0]), np.array([1.0, 0.0])    # go from 0 to 1 rad and stop
    for k in range(41):
        u = mpc_step(x, target)
        if k % 5 == 0:
            print(f't = {k * dt:3.1f} s   position = {x[0]:6.3f} rad   speed = {x[1]:6.3f} rad/s   u = {u:6.3f} rad/s^2')
        x = A @ x + B[:, 0] * u
