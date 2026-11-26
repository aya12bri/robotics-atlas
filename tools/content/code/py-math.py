# where is the end of a link? the math module works in radians
import math

L = 0.5                        # link length (m)
theta_deg = 30                 # joint angle in degrees
theta = math.radians(theta_deg)

x = L * math.cos(theta)
y = L * math.sin(theta)
print(f"x = {x:.3f} m, y = {y:.3f} m")

# and back: the angle of a point with atan2 (right in every quadrant)
angle = math.degrees(math.atan2(y, x))
print(f"angle = {angle:.1f} deg")
