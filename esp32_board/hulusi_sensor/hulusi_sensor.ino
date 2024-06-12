int myPins[] = {27, 14, 12, 13, 4, 32, 15};

void setup() {
  Serial.begin(115200);
  delay(1000); // give me time to bring up serial monitor
  Serial.println("ESP32 Touch Test");
}

void loop() {


  Serial.print(sensor_mapping(27));  // get touch value on GPIO 4
  Serial.print(" ");

  Serial.print(sensor_mapping(14));  // get touch value on GPIO 4
  Serial.print(" ");

  Serial.print(sensor_mapping(12));  // get touch value on GPIO 4
  Serial.print(" ");

  Serial.print(sensor_mapping(13));  // get touch value on GPIO 4
  Serial.print(" ");

  Serial.print(sensor_mapping(4));  // get touch value on GPIO 4
  Serial.print(" ");

  Serial.print(sensor_mapping(32));  // get touch value on GPIO 4
  Serial.print(" ");

  Serial.print(sensor_mapping(15));  // get touch value on GPIO 4
  Serial.print(" ");

  int sensorValue = analogRead(34);
  // Convert the analog reading (which goes from 0 - 1023) to a voltage (0 - 5V):
  
  int sensormap=constrain(map(sensorValue,115,400,0,255),0,255);
  Serial.println(sensormap);
  

  delay(100);
}
int sensor_mapping(int input_pin){

  return constrain(map(touchRead(input_pin),45,10,0,255),0,255);
}