from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription([
        DeclareLaunchArgument('robot', default_value='r1'),   # ros2 launch ... robot:=r2

        Node(package='my_robot', executable='talker',
             namespace=LaunchConfiguration('robot'),           # topics become /r1/...
             remappings=[('chatter', 'news')],                 # (name in the code, name on the network)
             output='screen'),

        Node(package='my_robot', executable='listener',
             namespace=LaunchConfiguration('robot'),
             remappings=[('chatter', 'news')],
             output='screen'),

        Node(package='my_robot', executable='adder',
             parameters=[{'offset': 10}]),                     # or a YAML file
    ])
