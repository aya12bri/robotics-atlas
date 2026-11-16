"""Forward kinematics of a planar 2-axis arm: from the joint angles to the tool."""
import numpy as np

L1, L2 = 0.5, 0.4                      # link lengths (m)


def fk(theta1, theta2):
    """Joint angles (rad) -> positions of the elbow and of the tool (m)."""
    elbow = np.array([L1 * np.cos(theta1), L1 * np.sin(theta1)])
    tool = elbow + np.array([L2 * np.cos(theta1 + theta2), L2 * np.sin(theta1 + theta2)])
    return elbow, tool


if __name__ == '__main__':
    for deg in [(0, 0), (30, 45), (90, -90), (120, 60)]:
        q = np.radians(deg)
        elbow, tool = fk(*q)
        print(f'theta = {deg} deg  ->  elbow ({elbow[0]:6.3f}, {elbow[1]:6.3f})  '
              f'tool ({tool[0]:6.3f}, {tool[1]:6.3f})  reach {np.linalg.norm(tool):.3f} m')
