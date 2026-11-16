"""Forward kinematics of ANY serial arm from its DH table (standard or modified)."""
import numpy as np


def dh_std(theta, d, a, alpha):
    """Standard DH: Rot(z, theta) Trans(z, d) Trans(x, a) Rot(x, alpha)."""
    ct, st, ca, sa = np.cos(theta), np.sin(theta), np.cos(alpha), np.sin(alpha)
    return np.array([[ct, -st * ca,  st * sa, a * ct],
                     [st,  ct * ca, -ct * sa, a * st],
                     [0,       sa,       ca,      d],
                     [0,        0,        0,      1]])


def dh_mod(alpha, a, theta, d):
    """Modified DH (DHM): Rot(x, alpha) Trans(x, a) Rot(z, theta) Trans(z, d)."""
    ct, st, ca, sa = np.cos(theta), np.sin(theta), np.cos(alpha), np.sin(alpha)
    return np.array([[ct,      -st,   0,       a],
                     [st * ca, ct * ca, -sa, -d * sa],
                     [st * sa, ct * sa,  ca,  d * ca],
                     [0,        0,       0,       1]])


def fk(rows, joint, q):
    """rows: the DH table; joint(row, qi) -> the matrix of one row. Returns the 4x4 pose of the tool."""
    T = np.eye(4)
    for row, qi in zip(rows, q):
        T = T @ joint(row, qi)
    return T


# the 3-axis arm of the course: shoulder height 0.40 m, links 0.45 m and 0.38 m
STD = [(0.40, 0.00, np.pi / 2), (0.0, 0.45, 0.0), (0.0, 0.38, 0.0)]          # (d, a, alpha), theta = q
MOD = [(0.0, 0.00, 0.40), (np.pi / 2, 0.00, 0.0), (0.0, 0.45, 0.0), (0.0, 0.38, 0.0)]   # (alpha, a, d), theta = q (0 for the tool)

std_joint = lambda row, qi: dh_std(qi, row[0], row[1], row[2])
mod_joint = lambda row, qi: dh_mod(row[0], row[1], qi, row[2])

if __name__ == '__main__':
    q = np.radians([25, 70, -80])
    T_std = fk(STD, std_joint, q)
    T_mod = fk(MOD, mod_joint, list(q) + [0.0])        # the fixed tool row has theta = 0
    np.set_printoptions(precision=3, suppress=True)
    print('tool position, standard DH :', T_std[:3, 3])
    print('tool position, modified DH :', T_mod[:3, 3])
    print('same pose (position and orientation):', np.allclose(T_std, T_mod))
    print('zero pose (all angles 0)   :', fk(STD, std_joint, [0, 0, 0])[:3, 3])
