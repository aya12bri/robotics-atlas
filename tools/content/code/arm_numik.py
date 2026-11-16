"""Numerical inverse kinematics for any arm: Jacobian by finite differences + damped least squares."""
import numpy as np
from arm_dh import fk, STD, std_joint

LIMITS = np.radians([[-170, 170], [-10, 170], [-150, 150]])


def position(q):
    return fk(STD, std_joint, q)[:3, 3]


def jacobian(q, h=1e-6):
    """3 x n matrix: column i = how the tool moves when joint i turns a little."""
    p0 = position(q)
    J = np.zeros((3, len(q)))
    for i in range(len(q)):
        dq = np.array(q, dtype=float)
        dq[i] += h
        J[:, i] = (position(dq) - p0) / h
    return J


def ik(target, q0, damping=0.01, tol=1e-4, max_iter=100):
    q = np.array(q0, dtype=float)
    for it in range(max_iter):
        error = target - position(q)
        if np.linalg.norm(error) < tol:
            return q, it
        J = jacobian(q)
        # damped least squares: dq = J^T (J J^T + lambda^2 I)^-1 error  (safe near singularities)
        dq = J.T @ np.linalg.solve(J @ J.T + damping ** 2 * np.eye(3), error)
        q = np.clip(q + dq, LIMITS[:, 0], LIMITS[:, 1])
    return q, max_iter


if __name__ == '__main__':
    np.set_printoptions(precision=3, suppress=True)
    target = np.array([0.479, 0.223, 0.757])           # the tool position of the DH lesson
    q, n = ik(target, q0=np.radians([0, 45, -45]))
    print(f'converged in {n} iterations: q = {np.degrees(q)} deg')
    print('reached position:', position(q), ' error (mm):', round(1000 * np.linalg.norm(position(q) - target), 3))
    # 20 random reachable targets: pick random joint angles, compute the position, then solve back
    rng = np.random.default_rng(1)
    targets = [position(rng.uniform(LIMITS[:, 0] * 0.8, LIMITS[:, 1] * 0.8)) for _ in range(20)]
    ok1 = ok2 = 0
    for p in targets:
        q_sol, _ = ik(p, q0=np.radians([0, 45, -45]))                 # always the same start
        ok1 += np.linalg.norm(position(q_sol) - p) < 1e-3
        for start in [np.radians([0, 45, -45])] + [rng.uniform(LIMITS[:, 0], LIMITS[:, 1]) for _ in range(5)]:
            q_sol, _ = ik(p, q0=start)                                # retry from other starts if needed
            if np.linalg.norm(position(q_sol) - p) < 1e-3:
                ok2 += 1
                break
    print(f'random targets reached within 1 mm, one start     : {ok1} / 20')
    print(f'random targets reached within 1 mm, up to 6 starts: {ok2} / 20')
