import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts      # request: a, b   response: sum


class Adder(Node):
    def __init__(self):
        super().__init__('adder')
        self.srv = self.create_service(AddTwoInts, 'add_two_ints', self.add)
        self.declare_parameter('offset', 0)          # a parameter, with its default value

    def add(self, request, response):
        offset = self.get_parameter('offset').value
        response.sum = request.a + request.b + offset
        self.get_logger().info(f'{request.a} + {request.b} (+ {offset}) = {response.sum}')
        return response


def main():
    rclpy.init()
    node = Adder()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == '__main__':
    main()
