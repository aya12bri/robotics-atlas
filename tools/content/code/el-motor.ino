// a DC motor through an H-bridge (TB6612 or L298N) and its encoder: direction, PWM, speed
const int PWMA = 5, AIN1 = 7, AIN2 = 8;   // driver: speed and direction
const int ENC_A = 2, ENC_B = 4;           // encoder: A on an interrupt pin
volatile long ticks = 0;
const float CPR = 360.0;                  // ticks per turn of the wheel (encoder x gearbox)

void onA() { ticks += (digitalRead(ENC_B) == HIGH) ? -1 : +1; }   // B tells the direction

void drive(int u) {                       // u from -255 (full back) to +255 (full forward)
  digitalWrite(AIN1, u >= 0 ? HIGH : LOW);
  digitalWrite(AIN2, u >= 0 ? LOW : HIGH);
  analogWrite(PWMA, constrain(abs(u), 0, 255));
}

void setup() {
  pinMode(PWMA, OUTPUT); pinMode(AIN1, OUTPUT); pinMode(AIN2, OUTPUT);
  pinMode(ENC_A, INPUT_PULLUP); pinMode(ENC_B, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENC_A), onA, RISING);
  Serial.begin(115200);
}

void loop() {
  static long last = 0;
  drive(150);                              // forward at about 60 %
  delay(100);                              // every 100 ms
  noInterrupts(); long now = ticks; interrupts();
  float rpm = (now - last) / CPR / 0.1 * 60;   // turns per second x 60
  last = now;
  Serial.println(rpm);
}
