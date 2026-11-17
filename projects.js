// projects.js — guided real projects (projects.html): parts with indicative prices, wiring, code, steps and tests,
// in English and French (the page is built in the visitor's language). The code has not been run on real hardware
// by the site: the tests of each project are there to check it, step by step.
(function () {
  function start() {
    var RA = window.RA || {}, FR = RA.lang === 'fr', LG = FR ? 1 : 0;
    var L = function (en, fr) { return FR ? fr : en; };
    var t = function (p) { return Array.isArray(p) ? p[LG] : p; };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var main = document.getElementById('prj');
    document.title = L('Guided projects', 'Projets guidés') + ' — Robotics Atlas';

    // ---------------------------------------------------------------- 1. a 2-axis arm with servos (Arduino)
    var ARM = '#include <Servo.h>\n#include <math.h>\n\n' +
      '// ' + L('2-link planar arm: L1 = 10 cm, L2 = 8 cm. Type "x y" (cm) in the Serial Monitor.', 'Bras plan à 2 corps : L1 = 10 cm, L2 = 8 cm. Tapez « x y » (cm) dans le moniteur série.') + '\n' +
      'const float L1 = 10.0, L2 = 8.0;\n' +
      'const int OFFSET1 = 0, OFFSET2 = 0;   // ' + L('degrees: measure them once (step 4)', 'degrés : à mesurer une fois (étape 4)') + '\n' +
      'Servo s1, s2;\n\n' +
      'bool ik(float x, float y, float &t1, float &t2) {   // ' + L('angles in degrees, elbow down', 'angles en degrés, coude en bas') + '\n' +
      '  float c2 = (x * x + y * y - L1 * L1 - L2 * L2) / (2 * L1 * L2);\n' +
      '  if (c2 < -1 || c2 > 1) return false;              // ' + L('out of reach', 'hors d\'atteinte') + '\n' +
      '  float a2 = acos(c2);\n' +
      '  float a1 = atan2(y, x) - atan2(L2 * sin(a2), L1 + L2 * cos(a2));\n' +
      '  t1 = a1 * 180.0 / PI;  t2 = a2 * 180.0 / PI;\n' +
      '  return true;\n}\n\n' +
      'void moveTo(float t1, float t2) {                    // ' + L('slowly, 1 degree at a time', 'doucement, 1 degré à la fois') + '\n' +
      '  static float c1 = 90, c2 = 90;\n' +
      '  while (fabs(t1 - c1) > 0.5 || fabs(t2 - c2) > 0.5) {\n' +
      '    c1 += constrain(t1 - c1, -1, 1);  c2 += constrain(t2 - c2, -1, 1);\n' +
      '    s1.write(constrain((int)(c1 + OFFSET1), 0, 180));\n' +
      '    s2.write(constrain((int)(c2 + OFFSET2), 0, 180));\n' +
      '    delay(15);\n  }\n}\n\n' +
      'void setup() {\n  Serial.begin(115200);\n  s1.attach(9);  s2.attach(10);\n  moveTo(90, 90);\n' +
      '  Serial.println("' + L('Type x y in cm, for example: 12 6', 'Tapez x y en cm, par exemple : 12 6') + '");\n}\n\n' +
      'void loop() {\n  if (Serial.available()) {\n    float x = Serial.parseFloat(), y = Serial.parseFloat();\n    float t1, t2;\n' +
      '    if (ik(x, y, t1, t2) && t1 >= 0 && t1 <= 180 && t2 >= 0 && t2 <= 180) { moveTo(t1, t2); Serial.print("OK "); Serial.print(t1); Serial.print(" "); Serial.println(t2); }\n' +
      '    else Serial.println("' + L('unreachable', 'inatteignable') + '");\n    while (Serial.available()) Serial.read();\n  }\n}\n';

    // ---------------------------------------------------------------- 2. a line follower (Arduino, PID)
    var LINE = '// ' + L('Line follower: 3 IR sensors, TB6612FNG driver, PD control.', 'Suiveur de ligne : 3 capteurs IR, driver TB6612FNG, régulation PD.') + '\n' +
      'const int IR[3] = {A0, A1, A2};          // ' + L('left, middle, right', 'gauche, milieu, droite') + '\n' +
      'const int PWMA = 5, AIN1 = 7, AIN2 = 8;  // ' + L('left motor', 'moteur gauche') + '\n' +
      'const int PWMB = 6, BIN1 = 9, BIN2 = 10; // ' + L('right motor', 'moteur droit') + '\n' +
      'const int STBY = 4;\n' +
      'float Kp = 60, Kd = 20;                  // ' + L('to tune (step 5)', 'à régler (étape 5)') + '\n' +
      'int base = 140;                          // ' + L('base speed (0 to 255)', 'vitesse de base (0 à 255)') + '\n' +
      'int threshold = 500;                     // ' + L('between white and black (step 3)', 'entre blanc et noir (étape 3)') + '\n' +
      'float lastErr = 0;\n\n' +
      'void motor(int pwm, int in1, int in2, int v) {\n  v = constrain(v, -255, 255);\n  digitalWrite(in1, v >= 0);  digitalWrite(in2, v < 0);\n  analogWrite(pwm, abs(v));\n}\n\n' +
      'void setup() {\n  int pins[] = {PWMA, AIN1, AIN2, PWMB, BIN1, BIN2, STBY};\n  for (int p : pins) pinMode(p, OUTPUT);\n  digitalWrite(STBY, HIGH);\n  Serial.begin(115200);\n}\n\n' +
      'void loop() {\n  // ' + L('position of the line: -1 (left), 0 (middle), +1 (right)', 'position de la ligne : -1 (gauche), 0 (milieu), +1 (droite)') + '\n' +
      '  bool b[3];\n  for (int i = 0; i < 3; i++) b[i] = analogRead(IR[i]) > threshold;   // ' + L('true = black', 'vrai = noir') + '\n' +
      '  int n = b[0] + b[1] + b[2];\n  float err;\n' +
      '  if (n == 0) err = lastErr > 0 ? 1.5 : -1.5;   // ' + L('line lost: turn towards where it was', 'ligne perdue : tourner vers là où elle était') + '\n' +
      '  else err = (-1.0 * b[0] + 1.0 * b[2]) / n;\n' +
      '  float u = Kp * err + Kd * (err - lastErr);\n  lastErr = err;\n' +
      '  motor(PWMA, AIN1, AIN2, base + u);   // ' + L('line on the right: the left wheel speeds up', 'ligne à droite : la roue gauche accélère') + '\n' +
      '  motor(PWMB, BIN1, BIN2, base - u);\n  delay(5);\n}\n';

    // ---------------------------------------------------------------- 3. ROS 2 mobile robot: Arduino firmware + Python bridge node
    var FW = '// ' + L('Base firmware: receives "v w" (m/s, rad/s), sends the encoder counts back.', 'Firmware de la base : reçoit « v w » (m/s, rad/s), renvoie les impulsions des codeurs.') + '\n' +
      'const float TRACK = 0.16, R = 0.033;          // ' + L('track and wheel radius (m): measure yours', 'voie et rayon des roues (m) : mesurez les vôtres') + '\n' +
      'const float TICKS_PER_REV = 1320;             // ' + L('encoder counts per wheel turn (data sheet)', 'impulsions par tour de roue (fiche technique)') + '\n' +
      'const float MAX_W = 18.0;                     // ' + L('max wheel speed (rad/s) at PWM 255', 'vitesse max de roue (rad/s) à PWM 255') + '\n' +
      'volatile long tl = 0, tr = 0;\n' +
      'const int ENC_L = 2, ENC_LB = 4, ENC_R = 3, ENC_RB = 12;\n' +
      'const int PWML = 5, L1 = 7, L2 = 8, PWMR = 6, R1 = 9, R2 = 10, STBY = 11;\n' +
      'unsigned long lastCmd = 0, lastSend = 0;\n\n' +
      'void isrL() { tl += digitalRead(ENC_LB) ? -1 : 1; }\nvoid isrR() { tr += digitalRead(ENC_RB) ? 1 : -1; }\n\n' +
      'void wheel(int pwm, int a, int b, float w) {   // w: ' + L('wheel speed, rad/s (open loop)', 'vitesse de roue, rad/s (boucle ouverte)') + '\n' +
      '  int v = constrain((int)(255.0 * w / MAX_W), -255, 255);\n  digitalWrite(a, v >= 0);  digitalWrite(b, v < 0);  analogWrite(pwm, abs(v));\n}\n\n' +
      'void setup() {\n  Serial.begin(115200);\n  int pins[] = {PWML, L1, L2, PWMR, R1, R2, STBY};\n  for (int p : pins) pinMode(p, OUTPUT);\n  digitalWrite(STBY, HIGH);\n' +
      '  pinMode(ENC_LB, INPUT_PULLUP);  pinMode(ENC_RB, INPUT_PULLUP);\n' +
      '  attachInterrupt(digitalPinToInterrupt(ENC_L), isrL, RISING);\n  attachInterrupt(digitalPinToInterrupt(ENC_R), isrR, RISING);\n}\n\n' +
      'void loop() {\n  if (Serial.available()) {\n    float v = Serial.parseFloat(), w = Serial.parseFloat();\n    while (Serial.available()) Serial.read();\n' +
      '    wheel(PWML, L1, L2, (v - w * TRACK / 2) / R);   // ' + L('inverse kinematics of the differential drive', 'cinématique inverse du robot différentiel') + '\n' +
      '    wheel(PWMR, R1, R2, (v + w * TRACK / 2) / R);\n    lastCmd = millis();\n  }\n' +
      '  if (millis() - lastCmd > 500) { wheel(PWML, L1, L2, 0); wheel(PWMR, R1, R2, 0); }   // ' + L('watchdog: no command, stop', 'chien de garde : pas de commande, arrêt') + '\n' +
      '  if (millis() - lastSend >= 50) {                      // ' + L('20 Hz', '20 Hz') + '\n' +
      '    lastSend = millis();\n    noInterrupts(); long a = tl, b = tr; interrupts();\n    Serial.print(a); Serial.print(" "); Serial.println(b);\n  }\n}\n';
    var NODE = '# ' + L('ROS 2 node: /cmd_vel -> serial, encoder counts -> /odom and the odom -> base_link transform.', 'Nœud ROS 2 : /cmd_vel -> série, impulsions des codeurs -> /odom et la transformation odom -> base_link.') + '\n' +
      'import math\nimport serial\nimport rclpy\nfrom rclpy.node import Node\nfrom geometry_msgs.msg import Twist, TransformStamped\nfrom nav_msgs.msg import Odometry\nfrom tf2_ros import TransformBroadcaster\n\n' +
      'TRACK, R, TICKS = 0.16, 0.033, 1320.0\n\n\n' +
      'class Base(Node):\n    def __init__(self):\n        super().__init__("base")\n' +
      '        self.port = serial.Serial(self.declare_parameter("port", "/dev/ttyACM0").value, 115200, timeout=0.02)\n' +
      '        self.create_subscription(Twist, "cmd_vel", self.on_cmd, 10)\n' +
      '        self.odom = self.create_publisher(Odometry, "odom", 10)\n        self.tf = TransformBroadcaster(self)\n' +
      '        self.x = self.y = self.th = 0.0\n        self.last = None\n        self.create_timer(0.02, self.read)\n\n' +
      '    def on_cmd(self, m):\n        self.port.write(f"{m.linear.x:.3f} {m.angular.z:.3f}\\n".encode())\n\n' +
      '    def read(self):\n        line = self.port.readline().decode(errors="ignore").split()\n' +
      '        if len(line) != 2:\n            return\n        tl, tr = int(line[0]), int(line[1])\n' +
      '        if self.last is None:\n            self.last = (tl, tr)\n            return\n' +
      '        dl = (tl - self.last[0]) / TICKS * 2 * math.pi * R   # ' + L('distance of each wheel (m)', 'distance de chaque roue (m)') + '\n' +
      '        dr = (tr - self.last[1]) / TICKS * 2 * math.pi * R\n        self.last = (tl, tr)\n' +
      '        ds, dth = (dr + dl) / 2, (dr - dl) / TRACK            # ' + L('odometry (differential drive)', 'odométrie (robot différentiel)') + '\n' +
      '        self.x += ds * math.cos(self.th + dth / 2)\n        self.y += ds * math.sin(self.th + dth / 2)\n        self.th += dth\n' +
      '        now = self.get_clock().now().to_msg()\n        qz, qw = math.sin(self.th / 2), math.cos(self.th / 2)\n' +
      '        t = TransformStamped()\n        t.header.stamp, t.header.frame_id, t.child_frame_id = now, "odom", "base_link"\n' +
      '        t.transform.translation.x, t.transform.translation.y = self.x, self.y\n        t.transform.rotation.z, t.transform.rotation.w = qz, qw\n        self.tf.sendTransform(t)\n' +
      '        o = Odometry()\n        o.header.stamp, o.header.frame_id, o.child_frame_id = now, "odom", "base_link"\n' +
      '        o.pose.pose.position.x, o.pose.pose.position.y = self.x, self.y\n        o.pose.pose.orientation.z, o.pose.pose.orientation.w = qz, qw\n        self.odom.publish(o)\n\n\n' +
      'def main():\n    rclpy.init()\n    rclpy.spin(Base())\n\n\nif __name__ == "__main__":\n    main()\n';

    var P = [
      { id: 'arm', t: ['A 2-axis arm with servos (Arduino)', 'Un bras 2 axes à servos (Arduino)'], lv: [1, ['Beginner', 'Débutant']], time: ['an afternoon', 'un après-midi'], cost: '≈ 25–45 €',
        goal: ['Build a small planar arm that goes to any point (x, y) you type, with the inverse kinematics of the course running on the Arduino.', 'Construire un petit bras plan qui va à n\'importe quel point (x, y) que vous tapez, avec la cinématique inverse du cours qui tourne sur l\'Arduino.'],
        parts: [[['Arduino Uno (or a compatible board)', 'Arduino Uno (ou une carte compatible)'], 1, '10–25 €'], [['MG90S servos (metal gears; SG90 also works)', 'Servos MG90S (pignons métal ; des SG90 marchent aussi)'], 2, '6–10 €'], [['5 V power supply, 2 A or more', 'Alimentation 5 V, 2 A ou plus'], 1, '6–10 €'], [['Breadboard and jumper wires', 'Plaque d\'essai et fils'], 1, '5 €'], [['Links: cardboard, wood, or 3D-printed (10 cm and 8 cm between axes)', 'Bras : carton, bois ou impression 3D (10 cm et 8 cm entre axes)'], 2, '0–5 €'], [['A pen and tape, to draw', 'Un stylo et du ruban adhésif, pour dessiner'], 1, '—']],
        wiring: [[['Servo 1 (shoulder) signal', 'Signal du servo 1 (épaule)'], 'D9'], [['Servo 2 (elbow) signal', 'Signal du servo 2 (coude)'], 'D10'], [['Servo + (red)', '+ des servos (rouge)'], ['+5 V of the external supply', '+5 V de l\'alimentation externe']], [['Servo − (brown)', '− des servos (marron)'], ['GND of the supply AND GND of the Arduino (common ground)', 'GND de l\'alimentation ET GND de l\'Arduino (masse commune)']]],
        code: [['arm.ino', ARM, 'cpp']],
        steps: [['Fix servo 1 on a heavy base; fix link 1 (10 cm) on its horn, servo 2 at its end, link 2 (8 cm) on servo 2.', 'Fixez le servo 1 sur une base lourde ; fixez le bras 1 (10 cm) sur son palonnier, le servo 2 à son bout, le bras 2 (8 cm) sur le servo 2.'],
          ['Wire the servos to the external 5 V supply, never to the 5 V pin of the Arduino (its regulator cannot give the current of two servos), and join the grounds.', 'Câblez les servos sur l\'alimentation 5 V externe, jamais sur la broche 5 V de l\'Arduino (son régulateur ne peut pas donner le courant de deux servos), et reliez les masses.'],
          ['Upload the code, open the Serial Monitor at 115200 baud, type 12 6 and press Enter.', 'Téléversez le code, ouvrez le moniteur série à 115200 bauds, tapez 12 6 et appuyez sur Entrée.'],
          ['Measure the offsets: send each servo to 90° and check that the links are at the angle the maths expects; put the difference in OFFSET1 and OFFSET2.', 'Mesurez les décalages : envoyez chaque servo à 90° et vérifiez que les bras sont à l\'angle prévu par les maths ; mettez la différence dans OFFSET1 et OFFSET2.'],
          ['Tape a pen at the end and draw: send the corners of a square one by one.', 'Scotchez un stylo au bout et dessinez : envoyez un à un les coins d\'un carré.']],
        tests: [['Type 18 0: the arm must stretch out straight along x (both angles near 0°, then the offsets). With the code as written, this is at the limit of the servo range: adjust the mounting if needed.', 'Tapez 18 0 : le bras doit se tendre tout droit selon x (deux angles proches de 0°, puis les décalages). Avec ce code, c\'est à la limite de la course des servos : ajustez le montage si besoin.'],
          ['Type 30 0: the answer must be "unreachable" (30 > L1 + L2 = 18 cm).', 'Tapez 30 0 : la réponse doit être « inatteignable » (30 > L1 + L2 = 18 cm).'],
          ['Measure with a ruler where the pen goes for 4 points: the error should stay under about 5 mm; more means offsets or link lengths to fix.', 'Mesurez à la règle où va le stylo pour 4 points : l\'erreur doit rester sous 5 mm environ ; davantage veut dire des décalages ou des longueurs à corriger.']],
        more: [['Add a third servo for a pen lift (up / down), then draw letters.', 'Ajoutez un troisième servo pour lever le stylo, puis dessinez des lettres.'], ['Replace the direct move by the quintic law of the course for smooth motion.', 'Remplacez le déplacement direct par la loi de degré 5 du cours pour un mouvement doux.']],
        links: [['learn-maths.html#l4', ['Maths and motion, lesson 4: the two-joint arm', 'Maths et mouvement, leçon 4 : le bras à deux liaisons']], ['learn-armlab.html#l5', ['Code a robot arm, lesson 5: servos and trajectories', 'Coder un bras, leçon 5 : servos et trajectoires']]] },
      { id: 'line', t: ['A line-following robot', 'Un robot suiveur de ligne'], lv: [2, ['Intermediate', 'Intermédiaire']], time: ['a weekend', 'un week-end'], cost: '≈ 35–60 €',
        goal: ['Build a small two-wheel robot that follows a black line on the floor with a PD controller, and tune it like a control engineer.', 'Construire un petit robot à deux roues qui suit une ligne noire au sol avec une régulation PD, et la régler comme un automaticien.'],
        parts: [[['2-wheel chassis kit with TT gear motors and a caster', 'Kit de châssis 2 roues avec motoréducteurs TT et roue folle'], 1, '10–15 €'], [['TB6612FNG motor driver (better than an L298N: fewer losses)', 'Driver moteur TB6612FNG (mieux qu\'un L298N : moins de pertes)'], 1, '4–8 €'], [['Arduino Nano or Uno', 'Arduino Nano ou Uno'], 1, '6–25 €'], [['3 IR reflective sensors (TCRT5000 boards) or a QTR array', '3 capteurs IR à réflexion (cartes TCRT5000) ou une barrette QTR'], 3, '5–10 €'], [['Battery: 2 Li-ion 18650 cells (7.4 V) with holder, or 6 AA', 'Batterie : 2 cellules Li-ion 18650 (7,4 V) avec support, ou 6 piles AA'], 1, '10–15 €'], [['Black electrical tape (19 mm) on a light floor or white board', 'Ruban isolant noir (19 mm) sur un sol clair ou un carton blanc'], 1, '2 €']],
        wiring: [[['IR sensors (left, middle, right) analog out', 'Sorties analogiques des capteurs IR (gauche, milieu, droite)'], 'A0, A1, A2'], [['TB6612: PWMA, AIN1, AIN2 (left motor)', 'TB6612 : PWMA, AIN1, AIN2 (moteur gauche)'], 'D5, D7, D8'], [['TB6612: PWMB, BIN1, BIN2 (right motor)', 'TB6612 : PWMB, BIN1, BIN2 (moteur droit)'], 'D6, D9, D10'], [['TB6612: STBY', 'TB6612 : STBY'], 'D4'], [['TB6612: VM (motor power)', 'TB6612 : VM (puissance moteurs)'], ['battery +, through a switch', '+ batterie, via un interrupteur']], [['TB6612: VCC; Arduino VIN', 'TB6612 : VCC ; Arduino VIN'], ['5 V of the Arduino; battery + (7–12 V)', '5 V de l\'Arduino ; + batterie (7–12 V)']], [['All grounds', 'Toutes les masses'], ['together', 'reliées ensemble']]],
        code: [['line.ino', LINE, 'cpp']],
        steps: [['Assemble the chassis; put the 3 sensors in a row at the front, about 1.5 cm apart and 3–8 mm above the floor.', 'Montez le châssis ; mettez les 3 capteurs en ligne à l\'avant, à environ 1,5 cm l\'un de l\'autre et à 3–8 mm du sol.'],
          ['Wire it as in the table, motors first: test each motor alone with a small sketch (forward, then backward); swap its two wires if it turns the wrong way.', 'Câblez selon le tableau, moteurs d\'abord : testez chaque moteur seul avec un petit programme (avant, puis arrière) ; inversez ses deux fils s\'il tourne à l\'envers.'],
          ['Calibrate: print analogRead of each sensor on white and on black; put the middle value in threshold.', 'Étalonnez : affichez analogRead de chaque capteur sur le blanc et sur le noir ; mettez la valeur du milieu dans threshold.'],
          ['Upload the code with Kd = 0 and a low base speed (100). Raise Kp until the robot follows the line and starts to wobble, then take 60 % of it.', 'Téléversez le code avec Kd = 0 et une faible vitesse de base (100). Augmentez Kp jusqu\'à ce que le robot suive la ligne et commence à osciller, puis prenez 60 % de cette valeur.'],
          ['Add Kd step by step to damp the wobble, then raise the base speed.', 'Ajoutez Kd petit à petit pour amortir les oscillations, puis augmentez la vitesse de base.']],
        tests: [['On a straight line, the robot should not wobble more than the width of the tape.', 'Sur une ligne droite, le robot ne doit pas osciller plus que la largeur du ruban.'],
          ['On a 15 cm radius curve it must not leave the line; if it does, lower the base speed or raise Kp.', 'Sur un virage de 15 cm de rayon, il ne doit pas quitter la ligne ; sinon, baissez la vitesse de base ou augmentez Kp.'],
          ['Time one lap of your track 5 times and write down the mean and the spread: this is how you compare two settings.', 'Chronométrez 5 fois un tour de votre circuit et notez la moyenne et l\'écart : c\'est ainsi qu\'on compare deux réglages.']],
        more: [['Use 5 or 8 sensors and a weighted average of their analog values for a smoother error.', 'Utilisez 5 ou 8 capteurs et une moyenne pondérée de leurs valeurs analogiques pour une erreur plus douce.'], ['Add wheel encoders and a speed loop per wheel (cascade control).', 'Ajoutez des codeurs de roue et une boucle de vitesse par roue (commande en cascade).']],
        links: [['learn-control.html#l4', ['Dynamics and control, lesson 4: feedback and PID', 'Dynamique et commande, leçon 4 : rétroaction et PID']], ['learn-mobile.html#l5', ['Wheeled mobile robots, lesson 5: differential drive', 'Robots mobiles, leçon 5 : le robot différentiel']]] },
      { id: 'ros', t: ['A ROS 2 mobile robot that makes a map', 'Un robot mobile ROS 2 qui fait une carte'], lv: [3, ['Advanced', 'Avancé']], time: ['2 to 4 weekends', '2 à 4 week-ends'], cost: '≈ 200–300 €',
        goal: ['Build a differential robot with a lidar, run ROS 2 on a Raspberry Pi, publish its odometry, build a map with slam_toolbox and send it to goals with Nav2.', 'Construire un robot différentiel avec un lidar, faire tourner ROS 2 sur un Raspberry Pi, publier son odométrie, construire une carte avec slam_toolbox et l\'envoyer vers des buts avec Nav2.'],
        parts: [[['Raspberry Pi 4 or 5 (4 GB or more) with a 32 GB card', 'Raspberry Pi 4 ou 5 (4 Go ou plus) avec une carte 32 Go'], 1, '60–100 €'], [['2 DC gear motors with encoders (for example 12 V, about 1:30 to 1:50)', '2 motoréducteurs à courant continu avec codeurs (par exemple 12 V, environ 1:30 à 1:50)'], 2, '25–40 €'], [['TB6612FNG driver (or a larger one for bigger motors)', 'Driver TB6612FNG (ou plus gros pour de plus gros moteurs)'], 1, '5–10 €'], [['Arduino Uno / Nano (or an ESP32) for the motors and encoders', 'Arduino Uno / Nano (ou un ESP32) pour les moteurs et les codeurs'], 1, '6–25 €'], [['2D lidar (RPLIDAR A1, LD06 or similar)', 'Lidar 2D (RPLIDAR A1, LD06 ou équivalent)'], 1, '60–100 €'], [['Battery (3S Li-ion 11.1 V) and a 5 V 3 A converter for the Pi', 'Batterie (Li-ion 3S 11,1 V) et un convertisseur 5 V 3 A pour le Pi'], 1, '25–40 €'], [['Chassis plate, caster wheel, wheels, screws', 'Plaque de châssis, roue folle, roues, vis'], 1, '15–25 €']],
        wiring: [[['Encoder A outputs (left, right)', 'Sorties A des codeurs (gauche, droite)'], ['D2, D3 (interrupts)', 'D2, D3 (interruptions)']], [['Encoder B outputs (left, right)', 'Sorties B des codeurs (gauche, droite)'], 'D4, D12'], [['TB6612 (left / right / STBY)', 'TB6612 (gauche / droite / STBY)'], 'D5 D7 D8 / D6 D9 D10 / D11'], [['Arduino ↔ Raspberry Pi', 'Arduino ↔ Raspberry Pi'], ['USB cable (serial /dev/ttyACM0)', 'câble USB (série /dev/ttyACM0)']], [['Lidar ↔ Raspberry Pi', 'Lidar ↔ Raspberry Pi'], ['USB adapter delivered with the lidar', 'adaptateur USB fourni avec le lidar']], [['Battery', 'Batterie'], ['motor driver VM directly; the Pi through the 5 V converter; common ground', 'VM du driver directement ; le Pi via le convertisseur 5 V ; masse commune']]],
        code: [['base.ino (Arduino)', FW, 'cpp'], ['base_node.py (ROS 2, Python)', NODE, 'python']],
        steps: [['Install Ubuntu 24.04 and ROS 2 Jazzy on the Pi, plus python3-serial, slam_toolbox, nav2_bringup and the driver of your lidar.', 'Installez Ubuntu 24.04 et ROS 2 Jazzy sur le Pi, plus python3-serial, slam_toolbox, nav2_bringup et le pilote de votre lidar.'],
          ['Measure the track and the wheel radius, read the encoder counts per wheel turn, and put them in both programs.', 'Mesurez la voie et le rayon des roues, lisez les impulsions par tour de roue du codeur, et mettez-les dans les deux programmes.'],
          ['Upload base.ino; check in the Serial Monitor that turning a wheel by hand forward increases its count (swap A and B if not).', 'Téléversez base.ino ; vérifiez dans le moniteur série que tourner une roue à la main vers l\'avant augmente son compteur (inversez A et B sinon).'],
          ['Run base_node.py and drive with teleop_twist_keyboard; watch /odom in RViz.', 'Lancez base_node.py et conduisez avec teleop_twist_keyboard ; regardez /odom dans RViz.'],
          ['Publish the transform base_link → laser (static_transform_publisher) where the lidar really is, start the lidar driver and slam_toolbox, drive around: the map appears.', 'Publiez la transformation base_link → laser (static_transform_publisher) là où est vraiment le lidar, lancez le pilote du lidar et slam_toolbox, roulez : la carte apparaît.'],
          ['Save the map, start Nav2 with it, and send goals from RViz.', 'Enregistrez la carte, lancez Nav2 avec elle, et envoyez des buts depuis RViz.']],
        tests: [['Odometry: drive 1 m straight with the keyboard and compare /odom with a tape measure; then the square test of the course (UMBmark) to calibrate the radius and the track.', 'Odométrie : roulez 1 m tout droit au clavier et comparez /odom avec un mètre ; puis le test du carré du cours (UMBmark) pour étalonner le rayon et la voie.'],
          ['Watchdog: stop the node while the robot moves: it must stop within half a second.', 'Chien de garde : arrêtez le nœud pendant que le robot roule : il doit s\'arrêter en moins d\'une demi-seconde.'],
          ['Map: walls must be straight and not doubled; doubled walls mean bad odometry or a wrong lidar transform.', 'Carte : les murs doivent être droits et non dédoublés ; des murs doublés veulent dire une mauvaise odométrie ou une mauvaise transformation du lidar.']],
        more: [['Close the speed loop of each wheel on the Arduino (PI on the encoder speed) instead of the open loop.', 'Fermez la boucle de vitesse de chaque roue sur l\'Arduino (PI sur la vitesse des codeurs) au lieu de la boucle ouverte.'], ['Add an IMU and fuse it with robot_localization (EKF).', 'Ajoutez une centrale inertielle et fusionnez-la avec robot_localization (EKF).'], ['Put a physical emergency stop on the motor power: safety stays outside ROS.', 'Mettez un arrêt d\'urgence physique sur la puissance des moteurs : la sécurité reste hors de ROS.']],
        links: [['learn-ros.html#l9', ['ROS 2 from zero, lesson 9: a robot that drives and avoids obstacles', 'ROS 2 depuis zéro, leçon 9 : un robot qui roule et évite les obstacles']], ['learn-mobile-pro.html#l14', ['Wheeled mobile robots, lesson 14: odometry and calibration', 'Robots mobiles, leçon 14 : odométrie et étalonnage']], ['learn-ros.html#l8', ['ROS 2 from zero, lesson 8: Nav2 and the big stacks', 'ROS 2 depuis zéro, leçon 8 : Nav2 et les grandes piles']]] }
    ];

    var table = function (head, rows) { return '<div class="cmp-wrap"><table class="dh"><tr>' + head.map(function (h) { return '<th class="left">' + esc(h) + '</th>'; }).join('') + '</tr>' + rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td class="left">' + esc(t(c)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table></div>'; };
    var list = function (tag, items) { return '<' + tag + '>' + items.map(function (i) { return '<li>' + esc(t(i)) + '</li>'; }).join('') + '</' + tag + '>'; };
    main.innerHTML = '<h1>' + L('Guided projects', 'Projets guidés') + '</h1>' +
      '<p class="lead">' + L('Three real projects to go from the screen to a robot on your desk: the list of parts with an indicative price, the wiring, the code, the steps and the tests that prove it works.', 'Trois projets réels pour passer de l\'écran à un robot sur votre bureau : la liste des pièces avec un prix indicatif, le câblage, le code, les étapes et les tests qui prouvent que ça marche.') + '</p>' +
      '<div class="box warn"><div class="bt">' + L('Before you start', 'Avant de commencer') + '</div><div class="bb"><p>' + L('Prices are indicative (2026) and vary by shop and country. The code follows the course and is written to be read and adapted; it has not been run on your exact parts, so follow the tests step by step. Lithium batteries need care: use a proper charger, never short them, and keep a switch on the power.', 'Les prix sont indicatifs (2026) et varient selon les boutiques et les pays. Le code suit le cours et est écrit pour être lu et adapté ; il n\'a pas été exécuté sur vos pièces exactes, donc suivez les tests étape par étape. Les batteries au lithium demandent de la prudence : utilisez un vrai chargeur, ne les court-circuitez jamais, et gardez un interrupteur sur l\'alimentation.') + '</p></div></div>' +
      '<div class="prj-cards">' + P.map(function (p) { return '<a class="rev-card" href="#' + p.id + '"><span class="rev-ic" aria-hidden="true">' + ['🦾', '🛤️', '🗺️'][P.indexOf(p)] + '</span><b>' + esc(t(p.t)) + '</b><span>' + esc(t(p.lv[1])) + ' · ' + esc(t(p.time)) + ' · ' + p.cost + '</span><em>' + L('See the project', 'Voir le projet') + ' →</em></a>'; }).join('') + '</div>' +
      P.map(function (p) {
        return '<section class="prj" id="' + p.id + '"><h2>' + esc(t(p.t)) + '</h2>' +
          '<p class="prj-meta"><span class="lv l' + p.lv[0] + '"><b></b><b></b><b></b> ' + esc(t(p.lv[1])) + '</span> · ' + esc(t(p.time)) + ' · ' + p.cost + '</p>' +
          '<p>' + esc(t(p.goal)) + '</p>' +
          '<h3>' + L('Parts', 'Pièces') + '</h3>' + table([L('Part', 'Pièce'), L('Qty', 'Qté'), L('Indicative price', 'Prix indicatif')], p.parts) +
          '<h3>' + L('Wiring', 'Câblage') + '</h3>' + table([L('From', 'De'), L('To', 'Vers')], p.wiring) +
          '<h3>' + L('Code', 'Code') + '</h3>' + p.code.map(function (c) { return '<div class="prj-code"><div class="prj-code-h"><b>' + esc(c[0]) + '</b><button type="button" class="btn sm ghost" data-copy>' + L('Copy', 'Copier') + '</button></div><pre class="code" tabindex="0"><code>' + esc(c[1]) + '</code></pre></div>'; }).join('') +
          '<h3>' + L('Steps', 'Étapes') + '</h3>' + list('ol', p.steps) +
          '<h3>' + L('Tests: prove that it works', 'Essais : prouver que ça marche') + '</h3>' + list('ul', p.tests) +
          '<h3>' + L('Going further', 'Pour aller plus loin') + '</h3>' + list('ul', p.more) +
          '<p class="prj-links">' + L('The lessons behind this project:', 'Les leçons derrière ce projet :') + ' ' + p.links.map(function (l) { return '<a href="' + l[0] + '">' + esc(t(l[1])) + '</a>'; }).join(' · ') + '</p></section>';
      }).join('');
    main.addEventListener('click', function (e) {
      var b = e.target.closest('[data-copy]'); if (!b) return;
      var txt = b.closest('.prj-code').querySelector('code').textContent;
      var done = function () { b.textContent = L('Copied ✓', 'Copié ✓'); setTimeout(function () { b.textContent = L('Copy', 'Copier'); }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () {}); else done();
    });
    if (location.hash) { var el = document.getElementById(location.hash.slice(1)); if (el) setTimeout(function () { el.scrollIntoView(); }, 50); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
