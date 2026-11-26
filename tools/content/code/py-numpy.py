# NumPy: vectors, matrices and a whole trajectory at once
import numpy as np

a = np.array([0.3, 0.4])
print("length of a:", np.linalg.norm(a))          # 0.5

def rot(deg):
    t = np.radians(deg)
    return np.array([[np.cos(t), -np.sin(t)],
                     [np.sin(t),  np.cos(t)]])

print("a turned by 90 deg:", rot(90) @ a)          # @ = matrix product

t = np.linspace(0, 2, 5)                           # 5 instants from 0 to 2 s
theta = 90 * t / 2                                 # a joint going from 0 to 90 deg
print("t     =", t)
print("theta =", theta)
