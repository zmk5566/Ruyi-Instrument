void setup() {
  Serial.begin(115200); // Start the Serial communication to the computer
  // Start the Serial2 at 9600 baud rate
  // Default pins for UART2 are 16 (RX), 17 (TX)
  Serial2.begin(115200, SERIAL_8N1, 16, 17);
}

void loop() {
  // Check if the Serial2 has received any data
  if (Serial2.available()) {
    String receivedMessage = Serial2.readStringUntil('\n');
    Serial.println(receivedMessage); // Print the received message to the Serial Monitor
  }
}