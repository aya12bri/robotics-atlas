sudo apt install ros-jazzy-navigation2 ros-jazzy-nav2-bringup ros-jazzy-slam-toolbox

# 1. build a map: drive the robot around while slam_toolbox draws the map
ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py
ros2 launch slam_toolbox online_async_launch.py use_sim_time:=true
ros2 run teleop_twist_keyboard teleop_twist_keyboard
ros2 run nav2_map_server map_saver_cli -f ~/my_map          # writes my_map.pgm and my_map.yaml

# 2. navigate in this map: click "2D Pose Estimate", then "Nav2 Goal" in RViz
ros2 launch nav2_bringup bringup_launch.py use_sim_time:=true map:=$HOME/my_map.yaml
ros2 launch nav2_bringup rviz_launch.py
