// Arduino sketch: receives "a1 a2 a3" (servo angles in degrees, one line per command) and moves 3 servos.
#include <Servo.h>

Servo s[3];
const int PINS[3] = {9, 10, 11};

void setup() {
  Serial.begin(115200);
  for (int i = 0; i < 3; i++) {
    s[i].attach(PINS[i], 500, 2500);     // pulse range in microseconds (check your servo's data sheet)
    s[i].write(90);                       // start in the middle
  }
}

void loop() {
  if (Serial.available()) {
    for (int i = 0; i < 3; i++) {
      int a = Serial.parseInt();          // reads the next integer of the line
      s[i].write(constrain(a, 0, 180));   // never send a servo beyond its range
    }
    while (Serial.available() && Serial.read() != '\n') {}   // drop the end of the line
  }
}
