# a small robot class and a proportional controller on one joint
import math

class Arm2:
    def __init__(self, L1=0.5, L2=0.4):
        self.L1, self.L2 = L1, L2
        self.q = [0.0, 0.0]                      # joint angles in degrees

    def tool(self):
        t1, t12 = math.radians(self.q[0]), math.radians(self.q[0] + self.q[1])
        return (self.L1 * math.cos(t1) + self.L2 * math.cos(t12),
                self.L1 * math.sin(t1) + self.L2 * math.sin(t12))

arm = Arm2()
target, Kp, dt = 60.0, 4.0, 0.05                 # P controller on joint 1
for k in range(6):
    error = target - arm.q[0]
    speed = Kp * error                           # deg/s
    arm.q[0] += speed * dt
    print(f"step {k}: q1 = {arm.q[0]:5.1f} deg, error = {error:5.1f}")
print("tool at (%.2f, %.2f) m" % arm.tool())
