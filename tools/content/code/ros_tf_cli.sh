sudo apt install ros-jazzy-urdf-tutorial ros-jazzy-tf2-tools

ros2 launch urdf_tutorial display.launch.py model:=$PWD/robot.urdf
#   -> RViz shows the arm, and a small window with one slider per joint

ros2 run tf2_ros tf2_echo base_link link2          # where is link2, seen from the base?
ros2 run tf2_tools view_frames                     # writes frames.pdf: the whole tree

# a fixed frame, for example a camera 0.2 m in front of the base and 0.5 m above it
ros2 run tf2_ros static_transform_publisher --x 0.2 --z 0.5 --frame-id base_link --child-frame-id camera_link
