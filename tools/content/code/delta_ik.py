"""Inverse kinematics of a Delta robot: one closed formula per arm, then a check of every constraint."""
import numpy as np

R, r = 0.20, 0.05          # radius of the motor circle (base) and of the joint circle (moving platform), m
L, l = 0.30, 0.60          # upper arm (driven by the motor) and forearm (the parallelogram), m
PHI = np.radians([0, 120, 240])   # directions of the three arms around the vertical axis


def ik(p):
    """Platform centre p = (x, y, z) -> the three motor angles (rad, positive = arm going down), or None."""
    angles = []
    for phi in PHI:
        c, s = np.cos(phi), np.sin(phi)
        x, y, z = c * p[0] + s * p[1], -s * p[0] + c * p[1], p[2]   # p seen from the plane of this arm
        xq, yq, zq = x + r - R, y, z                                  # wrist joint relative to the motor axis
        k = (xq**2 + yq**2 + zq**2 + L**2 - l**2) / (2 * L)
        rho = np.hypot(xq, zq)
        if abs(k) > rho:
            return None                                              # out of the workspace
        angles.append(-np.arctan2(zq, xq) - np.arccos(k / rho))      # the elbow pointing outwards
    return np.array(angles)


def check(p, th):
    """Length of each forearm for the solution: must be exactly l."""
    out = []
    for phi, t in zip(PHI, th):
        c, s = np.cos(phi), np.sin(phi)
        elbow = np.array([R + L * np.cos(t), 0, -L * np.sin(t)])
        wrist = np.array([c * p[0] + s * p[1] + r, -s * p[0] + c * p[1], p[2]])
        out.append(np.linalg.norm(elbow - wrist))
    return np.array(out)


if __name__ == '__main__':
    np.set_printoptions(precision=4, suppress=True)
    for p in [(0, 0, -0.6), (0.1, 0, -0.6), (0.05, 0.08, -0.55), (0.6, 0, -0.6)]:
        th = ik(np.array(p, dtype=float))
        if th is None:
            print(f'p = {p}: out of reach')
        else:
            print(f'p = {p}: angles = {np.degrees(th)} deg   forearm lengths = {check(np.array(p, float), th)} m')
