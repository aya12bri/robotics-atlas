// blink: the LED on pin 13 turns on and off every half second
const int LED = 13;              // pin 13 (the board's own LED is on it too)

void setup() {                   // runs once, at power-on or reset
  pinMode(LED, OUTPUT);          // pin 13 gives a voltage
  Serial.begin(9600);            // open the link to the computer
}

void loop() {                    // runs again and again, forever
  digitalWrite(LED, HIGH);       // 5 V: the LED is on
  Serial.println("on");
  delay(500);                    // wait 500 ms
  digitalWrite(LED, LOW);        // 0 V: the LED is off
  Serial.println("off");
  delay(500);
}
