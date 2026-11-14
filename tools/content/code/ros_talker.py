import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class Talker(Node):
    def __init__(self):
        super().__init__('talker')                               # the name of the node
        self.pub = self.create_publisher(String, 'chatter', 10)  # type, topic, queue size
        self.timer = self.create_timer(0.5, self.tick)           # call tick() every 0.5 s
        self.count = 0

    def tick(self):
        msg = String()
        msg.data = f'Hello robot: {self.count}'
        self.pub.publish(msg)
        self.get_logger().info(f'I said: "{msg.data}"')
        self.count += 1


def main():
    rclpy.init()
    node = Talker()
    try:
        rclpy.spin(node)             # wait and run the callbacks until Ctrl+C
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == '__main__':
    main()
