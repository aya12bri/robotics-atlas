ros2 run my_robot adder                                   # terminal 1: the server

ros2 service list -t                                      # terminal 2
ros2 service call /add_two_ints example_interfaces/srv/AddTwoInts "{a: 2, b: 3}"
#   -> response: example_interfaces.srv.AddTwoInts_Response(sum=5)

ros2 param list /adder
ros2 param set /adder offset 10                           # change the parameter while the node runs
ros2 service call /add_two_ints example_interfaces/srv/AddTwoInts "{a: 2, b: 3}"
#   -> sum=15

ros2 action list -t                                       # the actions, if a node offers some
