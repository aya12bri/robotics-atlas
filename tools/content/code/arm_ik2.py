"""Closed-form inverse kinematics of the planar 2-axis arm, with both elbow solutions."""
import numpy as np
from arm_fk2 import fk, L1, L2


def ik(x, y, elbow_up=True):
    """Tool position (m) -> joint angles (rad), or None if the point is out of reach."""
    c2 = (x * x + y * y - L1 * L1 - L2 * L2) / (2 * L1 * L2)    # law of cosines
    if abs(c2) > 1:
        return None                                              # too far or too close
    s2 = np.sqrt(1 - c2 * c2) * (-1 if elbow_up else 1)          # the two signs = the two elbows
    theta2 = np.arctan2(s2, c2)
    theta1 = np.arctan2(y, x) - np.arctan2(L2 * s2, L1 + L2 * c2)
    return theta1, theta2


if __name__ == '__main__':
    for target in [(0.537, 0.636), (0.6, 0.2), (1.0, 0.0)]:
        print('target', target)
        for up in (True, False):
            sol = ik(*target, elbow_up=up)
            if sol is None:
                print('   out of reach (max reach 0.9 m)')
                break
            _, tool = fk(*sol)                                   # round trip: FK(IK(x)) must give x back
            print(f'   elbow {"up  " if up else "down"}: theta = ({np.degrees(sol[0]):7.2f}, {np.degrees(sol[1]):7.2f}) deg'
                  f'   check FK -> ({tool[0]:.3f}, {tool[1]:.3f})')
