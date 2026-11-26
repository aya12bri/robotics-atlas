# check a joint against its limits, then move it step by step
LOW, HIGH = -90, 90            # joint limits in degrees

def check(angle):
    if angle < LOW:
        return "too low"
    elif angle > HIGH:
        return "too high"
    else:
        return "ok"

for a in [-120, 0, 45, 100]:
    print(a, check(a))

# a simple loop: move from 0 to 60 degrees in steps of 15
angle = 0
while angle < 60:
    angle += 15
    print("joint at", angle)
