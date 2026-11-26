// a first robot: two wheels keep the robot 20 cm from a wall with a proportional controller
const int TRIG = 9, ECHO = 10;
const int PWMA = 5, AIN1 = 7, AIN2 = 8, PWMB = 6, BIN1 = 11, BIN2 = 12;
const float TARGET = 20.0, KP = 12.0;     // cm, PWM units per cm
const unsigned long PERIOD = 50;          // ms: the loop runs at 20 Hz

float distance_cm() {
  digitalWrite(TRIG, LOW);  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10); digitalWrite(TRIG, LOW);
  unsigned long t = pulseIn(ECHO, HIGH, 30000);
  return t == 0 ? 400 : t * 0.0343 / 2;   // no echo: treat as far away
}

void wheel(int pwm, int in1, int in2, int u) {
  digitalWrite(in1, u >= 0 ? HIGH : LOW); digitalWrite(in2, u >= 0 ? LOW : HIGH);
  analogWrite(pwm, constrain(abs(u), 0, 255));
}

void setup() {
  int outs[] = {TRIG, PWMA, AIN1, AIN2, PWMB, BIN1, BIN2};
  for (int p : outs) pinMode(p, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(115200);
}

void loop() {
  static unsigned long next = 0;
  if (millis() < next) return;            // wait for the next period without blocking
  next = millis() + PERIOD;

  float d = distance_cm();                // 1. read
  float e = d - TARGET;                   // 2. compute: error > 0 = too far, go forward
  int u = constrain((int)(KP * e), -200, 200);
  if (abs(e) < 1.0) u = 0;                //    a dead band: no buzzing around the target
  wheel(PWMA, AIN1, AIN2, u);             // 3. command both wheels
  wheel(PWMB, BIN1, BIN2, u);
  Serial.print(d); Serial.print(" cm  u = "); Serial.println(u);
}
