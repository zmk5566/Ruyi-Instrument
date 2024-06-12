int myPins[] = {27, 14, 12, 13, 4, 32, 15};

void setup() {
  //Serial.begin(115200);
  Serial2.begin(115200, SERIAL_8N1, 16, 17);
  delay(1000); // give me time to bring up serial monitor
  Serial2.println("ESP32 Touch Test");
}

void loop() {


  Serial2.print(sensor_mapping(27));  // get touch value on GPIO 4
  Serial2.print(" ");

  Serial2.print(sensor_mapping(14));  // get touch value on GPIO 4
  Serial2.print(" ");

  Serial2.print(sensor_mapping(12));  // get touch value on GPIO 4
  Serial2.print(" ");

  Serial2.print(sensor_mapping(13));  // get touch value on GPIO 4
  Serial2.print(" ");

  Serial2.print(sensor_mapping(4));  // get touch value on GPIO 4
  Serial2.print(" ");

  Serial2.print(sensor_mapping(32));  // get touch value on GPIO 4
  Serial2.print(" ");

  Serial2.print(sensor_mapping(15));  // get touch value on GPIO 4
  Serial2.print(" ");

  int sensorValue = analogRead(34);
  // Convert the analog reading (which goes from 0 - 1023) to a voltage (0 - 5V):
  
  int sensormap=constrain(map(sensorValue,115,400,0,255),0,255);
  Serial2.println(sensormap);
  

  delay(50);
}
int sensor_mapping(int input_pin){

  return constrain(map(touchRead(input_pin),45,10,0,255),0,255);
}