# plot a joint trajectory and read sensor data from a file
import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(0, 2, 200)
s = 10 * (t / 2)**3 - 15 * (t / 2)**4 + 6 * (t / 2)**5     # smooth law from 0 to 1
theta = 90 * s                                            # degrees

plt.plot(t, theta, label="theta (deg)")
plt.xlabel("time (s)"); plt.ylabel("angle (deg)"); plt.legend(); plt.grid()
plt.savefig("trajectory.png")                              # or plt.show()

data = np.loadtxt("distance.csv", delimiter=",")           # one column of measurements (m)
print(f"mean = {data.mean():.3f} m, std = {data.std():.3f} m, n = {data.size}")
