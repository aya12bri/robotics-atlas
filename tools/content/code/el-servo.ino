// a hobby servo on pin 9 and a stepper motor through an A4988 driver (STEP on 3, DIR on 4)
#include <Servo.h>
Servo s;
const int STEP = 3, DIR = 4;

void setup() {
  s.attach(9);                   // a pulse every 20 ms, 1 ms = 0 deg ... 2 ms = 180 deg
  pinMode(STEP, OUTPUT); pinMode(DIR, OUTPUT);
}

void loop() {
  s.write(0);   delay(1000);     // go to 0 deg
  s.write(90);  delay(1000);     // 1.5 ms pulse: the middle
  s.write(180); delay(1000);

  digitalWrite(DIR, HIGH);       // one way
  for (int i = 0; i < 200; i++) {   // 200 full steps = 1 turn (1.8 deg per step)
    digitalWrite(STEP, HIGH); delayMicroseconds(1000);
    digitalWrite(STEP, LOW);  delayMicroseconds(1000);   // 2 ms per step: 1 turn in 0.4 s
  }
  delay(500);
}
