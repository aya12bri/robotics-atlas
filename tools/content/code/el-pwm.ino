// PWM: the speed of a DC motor through a MOSFET on pin 5, set by a potentiometer on A0
const int MOTOR = 5;             // a PWM pin (marked ~ on the board)

void setup() {
  pinMode(MOTOR, OUTPUT);
}

void loop() {
  int n = analogRead(A0);        // 0 ... 1023
  int duty = n / 4;              // 0 ... 255
  analogWrite(MOTOR, duty);      // 0 = always off, 255 = always on, 128 = on half the time
  delay(20);
}
