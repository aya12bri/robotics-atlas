import math

import rclpy
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan


class SafeDriver(Node):
    """Drive forward, and turn on the spot when an obstacle is closer than stop_distance."""

    def __init__(self):
        super().__init__('safe_driver')
        self.declare_parameter('speed', 0.15)             # m/s
        self.declare_parameter('stop_distance', 0.40)     # m
        self.front = math.inf                             # nearest obstacle in front (m)
        self.cmd = self.create_publisher(Twist, 'cmd_vel', 10)
        self.scan = self.create_subscription(LaserScan, 'scan', self.on_scan, qos_profile_sensor_data)
        self.timer = self.create_timer(0.1, self.control)  # the control loop: 10 Hz

    def on_scan(self, msg):
        # keep the beams within 25 degrees of straight ahead (angle 0)
        near = []
        for i, r in enumerate(msg.ranges):
            angle = msg.angle_min + i * msg.angle_increment
            angle = math.atan2(math.sin(angle), math.cos(angle))      # wrap to [-pi, pi]
            if abs(angle) < math.radians(25) and msg.range_min < r < msg.range_max:
                near.append(r)
        self.front = min(near) if near else math.inf

    def control(self):
        cmd = Twist()
        if self.front > self.get_parameter('stop_distance').value:
            cmd.linear.x = self.get_parameter('speed').value          # the way is free: go
        else:
            cmd.angular.z = 0.6                                       # obstacle: turn left on the spot
        self.cmd.publish(cmd)


def main():
    rclpy.init()
    node = SafeDriver()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.cmd.publish(Twist())                                     # stop the robot before leaving
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == '__main__':
    main()
