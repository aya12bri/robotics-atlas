// a push button (pull-up), a potentiometer and an HC-SR04 ultrasonic sensor
const int BUTTON = 2, TRIG = 9, ECHO = 10;

void setup() {
  pinMode(BUTTON, INPUT_PULLUP); // internal resistor to 5 V: reads HIGH when released
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

float distance_cm() {
  digitalWrite(TRIG, LOW);  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);   // a 10 us pulse starts a measurement
  digitalWrite(TRIG, LOW);
  unsigned long t = pulseIn(ECHO, HIGH, 30000);      // echo time in us (0 if nothing within 30 ms)
  return t * 0.0343 / 2;                             // sound: 343 m/s = 0.0343 cm/us, there and back
}

void loop() {
  bool pressed = digitalRead(BUTTON) == LOW;         // pressed = connected to GND
  int n = analogRead(A0);                            // 0 ... 1023
  float volts = n * 5.0 / 1023;
  Serial.print(pressed ? "pressed  " : "released ");
  Serial.print(volts, 2);  Serial.print(" V  ");
  Serial.print(distance_cm(), 1); Serial.println(" cm");
  delay(200);
}
