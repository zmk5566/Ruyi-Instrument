int myArray[] = {0,0,0,0,0,0,0,0};
int pastArray[] = {0,0,0,0,0,0,0,0};

int myPins[] = {27, 14, 12, 13, 4, 32, 15};
bool isChanging = false;

unsigned long previousMillis = 0;        // stores last time LED was updated
const long interval = 50;              // interval at which to blink (milliseconds)
 
void setup() {
 
  // Set up Serial Monitor
  Serial.begin(115200);
  delay(1000);

  Serial2.begin(115200, SERIAL_8N1, 16, 17);
 
  delay(500);
}
 
void loop() {

  unsigned long currentMillis = millis();
  
  main_loop();
  compareArraysAndTrigger();

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;   // save the last time you blinked the LED
    
    // if the LED is off turn it on and vice-versa:
    array_printing();
  }


  
}

void array_printing(){
  for(int i = 0; i < 8; i++) {
    Serial.print(myArray[i]);
    Serial.print(" "); // Print a space after each number
    Serial2.print(myArray[i]);
    Serial2.print(" "); // Print a space after each number
  }
  // Change the line after the last element has been printed
  Serial.println(); // This moves the cursor to the next line
  Serial2.println(); // This moves the cursor to the next line
}


void main_loop(){

  for(int i = 0; i < 7; i++) {
    myArray[i] = sensor_mapping(myPins[i]);
  }

  
 int sensorValue = analogRead(26);
  // Convert the analog reading (which goes from 0 - 1023) to a voltage (0 - 5V):

  myArray[7]=constrain(map(sensorValue,115,400,0,255),0,255);
  
}




int sensor_mapping(int input_pin){

  return constrain(map(touchRead(input_pin),18,10,0,255),0,255);
}


void compareArraysAndTrigger() {
  bool shouldPrint = false; // Flag to determine if array_printing should be called

  for(int i = 0; i < 8; i++) {
    // Check if the current state is different from the past state
    // AND either current or past was 0, indicating an ON/OFF or OFF/ON transition
    if((myArray[i] != pastArray[i]) && (myArray[i] == 0 || pastArray[i] == 0)) {
      shouldPrint = true; // Set the flag to true if any change detected
      break; // No need to check further if we already found a change
    }
  }

  if(shouldPrint) {
    array_printing(); // Call the printing function if there was a change
  }

  // Update pastArray with the contents of myArray for the next comparison
  for(int i = 0; i < 8; i++) {
    pastArray[i] = myArray[i];
  }
}
