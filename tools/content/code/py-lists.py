# a list of waypoints and a dictionary of robot parameters
robot = {"name": "arm2", "L1": 0.5, "L2": 0.4, "max_speed": 90}   # dict: key -> value
waypoints = [(0, 0), (30, 45), (60, -30), (90, 0)]               # list of tuples (theta1, theta2)

print("robot", robot["name"], "with", len(waypoints), "waypoints")
for i, (t1, t2) in enumerate(waypoints):
    print(f"point {i}: theta1 = {t1}, theta2 = {t2}")

waypoints.append((0, 0))                 # go back home at the end
print("last point:", waypoints[-1], "- total:", len(waypoints))
