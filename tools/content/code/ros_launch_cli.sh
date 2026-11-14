# the file is my_robot/launch/demo.launch.py; add to setup.py (data_files):
#   (os.path.join('share', package_name, 'launch'), glob('launch/*.launch.py')),
colcon build --symlink-install && source install/setup.bash

ros2 launch my_robot demo.launch.py                # starts the three nodes
ros2 launch my_robot demo.launch.py robot:=r2      # same nodes, for a second robot
ros2 launch my_robot demo.launch.py --show-args    # which arguments does it accept?
