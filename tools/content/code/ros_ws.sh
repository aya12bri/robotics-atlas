mkdir -p ~/ros2_ws/src && cd ~/ros2_ws/src
ros2 pkg create my_robot --build-type ament_python --dependencies rclpy std_msgs

# put talker.py and listener.py in my_robot/my_robot/, then declare them in setup.py:
#   entry_points={'console_scripts': [
#       'talker = my_robot.talker:main',
#       'listener = my_robot.listener:main',
#   ]},

cd ~/ros2_ws
colcon build --symlink-install     # build every package of the workspace
source install/setup.bash          # make the new package visible in this terminal

ros2 run my_robot talker           # terminal 1
ros2 run my_robot listener         # terminal 2 (source install/setup.bash first)
