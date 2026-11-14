# Ubuntu 24.04 + ROS 2 Jazzy (after adding the ROS 2 apt repository, see docs.ros.org)
sudo apt install ros-jazzy-desktop          # ROS 2, RViz, demos
sudo apt install python3-colcon-common-extensions

source /opt/ros/jazzy/setup.bash            # in every new terminal (or put it in ~/.bashrc)

ros2 run demo_nodes_cpp talker              # terminal 1: publishes "Hello World: 1, 2, 3..."
ros2 run demo_nodes_py listener             # terminal 2: prints what it hears
