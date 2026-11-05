import numpy as np

def predict(mu, S, v, w, dt, q):
    x, y, th = mu
    mu_new = np.array([x + v * dt * np.cos(th), y + v * dt * np.sin(th), th + w * dt])
    G = np.array([[1, 0, -v * dt * np.sin(th)],
                  [0, 1,  v * dt * np.cos(th)],
                  [0, 0, 1]])
    return mu_new, G @ S @ G.T + np.diag(q)

def update(mu, S, z, H, R):
    innov = z - H @ mu
    Sinn = H @ S @ H.T + R
    K = S @ H.T @ np.linalg.inv(Sinn)
    mu_new = mu + K @ innov
    S_new = (np.eye(3) - K @ H) @ S
    return mu_new, S_new, innov, Sinn

if __name__ == "__main__":
    # one step by hand
    mu = np.array([0.0, 0.0, 0.0]); S = np.diag([0.01, 0.01, 0.005])
    mu, S = predict(mu, S, v=1.0, w=0.2, dt=0.5, q=[0.002, 0.002, 0.001])
    print("after prediction : mu =", np.round(mu, 3), " sigma_x =", round(float(np.sqrt(S[0, 0])), 4), " sigma_y =", round(float(np.sqrt(S[1, 1])), 4), " sigma_th =", round(float(np.sqrt(S[2, 2])), 4))
    H = np.array([[1, 0, 0], [0, 1, 0]]); R = np.diag([0.0025, 0.0025])        # GPS-like, sigma = 5 cm
    z = np.array([0.52, 0.03])
    mu2, S2, innov, Sinn = update(mu, S, z, H, R)
    print("innovation       :", np.round(innov, 3))
    print("after update     : mu =", np.round(mu2, 3), " sigma_x =", round(float(np.sqrt(S2[0, 0])), 4), " sigma_th =", round(float(np.sqrt(S2[2, 2])), 4))
    d2 = float(innov @ np.linalg.inv(Sinn) @ innov); print("Mahalanobis d^2   :", round(d2, 2), "(gate 9.21 for 99 %, 2 dof)")

    # simulation: robot on a circle, noisy odometry, position fix every second
    rng = np.random.default_rng(3)
    dt, T = 0.1, 60.0
    truth = np.array([0.0, 0.0, 0.0]); est = truth.copy(); dr = truth.copy(); P = np.diag([1e-4, 1e-4, 1e-4])
    v, w = 0.5, 0.25
    e_dr, e_ekf = [], []
    for k in range(int(T / dt)):
        # true motion
        truth = np.array([truth[0] + v * dt * np.cos(truth[2]), truth[1] + v * dt * np.sin(truth[2]), truth[2] + w * dt])
        # noisy measured speeds (this is what odometry sees): 3 % speed error + 0.02 rad/s gyro-like bias on w
        vm = v * 1.03 + rng.normal(0, 0.02); wm = w + 0.02 + rng.normal(0, 0.01)
        dr = np.array([dr[0] + vm * dt * np.cos(dr[2]), dr[1] + vm * dt * np.sin(dr[2]), dr[2] + wm * dt])
        est, P = predict(est, P, vm, wm, dt, [1e-5, 1e-5, 1e-5])
        if (k + 1) % 10 == 0:                                               # a position fix every second
            z = truth[:2] + rng.normal(0, 0.05, 2)
            est, P, _, _ = update(est, P, z, H, R)
        e_dr.append(np.hypot(*(dr[:2] - truth[:2]))); e_ekf.append(np.hypot(*(est[:2] - truth[:2])))
    print("after %.0f s      : odometry-only error %.2f m, EKF error %.3f m (RMS over the run: %.2f m vs %.3f m)" % (T, e_dr[-1], e_ekf[-1], np.sqrt(np.mean(np.square(e_dr))), np.sqrt(np.mean(np.square(e_ekf)))))
