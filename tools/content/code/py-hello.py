# my first robot program: variables, types and print
name = "R2"              # a text (str)
joints = 3               # a whole number (int)
length = 0.45            # a decimal number (float), in metres
powered = True           # True or False (bool)

print("Robot", name, "has", joints, "joints")
print("Link length:", length, "m")
print("Powered:", powered)
print(type(joints), type(length))
