# a function for the forward kinematics of a 2-link arm
import math

def fk(theta1, theta2, L1=0.5, L2=0.4):
    """Angles in degrees -> position (x, y) of the tool in metres."""
    t1 = math.radians(theta1)
    t12 = math.radians(theta1 + theta2)
    x = L1 * math.cos(t1) + L2 * math.cos(t12)
    y = L1 * math.sin(t1) + L2 * math.sin(t12)
    return x, y

x, y = fk(30, 45)
print(f"tool at ({x:.3f}, {y:.3f}) m")
print(fk(0, 0))            # arm stretched along x: (0.9, 0.0)
