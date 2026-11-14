sudo apt install ros-jazzy-turtlebot3-gazebo ros-jazzy-teleop-twist-keyboard
export TURTLEBOT3_MODEL=burger

ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py     # terminal 1: the simulated robot and its world

ros2 run teleop_twist_keyboard teleop_twist_keyboard         # terminal 2: drive it with the keyboard
ros2 topic echo /odom --once                                 # terminal 3: where the robot thinks it is
ros2 topic echo /scan --once                                 #             one turn of the laser scanner
rviz2                                                        # add the displays LaserScan, TF and RobotModel

ros2 bag record -o run1 /scan /odom /tf /cmd_vel             # record a test...
ros2 bag info run1
ros2 bag play run1                                           # ...and replay it later, without the robot
