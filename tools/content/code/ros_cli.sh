ros2 node list                    # which nodes are running?
ros2 topic list -t                # which topics exist, and their message type
ros2 topic echo /chatter          # print the messages of a topic
ros2 topic hz /chatter            # how many messages per second?
ros2 topic info /chatter -v       # who publishes, who subscribes, with which QoS
ros2 interface show geometry_msgs/msg/Twist    # what is inside a message type

# publish by hand: drive a robot forward at 0.2 m/s while turning at 0.5 rad/s, 10 times per second
ros2 topic pub -r 10 /cmd_vel geometry_msgs/msg/Twist "{linear: {x: 0.2}, angular: {z: 0.5}}"

rqt_graph                         # draw the graph of nodes and topics
